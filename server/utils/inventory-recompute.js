"use strict";

const { sequelize } = require("../database/models");
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
            const lotKey = a.expiryDate ? new Date(a.expiryDate).toISOString().slice(0, 10) : "NULL";
            const key = `${r.productId}__${lotKey}`;
            soldByProdLot.set(key, (soldByProdLot.get(key) || 0) + Number(a.qty || 0));
        }
    }

   
    for (const row of pLots) {
        const pid = Number(row.productId);
        const lotKey = row.expiryDate ? new Date(row.expiryDate).toISOString().slice(0, 10) : "NULL";
        const purchased = Number(row.purchasedQty || 0);
        const sold = Number(soldByProdLot.get(`${pid}__${lotKey}`) || 0);
        const remaining = Math.max(0, purchased - sold);
        const exp = row.expiryDate ? new Date(row.expiryDate) : null;
        const isExpired = exp && exp < today;
        const prev = byProd.get(pid) || { unexp: 0, expd: 0 };
        if (isExpired) prev.expd += remaining; else prev.unexp += remaining;
        byProd.set(pid, prev);
    }

    let productReorderLevels = new Map();
    if (productIds.length > 0) {
        const [products] = await sequelize.query(
            `SELECT id, reorderLevel FROM products WHERE id IN (${productIds.map(() => "?").join(",")})`,
            { replacements: productIds, transaction: t }
        );
        productReorderLevels = new Map(products.map(p => [Number(p.id), Number(p.reorderLevel) || 5]));
    }

    const now = new Date();
    const upserts = [];
    const inStock = [], lowStock = [], expired = [], sellable = [], oos = [];

    for (const pid of productIds) {
        const agg = byProd.get(pid) || { unexp: 0, expd: 0 };
        const qoh = Number(agg.unexp + agg.expd);
        const reorderLevel = productReorderLevels.get(pid) || 5;

    
        if (agg.expd + agg.unexp !== qoh) {
            console.warn(
                `[Inventory Validation] Product ${pid}: expiredQty(${agg.expd}) + unexpiredQty(${agg.unexp}) !== quantityOnHand(${qoh})`
            );
        }

        upserts.push([pid, qoh, agg.unexp, agg.expd, reorderLevel, now]);
        if (agg.expd > 0) expired.push([pid, agg.expd]);
        if (qoh > 0) {
            inStock.push([pid, qoh]);
            if (qoh <= reorderLevel) lowStock.push([pid, qoh]);
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

module.exports = { recomputeForProducts };
