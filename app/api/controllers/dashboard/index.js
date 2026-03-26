"use strict";

const { QueryTypes } = require("sequelize");
const { sequelize, Product } = require("../../database/models");
const { success, serverError } = require("../../utils/api-response");
const { Decimal } = require("../../utils/price-calculator");
const { buildLotSnapshot } = require("../../utils/inventory-recompute");
const { getNetAverageCostMap } = require("../../utils/costing");
const { getSaleReturnRevenueAmount } = require("../../utils/sale-returns");

const SALE_RETURN_STATUSES = ["approved", "refunded"];
const PURCHASE_RETURN_STATUSES = ["pending", "approved", "refunded"];
const EXPIRING_SOON_DAYS = 30;

function parseJsonArray(value) {
    if (Array.isArray(value)) return value;
    if (!value) return [];

    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch (_error) {
        return [];
    }
}

function startOfDay(date = new Date()) {
    const next = new Date(date);
    next.setHours(0, 0, 0, 0);
    return next;
}

function startOfMonth(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfYear(date = new Date()) {
    return new Date(date.getFullYear(), 0, 1);
}

function startOfMonthOffset(date = new Date(), offset = 0) {
    return new Date(date.getFullYear(), date.getMonth() + offset, 1);
}

function addDays(date, days) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
}

