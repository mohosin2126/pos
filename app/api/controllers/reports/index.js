"use strict";

const { QueryTypes } = require("sequelize");
const { sequelize } = require("../../database/models");
const { success, serverError } = require("../../utils/api-response");
const { getNetAverageCostMap } = require("../../utils/costing");
const { getSaleReturnRevenueAmount, parseReturnItems } = require("../../utils/sale-returns");
const { roundMoney } = require("../../utils/price-calculator");

function buildSalesDateFilter(query = {}) {
    const replacements = [];
    const clauses = [];

    if (query.startDate && query.endDate) {
        clauses.push("saleDate BETWEEN ? AND ?");
        replacements.push(query.startDate, query.endDate);
    } else if (query.startDate) {
        clauses.push("saleDate >= ?");
        replacements.push(query.startDate);
    } else if (query.endDate) {
        clauses.push("saleDate <= ?");
        replacements.push(query.endDate);
    }

    return {
        replacements,
        whereClause: clauses.length ? `AND ${clauses.join(" AND ")}` : "",
    };
}

async function fetchSales(query = {}) {
    const { replacements, whereClause } = buildSalesDateFilter(query);
    return sequelize.query(
        `SELECT id, referenceNo, saleDate, totalAmount
         FROM sales
         WHERE status = 'completed'
           ${whereClause}
         ORDER BY saleDate DESC, id DESC`,
        {
            replacements,
            type: QueryTypes.SELECT,
        }
    );
}

async function fetchSaleItemsBySales(saleIds, categoryId = null) {
    if (!saleIds.length) return [];

    const replacements = [...saleIds];
    let categoryClause = "";
    if (categoryId) {
        categoryClause = "AND p.categoryId = ?";
        replacements.push(Number(categoryId));
    }

    return sequelize.query(
        `SELECT
             si.saleId,
             si.productId,
             p.name AS productName,
             p.sku,
             p.price AS currentPrice,
             c.name AS categoryName,
             SUM(si.quantity) AS soldQuantity,
             SUM(
                 (si.lineTotal - si.taxAmount)
                 - CASE
                     WHEN sale_totals.saleBaseAmount > 0
                     THEN s.discountAmount * ((si.lineTotal - si.taxAmount) / sale_totals.saleBaseAmount)
                     ELSE 0
                   END
             ) AS revenue
         FROM sale_items si
         JOIN sales s ON s.id = si.saleId
         JOIN products p ON p.id = si.productId
         LEFT JOIN categories c ON c.id = p.categoryId
         JOIN (
             SELECT saleId, COALESCE(SUM(lineTotal - taxAmount), 0) AS saleBaseAmount
             FROM sale_items
             GROUP BY saleId
         ) sale_totals ON sale_totals.saleId = si.saleId
         WHERE si.saleId IN (${saleIds.map(() => "?").join(",")})
           ${categoryClause}
         GROUP BY si.saleId, si.productId, p.name, p.sku, p.price, c.name`,
        {
            replacements,
            type: QueryTypes.SELECT,
        }
    );
}

async function fetchAverageCostByProductIds(productIds) {
    if (!productIds.length) return new Map();
    return getNetAverageCostMap(productIds);
}

async function fetchSaleReturnsForSales(saleIds) {
    if (!saleIds.length) return [];

    return sequelize.query(
        `SELECT saleId, returnItems
         FROM sale_returns
         WHERE saleId IN (${saleIds.map(() => "?").join(",")})
           AND refundStatus IN ('approved', 'refunded')`,
        {
            replacements: saleIds,
            type: QueryTypes.SELECT,
        }
    );
}

function buildReturnAdjustmentsByProduct(returnRows, allowedProductIds = null) {
    const adjustments = new Map();
    const allowedSet = allowedProductIds ? new Set(allowedProductIds) : null;

    for (const row of returnRows) {
        for (const item of parseReturnItems(row.returnItems)) {
            const productId = Number(item.productId);
            if (!productId) continue;
            if (allowedSet && !allowedSet.has(productId)) continue;

            const current = adjustments.get(productId) || { quantity: 0, revenue: 0 };
            current.quantity += Number(item.quantity || 0);
            current.revenue = roundMoney(current.revenue + getSaleReturnRevenueAmount(item));
            adjustments.set(productId, current);
        }
    }

    return adjustments;
}

function buildReturnAdjustmentsBySale(returnRows) {
    const adjustments = new Map();

    for (const row of returnRows) {
        const saleId = Number(row.saleId);
        const current = adjustments.get(saleId) || { quantity: 0, revenue: 0 };

        for (const item of parseReturnItems(row.returnItems)) {
            current.quantity += Number(item.quantity || 0);
            current.revenue = roundMoney(current.revenue + getSaleReturnRevenueAmount(item));
        }

        adjustments.set(saleId, current);
    }

    return adjustments;
}

