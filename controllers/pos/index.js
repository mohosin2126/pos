"use strict";
const { sequelize } = require("../../database/models");
const SalesController = require("../sales");

// GET /sellable-products
const listSellableProducts = async (req, res) => {
    try {
        const q = (req.query.q || "").trim().toLowerCase();

        const [rows] = await sequelize.query(`
            SELECT
                x.productId,
                GREATEST(COALESCE(x.nonExpiredPurchased,0) - COALESCE(x.soldQty,0), 0) AS available
            FROM (
                     SELECT
                         a.productId,
                         a.nonExpiredPurchased,
                         b.soldQty
                     FROM (
                              SELECT p.productId,
                                     SUM(CASE WHEN p.expiryDate IS NULL OR p.expiryDate >= CURDATE() THEN p.totalItems ELSE 0 END) AS nonExpiredPurchased
                              FROM purchases p
                              GROUP BY p.productId
                          ) a
                              LEFT JOIN (
                         SELECT si.productId, COALESCE(SUM(si.quantity),0) AS soldQty
                         FROM sale_items si
                         GROUP BY si.productId
                     ) b ON b.productId = a.productId

                     UNION

                     SELECT
                         b.productId,
                         a.nonExpiredPurchased,
                         b.soldQty
                     FROM (
                              SELECT p.productId,
                                     SUM(CASE WHEN p.expiryDate IS NULL OR p.expiryDate >= CURDATE() THEN p.totalItems ELSE 0 END) AS nonExpiredPurchased
                              FROM purchases p
                              GROUP BY p.productId
                          ) a
                              RIGHT JOIN (
                         SELECT si.productId, COALESCE(SUM(si.quantity),0) AS soldQty
                         FROM sale_items si
                         GROUP BY si.productId
                     ) b ON b.productId = a.productId
                 ) x
            HAVING available > 0
            ORDER BY productId ASC
        `);

        const filtered = !q
            ? rows
            : rows.filter(r => String(r.productId).toLowerCase().includes(q));

        const data = filtered.map(r => ({
            productId: r.productId,
            available: Number(r.available),
        }));

        return res.json({ data });
    } catch (err) {
        return res.status(500).json({ message: "Failed to list sellable products", error: err.message });
    }
};

const checkout = async (req, res) => SalesController.create(req, res);

module.exports = { listSellableProducts, checkout };
