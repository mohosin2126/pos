"use strict";

const { sequelize, StockSummary } = require("../../database/models");
const {
    success, serverError,
} = require("../../utils/api-response");

// Recompute summaries and materialized lists for all or specific productIds
const rebuild = async (req, res) => {
    try {
        await sequelize.transaction(async (t) => {
            let productIds = Array.isArray(req.body?.productIds)
                ? req.body.productIds.map(Number).filter(Boolean)
                : [];

            if (!productIds.length) {
                const [ids] = await sequelize.query(
                    `SELECT DISTINCT productId FROM purchases`,
                    { transaction: t }
                );
                productIds = ids.map(r => Number(r.productId));
            }
            if (!productIds.length) return;

            const today = new Date(new Date().toDateString());
            const now = new Date();

            // Purchases aggregated per product per lot
            const [pLots] = await sequelize.query(
                `SELECT productId, expiryDate, COALESCE(SUM(totalItems),0) AS purchasedQty
                 FROM purchases
                 WHERE productId IN (${productIds.map(() => "?").join(",")})
                 GROUP BY productId, expiryDate`,
                { replacements: productIds, transaction: t }
            );

            // Sold allocations aggregated from sale_items.allocations JSON for completed sales
            const [sAllocRows] = await sequelize.query(
                `SELECT si.productId, si.allocations
                 FROM sale_items si
                          JOIN sales s ON s.id = si.saleId
                 WHERE si.productId IN (${productIds.map(() => "?").join(",")})
                   AND s.status='completed'`,
                { replacements: productIds, transaction: t }
            );

            // Map key: `${productId}__${lotKey}`
            const soldByProdLot = new Map();
            for (const r of sAllocRows) {
                const allocs = Array.isArray(r.allocations)
                    ? r.allocations
                    : (r.allocations ? JSON.parse(r.allocations) : []);
                for (const a of allocs) {
                    const lotKey = a.expiryDate
                        ? new Date(a.expiryDate).toISOString().slice(0, 10)
                        : "NULL";
                    const key = `${r.productId}__${lotKey}`;
                    soldByProdLot.set(key, (soldByProdLot.get(key) || 0) + Number(a.qty || 0));
                }
            }

            // Aggregate remaining per product: unexpired vs expired
            const byProd = new Map();
            for (const row of pLots) {
                const pid = Number(row.productId);
                const lotKey = row.expiryDate ? new Date(row.expiryDate).toISOString().slice(0,10) : "NULL";
                const purchased = Number(row.purchasedQty || 0);
                const sold = Number(soldByProdLot.get(`${pid}__${lotKey}`) || 0);
                const remaining = Math.max(0, purchased - sold);

                const exp = row.expiryDate ? new Date(row.expiryDate) : null;
                const isExpired = exp && exp < today;

                const prev = byProd.get(pid) || { unexp: 0, expd: 0 };
                if (isExpired) prev.expd += remaining; else prev.unexp += remaining;
                byProd.set(pid, prev);
            }

            // Prepare upserts & list rows
            const upserts = [];
            const inStock = [], lowStock = [], expired = [], sellable = [], oos = [];

            for (const pid of productIds) {
                const agg = byProd.get(pid) || { unexp: 0, expd: 0 };
                const qoh = Number(agg.unexp + agg.expd);
                upserts.push([pid, qoh, agg.unexp, agg.expd, 5, now]);

                if (agg.expd > 0) expired.push([pid, agg.expd]);
                if (qoh > 0) {
                    inStock.push([pid, qoh]);
                    if (qoh < 5) lowStock.push([pid, qoh]);
                    if (agg.unexp > 0) sellable.push([pid, agg.unexp]); // NOTE: unexpiredQty (NOT nonExpiredQty)
                } else {
                    oos.push([pid, qoh]);
                }
            }

            if (upserts.length) {
                const ph = upserts.map(() => "(?,?,?,?,?,?)").join(",");
                await sequelize.query(
                    `INSERT INTO stock_summaries
                     (productId, quantityOnHand, unexpiredQty, expiredQty, reorderPoint, lastComputedAt)
                     VALUES ${ph}
                         ON DUPLICATE KEY UPDATE
                                              quantityOnHand=VALUES(quantityOnHand),
                                              unexpiredQty=VALUES(unexpiredQty),
                                              expiredQty=VALUES(expiredQty),
                                              reorderPoint=VALUES(reorderPoint),
                                              lastComputedAt=VALUES(lastComputedAt)`,
                    { replacements: upserts.flat(), transaction: t }
                );
            }

            const inClause = productIds.map(() => "?").join(",");
            await Promise.all([
                sequelize.query(`DELETE FROM list_in_stock_products WHERE productId IN (${inClause})`, { replacements: productIds, transaction: t }),
                sequelize.query(`DELETE FROM list_low_stock_products WHERE productId IN (${inClause})`, { replacements: productIds, transaction: t }),
                sequelize.query(`DELETE FROM list_expired_products WHERE productId IN (${inClause})`, { replacements: productIds, transaction: t }),
                sequelize.query(`DELETE FROM list_sellable_products WHERE productId IN (${inClause})`, { replacements: productIds, transaction: t }),
                sequelize.query(`DELETE FROM list_out_of_stock_products WHERE productId IN (${inClause})`, { replacements: productIds, transaction: t }),
            ]);

            async function insert(table, cols, rows) {
                if (!rows.length) return;
                const ph = rows.map(() => `(${cols.map(() => "?").join(",")})`).join(",");
                await sequelize.query(`INSERT INTO ${table} (${cols.join(",")}) VALUES ${ph}`, {
                    replacements: rows.flat(), transaction: t,
                });
            }
            await insert("list_expired_products", ["productId", "expiredQty"], expired);
            await insert("list_in_stock_products", ["productId", "quantityOnHand"], inStock);
            await insert("list_low_stock_products", ["productId", "quantityOnHand"], lowStock);
            await insert("list_sellable_products", ["productId", "unexpiredQty"], sellable);
            await insert("list_out_of_stock_products", ["productId", "quantityOnHand"], oos);
        });

        return success(res, "Inventory rebuilt");
    } catch (error) {
        return serverError(res, "Error rebuilding inventory", error);
    }
};