function buildReturnAdjustmentsBySaleProduct(returnRows) {
    const adjustments = new Map();

    for (const row of returnRows) {
        const saleId = Number(row.saleId);

        for (const item of parseReturnItems(row.returnItems)) {
            const productId = Number(item.productId);
            if (!productId) continue;

            const key = `${saleId}:${productId}`;
            const current = adjustments.get(key) || { quantity: 0, revenue: 0 };
            current.quantity += Number(item.quantity || 0);
            current.revenue = roundMoney(current.revenue + getSaleReturnRevenueAmount(item));
            adjustments.set(key, current);
        }
    }

    return adjustments;
}

async function buildProductProfitRows(query = {}) {
    const sales = await fetchSales(query);
    const saleIds = sales.map((sale) => Number(sale.id)).filter(Boolean);
    if (!saleIds.length) return [];

    const saleItems = await fetchSaleItemsBySales(saleIds, query.categoryId);
    const productIds = [...new Set(saleItems.map((item) => Number(item.productId)).filter(Boolean))];
    const [avgCostMap, returnRows] = await Promise.all([
        fetchAverageCostByProductIds(productIds),
        fetchSaleReturnsForSales(saleIds),
    ]);
    const returnAdjustments = buildReturnAdjustmentsByProduct(returnRows, productIds);

    const grouped = new Map();

    for (const row of saleItems) {
        const productId = Number(row.productId);
        const current = grouped.get(productId) || {
            productId,
            productName: row.productName,
            sku: row.sku,
            currentPrice: Number(row.currentPrice || 0),
            categoryName: row.categoryName || null,
            totalSales: new Set(),
            grossUnitsSold: 0,
            grossRevenue: 0,
        };

        current.totalSales.add(Number(row.saleId));
        current.grossUnitsSold += Number(row.soldQuantity || 0);
        current.grossRevenue = roundMoney(current.grossRevenue + Number(row.revenue || 0));
        grouped.set(productId, current);
    }

    let rows = [...grouped.values()].map((row) => {
        const returnAdjustment = returnAdjustments.get(row.productId) || { quantity: 0, revenue: 0 };
        const avgCost = Number(avgCostMap.get(row.productId) || 0);
        const totalUnitsSold = row.grossUnitsSold - returnAdjustment.quantity;
        const totalRevenue = roundMoney(row.grossRevenue - returnAdjustment.revenue);
        const totalCost = roundMoney(totalUnitsSold * avgCost);
        const totalProfit = roundMoney(totalRevenue - totalCost);

        return {
            productId: row.productId,
            productName: row.productName,
            sku: row.sku,
            currentPrice: roundMoney(row.currentPrice),
            sellingPrice: roundMoney(row.currentPrice),
            avgCost: roundMoney(avgCost),
            categoryName: row.categoryName,
            totalSales: row.totalSales.size,
            totalUnitsSold,
            totalRevenue,
            totalCost,
            totalProfit,
            avgMarginPercent: totalRevenue !== 0 ? roundMoney((totalProfit / totalRevenue) * 100) : 0,
            avgMarkupPercent: totalCost !== 0 ? roundMoney((totalProfit / totalCost) * 100) : 0,
        };
    });

    if (query.minMargin !== undefined) {
        rows = rows.filter((row) => row.avgMarginPercent >= Number(query.minMargin));
    }
    if (query.maxMargin !== undefined) {
        rows = rows.filter((row) => row.avgMarginPercent <= Number(query.maxMargin));
    }

    return rows.sort((a, b) => b.totalProfit - a.totalProfit);
}

