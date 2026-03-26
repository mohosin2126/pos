"use strict";

const { sequelize } = require("../database/models");

const STOCKED_PURCHASE_STATUSES = [
    "purchase",
    "received",
    "partial",
    "partial_return",
    "full_return",
];

const STOCK_REDUCING_RETURN_STATUSES = ["pending", "approved", "refunded"];
const STOCK_RESTORING_SALE_RETURN_STATUSES = ["approved", "refunded"];

function startOfToday() {
    return new Date(new Date().toDateString());
}

function toDateKey(value) {
    if (!value) return "NULL";
    return new Date(value).toISOString().slice(0, 10);
}

function parseJsonArray(value) {
    if (Array.isArray(value)) return value;
    if (!value) return [];

    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch (_error) {
        return [];
    }
}

function compareLotDates(a, b) {
    if (a.expiryDate === null && b.expiryDate === null) return 0;
    if (a.expiryDate === null) return 1;
    if (b.expiryDate === null) return -1;
    return a.expiryDate - b.expiryDate;
}

async function buildLotSnapshot(productIds, t) {
    if (!Array.isArray(productIds) || productIds.length === 0) {
        return new Map();
    }

    const productPlaceholders = productIds.map(() => "?").join(",");
    const statusPlaceholders = STOCKED_PURCHASE_STATUSES.map(() => "?").join(",");

    const [purchaseRows] = await sequelize.query(
        `SELECT
             pi.purchaseId,
             pi.productId,
             pi.expiryDate,
             COALESCE(SUM(pi.quantity), 0) AS purchasedQty
         FROM purchase_items pi
         JOIN purchases p ON p.id = pi.purchaseId
         WHERE pi.productId IN (${productPlaceholders})
           AND p.status IN (${statusPlaceholders})
         GROUP BY pi.purchaseId, pi.productId, pi.expiryDate`,
        {
            replacements: [...productIds, ...STOCKED_PURCHASE_STATUSES],
            transaction: t,
        }
    );

    const purchaseLotsByKey = new Map();
    const purchaseIds = new Set();

    for (const row of purchaseRows) {
        const purchaseId = Number(row.purchaseId);
        const productId = Number(row.productId);
        const key = `${purchaseId}__${productId}`;
        const lot = {
            productId,
            expiryDate: row.expiryDate ? new Date(row.expiryDate) : null,
            remainingQty: Number(row.purchasedQty || 0),
        };

        purchaseIds.add(purchaseId);

        if (!purchaseLotsByKey.has(key)) {
            purchaseLotsByKey.set(key, []);
        }

        purchaseLotsByKey.get(key).push(lot);
    }

    for (const lots of purchaseLotsByKey.values()) {
        lots.sort(compareLotDates);
    }

    if (purchaseIds.size > 0) {
        const purchaseIdList = [...purchaseIds];
        const purchaseIdPlaceholders = purchaseIdList.map(() => "?").join(",");
        const returnStatusPlaceholders = STOCK_REDUCING_RETURN_STATUSES.map(() => "?").join(",");

        const [returnRows] = await sequelize.query(
            `SELECT purchaseId, returnItems
             FROM purchase_returns
             WHERE purchaseId IN (${purchaseIdPlaceholders})
               AND refundStatus IN (${returnStatusPlaceholders})`,
            {
                replacements: [...purchaseIdList, ...STOCK_REDUCING_RETURN_STATUSES],
                transaction: t,
            }
        );

        for (const row of returnRows) {
            const purchaseId = Number(row.purchaseId);
            const returnItems = parseJsonArray(row.returnItems);

            for (const item of returnItems) {
                const productId = Number(item.productId);
                let quantityToApply = Number(item.quantity || 0);
                const key = `${purchaseId}__${productId}`;
                const lots = purchaseLotsByKey.get(key) || [];

                for (const lot of lots) {
                    if (quantityToApply <= 0) break;

                    const qtyTaken = Math.min(lot.remainingQty, quantityToApply);
                    lot.remainingQty -= qtyTaken;
                    quantityToApply -= qtyTaken;
                }
            }
        }
    }

    const soldByProductLot = new Map();
    const saleIds = new Set();
    const [saleRows] = await sequelize.query(
        `SELECT si.saleId, si.productId, si.allocations
         FROM sale_items si
         JOIN sales s ON s.id = si.saleId
         WHERE si.productId IN (${productPlaceholders})
           AND s.status = 'completed'`,
        { replacements: productIds, transaction: t }
    );

    for (const row of saleRows) {
        saleIds.add(Number(row.saleId));
        const productId = Number(row.productId);
        const allocations = parseJsonArray(row.allocations);

        for (const allocation of allocations) {
            const key = `${productId}__${toDateKey(allocation.expiryDate)}`;
            soldByProductLot.set(key, (soldByProductLot.get(key) || 0) + Number(allocation.qty || 0));
        }
    }

    if (saleIds.size > 0) {
        const saleIdList = [...saleIds];
        const saleIdPlaceholders = saleIdList.map(() => "?").join(",");
        const saleReturnStatusPlaceholders = STOCK_RESTORING_SALE_RETURN_STATUSES.map(() => "?").join(",");

        const [saleReturnRows] = await sequelize.query(
            `SELECT returnItems
             FROM sale_returns
             WHERE saleId IN (${saleIdPlaceholders})
               AND refundStatus IN (${saleReturnStatusPlaceholders})
               AND restockingDisposition = 'restock'`,
            {
                replacements: [...saleIdList, ...STOCK_RESTORING_SALE_RETURN_STATUSES],
                transaction: t,
            }
        );

        for (const row of saleReturnRows) {
            const returnItems = parseJsonArray(row.returnItems);

            for (const item of returnItems) {
                const productId = Number(item.productId);
                if (!productIds.includes(productId)) continue;

                const allocations = parseJsonArray(item.allocations);
                for (const allocation of allocations) {
                    const key = `${productId}__${toDateKey(allocation.expiryDate)}`;
                    soldByProductLot.set(key, (soldByProductLot.get(key) || 0) - Number(allocation.qty || 0));
                }
            }
        }
    }

    const purchasedAfterReturnsByProductLot = new Map();
    for (const lots of purchaseLotsByKey.values()) {
        for (const lot of lots) {
            if (lot.remainingQty <= 0) continue;

            const key = `${lot.productId}__${toDateKey(lot.expiryDate)}`;
            const currentQty = purchasedAfterReturnsByProductLot.get(key) || 0;
            purchasedAfterReturnsByProductLot.set(key, currentQty + lot.remainingQty);
        }
    }

    const lotsByProduct = new Map();

    for (const [key, purchasedQty] of purchasedAfterReturnsByProductLot.entries()) {
        const [productIdRaw, lotKey] = key.split("__");
        const productId = Number(productIdRaw);
        const soldQty = Number(soldByProductLot.get(key) || 0);
        const remainingQty = Math.max(0, Number(purchasedQty || 0) - soldQty);

        if (remainingQty <= 0) continue;

        const expiryDate = lotKey === "NULL" ? null : new Date(lotKey);
        const entry = {
            expiryDate,
            qty: remainingQty,
            isExpired: Boolean(expiryDate && expiryDate < startOfToday()),
        };

        if (!lotsByProduct.has(productId)) {
            lotsByProduct.set(productId, []);
        }

        lotsByProduct.get(productId).push(entry);
    }

    for (const lots of lotsByProduct.values()) {
        lots.sort(compareLotDates);
    }

    return lotsByProduct;
}

