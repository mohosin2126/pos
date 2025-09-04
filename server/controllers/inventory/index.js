"use strict";

const { sequelize, StockSummary } = require("../../database/models");
const { success, serverError } = require("../../utils/api-response");

// ========== optional: rebuild endpoint uses same inline recompute ==========
const LOW_STOCK_THRESHOLD = 5;
async function recomputeForProducts(productIds, t) {
    if (!Array.isArray(productIds) || !productIds.length) return;

    const [pLots] = await sequelize.query(
        `SELECT productId, expiryDate, COALESCE(SUM(totalItems),0) AS purchasedQty
         FROM purchases
         WHERE productId IN (${productIds.map(() => "?").join(",")})
         GROUP BY productId, expiryDate`,
        { replacements: productIds, transaction: t }
    );

    const [sAllocRows] = await sequelize.query(
        `SELECT si.productId, si.allocations
         FROM sale_items si
                  JOIN sales s ON s.id = si.saleId
         WHERE si.productId IN (${productIds.map(() => "?").join(",")})
           AND s.status='completed'`,
        { replacements: productIds, transaction: t }
    );

    const today = new Date(new Date().toDateString());
    const soldByProdLot = new Map();
    for (const r of sAllocRows) {
        const allocs = Array.isArray(r.allocations) ? r.allocations : (r.allocations ? JSON.parse(r.allocations) : []);
        for (const a of allocs) {
            const lotKey = a.expiryDate ? new Date(a.expiryDate).toISOString().slice(0,10) : "NULL";
            const key = `${r.productId}__${lotKey}`;
            soldByProdLot.set(key, (soldByProdLot.get(key) || 0) + Number(a.qty || 0));
        }
    }

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

    const now = new Date();
    const upserts = [];
    const inStock = [], lowStock = [], expired = [], sellable = [], oos = [];
    for (const pid of productIds) {
        const agg = byProd.get(pid) || { unexp: 0, expd: 0 };
        const qoh = Number(agg.unexp + agg.expd);
        upserts.push([pid, qoh, agg.unexp, agg.expd, LOW_STOCK_THRESHOLD, now]);
        if (agg.expd > 0) expired.push([pid, agg.expd]);
        if (qoh > 0) {
            inStock.push([pid, qoh]);
            if (qoh < LOW_STOCK_THRESHOLD) lowStock.push([pid, qoh]);
            if (agg.unexp > 0) sellable.push([pid, agg.unexp]);
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
        const rowPh = rows.map(() => `(${cols.map(() => "?").join(",")})`).join(",");
        await sequelize.query(
            `INSERT INTO ${table} (${cols.join(",")}) VALUES ${rowPh}`,
            { replacements: rows.flat(), transaction: t }
        );
    }

    await insert("list_expired_products", ["productId", "expiredQty"], expired);
    await insert("list_in_stock_products", ["productId", "quantityOnHand"], inStock);
    await insert("list_low_stock_products", ["productId", "quantityOnHand"], lowStock);
    await insert("list_sellable_products", ["productId", "unexpiredQty"], sellable);
    await insert("list_out_of_stock_products", ["productId", "quantityOnHand"], oos);
}

// ===================== product-joined list endpoints =====================
function shape(rows, qtyField) {
    return rows.map(r => {
        const product = { ...r };
        delete product[qtyField];
        return { product, [qtyField]: r[qtyField] };
    });
}

const listInStockProducts = async (_req, res) => {
    try {
        const [rows] = await sequelize.query(
            `SELECT p.*, lis.quantityOnHand
         FROM list_in_stock_products lis
         JOIN products p ON p.id = lis.productId
        ORDER BY p.id ASC`
        );
        return success(res, "Success", shape(rows, "quantityOnHand"));
    } catch (error) {
        return serverError(res, "Failed to fetch in-stock products", error);
    }
};

const listLowStockProducts = async (_req, res) => {
    try {
        const [rows] = await sequelize.query(
            `SELECT p.*, lls.quantityOnHand
             FROM list_low_stock_products lls
                      JOIN products p ON p.id = lls.productId
             ORDER BY p.id ASC`
        );
        return success(res, "Success", shape(rows, "quantityOnHand"));
    } catch (error) {
        return serverError(res, "Failed to fetch low-stock products", error);
    }
};

const listExpiredOnlyProducts = async (_req, res) => {
    try {
        const [rows] = await sequelize.query(
            `SELECT p.*, lep.expiredQty
             FROM list_expired_products lep
                      JOIN products p ON p.id = lep.productId
             ORDER BY p.id ASC`
        );
        return success(res, "Success", shape(rows, "expiredQty"));
    } catch (error) {
        return serverError(res, "Failed to fetch expired products", error);
    }
};

const listSellableProducts = async (_req, res) => {
    try {
        const [rows] = await sequelize.query(
            `SELECT p.*, lsp.unexpiredQty
             FROM list_sellable_products lsp
                      JOIN products p ON p.id = lsp.productId
             ORDER BY p.id ASC`
        );
        return success(res, "Success", shape(rows, "unexpiredQty"));
    } catch (error) {
        return serverError(res, "Failed to fetch sellable products", error);
    }
};

const listOutOfStockProducts = async (_req, res) => {
    try {
        const [rows] = await sequelize.query(
            `SELECT p.*, loos.quantityOnHand
             FROM list_out_of_stock_products loos
                      JOIN products p ON p.id = loos.productId
             ORDER BY p.id ASC`
        );
        return success(res, "Success", shape(rows, "quantityOnHand"));
    } catch (error) {
        return serverError(res, "Failed to fetch out-of-stock products", error);
    }
};

// flattened product + summary (still includes full product fields)
const listSummary = async (_req, res) => {
    try {
        const [rows] = await sequelize.query(
            `SELECT p.*,
                    ss.quantityOnHand, ss.unexpiredQty, ss.expiredQty, ss.reorderPoint, ss.lastComputedAt
             FROM stock_summaries ss
                      JOIN products p ON p.id = ss.productId
             ORDER BY p.id ASC`
        );
        const shaped = rows.map(r => {
            const { quantityOnHand, unexpiredQty, expiredQty, reorderPoint, lastComputedAt, ...product } = r;
            return { product, quantityOnHand, unexpiredQty, expiredQty, reorderPoint, lastComputedAt };
        });
        return success(res, "Success", shaped);
    } catch (error) {
        return serverError(res, "Error fetching summary", error);
    }
};

// optional: rebuild endpoint
const rebuild = async (req, res) => {
    try {
        await sequelize.transaction(async (t) => {
            let productIds = Array.isArray(req.body?.productIds)
                ? req.body.productIds.map(Number).filter(Boolean)
                : [];
            if (!productIds.length) {
                const [ids] = await sequelize.query(`SELECT DISTINCT productId FROM purchases`, { transaction: t });
                productIds = ids.map(r => Number(r.productId)).filter(Boolean);
            }
            if (!productIds.length) return;
            await recomputeForProducts(productIds, t);
        });
        return success(res, "Inventory rebuilt");
    } catch (error) {
        return serverError(res, "Error rebuilding inventory", error);
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
