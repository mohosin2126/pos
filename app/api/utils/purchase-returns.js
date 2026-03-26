"use strict";

const { Op } = require("sequelize");
const { Purchase, PurchaseItem, PurchaseReturn } = require("../database/models");

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
    const unitPriceByProduct = new Map();

    for (const item of items) {
        const productId = Number(item.productId);
        const quantity = Number(item.quantity || 0);

        purchasedByProduct.set(productId, (purchasedByProduct.get(productId) || 0) + quantity);

        if (!unitPriceByProduct.has(productId)) {
            unitPriceByProduct.set(productId, Number(item.unitPrice || 0));
        }
    }

    const returnedByProduct = new Map();
    for (const purchaseReturn of existingReturns) {
        const returnItems = parseReturnItems(purchaseReturn.returnItems);

        for (const item of returnItems) {
            const productId = Number(item.productId);
            const quantity = Number(item.quantity || 0);
            returnedByProduct.set(productId, (returnedByProduct.get(productId) || 0) + quantity);
        }
    }

    const availableByProduct = new Map();
    for (const [productId, purchasedQty] of purchasedByProduct.entries()) {
        const returnedQty = returnedByProduct.get(productId) || 0;
        availableByProduct.set(productId, Math.max(0, purchasedQty - returnedQty));
    }

    return {
        items,
        availableByProduct,
        purchasedByProduct,
        unitPriceByProduct,
    };
}

function validateReturnRequest(purchase, returnItems, availability) {
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

        const unitPrice = Number(availability.unitPriceByProduct.get(productId) || 0);
        const maxLineTotal = roundMoney(unitPrice * quantity);
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

async function syncPurchaseReturnStatus(purchaseId, t) {
    const purchase = await Purchase.findByPk(purchaseId, { transaction: t });
    if (!purchase) return null;

    const activeReturns = await PurchaseReturn.findAll({
        where: {
            purchaseId,
            refundStatus: { [Op.ne]: "rejected" },
        },
        transaction: t,
    });

    const totalReturned = roundMoney(
        activeReturns.reduce((sum, purchaseReturn) => sum + Number(purchaseReturn.totalReturnAmount || 0), 0)
    );
    const purchaseTotal = roundMoney(purchase.totalAmount);

    let nextStatus = purchase.status;
    if (totalReturned <= 0) {
        if (purchase.status === "partial_return" || purchase.status === "full_return") {
            nextStatus = "purchase";
        }
    } else if (Math.abs(totalReturned - purchaseTotal) < 0.01 || totalReturned > purchaseTotal) {
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
    getReturnAvailability,
    getReturnProductIds,
    parseReturnItems,
    syncPurchaseReturnStatus,
    validateReturnRequest,
};
