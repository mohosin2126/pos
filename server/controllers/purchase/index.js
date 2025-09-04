"use strict";

const { Purchase, Supplier, Product, sequelize } = require("../../database/models");
const {
    success, created, badRequest, notFound, serverError, parsePagination, paginated,
} = require("../../utils/api-response");

// ===================== inline inventory recompute (no service file) =====================
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

    const byProd = new Map(); // productId -> { unexp, expd }
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
// ===================== end recompute =====================

// CREATE
const create = async (req, res) => {
    try {
        const { productId, totalItems } = req.body;

        if (!productId) return badRequest(res, "productId is required");
        const product = await Product.findByPk(productId);
        if (!product) return badRequest(res, "Invalid productId: product not found");
        if (product.status !== "active") return badRequest(res, "Cannot create purchase for an inactive product");
        if (totalItems == null || Number(totalItems) < 0) return badRequest(res, "totalItems must be ≥ 0");

        const purchase = await sequelize.transaction(async (t) => {
            const p = await Purchase.create(req.body, { transaction: t });
            await recomputeForProducts([productId], t);
            return p;
        });

        return created(res, "Purchase created successfully", purchase);
    } catch (error) {
        return serverError(res, "Error creating purchase", error);
    }
};

// GET ALL
const getAll = async (req, res) => {
    try {
        const { page, limit, offset } = parsePagination(req.query, { page: 1, limit: 20, maxLimit: 100 });
        const { rows, count } = await Purchase.findAndCountAll({
            include: [{ model: Supplier, as: "supplier" }, { model: Product, as: "product" }],
            order: [["createdAt", "DESC"]],
            limit, offset,
        });
        return paginated(res, { rows, count }, { page, limit }, "Fetched successfully");
    } catch (error) {
        return serverError(res, "Error fetching purchases", error);
    }
};

// GET ONE
const getOne = async (req, res) => {
    try {
        const purchase = await Purchase.findByPk(req.params.id, {
            include: [{ model: Supplier, as: "supplier" }, { model: Product, as: "product" }],
        });
        if (!purchase) return notFound(res, "Purchase not found");
        return success(res, "Success", purchase);
    } catch (error) {
        return serverError(res, "Error fetching purchase", error);
    }
};

// UPDATE
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const purchase = await Purchase.findByPk(id);
        if (!purchase) return notFound(res, "Purchase not found");

        if (req.body.productId !== undefined) {
            const product = await Product.findByPk(req.body.productId);
            if (!product) return badRequest(res, "Invalid productId: product not found");
            if (product.status !== "active") return badRequest(res, "Cannot set purchase to an inactive product");
        }

        const oldPid = purchase.productId;
        const newPid = req.body.productId ?? oldPid;

        await sequelize.transaction(async (t) => {
            await purchase.update(req.body, { transaction: t });
            const needs = new Set([oldPid, newPid]);
            await recomputeForProducts([...needs], t);
        });

        return success(res, "Purchase updated successfully", purchase);
    } catch (error) {
        return serverError(res, "Error updating purchase", error);
    }
};

// DELETE
const destroy = async (req, res) => {
    try {
        const { id } = req.params;
        const purchase = await Purchase.findByPk(id);
        if (!purchase) return notFound(res, "Purchase not found");

        const pid = purchase.productId;
        await sequelize.transaction(async (t) => {
            await purchase.destroy({ transaction: t });
            await recomputeForProducts([pid], t);
        });

        return success(res, "Purchase deleted successfully", null);
    } catch (error) {
        return serverError(res, "Error deleting purchase", error);
    }
};

module.exports = { create, getAll, getOne, update, destroy };
