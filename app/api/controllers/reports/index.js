"use strict";

const { sequelize, Sale, SaleItem, Product, Category } = require("../../database/models");
const { success, badRequest, serverError } = require("../../utils/api-response");
const { calculateProfitMetrics } = require("../../utils/price-calculator");

const getProfitByProduct = async (req, res) => {
    try {
        const { startDate, endDate, categoryId, minMargin, maxMargin } = req.query;

        let dateFilter = "";
        const replacements = [];

        if (startDate && endDate) {
            dateFilter = "AND s.saleDate BETWEEN ? AND ?";
            replacements.push(startDate, endDate);
        } else if (startDate) {
            dateFilter = "AND s.saleDate >= ?";
            replacements.push(startDate);
        } else if (endDate) {
            dateFilter = "AND s.saleDate <= ?";
            replacements.push(endDate);
        }

        const [results] = await sequelize.query(
            `SELECT 
                p.id AS productId,
                p.name AS productName,
                p.sku,
                p.price AS currentPrice,
                p.avgCost,
                p.lastCost,
                c.name AS categoryName,
                COUNT(DISTINCT s.id) AS totalSales,
                SUM(si.quantity) AS totalUnitsSold,
                SUM(si.lineTotal) AS totalRevenue,
                SUM(si.costPrice * si.quantity) AS totalCost,
                SUM(si.lineTotal - (si.costPrice * si.quantity)) AS totalProfit,
                CASE 
                    WHEN SUM(si.lineTotal) > 0 
                    THEN ROUND((SUM(si.lineTotal - (si.costPrice * si.quantity)) / SUM(si.lineTotal)) * 100, 2)
                    ELSE 0 
                END AS avgMarginPercent,
                CASE 
                    WHEN SUM(si.costPrice * si.quantity) > 0 
                    THEN ROUND((SUM(si.lineTotal - (si.costPrice * si.quantity)) / SUM(si.costPrice * si.quantity)) * 100, 2)
                    ELSE 0 
                END AS avgMarkupPercent
            FROM sale_items si
            INNER JOIN sales s ON s.id = si.saleId
            INNER JOIN products p ON p.id = si.productId
            LEFT JOIN categories c ON c.id = p.categoryId
            WHERE s.status = 'completed' 
            AND si.costPrice IS NOT NULL
            ${dateFilter}
            GROUP BY p.id, p.name, p.sku, p.price, p.avgCost, p.lastCost, c.name
            ORDER BY totalProfit DESC`,
            { replacements }
        );

        let filteredResults = results;
        if (categoryId) {
            const products = await Product.findAll({ where: { categoryId: Number(categoryId) } });
            const productIds = new Set(products.map(p => p.id));
            filteredResults = results.filter(r => productIds.has(r.productId));
        }

        if (minMargin !== undefined || maxMargin !== undefined) {
            filteredResults = filteredResults.filter(r => {
                const margin = Number(r.avgMarginPercent);
                if (minMargin !== undefined && margin < Number(minMargin)) return false;
                if (maxMargin !== undefined && margin > Number(maxMargin)) return false;
                return true;
            });
        }

        return success(res, "Profit by product retrieved", filteredResults);
    } catch (err) {
        return serverError(res, "Failed to fetch profit by product", err);
    }
};