function toDateKey(value) {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function inRange(value, start, end) {
    if (!value) return false;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return false;
    if (start && date < start) return false;
    if (end && date > end) return false;
    return true;
}

function toAmount(value) {
    const num = Number(value || 0);
    return Number.isFinite(num) ? num : 0;
}

function roundCurrency(value) {
    return Number(new Decimal(value || 0).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toString());
}

async function getAverageCostMap() {
    return getNetAverageCostMap();
}

async function getSalesRows(minDate) {
    return sequelize.query(
        `SELECT
             id,
             referenceNo,
             saleDate,
             totalAmount
         FROM sales
         WHERE status = 'completed'
           AND saleDate >= ?
         ORDER BY saleDate DESC`,
        {
            replacements: [minDate],
            type: QueryTypes.SELECT,
        }
    );
}

async function getSaleItemRows(minDate) {
    return sequelize.query(
        `SELECT
             s.id AS saleId,
             s.saleDate,
             si.productId,
             si.quantity,
             (si.lineTotal - si.taxAmount) AS itemBaseAmount,
             CASE
                 WHEN sale_totals.saleBaseAmount > 0
                 THEN s.discountAmount * ((si.lineTotal - si.taxAmount) / sale_totals.saleBaseAmount)
                 ELSE 0
             END AS allocatedOrderDiscount
         FROM sale_items si
         JOIN sales s ON s.id = si.saleId
         JOIN (
             SELECT saleId, COALESCE(SUM(lineTotal - taxAmount), 0) AS saleBaseAmount
             FROM sale_items
             GROUP BY saleId
         ) sale_totals ON sale_totals.saleId = si.saleId
         WHERE s.status = 'completed'
           AND s.saleDate >= ?
         ORDER BY s.saleDate DESC`,
        {
            replacements: [minDate],
            type: QueryTypes.SELECT,
        }
    );
}

async function getSaleReturnRows(minDate) {
    const placeholders = SALE_RETURN_STATUSES.map(() => "?").join(",");
    return sequelize.query(
        `SELECT
             id,
             saleId,
             referenceNo,
             returnDate,
             totalReturnAmount,
             refundAmount,
             refundStatus,
             restockingDisposition,
             returnItems
         FROM sale_returns
         WHERE refundStatus IN (${placeholders})
           AND returnDate >= ?
         ORDER BY returnDate DESC`,
        {
            replacements: [...SALE_RETURN_STATUSES, minDate],
            type: QueryTypes.SELECT,
        }
    );
}

function buildMetrics({ start, end, salesRows, saleItemRows, saleReturnRows, avgCostMap }) {
    let salesTotal = 0;
    let orders = 0;
    let revenue = 0;
    let costOfGoods = 0;
    let returnAmount = 0;
    let returnedRevenue = 0;
    let returnedCost = 0;

    for (const sale of salesRows) {
        if (!inRange(sale.saleDate, start, end)) continue;
        salesTotal += toAmount(sale.totalAmount);
        orders += 1;
    }

    for (const item of saleItemRows) {
        if (!inRange(item.saleDate, start, end)) continue;
        const quantity = toAmount(item.quantity);
        const revenueAmount = toAmount(item.itemBaseAmount) - toAmount(item.allocatedOrderDiscount);
        const avgCost = toAmount(avgCostMap.get(Number(item.productId)));

        revenue += revenueAmount;
        costOfGoods += quantity * avgCost;
    }

    for (const saleReturn of saleReturnRows) {
        if (!inRange(saleReturn.returnDate, start, end)) continue;

        returnAmount += toAmount(saleReturn.totalReturnAmount);

        for (const item of parseJsonArray(saleReturn.returnItems)) {
            const quantity = toAmount(item.quantity);
            const revenueAmount = getSaleReturnRevenueAmount(item);
            const avgCost = toAmount(avgCostMap.get(Number(item.productId)));

            returnedRevenue += revenueAmount;
            returnedCost += quantity * avgCost;
        }
    }

    const profit = (revenue - returnedRevenue) - (costOfGoods - returnedCost);

    return {
        salesTotal: roundCurrency(salesTotal - returnAmount),
        grossSales: roundCurrency(salesTotal),
        orders,
        returnsTotal: roundCurrency(returnAmount),
        revenue: roundCurrency(revenue - returnedRevenue),
        profit: roundCurrency(profit),
    };
}

function buildTrend({ days, salesRows, saleItemRows, saleReturnRows, avgCostMap }) {
    const start = startOfDay(addDays(new Date(), -(days - 1)));
    const buckets = [];
    const bucketMap = new Map();

    for (let index = 0; index < days; index += 1) {
        const date = addDays(start, index);
        const key = toDateKey(date);
        const bucket = {
            date: key,
            label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            sales: 0,
            profit: 0,
            returns: 0,
            orders: 0,
        };

        buckets.push(bucket);
        bucketMap.set(key, bucket);
    }

    for (const sale of salesRows) {
        const key = toDateKey(sale.saleDate);
        const bucket = bucketMap.get(key);
        if (!bucket) continue;
        bucket.sales += toAmount(sale.totalAmount);
        bucket.orders += 1;
    }

    for (const item of saleItemRows) {
        const key = toDateKey(item.saleDate);
        const bucket = bucketMap.get(key);
        if (!bucket) continue;

        const quantity = toAmount(item.quantity);
        const revenue = toAmount(item.itemBaseAmount) - toAmount(item.allocatedOrderDiscount);
        const avgCost = toAmount(avgCostMap.get(Number(item.productId)));

        bucket.profit += revenue - (quantity * avgCost);
    }

    for (const saleReturn of saleReturnRows) {
        const key = toDateKey(saleReturn.returnDate);
        const bucket = bucketMap.get(key);
        if (!bucket) continue;

        bucket.sales -= toAmount(saleReturn.totalReturnAmount);
        bucket.returns += toAmount(saleReturn.totalReturnAmount);

        for (const item of parseJsonArray(saleReturn.returnItems)) {
            const quantity = toAmount(item.quantity);
            const revenue = getSaleReturnRevenueAmount(item);
            const avgCost = toAmount(avgCostMap.get(Number(item.productId)));

            bucket.profit -= revenue - (quantity * avgCost);
        }
    }

    return buckets.map((bucket) => ({
        ...bucket,
        sales: roundCurrency(bucket.sales),
        profit: roundCurrency(bucket.profit),
        returns: roundCurrency(bucket.returns),
    }));
}

function aggregateTopSellingProducts({ start, end, saleItemRows, saleReturnRows, avgCostMap, productMap, limit = 5 }) {
    const metrics = new Map();

    for (const item of saleItemRows) {
        if (!inRange(item.saleDate, start, end)) continue;

        const productId = Number(item.productId);
        const current = metrics.get(productId) || {
            productId,
            soldQuantity: 0,
            revenue: 0,
            costOfGoodsSold: 0,
            profit: 0,
        };

        const quantity = toAmount(item.quantity);
        const revenue = toAmount(item.itemBaseAmount) - toAmount(item.allocatedOrderDiscount);
        const cost = quantity * toAmount(avgCostMap.get(productId));

        current.soldQuantity += quantity;
        current.revenue += revenue;
        current.costOfGoodsSold += cost;
        current.profit += revenue - cost;
        metrics.set(productId, current);
    }

    for (const saleReturn of saleReturnRows) {
        if (!inRange(saleReturn.returnDate, start, end)) continue;

        for (const item of parseJsonArray(saleReturn.returnItems)) {
            const productId = Number(item.productId);
            const current = metrics.get(productId) || {
                productId,
                soldQuantity: 0,
                revenue: 0,
                costOfGoodsSold: 0,
                profit: 0,
            };

            const quantity = toAmount(item.quantity);
            const revenue = getSaleReturnRevenueAmount(item);
            const cost = quantity * toAmount(avgCostMap.get(productId));

            current.soldQuantity -= quantity;
            current.revenue -= revenue;
            current.costOfGoodsSold -= cost;
            current.profit -= revenue - cost;
            metrics.set(productId, current);
        }
    }

    return [...metrics.values()]
        .map((item) => {
            const product = productMap.get(item.productId) || {};
            return {
                productId: item.productId,
                productName: product.name || "Unknown Product",
                sku: product.sku || null,
                stockQuantity: toAmount(product.stockQuantity),
                soldQuantity: Math.max(0, Math.round(item.soldQuantity)),
                revenue: roundCurrency(item.revenue),
                costOfGoodsSold: roundCurrency(item.costOfGoodsSold),
                profit: roundCurrency(item.profit),
            };
        })
        .filter((item) => item.soldQuantity > 0 || item.revenue > 0)
        .sort((a, b) => {
            if (b.soldQuantity !== a.soldQuantity) return b.soldQuantity - a.soldQuantity;
            return b.revenue - a.revenue;
        })
        .slice(0, limit);
}

async function getInventorySnapshot() {
    const [counts] = await sequelize.query(
        `SELECT
             (SELECT COUNT(*) FROM products WHERE status = 'active') AS totalProducts,
             (SELECT COUNT(*) FROM list_sellable_products) AS sellableCount,
             (SELECT COUNT(*) FROM list_low_stock_products) AS lowStockCount,
             (SELECT COUNT(*) FROM list_out_of_stock_products) AS outOfStockCount,
             (SELECT COUNT(*) FROM list_expired_products) AS expiredCount`,
        { type: QueryTypes.SELECT }
    );

    const lowStockProducts = await sequelize.query(
        `SELECT
             p.id AS productId,
             p.name AS productName,
             p.sku,
             ss.quantityOnHand,
             ss.reorderPoint
         FROM stock_summaries ss
         JOIN products p ON p.id = ss.productId
         WHERE p.status = 'active'
           AND ss.quantityOnHand > 0
           AND ss.quantityOnHand <= ss.reorderPoint
         ORDER BY ss.quantityOnHand ASC, ss.reorderPoint DESC, p.name ASC
         LIMIT 5`,
        { type: QueryTypes.SELECT }
    );

    const trackedProducts = await Product.findAll({
        attributes: ["id", "name", "sku", "stockQuantity"],
        where: { status: "active", isTrackStock: true },
        raw: true,
    });

    const trackedIds = trackedProducts.map((product) => Number(product.id)).filter(Boolean);
    const lotsByProduct = trackedIds.length ? await buildLotSnapshot(trackedIds) : new Map();
    const today = startOfDay(new Date());
    const threshold = addDays(today, EXPIRING_SOON_DAYS);
    const expiringSoonProducts = [];

    for (const product of trackedProducts) {
        const lots = lotsByProduct.get(Number(product.id)) || [];
        const soonLots = lots.filter((lot) => lot.expiryDate && !lot.isExpired && lot.expiryDate <= threshold && toAmount(lot.qty) > 0);
        if (!soonLots.length) continue;

        const expiringQty = soonLots.reduce((sum, lot) => sum + toAmount(lot.qty), 0);
        const nextExpiry = soonLots
            .map((lot) => lot.expiryDate)
            .sort((a, b) => new Date(a) - new Date(b))[0];

        const diffTime = new Date(nextExpiry).getTime() - today.getTime();
        const daysUntilExpiry = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

        expiringSoonProducts.push({
            productId: Number(product.id),
            productName: product.name,
            sku: product.sku,
            stockQuantity: toAmount(product.stockQuantity),
            expiringQty: roundCurrency(expiringQty),
            nextExpiryDate: nextExpiry,
            daysUntilExpiry,
        });
    }

    expiringSoonProducts.sort((a, b) => {
        if (a.daysUntilExpiry !== b.daysUntilExpiry) return a.daysUntilExpiry - b.daysUntilExpiry;
        return a.productName.localeCompare(b.productName);
    });

    return {
        totalProducts: Number(counts.totalProducts || 0),
        sellableCount: Number(counts.sellableCount || 0),
        lowStockCount: Number(counts.lowStockCount || 0),
        outOfStockCount: Number(counts.outOfStockCount || 0),
        expiredCount: Number(counts.expiredCount || 0),
        expiringSoonCount: expiringSoonProducts.length,
        lowStockProducts: lowStockProducts.map((item) => ({
            productId: Number(item.productId),
            productName: item.productName,
            sku: item.sku,
            quantityOnHand: roundCurrency(item.quantityOnHand),
            reorderPoint: roundCurrency(item.reorderPoint),
        })),
        expiringSoonProducts: expiringSoonProducts.slice(0, 5),
    };
}

async function getRecentTransactions() {
    const [sales, purchases, saleReturns, purchaseReturns] = await Promise.all([
        sequelize.query(
            `SELECT
                 s.id AS entityId,
                 'sale' AS type,
                 s.referenceNo,
                 s.saleDate AS transactionDate,
                 s.status,
                 COALESCE(c.name, 'Walk-in Customer') AS partyName,
                 s.totalAmount AS amount
             FROM sales s
             LEFT JOIN customers c ON c.id = s.customerId
             ORDER BY s.saleDate DESC
             LIMIT 10`,
            { type: QueryTypes.SELECT }
        ),
        sequelize.query(
            `SELECT
                 p.id AS entityId,
                 'purchase' AS type,
                 p.referenceNo,
                 p.purchaseDate AS transactionDate,
                 p.status,
                 COALESCE(s.companyName, 'Unknown Supplier') AS partyName,
                 p.totalAmount AS amount
             FROM purchases p
             LEFT JOIN suppliers s ON s.id = p.supplierId
             ORDER BY p.purchaseDate DESC
             LIMIT 10`,
            { type: QueryTypes.SELECT }
        ),
        sequelize.query(
            `SELECT
                 sr.id AS entityId,
                 'sale_return' AS type,
                 sr.referenceNo,
                 sr.returnDate AS transactionDate,
                 sr.refundStatus AS status,
                 COALESCE(c.name, 'Walk-in Customer') AS partyName,
                 sr.totalReturnAmount AS amount
             FROM sale_returns sr
             LEFT JOIN sales s ON s.id = sr.saleId
             LEFT JOIN customers c ON c.id = s.customerId
             ORDER BY sr.returnDate DESC
             LIMIT 10`,
            { type: QueryTypes.SELECT }
        ),
        sequelize.query(
            `SELECT
                 pr.id AS entityId,
                 'purchase_return' AS type,
                 pr.referenceNo,
                 pr.returnDate AS transactionDate,
                 pr.refundStatus AS status,
                 COALESCE(s.companyName, 'Unknown Supplier') AS partyName,
                 pr.totalReturnAmount AS amount
             FROM purchase_returns pr
             LEFT JOIN purchases p ON p.id = pr.purchaseId
             LEFT JOIN suppliers s ON s.id = p.supplierId
             WHERE pr.refundStatus IN (${PURCHASE_RETURN_STATUSES.map(() => "?").join(",")})
             ORDER BY pr.returnDate DESC
             LIMIT 10`,
            {
                replacements: PURCHASE_RETURN_STATUSES,
                type: QueryTypes.SELECT,
            }
        ),
    ]);

    return [...sales, ...purchases, ...saleReturns, ...purchaseReturns]
        .map((item) => ({
            entityId: Number(item.entityId),
            type: item.type,
            referenceNo: item.referenceNo,
            transactionDate: item.transactionDate,
            status: item.status,
            partyName: item.partyName,
            amount: roundCurrency(item.amount),
        }))
        .sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate))
        .slice(0, 10);
}

