"use strict";
const { sequelize } = require("../../database/models");
const SalesController = require("../sales");

// GET sellable-products?q=
const listSellableProducts = async (req, res) => {
    try {
        const q = (req.query.q || "").trim().toLowerCase();
        const [rows] = await sequelize.query(`
      SELECT p.id AS productId, p.name AS productName, p.reorderLevel,
             COALESCE(s.nonExpiredQty,0) AS available
      FROM products p
      JOIN inventory_stock_summary s ON s.productId = p.id
      WHERE p.status = 'active' AND s.nonExpiredQty > 0
      ORDER BY p.name ASC
    `);
        const filtered = !q ? rows : rows.filter(r => (r.productName || "").toLowerCase().includes(q));
        const data = filtered.map(r => ({
            productId: r.productId,
            productName: r.productName,
            available: Number(r.available),
            reorderLevel: r.reorderLevel,
        }));
        return res.json({ data });
    } catch (err) {
        return res.status(500).json({ message: "Failed to list sellable products", error: err.message });
    }
};


const checkout = async (req, res) => SalesController.create(req, res);

module.exports = { listSellableProducts, checkout };
