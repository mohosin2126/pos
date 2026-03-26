"use strict";

const { Op } = require("sequelize");
const { Purchase, PurchaseItem, PurchaseReturn } = require("../database/models");

const BASE_PURCHASE_STATUSES = new Set(["purchase", "received", "partial"]);
const RETURNABLE_PURCHASE_STATUSES = new Set([
    ...BASE_PURCHASE_STATUSES,
    "partial_return",
    "full_return",
]);
const RETURN_STATUS_SET = new Set(["partial_return", "full_return"]);

function parseReturnItems(value) {
    if (Array.isArray(value)) return value;
    if (!value) return [];

    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch (_error) {
        return [];
    }
}

function roundMoney(value) {
    return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

function getValidBasePurchaseStatus(status) {
    return BASE_PURCHASE_STATUSES.has(status) ? status : null;
}

function getFallbackPurchaseStatus(purchase, purchaseReturns = []) {
    for (const purchaseReturn of purchaseReturns) {
        const baseStatus = getValidBasePurchaseStatus(
            purchaseReturn?.basePurchaseStatus
        );
        if (baseStatus) {
            return baseStatus;
        }
    }

    return getValidBasePurchaseStatus(purchase?.status) || "purchase";
}

async function getReturnAvailability(purchaseId, t, excludeReturnId = null) {
    const items = await PurchaseItem.findAll({
        where: { purchaseId },
        transaction: t,
        order: [["expiryDate", "ASC"], ["id", "ASC"]],
    });

    const returnsWhere = {
        purchaseId,
        refundStatus: { [Op.ne]: "rejected" },
    };

    if (excludeReturnId) {
        returnsWhere.id = { [Op.ne]: excludeReturnId };
    }

    const existingReturns = await PurchaseReturn.findAll({
        where: returnsWhere,
        transaction: t,
    });

    const purchasedByProduct = new Map();
    const purchasedValueByProduct = new Map();

    for (const item of items) {
        const productId = Number(item.productId);
        const quantity = Number(item.quantity || 0);
        const lineTotal = roundMoney(item.lineTotal || Number(item.unitPrice || 0) * quantity);

        purchasedByProduct.set(productId, (purchasedByProduct.get(productId) || 0) + quantity);
        purchasedValueByProduct.set(
            productId,
            roundMoney((purchasedValueByProduct.get(productId) || 0) + lineTotal)
        );
    }

    const returnedByProduct = new Map();
    const returnedValueByProduct = new Map();
    for (const purchaseReturn of existingReturns) {
        const returnItems = parseReturnItems(purchaseReturn.returnItems);

        for (const item of returnItems) {
            const productId = Number(item.productId);
            const quantity = Number(item.quantity || 0);
            const lineTotal = roundMoney(item.lineTotal || 0);
            returnedByProduct.set(productId, (returnedByProduct.get(productId) || 0) + quantity);
            returnedValueByProduct.set(
                productId,
                roundMoney((returnedValueByProduct.get(productId) || 0) + lineTotal)
            );
        }
    }

    const availableByProduct = new Map();
    const availableValueByProduct = new Map();
    for (const [productId, purchasedQty] of purchasedByProduct.entries()) {
        const returnedQty = returnedByProduct.get(productId) || 0;
        const purchasedValue = purchasedValueByProduct.get(productId) || 0;
        const returnedValue = returnedValueByProduct.get(productId) || 0;
        availableByProduct.set(productId, Math.max(0, purchasedQty - returnedQty));
        availableValueByProduct.set(
            productId,
            roundMoney(Math.max(0, purchasedValue - returnedValue))
        );
    }

    return {
        existingReturns,
        items,
        availableByProduct,
        availableValueByProduct,
        purchasedByProduct,
        purchasedValueByProduct,
        returnedByProduct,
    };
}

function validateReturnRequest(purchase, returnItems, availability) {
    if (!RETURNABLE_PURCHASE_STATUSES.has(purchase?.status)) {
        return `Purchase status "${purchase?.status}" cannot be returned`;
    }

    if (roundMoney(returnItems.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0)) <= 0) {
        return "Return amount must be greater than 0";
    }

    for (const item of returnItems) {
        const productId = Number(item.productId);
        const quantity = Number(item.quantity || 0);
        const availableQty = Number(availability.availableByProduct.get(productId) || 0);

        if (!availability.purchasedByProduct.has(productId)) {
            return `Product ${productId} does not belong to this purchase`;
        }

        if (quantity <= 0) {
            return `Return quantity for product ${productId} must be greater than 0`;
        }

        if (quantity > availableQty) {
            return `Cannot return ${quantity} units for product ${productId}; only ${availableQty} available to return`;
        }

        const maxLineTotal = roundMoney(
            availability.availableValueByProduct.get(productId) || 0
        );
        const lineTotal = roundMoney(item.lineTotal);

        if (lineTotal > maxLineTotal + 0.01) {
            return `Return line total for product ${productId} exceeds the purchased value`;
        }
    }

    const totalReturnAmount = roundMoney(
        returnItems.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0)
    );
    const purchaseTotal = roundMoney(purchase.totalAmount);

    if (totalReturnAmount > purchaseTotal + 0.01) {
        return "Return amount cannot exceed the purchase total";
    }

    return null;
}

async function syncPurchaseReturnStatus(purchaseId, t, options = {}) {
    const purchase = await Purchase.findByPk(purchaseId, { transaction: t });
    if (!purchase) return null;

    const items = await PurchaseItem.findAll({
        where: { purchaseId },
        transaction: t,
    });
    const activeReturns = await PurchaseReturn.findAll({
        where: {
            purchaseId,
            refundStatus: { [Op.ne]: "rejected" },
        },
        transaction: t,
    });

    const purchasedQty = items.reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0
    );
    const returnedQty = activeReturns.reduce(
        (sum, purchaseReturn) =>
            sum +
            parseReturnItems(purchaseReturn.returnItems).reduce(
                (innerSum, item) => innerSum + Number(item.quantity || 0),
                0
            ),
        0
    );

    let nextStatus = purchase.status;
    if (returnedQty <= 0) {
        if (RETURN_STATUS_SET.has(purchase.status)) {
            nextStatus = getValidBasePurchaseStatus(options.fallbackStatus)
                || getFallbackPurchaseStatus(purchase, activeReturns)
                || "purchase";
        }
    } else if (returnedQty >= purchasedQty) {
        nextStatus = "full_return";
    } else {
        nextStatus = "partial_return";
    }

    if (nextStatus !== purchase.status) {
        await purchase.update({ status: nextStatus }, { transaction: t });
    }

    return purchase;
}

function getReturnProductIds(purchaseReturn) {
    return [...new Set(
        parseReturnItems(purchaseReturn?.returnItems)
            .map((item) => Number(item.productId))
            .filter(Boolean)
    )];
}

module.exports = {
    BASE_PURCHASE_STATUSES,
    RETURNABLE_PURCHASE_STATUSES,
    getReturnAvailability,
    getFallbackPurchaseStatus,
    getReturnProductIds,
    getValidBasePurchaseStatus,
    parseReturnItems,
    syncPurchaseReturnStatus,
    validateReturnRequest,
};
