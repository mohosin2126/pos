"use strict";
const { SellableProductView } = require("../../../POS/server/database/models");
const SalesController = require("../sales");

// GET /pos/sellable-products?q=
const listSellableProducts = async (req, res) => {
    try {
        const q = (req.query.q || "").trim().toLowerCase();
        const rows = await SellableProductView.findAll({ order: [["productName","ASC"]] });
        const filtered = !q ? rows : rows.filter(r => (r.productName || "").toLowerCase().includes(q));
        return res.json({
            data: filtered.map(r => ({
                productId: r.productId,
                productName: r.productName,
                available: Number(r.onHandNotExpired),
                reorderLevel: r.reorderLevel
            }))
        });
    } catch (err) {
        return res.status(500).json({ message: "Failed to list sellable products", error: err.message });
    }
};

// POST /pos/checkout -> same validations as /sales
const checkout = async (req, res) => SalesController.create(req, res);

module.exports = { listSellableProducts, checkout };