async function buildSaleProfitRows(query = {}) {
    const sales = await fetchSales(query);
    const saleIds = sales.map((sale) => Number(sale.id)).filter(Boolean);
    if (!saleIds.length) return [];

    const saleItems = await fetchSaleItemsBySales(saleIds);
    const productIds = [...new Set(saleItems.map((item) => Number(item.productId)).filter(Boolean))];
    const [avgCostMap, returnRows] = await Promise.all([
        fetchAverageCostByProductIds(productIds),
        fetchSaleReturnsForSales(saleIds),
    ]);
    const returnAdjustments = buildReturnAdjustmentsBySale(returnRows);
    const returnAdjustmentsBySaleProduct = buildReturnAdjustmentsBySaleProduct(returnRows);

    const grouped = new Map();

    for (const sale of sales) {
        grouped.set(Number(sale.id), {
            saleId: Number(sale.id),
            referenceNo: sale.referenceNo,
            saleDate: sale.saleDate,
            saleTotal: roundMoney(sale.totalAmount),
            totalUnitsSold: 0,
            totalRevenue: 0,
            totalCost: 0,
            productBreakdown: new Map(),
        });
    }

    for (const row of saleItems) {
        const saleId = Number(row.saleId);
        const current = grouped.get(saleId);
        if (!current) continue;

        const quantity = Number(row.soldQuantity || 0);
        const revenue = Number(row.revenue || 0);
        const avgCost = Number(avgCostMap.get(Number(row.productId)) || 0);

        current.totalUnitsSold += quantity;
        current.totalRevenue = roundMoney(current.totalRevenue + revenue);
        current.totalCost = roundMoney(current.totalCost + (quantity * avgCost));

        const breakdown = current.productBreakdown.get(Number(row.productId)) || {
            quantity: 0,
            revenue: 0,
            avgCost,
        };
        breakdown.quantity += quantity;
        breakdown.revenue = roundMoney(breakdown.revenue + revenue);
        breakdown.avgCost = avgCost;
        current.productBreakdown.set(Number(row.productId), breakdown);
    }

    let rows = [...grouped.values()].map((row) => {
        const returnAdjustment = returnAdjustments.get(row.saleId) || { quantity: 0, revenue: 0 };
        let totalUnitsSold = 0;
        let totalRevenue = 0;
        let totalCost = 0;

        for (const [productId, breakdown] of row.productBreakdown.entries()) {
            const adjustment = returnAdjustmentsBySaleProduct.get(`${row.saleId}:${productId}`) || {
                quantity: 0,
                revenue: 0,
            };
            const netQuantity = breakdown.quantity - adjustment.quantity;
            const netRevenue = roundMoney(breakdown.revenue - adjustment.revenue);

            totalUnitsSold += netQuantity;
            totalRevenue = roundMoney(totalRevenue + netRevenue);
            totalCost = roundMoney(totalCost + (netQuantity * breakdown.avgCost));
        }

        const totalProfit = roundMoney(totalRevenue - totalCost);

        return {
            saleId: row.saleId,
            referenceNo: row.referenceNo,
            saleDate: row.saleDate,
            saleTotal: roundMoney(row.saleTotal - returnAdjustment.revenue),
            totalCost,
            totalProfit,
            marginPercent: totalRevenue !== 0 ? roundMoney((totalProfit / totalRevenue) * 100) : 0,
            itemCount: totalUnitsSold,
        };
    });

    if (query.minProfit !== undefined) {
        rows = rows.filter((row) => row.totalProfit >= Number(query.minProfit));
    }
    if (query.maxProfit !== undefined) {
        rows = rows.filter((row) => row.totalProfit <= Number(query.maxProfit));
    }

    return rows.sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate));
}

const getProfitByProduct = async (req, res) => {
    try {
        const results = await buildProductProfitRows(req.query);
        return success(res, "Profit by product retrieved", results);
    } catch (err) {
        return serverError(res, "Failed to fetch profit by product", err);
    }
};

const getProfitSummary = async (req, res) => {
    try {
        const [productRows, sales] = await Promise.all([
            buildProductProfitRows(req.query),
            fetchSales(req.query),
        ]);

        const summary = productRows.reduce(
            (acc, row) => {
                acc.totalUnitsSold += Number(row.totalUnitsSold || 0);
                acc.totalRevenue = roundMoney(acc.totalRevenue + Number(row.totalRevenue || 0));
                acc.totalCost = roundMoney(acc.totalCost + Number(row.totalCost || 0));
                acc.totalProfit = roundMoney(acc.totalProfit + Number(row.totalProfit || 0));
                return acc;
            },
            {
                totalUnitsSold: 0,
                totalRevenue: 0,
                totalCost: 0,
                totalProfit: 0,
            }
        );

        return success(res, "Profit summary retrieved", {
            summary: {
                totalSales: sales.length,
                totalUnitsSold: summary.totalUnitsSold,
                totalRevenue: roundMoney(summary.totalRevenue).toFixed(2),
                totalCost: roundMoney(summary.totalCost).toFixed(2),
                totalProfit: roundMoney(summary.totalProfit).toFixed(2),
                avgMarginPercent:
                    summary.totalRevenue !== 0
                        ? roundMoney((summary.totalProfit / summary.totalRevenue) * 100)
                        : 0,
                uniqueProducts: productRows.length,
            },
            topPerformers: productRows
                .filter((row) => row.totalProfit > 0)
                .slice(0, 5)
                .map((row) => ({
                    productId: row.productId,
                    productName: row.productName,
                    totalProfit: roundMoney(row.totalProfit).toFixed(2),
                })),
            lossProducts: productRows
                .filter((row) => row.totalProfit < 0)
                .sort((a, b) => a.totalProfit - b.totalProfit)
                .slice(0, 5)
                .map((row) => ({
                    productId: row.productId,
                    productName: row.productName,
                    totalProfit: roundMoney(row.totalProfit).toFixed(2),
                    timesSold: row.totalSales,
                })),
        });
    } catch (err) {
        return serverError(res, "Failed to fetch profit summary", err);
    }
};

const getProfitBySale = async (req, res) => {
    try {
        const results = await buildSaleProfitRows(req.query);
        return success(res, "Profit by sale retrieved", results);
    } catch (err) {
        return serverError(res, "Failed to fetch profit by sale", err);
    }
};

module.exports = { getProfitByProduct, getProfitSummary, getProfitBySale };