const getSummary = async (_req, res) => {
    try {
        const now = new Date();
        const todayStart = startOfDay(now);
        const monthStart = startOfMonth(now);
        const yearStart = startOfYear(now);
        const trendStart = startOfMonthOffset(now, -5);
        const minDate = trendStart < yearStart ? trendStart : yearStart;

        const [avgCostMap, productRows, salesRows, saleItemRows, saleReturnRows, inventory, recentTransactions] = await Promise.all([
            getAverageCostMap(),
            Product.findAll({
                attributes: ["id", "name", "sku", "stockQuantity"],
                where: { status: "active" },
                raw: true,
            }),
            getSalesRows(minDate),
            getSaleItemRows(minDate),
            getSaleReturnRows(minDate),
            getInventorySnapshot(),
            getRecentTransactions(),
        ]);

        const productMap = new Map(productRows.map((product) => [Number(product.id), product]));
        const overview = {
            today: buildMetrics({ start: todayStart, end: now, salesRows, saleItemRows, saleReturnRows, avgCostMap }),
            month: buildMetrics({ start: monthStart, end: now, salesRows, saleItemRows, saleReturnRows, avgCostMap }),
            year: buildMetrics({ start: yearStart, end: now, salesRows, saleItemRows, saleReturnRows, avgCostMap }),
        };

        const topSellingProducts = aggregateTopSellingProducts({
            start: monthStart,
            end: now,
            saleItemRows,
            saleReturnRows,
            avgCostMap,
            productMap,
        });

        const stockDistribution = [
            { label: "Sellable", value: inventory.sellableCount },
            { label: "Low Stock", value: inventory.lowStockCount },
            { label: "Expired", value: inventory.expiredCount },
            { label: "Out of Stock", value: inventory.outOfStockCount },
            { label: "Expiring Soon", value: inventory.expiringSoonCount },
        ];

        return success(res, "Dashboard summary fetched successfully", {
            overview,
            inventory,
            topSellingProducts,
            recentTransactions,
            trend: buildTrend({
                days: 7,
                salesRows,
                saleItemRows,
                saleReturnRows,
                avgCostMap,
            }),
            stockDistribution,
        });
    } catch (error) {
        return serverError(res, "Failed to fetch dashboard summary", error);
    }
};

module.exports = { getSummary };
