"use strict";
const { sequelize } =require("../../database/models");

const LOW_STOCK_THRESHOLD = 5;

async function fetchProductSummaryRows() {
    const [rows] = await sequelize.query(`
    SELECT
      p.id AS productId,
      p.name AS productName,
      p.status,
      p.isTrackStock,
      p.reorderLevel,
      COALESCE(s.nonExpiredQty, 0) AS nonExpiredQty,
      COALESCE(s.expiredQty, 0)    AS expiredQty
    FROM products p
    LEFT JOIN inventory_stock_summary s ON s.productId = p.id
  `);
    return rows;
}

// GET active-products
const listActiveProducts = async (_req, res) => {
    try {
        const rows = await fetchProductSummaryRows();
        const data = rows
            .filter(r => r.status === "active")
            .sort((a,b) => a.productName.localeCompare(b.productName))
            .map(r => ({
                productId: r.productId,
                productName: r.productName,
                isTrackStock: !!r.isTrackStock,
                reorderLevel: r.reorderLevel,
            }));
        return res.json({ data });
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch active products", error: err.message });
    }
};

// GET in-stock-products
const listInStockProducts = async (_req, res) => {
    try {
        const rows = await fetchProductSummaryRows();
        const data = rows
            .filter(r => r.status === "active" && Number(r.nonExpiredQty) > 0)
            .sort((a,b) => a.productName.localeCompare(b.productName))
            .map(r => ({ productId: r.productId, productName: r.productName, quantity: Number(r.nonExpiredQty) }));
        return res.json({ data });
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch in-stock products", error: err.message });
    }
};

// GET low-stock-products
const listLowStockProducts = async (_req, res) => {
    try {
        const rows = await fetchProductSummaryRows();
        const data = rows
            .filter(r => Number(r.nonExpiredQty) <= LOW_STOCK_THRESHOLD)
            .sort((a,b) => a.productName.localeCompare(b.productName))
            .map(r => ({
                productId: r.productId,
                productName: r.productName,
                quantity: Number(r.nonExpiredQty),
                reorderLevel: r.reorderLevel,
                threshold: LOW_STOCK_THRESHOLD,
            }));
        return res.json({ data });
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch low-stock products", error: err.message });
    }
};

// GET out-of-stock-products
const listOutOfStockProducts = async (_req, res) => {
    try {
        const rows = await fetchProductSummaryRows();
        const data = rows
            .filter(r => Number(r.nonExpiredQty) === 0)
            .sort((a,b) => a.productName.localeCompare(b.productName))
            .map(r => ({ productId: r.productId, productName: r.productName }));
        return res.json({ data });
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch out-of-stock products", error: err.message });
    }
};

// GET expired-only-products
const listExpiredOnlyProducts = async (_req, res) => {
    try {
        const rows = await fetchProductSummaryRows();
        const data = rows
            .filter(r => Number(r.nonExpiredQty) === 0 && Number(r.expiredQty) > 0)
            .sort((a,b) => a.productName.localeCompare(b.productName))
            .map(r => ({ productId: r.productId, productName: r.productName, expiredQuantity: Number(r.expiredQty) }));
        return res.json({ data });
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch expired-only products", error: err.message });
    }
};

// GET sellable-products
const listSellableProducts = async (_req, res) => {
    try {
        const rows = await fetchProductSummaryRows();
        const data = rows
            .filter(r => r.status === "active" && Number(r.nonExpiredQty) > 0)
            .sort((a,b) => a.productName.localeCompare(b.productName))
            .map(r => ({
                productId: r.productId,
                productName: r.productName,
                available: Number(r.nonExpiredQty),
                reorderLevel: r.reorderLevel,
            }));
        return res.json({ data });
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch sellable products", error: err.message });
    }
};

module.exports = {
    listActiveProducts,
    listInStockProducts,
    listLowStockProducts,
    listOutOfStockProducts,
    listExpiredOnlyProducts,
    listSellableProducts,
};