const getProfitSummary = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        let dateFilter = "";
        const replacements = [];

        if (startDate && endDate) {
            dateFilter = "AND s.saleDate BETWEEN ? AND ?";
            replacements.push(startDate, endDate);
        } else if (startDate) {
            dateFilter = "AND s.saleDate >= ?";
            replacements.push(startDate);
        } else if (endDate) {
            dateFilter = "AND s.saleDate <= ?";
            replacements.push(endDate);
        }

        const [summaryResults] = await sequelize.query(
            `SELECT 
                COUNT(DISTINCT s.id) AS totalSales,
                SUM(si.quantity) AS totalUnitsSold,
                SUM(si.lineTotal) AS totalRevenue,
                SUM(si.costPrice * si.quantity) AS totalCost,
                SUM(si.lineTotal - (si.costPrice * si.quantity)) AS totalProfit,
                CASE 
                    WHEN SUM(si.lineTotal) > 0 
                    THEN ROUND((SUM(si.lineTotal - (si.costPrice * si.quantity)) / SUM(si.lineTotal)) * 100, 2)
                    ELSE 0 
                END AS avgMarginPercent,
                COUNT(DISTINCT si.productId) AS uniqueProducts
            FROM sale_items si
            INNER JOIN sales s ON s.id = si.saleId
            WHERE s.status = 'completed' 
            AND si.costPrice IS NOT NULL
            ${dateFilter}`,
            { replacements }
        );

        const [topProducts] = await sequelize.query(
            `SELECT 
                p.id AS productId,
                p.name AS productName,
                SUM(si.lineTotal - (si.costPrice * si.quantity)) AS totalProfit
            FROM sale_items si
            INNER JOIN sales s ON s.id = si.saleId
            INNER JOIN products p ON p.id = si.productId
            WHERE s.status = 'completed' 
            AND si.costPrice IS NOT NULL
            ${dateFilter}
            GROUP BY p.id, p.name
            ORDER BY totalProfit DESC
            LIMIT 5`,
            { replacements }
        );

        const [lossProducts] = await sequelize.query(
            `SELECT 
                p.id AS productId,
                p.name AS productName,
                SUM(si.lineTotal - (si.costPrice * si.quantity)) AS totalProfit,
                COUNT(*) AS timesSold
            FROM sale_items si
            INNER JOIN sales s ON s.id = si.saleId
            INNER JOIN products p ON p.id = si.productId
            WHERE s.status = 'completed' 
            AND si.costPrice IS NOT NULL
            AND si.lineTotal < (si.costPrice * si.quantity)
            ${dateFilter}
            GROUP BY p.id, p.name
            ORDER BY totalProfit ASC
            LIMIT 5`,
            { replacements }
        );

        const summary = summaryResults[0] || {};

        return success(res, "Profit summary retrieved", {
            summary: {
                totalSales: Number(summary.totalSales || 0),
                totalUnitsSold: Number(summary.totalUnitsSold || 0),
                totalRevenue: Number(summary.totalRevenue || 0).toFixed(2),
                totalCost: Number(summary.totalCost || 0).toFixed(2),
                totalProfit: Number(summary.totalProfit || 0).toFixed(2),
                avgMarginPercent: Number(summary.avgMarginPercent || 0),
                uniqueProducts: Number(summary.uniqueProducts || 0),
            },
            topPerformers: topProducts.map(p => ({
                productId: p.productId,
                productName: p.productName,
                totalProfit: Number(p.totalProfit || 0).toFixed(2),
            })),
            lossProducts: lossProducts.map(p => ({
                productId: p.productId,
                productName: p.productName,
                totalProfit: Number(p.totalProfit || 0).toFixed(2),
                timesSold: Number(p.timesSold || 0),
            })),
        });
    } catch (err) {
        return serverError(res, "Failed to fetch profit summary", err);
    }
};

const getProfitBySale = async (req, res) => {
    try {
        const { startDate, endDate, minProfit, maxProfit } = req.query;

        let dateFilter = "";
        const replacements = [];

        if (startDate && endDate) {
            dateFilter = "AND s.saleDate BETWEEN ? AND ?";
            replacements.push(startDate, endDate);
        } else if (startDate) {
            dateFilter = "AND s.saleDate >= ?";
            replacements.push(startDate);
        } else if (endDate) {
            dateFilter = "AND s.saleDate <= ?";
            replacements.push(endDate);
        }

        const [results] = await sequelize.query(
            `SELECT 
                s.id AS saleId,
                s.referenceNo,
                s.saleDate,
                s.totalAmount AS saleTotal,
                SUM(si.costPrice * si.quantity) AS totalCost,
                SUM(si.lineTotal - (si.costPrice * si.quantity)) AS totalProfit,
                CASE 
                    WHEN SUM(si.lineTotal) > 0 
                    THEN ROUND((SUM(si.lineTotal - (si.costPrice * si.quantity)) / SUM(si.lineTotal)) * 100, 2)
                    ELSE 0 
                END AS marginPercent,
                COUNT(si.id) AS itemCount
            FROM sales s
            INNER JOIN sale_items si ON si.saleId = s.id
            WHERE s.status = 'completed' 
            AND si.costPrice IS NOT NULL
            ${dateFilter}
            GROUP BY s.id, s.referenceNo, s.saleDate, s.totalAmount
            ORDER BY s.saleDate DESC`,
            { replacements }
        );

        let filteredResults = results;
        if (minProfit !== undefined || maxProfit !== undefined) {
            filteredResults = results.filter(r => {
                const profit = Number(r.totalProfit);
                if (minProfit !== undefined && profit < Number(minProfit)) return false;
                if (maxProfit !== undefined && profit > Number(maxProfit)) return false;
                return true;
            });
        }

        return success(res, "Profit by sale retrieved", filteredResults);
    } catch (err) {
        return serverError(res, "Failed to fetch profit by sale", err);
    }
};

module.exports = { getProfitByProduct, getProfitSummary, getProfitBySale };
