"use strict";

const { Op } = require("sequelize");
const { Sale, SaleItem, SaleReturn, Invoice } = require("../database/models");

const RESTOCKING_SALE_RETURN_STATUSES = ["approved", "refunded"];

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

function normalizeAllocations(value) {
    const parsed = parseReturnItems(value);
    return parsed.map((allocation) => ({
        expiryDate: allocation.expiryDate || null,
        qty: Number(allocation.qty || 0),
    })).filter((allocation) => allocation.qty > 0);
}

function getSaleReturnProductIds(saleReturn) {
    return [...new Set(
        parseReturnItems(saleReturn?.returnItems)
            .map((item) => Number(item.productId))
            .filter(Boolean)
    )];
}

function shouldRestockSaleReturn(saleReturnLike) {
    if (!saleReturnLike) return false;
    return saleReturnLike.restockingDisposition === "restock"
        && RESTOCKING_SALE_RETURN_STATUSES.includes(saleReturnLike.refundStatus);
}

function buildReturnAllocations(availability, quantity) {
    let remaining = Number(quantity || 0);
    const allocations = [];

    for (const allocation of availability) {
        if (remaining <= 0) break;

        const availableQty = Number(allocation.qty || 0);
        if (availableQty <= 0) continue;

        const qty = Math.min(availableQty, remaining);
        allocations.push({
            expiryDate: allocation.expiryDate || null,
            qty,
        });
        remaining -= qty;
    }

    if (remaining > 0) {
        throw new Error("Insufficient sale allocations available for return");
    }

    return allocations;
}

async function getSaleReturnAvailability(saleId, t, excludeReturnId = null) {
    const sale = await Sale.findByPk(saleId, {
        include: [
            { model: SaleItem, as: "items" },
            { model: Invoice, as: "invoice" },
        ],
        transaction: t,
    });

    if (!sale) {
        return { sale: null, existingReturns: [], items: [] };
    }

    const returnsWhere = {
        saleId,
        refundStatus: { [Op.ne]: "rejected" },
    };

    if (excludeReturnId) {
        returnsWhere.id = { [Op.ne]: excludeReturnId };
    }

    const existingReturns = await SaleReturn.findAll({
        where: returnsWhere,
        order: [["createdAt", "ASC"], ["id", "ASC"]],
        transaction: t,
    });

    const returnedQtyBySaleItem = new Map();
    const returnedAmountBySaleItem = new Map();
    const returnedTaxBySaleItem = new Map();
    const returnedAllocationsBySaleItem = new Map();

    for (const saleReturn of existingReturns) {
        const returnItems = parseReturnItems(saleReturn.returnItems);

        for (const item of returnItems) {
            const saleItemId = Number(item.saleItemId);
            if (!saleItemId) continue;

            returnedQtyBySaleItem.set(
                saleItemId,
                (returnedQtyBySaleItem.get(saleItemId) || 0) + Number(item.quantity || 0)
            );
            returnedAmountBySaleItem.set(
                saleItemId,
                roundMoney((returnedAmountBySaleItem.get(saleItemId) || 0) + Number(item.lineTotal || 0))
            );
            returnedTaxBySaleItem.set(
                saleItemId,
                roundMoney((returnedTaxBySaleItem.get(saleItemId) || 0) + Number(item.taxAmount || 0))
            );

            const allocations = normalizeAllocations(item.allocations);
            if (!returnedAllocationsBySaleItem.has(saleItemId)) {
                returnedAllocationsBySaleItem.set(saleItemId, []);
            }
            returnedAllocationsBySaleItem.get(saleItemId).push(...allocations);
        }
    }

    const items = sale.items.map((saleItem) => {
        const saleItemId = Number(saleItem.id);
        const originalAllocations = normalizeAllocations(saleItem.allocations);
        const returnedAllocations = returnedAllocationsBySaleItem.get(saleItemId) || [];
        const returnedByLot = new Map();

        for (const allocation of returnedAllocations) {
            const key = allocation.expiryDate || "NULL";
            returnedByLot.set(key, (returnedByLot.get(key) || 0) + Number(allocation.qty || 0));
        }

        const availableAllocations = originalAllocations.map((allocation) => {
            const key = allocation.expiryDate || "NULL";
            const remainingQty = Math.max(
                0,
                Number(allocation.qty || 0) - Number(returnedByLot.get(key) || 0)
            );

            return {
                expiryDate: allocation.expiryDate || null,
                qty: remainingQty,
            };
        }).filter((allocation) => allocation.qty > 0);

        const availableQty = Math.max(
            0,
            Number(saleItem.quantity || 0) - Number(returnedQtyBySaleItem.get(saleItemId) || 0)
        );
        const availableLineTotal = roundMoney(
            Number(saleItem.lineTotal || 0) - Number(returnedAmountBySaleItem.get(saleItemId) || 0)
        );
        const availableTaxAmount = roundMoney(
            Number(saleItem.taxAmount || 0) - Number(returnedTaxBySaleItem.get(saleItemId) || 0)
        );

        return {
            saleItem,
            availableQty,
            availableLineTotal: Math.max(0, availableLineTotal),
            availableTaxAmount: Math.max(0, availableTaxAmount),
            availableAllocations,
        };
    });

    return {
        sale,
        existingReturns,
        items,
    };
}

