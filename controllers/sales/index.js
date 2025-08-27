"use strict";

const { sequelize, Sale, SaleItem } = require("../../database/models");
const {
    success, created, badRequest, notFound, serverError, parsePagination, paginated,
} = require("../../utils/api-response");

const LOW_STOCK_THRESHOLD = 5;

// Remaining quantity per lot (expiryDate) = purchases - sold allocations
async function getRemainingLots(productId, t) {
    const [pRows] = await sequelize.query(
        `SELECT expiryDate, COALESCE(SUM(totalItems),0) AS purchasedQty
         FROM purchases
         WHERE productId = ?
         GROUP BY expiryDate`,
        { replacements: [productId], transaction: t }
    );

    const [sRows] = await sequelize.query(
        `SELECT si.allocations
         FROM sale_items si
                  JOIN sales s ON s.id = si.saleId
         WHERE si.productId = ? AND s.status = 'completed'`,
        { replacements: [productId], transaction: t }
    );

    const soldByLot = new Map(); // key = "YYYY-MM-DD" or "NULL"
    for (const r of sRows) {
        const allocs = Array.isArray(r.allocations)
            ? r.allocations
            : (r.allocations ? JSON.parse(r.allocations) : []);
        for (const a of allocs) {
            const key = a.expiryDate ? new Date(a.expiryDate).toISOString().slice(0,10) : "NULL";
            soldByLot.set(key, (soldByLot.get(key) || 0) + Number(a.qty || 0));
        }
    }

    const lotMap = new Map();
    for (const p of pRows) {
        const key = p.expiryDate ? new Date(p.expiryDate).toISOString().slice(0,10) : "NULL";
        const rem = Number(p.purchasedQty || 0) - Number(soldByLot.get(key) || 0);
        lotMap.set(key, Math.max(0, rem));
    }

    // FEFO: unexpired first by earliest expiry; NULL last
    const today = new Date(new Date().toDateString());
    const lots = [];
    for (const [key, qty] of lotMap.entries()) {
        const exp = (key === "NULL") ? null : new Date(key);
        const isExpired = exp && exp < today;
        lots.push({ expiryDate: exp, qty, isExpired });
    }
    const unexpiredLots = lots
        .filter(l => !l.isExpired)
        .sort((a, b) => {
            if (a.expiryDate === null && b.expiryDate === null) return 0;
            if (a.expiryDate === null) return 1;
            if (b.expiryDate === null) return -1;
            return a.expiryDate - b.expiryDate;
        });

    return { unexpiredLots, allLots: lots };
}

async function recomputeProducts(productIds, t) {
    if (!productIds.length) return;

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
        const allocs = Array.isArray(r.allocations)
            ? r.allocations
            : (r.allocations ? JSON.parse(r.allocations) : []);
        for (const a of allocs) {
            const lotKey = a.expiryDate
                ? new Date(a.expiryDate).toISOString().slice(0,10)
                : "NULL";
            const key = `${r.productId}__${lotKey}`;
            soldByProdLot.set(key, (soldByProdLot.get(key) || 0) + Number(a.qty || 0));
        }
    }

    const byProd = new Map(); // id -> {unexp, expd}
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

    const upserts = [];
    const inStock = [], lowStock = [], expired = [], sellable = [], oos = [];

    for (const pid of productIds) {
        const agg = byProd.get(pid) || { unexp: 0, expd: 0 };
        const qoh = Number(agg.unexp + agg.expd);
        upserts.push([pid, qoh, agg.unexp, agg.expd, 5, new Date()]);

        if (agg.expd > 0) expired.push([pid, agg.expd]);
        if (qoh > 0) {
            inStock.push([pid, qoh]);
            if (qoh < LOW_STOCK_THRESHOLD) lowStock.push([pid, qoh]);
            if (agg.unexp > 0) sellable.push([pid, agg.unexp]); // NOTE: unexpiredQty
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
            replacements: rows.flat(), transaction: t
        });
    }
    await insert("list_expired_products", ["productId", "expiredQty"], expired);
    await insert("list_in_stock_products", ["productId", "quantityOnHand"], inStock);
    await insert("list_low_stock_products", ["productId", "quantityOnHand"], lowStock);
    await insert("list_sellable_products", ["productId", "unexpiredQty"], sellable);
    await insert("list_out_of_stock_products", ["productId", "quantityOnHand"], oos);
}

// ---- controller actions ----

