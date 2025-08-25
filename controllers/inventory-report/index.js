"use strict";
const { sequelize } = require("../../database/models");

const LOW_STOCK_THRESHOLD = 5;

async function fetchAggregates() {
    const [rows] = await sequelize.query(`
        SELECT
            p.productId,
            COALESCE(SUM(iss.nonExpiredQty), 0) AS nonExpiredPurchased,
            COALESCE(SUM(iss.expiredQty), 0)     AS expiredPurchased,
            COALESCE(SUM(iss.nonExpiredQty), 0)  AS available
        FROM inventory_stock_summary iss
                 JOIN purchases p ON p.id = iss.purchaseId
        GROUP BY p.productId
    `);

    return rows.map(r => ({
        productId: r.productId,
        nonExpiredPurchased: Number(r.nonExpiredPurchased || 0),
        expiredPurchased: Number(r.expiredPurchased || 0),
        soldQty: 0,
        available: Number(r.available || 0),
    }));
}

// GET /in-stock-products  (not expired & qty > 0)
const listInStockProducts = async (_req, res) => {
    try {
        const rows = await fetchAggregates();
        const data = rows
            .filter(r => r.available > 0)
            .sort((a,b) => String(a.productId).localeCompare(String(b.productId)))
            .map(r => ({ productId: r.productId, quantity: r.available }));
        return res.json({ data });
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch in-stock products", error: err.message });
    }
};

// GET /low-stock-products (≤5 and >0, non-expired)
const listLowStockProducts = async (_req, res) => {
    try {
        const rows = await fetchAggregates();
        const data = rows
            .filter(r => r.available > 0 && r.available <= LOW_STOCK_THRESHOLD)
            .sort((a,b) => String(a.productId).localeCompare(String(b.productId)))
            .map(r => ({
                productId: r.productId,
                quantity: r.available,
                threshold: LOW_STOCK_THRESHOLD,
            }));
        return res.json({ data });
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch low-stock products", error: err.message });
    }
};

// GET /out-of-stock-products (≤0, non-expired)
const listOutOfStockProducts = async (_req, res) => {
    try {
        const rows = await fetchAggregates();
        const data = rows
            .filter(r => r.available <= 0)
            .sort((a,b) => String(a.productId).localeCompare(String(b.productId)))
            .map(r => ({ productId: r.productId }));
        return res.json({ data });
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch out-of-stock products", error: err.message });
    }
};

// GET /expired-only-products (any expiredPurchased > 0)
const listExpiredOnlyProducts = async (_req, res) => {
    try {
        const rows = await fetchAggregates();
        const data = rows
            .filter(r => r.expiredPurchased > 0)
            .sort((a,b) => String(a.productId).localeCompare(String(b.productId)))
            .map(r => ({
                productId: r.productId,
                expiredQuantity: r.expiredPurchased,
            }));
        return res.json({ data });
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch expired-only products", error: err.message });
    }
};

// GET /sellable-products (available > 0, non-expired)
const listSellableProducts = async (_req, res) => {
    try {
        const rows = await fetchAggregates();
        const data = rows
            .filter(r => r.available > 0)
            .sort((a,b) => String(a.productId).localeCompare(String(b.productId)))
            .map(r => ({ productId: r.productId, available: r.available }));
        return res.json({ data });
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch sellable products", error: err.message });
    }
};

module.exports = {
    listInStockProducts,
    listLowStockProducts,
    listOutOfStockProducts,
    listExpiredOnlyProducts,
    listSellableProducts,
};