function buildValidatedReturnItems(requestItems, availability) {
    const itemsById = new Map(
        availability.items.map((entry) => [Number(entry.saleItem.id), entry])
    );
    const requestedQtyBySaleItem = new Map();

    for (const rawItem of requestItems) {
        const saleItemId = Number(rawItem.saleItemId);
        const quantity = Number(rawItem.quantity || 0);
        requestedQtyBySaleItem.set(
            saleItemId,
            (requestedQtyBySaleItem.get(saleItemId) || 0) + quantity
        );
    }

    const returnItems = [];

    for (const [saleItemId, quantity] of requestedQtyBySaleItem.entries()) {
        const availabilityEntry = itemsById.get(saleItemId);

        if (!availabilityEntry) {
            return { error: `Sale item ${saleItemId} does not belong to this sale` };
        }

        if (quantity <= 0) {
            return { error: `Return quantity for sale item ${saleItemId} must be greater than 0` };
        }

        if (quantity > availabilityEntry.availableQty) {
            return {
                error: `Cannot return ${quantity} units for sale item ${saleItemId}; only ${availabilityEntry.availableQty} available to return`,
            };
        }

        let allocations;
        try {
            allocations = buildReturnAllocations(availabilityEntry.availableAllocations, quantity);
        } catch (_error) {
            return { error: `Unable to build return allocations for sale item ${saleItemId}` };
        }

        const saleItem = availabilityEntry.saleItem;
        const lineTotal = quantity === availabilityEntry.availableQty
            ? roundMoney(availabilityEntry.availableLineTotal)
            : roundMoney(Number(saleItem.lineTotal || 0) * quantity / Number(saleItem.quantity || 1));
        const taxAmount = quantity === availabilityEntry.availableQty
            ? roundMoney(availabilityEntry.availableTaxAmount)
            : roundMoney(Number(saleItem.taxAmount || 0) * quantity / Number(saleItem.quantity || 1));

        if (lineTotal <= 0) {
            return { error: `Return amount for sale item ${saleItemId} must be greater than 0` };
        }

        if (lineTotal > availabilityEntry.availableLineTotal + 0.01) {
            return { error: `Return amount for sale item ${saleItemId} exceeds the sold value` };
        }

        returnItems.push({
            saleItemId,
            productId: Number(saleItem.productId),
            quantity,
            taxAmount,
            lineTotal,
            allocations,
        });
    }

    return { returnItems };
}

function validateSaleReturnRequest(availability, returnItems) {
    if (!availability.sale) {
        return "Sale not found";
    }

    if (availability.sale.status !== "completed") {
        return `Sale status "${availability.sale.status}" cannot be returned`;
    }

    if (!availability.sale.invoice) {
        return "Completed sale must have an invoice before returns can be processed";
    }

    if (!Array.isArray(returnItems) || returnItems.length === 0) {
        return "At least one return item is required";
    }

    return null;
}

module.exports = {
    RESTOCKING_SALE_RETURN_STATUSES,
    buildValidatedReturnItems,
    getSaleReturnAvailability,
    getSaleReturnProductIds,
    parseReturnItems,
    shouldRestockSaleReturn,
    validateSaleReturnRequest,
};