async function getRemainingLotsForProduct(productId, t) {
    const lotsByProduct = await buildLotSnapshot([Number(productId)], t);
    const lots = lotsByProduct.get(Number(productId)) || [];
    const unexpiredLots = lots.filter((lot) => !lot.isExpired && lot.qty > 0);

    return {
        unexpiredLots,
        allLots: lots,
    };
}

async function recomputeForProducts(productIds, t) {
    if (!Array.isArray(productIds) || !productIds.length) return;

    const normalizedIds = [...new Set(productIds.map(Number).filter(Boolean))];
    if (!normalizedIds.length) return;

    const lotsByProduct = await buildLotSnapshot(normalizedIds, t);

    const productPlaceholders = normalizedIds.map(() => "?").join(",");
    const [products] = await sequelize.query(
        `SELECT id, reorderLevel FROM products WHERE id IN (${productPlaceholders})`,
        { replacements: normalizedIds, transaction: t }
    );

    const reorderLevels = new Map(
        products.map((product) => [Number(product.id), Number(product.reorderLevel) || 5])
    );

    const now = new Date();
    const summaryRows = [];
    const inStockRows = [];
    const lowStockRows = [];
    const expiredRows = [];
    const sellableRows = [];
    const outOfStockRows = [];

    for (const productId of normalizedIds) {
        const lots = lotsByProduct.get(productId) || [];
        let quantityOnHand = 0;
        let unexpiredQty = 0;
        let expiredQty = 0;

        for (const lot of lots) {
            quantityOnHand += Number(lot.qty || 0);
            if (lot.isExpired) {
                expiredQty += Number(lot.qty || 0);
            } else {
                unexpiredQty += Number(lot.qty || 0);
            }
        }

        const reorderPoint = reorderLevels.get(productId) || 5;

        summaryRows.push([
            productId,
            quantityOnHand,
            unexpiredQty,
            expiredQty,
            reorderPoint,
            now,
        ]);

        if (quantityOnHand > 0) {
            inStockRows.push([productId, quantityOnHand]);

            if (quantityOnHand <= reorderPoint) {
                lowStockRows.push([productId, quantityOnHand]);
            }

            if (unexpiredQty > 0) {
                sellableRows.push([productId, unexpiredQty]);
            }
        } else {
            outOfStockRows.push([productId, quantityOnHand]);
        }

        if (expiredQty > 0) {
            expiredRows.push([productId, expiredQty]);
        }
    }

    if (summaryRows.length) {
        const placeholders = summaryRows.map(() => "(?,?,?,?,?,?)").join(",");
        await sequelize.query(
            `INSERT INTO stock_summaries
             (productId, quantityOnHand, unexpiredQty, expiredQty, reorderPoint, lastComputedAt)
             VALUES ${placeholders}
             ON DUPLICATE KEY UPDATE
                 quantityOnHand = VALUES(quantityOnHand),
                 unexpiredQty = VALUES(unexpiredQty),
                 expiredQty = VALUES(expiredQty),
                 reorderPoint = VALUES(reorderPoint),
                 lastComputedAt = VALUES(lastComputedAt)`,
            { replacements: summaryRows.flat(), transaction: t }
        );
    }

    const inClause = normalizedIds.map(() => "?").join(",");
    await Promise.all([
        sequelize.query(`DELETE FROM list_in_stock_products WHERE productId IN (${inClause})`, { replacements: normalizedIds, transaction: t }),
        sequelize.query(`DELETE FROM list_low_stock_products WHERE productId IN (${inClause})`, { replacements: normalizedIds, transaction: t }),
        sequelize.query(`DELETE FROM list_expired_products WHERE productId IN (${inClause})`, { replacements: normalizedIds, transaction: t }),
        sequelize.query(`DELETE FROM list_sellable_products WHERE productId IN (${inClause})`, { replacements: normalizedIds, transaction: t }),
        sequelize.query(`DELETE FROM list_out_of_stock_products WHERE productId IN (${inClause})`, { replacements: normalizedIds, transaction: t }),
    ]);

    async function insertRows(tableName, columns, rows) {
        if (!rows.length) return;

        const rowPlaceholders = rows.map(() => `(${columns.map(() => "?").join(",")})`).join(",");
        await sequelize.query(
            `INSERT INTO ${tableName} (${columns.join(",")}) VALUES ${rowPlaceholders}`,
            { replacements: rows.flat(), transaction: t }
        );
    }

    await insertRows("list_in_stock_products", ["productId", "quantityOnHand"], inStockRows);
    await insertRows("list_low_stock_products", ["productId", "quantityOnHand"], lowStockRows);
    await insertRows("list_expired_products", ["productId", "expiredQty"], expiredRows);
    await insertRows("list_sellable_products", ["productId", "unexpiredQty"], sellableRows);
    await insertRows("list_out_of_stock_products", ["productId", "quantityOnHand"], outOfStockRows);

    await Promise.all(
        summaryRows.map(([productId, quantityOnHand]) =>
            sequelize.query(
                "UPDATE products SET stockQuantity = ? WHERE id = ?",
                { replacements: [Math.round(Number(quantityOnHand || 0)), productId], transaction: t }
            )
        )
    );
}

module.exports = {
    STOCKED_PURCHASE_STATUSES,
    STOCK_REDUCING_RETURN_STATUSES,
    STOCK_RESTORING_SALE_RETURN_STATUSES,
    getRemainingLotsForProduct,
    recomputeForProducts,
};