// CREATE SALE w/ FEFO allocations (no Op)
const create = async (req, res) => {
    try {
        const { items } = req.body;
        if (!Array.isArray(items) || !items.length) {
            return badRequest(res, "items are required");
        }

        // Only allow products that have been purchased at least once
        const productIds = [...new Set(items.map(i => Number(i.productId)).filter(Boolean))];
        const [seen] = await sequelize.query(
            `SELECT DISTINCT productId FROM purchases WHERE productId IN (${productIds.map(() => "?").join(",")})`,
            { replacements: productIds }
        );
        const purchasedSet = new Set(seen.map(r => Number(r.productId)));
        const notPurchased = productIds.filter(id => !purchasedSet.has(id));
        if (notPurchased.length) {
            return badRequest(res, `Cannot sell unpurchased products: ${notPurchased.join(", ")}`);
        }

        const sale = await sequelize.transaction(async (t) => {
            // create sale shell
            const sale = await Sale.create({
                referenceNo: req.body.referenceNo || null,
                saleDate: req.body.saleDate || new Date(),
                status: req.body.status || "completed",
                discountType: req.body.discountType || "none",
                discountAmount: req.body.discountAmount || 0,
                orderTaxPercent: req.body.orderTaxPercent || 0,
                orderTaxAmount: req.body.orderTaxAmount || 0,
                shippingCharge: req.body.shippingCharge || 0,
                totalItems: 0,
                netTotalAmount: 0,
                totalAmount: 0,
                amountPaid: req.body.amountPaid || 0,
                notes: req.body.notes || null,
                customerId: req.body.customerId || null,
                meta: req.body.meta || null,
            }, { transaction: t });

            const affected = new Set();

            // process each item (FEFO)
            for (const item of items) {
                const pid = Number(item.productId);
                const qty = Number(item.quantity);
                if (!pid || qty <= 0) continue;

                const { unexpiredLots } = await getRemainingLots(pid, t);

                // allocate
                let remaining = qty;
                const allocations = [];
                for (const lot of unexpiredLots) {
                    const take = Math.min(lot.qty, remaining);
                    if (take > 0) {
                        allocations.push({
                            expiryDate: lot.expiryDate ? lot.expiryDate.toISOString().slice(0,10) : null,
                            qty: take
                        });
                        remaining -= take;
                        if (remaining <= 0) break;
                    }
                }
                if (remaining > 0) {
                    return badRequest(res, `Insufficient stock for product ${pid}. Need ${qty}.`);
                }

                // compute line totals
                const base = Number(item.unitPrice) * qty;
                const disc = item.discountType === "percent"
                    ? (base * Number(item.discountAmount || 0)) / 100
                    : (item.discountType === "fixed" ? Number(item.discountAmount || 0) : 0);
                const taxable = Math.max(0, base - disc);
                const tax = (taxable * Number(item.taxPercent || 0)) / 100;
                const lineTotal = taxable + tax;

                await SaleItem.create({
                    saleId: sale.id,
                    productId: pid,
                    quantity: qty,
                    unitPrice: item.unitPrice,
                    discountType: item.discountType || "none",
                    discountAmount: item.discountAmount || 0,
                    taxPercent: item.taxPercent || 0,
                    taxAmount: tax,
                    lineTotal,
                    allocations,
                }, { transaction: t });

                affected.add(pid);
            }

            // totals
            const [tot] = await sequelize.query(
                `SELECT
                     COALESCE(SUM(quantity),0) AS totalItems,
                     COALESCE(SUM(lineTotal - taxAmount),0) AS netTotalAmount,
                     COALESCE(SUM(lineTotal),0) AS totalAmount
                 FROM sale_items WHERE saleId = ?`,
                { replacements: [sale.id], transaction: t }
            );
            const tr = Array.isArray(tot) ? tot[0] : tot;

            await sale.update({
                totalItems: Number(tr.totalItems || 0),
                netTotalAmount: Number(tr.netTotalAmount || 0),
                totalAmount: Number(tr.totalAmount || 0),
            }, { transaction: t });

            await recomputeProducts([...affected], t);
            return sale;
        });

        return created(res, "Sale created successfully", sale);
    } catch (error) {
        return serverError(res, "Error creating sale", error);
    }
};

const getAll = async (req, res) => {
    try {
        const { page, limit, offset } = parsePagination(req.query, { page: 1, limit: 20, maxLimit: 100 });

        const { rows, count } = await Sale.findAndCountAll({
            include: [{ model: SaleItem, as: "items" }],
            order: [["createdAt", "DESC"]],
            limit, offset,
        });

        return paginated(res, { rows, count }, { page, limit }, "Fetched successfully");
    } catch (error) {
        return serverError(res, "Error fetching sales", error);
    }
};

const getOne = async (req, res) => {
    try {
        const sale = await Sale.findByPk(req.params.id, {
            include: [{ model: SaleItem, as: "items" }],
        });
        if (!sale) return notFound(res, "Sale not found");
        return success(res, "Success", sale);
    } catch (error) {
        return serverError(res, "Error fetching sale", error);
    }
};

module.exports = { create, getAll, getOne };