// Simple readers (from materialized lists)
const listInStockProducts = async (_req, res) => {
    try {
        const [rows] = await sequelize.query(`SELECT * FROM list_in_stock_products`);
        return success(res, "Success", rows);
    } catch (error) {
        return serverError(res, "Error fetching in-stock list", error);
    }
};
const listLowStockProducts = async (_req, res) => {
    try {
        const [rows] = await sequelize.query(`SELECT * FROM list_low_stock_products`);
        return success(res, "Success", rows);
    } catch (error) {
        return serverError(res, "Error fetching low-stock list", error);
    }
};
const listExpiredOnlyProducts = async (_req, res) => {
    try {
        const [rows] = await sequelize.query(`SELECT * FROM list_expired_products`);
        return success(res, "Success", rows);
    } catch (error) {
        return serverError(res, "Error fetching expired list", error);
    }
};
const listSellableProducts = async (_req, res) => {
    try {
        const [rows] = await sequelize.query(`SELECT * FROM list_sellable_products`);
        return success(res, "Success", rows);
    } catch (error) {
        return serverError(res, "Error fetching sellable list", error);
    }
};
const listOutOfStockProducts = async (_req, res) => {
    try {
        const [rows] = await sequelize.query(`SELECT * FROM list_out_of_stock_products`);
        return success(res, "Success", rows);
    } catch (error) {
        return serverError(res, "Error fetching out-of-stock list", error);
    }
};
const listSummary = async (_req, res) => {
    try {
        const data = await StockSummary.findAll({ raw: true });
        return success(res, "Success", data);
    } catch (error) {
        return serverError(res, "Error fetching summary", error);
    }
};

module.exports = {
    rebuild,
    listInStockProducts,
    listLowStockProducts,
    listExpiredOnlyProducts,
    listSellableProducts,
    listOutOfStockProducts,
    listSummary,
};
