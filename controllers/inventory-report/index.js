"use strict";

const {
    ActiveProductView,
    NonExpiredStockView,
    LowStockProductView,
    ExpiredOnlyProductView,
    SellableProductView,
    OutOfStockProductView
} = require("../../../POS/server/database/models");

// GET /inventory/active-products
const listActiveProducts = async (req, res) => {
    try {
        const rows = await ActiveProductView.findAll({ order: [["productName", "ASC"]] });
        return res.json({
            data: rows.map(r => ({
                productId: r.productId,
                productName: r.productName,
                isTrackStock: !!r.isTrackStock,
                reorderLevel: r.reorderLevel,
            })),
        });
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch active products", error: err.message });
    }
};

// GET /inventory/in-stock-products (non-expired stock > 0)
const listInStockProducts = async (req, res) => {
    try {
        const rows = await NonExpiredStockView.findAll({ order: [["productName", "ASC"]] });
        // No Sequelize.Op — filter in JS
        const filtered = rows.filter(r => Number(r.onHandNotExpired || 0) > 0);
        return res.json({
            data: filtered.map(r => ({
                productId: r.productId,
                productName: r.productName,
                quantity: Number(r.onHandNotExpired),
            })),
        });
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch in-stock products", error: err.message });
    }
};

// GET /inventory/low-stock-products
const listLowStockProducts = async (req, res) => {
    try {
        const rows = await LowStockProductView.findAll({ order: [["productName", "ASC"]] });
        return res.json({
            data: rows.map(r => ({
                productId: r.productId,
                productName: r.productName,
                quantity: Number(r.onHandNotExpired),
                reorderLevel: r.reorderLevel,
            })),
        });
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch low-stock products", error: err.message });
    }
};

// GET /inventory/expired-only-products
// (products that have stock, but all of it is expired: non-expired = 0 AND total > 0)
const listExpiredOnlyProducts = async (req, res) => {
    try {
        const rows = await ExpiredOnlyProductView.findAll({ order: [["productName", "ASC"]] });
        return res.json({
            data: rows.map(r => ({
                productId: r.productId,
                productName: r.productName,
                expiredQuantity: Number(r.expiredOnlyQty),
            })),
        });
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch expired-only products", error: err.message });
    }
};


const listSellableProducts = async (req, res) => {
    try {
        const rows = await SellableProductView.findAll({ order: [["productName", "ASC"]] });
        return res.json({
            data: rows.map(r => ({
                productId: r.productId,
                productName: r.productName,
                available: Number(r.onHandNotExpired),
                reorderLevel: r.reorderLevel,
            })),
        });
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch sellable products", error: err.message });
    }
};

const listOutOfStockProducts = async (req, res) => {
    try {
        const rows = await OutOfStockProductView.findAll({ order: [["productName", "ASC"]] });
        return res.json({
            data: rows.map(r => ({
                productId: r.productId,
                productName: r.productName,
            })),
        });
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch out-of-stock products", error: err.message });
    }
};



module.exports = {
    listActiveProducts,
    listInStockProducts,
    listLowStockProducts,
    listExpiredOnlyProducts,
    listSellableProducts,
    listOutOfStockProducts,
};
