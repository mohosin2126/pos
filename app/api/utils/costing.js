"use strict";

const { Op } = require("sequelize");
const { Purchase, PurchaseItem, PurchaseReturn } = require("../database/models");
const {
    STOCKED_PURCHASE_STATUSES,
    STOCK_REDUCING_RETURN_STATUSES,
} = require("./inventory-recompute");
const { parseReturnItems } = require("./purchase-returns");
const { prorateAmount, roundMoney } = require("./price-calculator");

function getEntryKey(purchaseId, productId) {
    return `${Number(purchaseId)}:${Number(productId)}`;
}

function buildEmptySnapshot() {
    return {
        grossQuantity: 0,
        grossValue: 0,
        netQuantity: 0,
        netValue: 0,
        avgCost: 0,
        lastCost: null,
        lastPurchaseDate: null,
    };
}

async function getNetPurchaseCostSnapshots(productIds = null, t = null) {
    const normalizedProductIds = Array.isArray(productIds)
        ? [...new Set(productIds.map(Number).filter(Boolean))]
        : null;

    const purchaseItemWhere = {};
    if (normalizedProductIds && normalizedProductIds.length === 0) {
        return new Map();
    }
    if (normalizedProductIds) {
        purchaseItemWhere.productId = { [Op.in]: normalizedProductIds };
    }

    const purchaseItems = await PurchaseItem.findAll({
        where: purchaseItemWhere,
        include: [
            {
                model: Purchase,
                as: "purchase",
                required: true,
                where: {
                    status: { [Op.in]: STOCKED_PURCHASE_STATUSES },
                },
                attributes: ["id", "purchaseDate", "status"],
            },
        ],
        order: [
            [{ model: Purchase, as: "purchase" }, "purchaseDate", "ASC"],
            ["id", "ASC"],
        ],
        transaction: t,
    });

    if (!purchaseItems.length) {
        return new Map();
    }

    const purchaseIds = [...new Set(purchaseItems.map((item) => Number(item.purchaseId)).filter(Boolean))];
    const itemEntriesById = new Map();
    const itemEntriesByPurchaseProduct = new Map();
    const snapshotsByProduct = new Map();

    for (const item of purchaseItems) {
        const purchaseId = Number(item.purchaseId);
        const productId = Number(item.productId);
        const quantity = Number(item.quantity || 0);
        const lineTotal = roundMoney(item.lineTotal || (Number(item.unitPrice || 0) * quantity));
        const purchaseDate = item.purchase?.purchaseDate || null;

        const entry = {
            purchaseItemId: Number(item.id),
            purchaseId,
            productId,
            purchaseDate,
            unitPrice: roundMoney(item.unitPrice || 0),
            remainingQty: quantity,
            remainingLineTotal: lineTotal,
        };

        itemEntriesById.set(entry.purchaseItemId, entry);

        const purchaseProductKey = getEntryKey(purchaseId, productId);
        if (!itemEntriesByPurchaseProduct.has(purchaseProductKey)) {
            itemEntriesByPurchaseProduct.set(purchaseProductKey, []);
        }
        itemEntriesByPurchaseProduct.get(purchaseProductKey).push(entry);

        const current = snapshotsByProduct.get(productId) || buildEmptySnapshot();
        current.grossQuantity += quantity;
        current.grossValue = roundMoney(current.grossValue + lineTotal);
        snapshotsByProduct.set(productId, current);
    }

    if (purchaseIds.length > 0) {
        const purchaseReturns = await PurchaseReturn.findAll({
            where: {
                purchaseId: { [Op.in]: purchaseIds },
                refundStatus: { [Op.in]: STOCK_REDUCING_RETURN_STATUSES },
            },
            order: [["createdAt", "ASC"], ["id", "ASC"]],
            transaction: t,
        });

        for (const purchaseReturn of purchaseReturns) {
            const returnItems = parseReturnItems(purchaseReturn.returnItems);

            for (const item of returnItems) {
                const purchaseId = Number(purchaseReturn.purchaseId);
                const productId = Number(item.productId);
                if (!productId) continue;
                if (normalizedProductIds && !normalizedProductIds.includes(productId)) continue;

                const allocations = Array.isArray(item.allocations) ? item.allocations : [];
                if (allocations.length > 0) {
                    for (const allocation of allocations) {
                        const target = itemEntriesById.get(Number(allocation.purchaseItemId));
                        if (!target) continue;

                        const allocationQty = Number(allocation.qty || 0);
                        if (allocationQty <= 0 || target.remainingQty <= 0) continue;

                        const allocationLineTotal = roundMoney(
                            allocation.lineTotal
                                ?? (allocationQty >= target.remainingQty
                                    ? target.remainingLineTotal
                                    : prorateAmount(target.remainingLineTotal, allocationQty, target.remainingQty))
                        );

                        target.remainingQty = Math.max(0, target.remainingQty - allocationQty);
                        target.remainingLineTotal = roundMoney(
                            Math.max(0, target.remainingLineTotal - allocationLineTotal)
                        );
                    }
                    continue;
                }

                let remainingQty = Number(item.quantity || 0);
                let remainingLineTotal = roundMoney(item.lineTotal || 0);
                const entries = itemEntriesByPurchaseProduct.get(getEntryKey(purchaseId, productId)) || [];

                for (const entry of entries) {
                    if (remainingQty <= 0) break;
                    if (entry.remainingQty <= 0) continue;

                    const qtyToApply = Math.min(entry.remainingQty, remainingQty);
                    const lineTotalToApply = qtyToApply >= entry.remainingQty
                        ? Math.min(entry.remainingLineTotal, remainingLineTotal || entry.remainingLineTotal)
                        : Math.min(
                            entry.remainingLineTotal,
                            remainingLineTotal > 0
                                ? prorateAmount(remainingLineTotal, qtyToApply, remainingQty)
                                : prorateAmount(entry.remainingLineTotal, qtyToApply, entry.remainingQty)
                        );

                    entry.remainingQty = Math.max(0, entry.remainingQty - qtyToApply);
                    entry.remainingLineTotal = roundMoney(
                        Math.max(0, entry.remainingLineTotal - lineTotalToApply)
                    );

                    remainingQty -= qtyToApply;
                    remainingLineTotal = roundMoney(
                        Math.max(0, remainingLineTotal - lineTotalToApply)
                    );
                }
            }
        }
    }

    for (const entry of itemEntriesById.values()) {
        const productId = Number(entry.productId);
        const current = snapshotsByProduct.get(productId) || buildEmptySnapshot();

        current.netQuantity += Number(entry.remainingQty || 0);
        current.netValue = roundMoney(current.netValue + Number(entry.remainingLineTotal || 0));

        if (Number(entry.remainingQty || 0) > 0) {
            const currentDate = current.lastPurchaseDate ? new Date(current.lastPurchaseDate) : null;
            const entryDate = entry.purchaseDate ? new Date(entry.purchaseDate) : null;
            if (!currentDate || (entryDate && entryDate >= currentDate)) {
                current.lastPurchaseDate = entry.purchaseDate || null;
                current.lastCost = roundMoney(entry.unitPrice || 0);
            }
        }

        snapshotsByProduct.set(productId, current);
    }

    for (const snapshot of snapshotsByProduct.values()) {
        snapshot.avgCost = snapshot.netQuantity > 0
            ? roundMoney(snapshot.netValue / snapshot.netQuantity)
            : 0;
        snapshot.grossQuantity = roundMoney(snapshot.grossQuantity);
        snapshot.grossValue = roundMoney(snapshot.grossValue);
        snapshot.netQuantity = roundMoney(snapshot.netQuantity);
        snapshot.netValue = roundMoney(snapshot.netValue);
        snapshot.lastCost = snapshot.lastCost === null ? null : roundMoney(snapshot.lastCost);
    }

    return snapshotsByProduct;
}

async function getNetAverageCostMap(productIds = null, t = null) {
    const snapshots = await getNetPurchaseCostSnapshots(productIds, t);
    return new Map(
        [...snapshots.entries()].map(([productId, snapshot]) => [
            Number(productId),
            Number(snapshot.avgCost || 0),
        ])
    );
}

module.exports = {
    buildEmptySnapshot,
    getNetAverageCostMap,
    getNetPurchaseCostSnapshots,
};
