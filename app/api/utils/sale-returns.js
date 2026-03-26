"use strict";

const { Op } = require("sequelize");
const { Sale, SaleItem, SaleReturn, Invoice } = require("../database/models");
const { Decimal, prorateAmount, roundMoney } = require("./price-calculator");

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

function getSaleReturnRevenueAmount(item) {
    if (!item) return 0;

    if (item.baseAmount !== undefined || item.orderDiscountAmount !== undefined) {
        return roundMoney(
            Number(item.baseAmount || 0) - Number(item.orderDiscountAmount || 0)
        );
    }

    return roundMoney(Number(item.lineTotal || 0) - Number(item.taxAmount || 0));
}

function buildSaleItemPricingEntries(sale) {
    const saleItems = Array.isArray(sale?.items) ? sale.items : [];
    if (!saleItems.length) return new Map();

    const normalizedItems = saleItems.map((saleItem) => ({
        saleItemId: Number(saleItem.id),
        baseAmount: roundMoney(Number(saleItem.lineTotal || 0) - Number(saleItem.taxAmount || 0)),
        taxAmount: roundMoney(Number(saleItem.taxAmount || 0)),
    }));

    const subtotal = new Decimal(
        normalizedItems.reduce((sum, item) => sum + Number(item.baseAmount || 0), 0)
    );
    let remainingDiscount = new Decimal(Number(sale.discountAmount || 0)).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    const discountEntries = normalizedItems.map((item, index) => {
        const baseAmount = new Decimal(item.baseAmount || 0);
        let orderDiscountAmount = new Decimal(0);

        if (subtotal.greaterThan(0) && remainingDiscount.greaterThan(0)) {
            if (index === normalizedItems.length - 1) {
                orderDiscountAmount = remainingDiscount;
            } else {
                orderDiscountAmount = baseAmount
                    .times(new Decimal(Number(sale.discountAmount || 0)))
                    .dividedBy(subtotal)
                    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
                if (orderDiscountAmount.greaterThan(remainingDiscount)) {
                    orderDiscountAmount = remainingDiscount;
                }
            }
        }

        remainingDiscount = remainingDiscount.minus(orderDiscountAmount);

        return {
            saleItemId: item.saleItemId,
            baseAmount: roundMoney(baseAmount),
            taxAmount: roundMoney(item.taxAmount),
            orderDiscountAmount: roundMoney(orderDiscountAmount),
            discountedBaseAmount: roundMoney(baseAmount.minus(orderDiscountAmount)),
        };
    });

    const discountedSubtotal = new Decimal(
        discountEntries.reduce((sum, item) => sum + Number(item.discountedBaseAmount || 0), 0)
    );
    let remainingOrderTax = new Decimal(Number(sale.orderTaxAmount || 0)).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    return new Map(
        discountEntries.map((item, index) => {
            const discountedBaseAmount = new Decimal(item.discountedBaseAmount || 0);
            let orderTaxAmount = new Decimal(0);

            if (discountedSubtotal.greaterThan(0) && remainingOrderTax.greaterThan(0)) {
                if (index === discountEntries.length - 1) {
                    orderTaxAmount = remainingOrderTax;
                } else {
                    orderTaxAmount = discountedBaseAmount
                        .times(new Decimal(Number(sale.orderTaxAmount || 0)))
                        .dividedBy(discountedSubtotal)
                        .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
                    if (orderTaxAmount.greaterThan(remainingOrderTax)) {
                        orderTaxAmount = remainingOrderTax;
                    }
                }
            }

            remainingOrderTax = remainingOrderTax.minus(orderTaxAmount);

            return [
                item.saleItemId,
                {
                    saleItemId: item.saleItemId,
                    baseAmount: item.baseAmount,
                    taxAmount: item.taxAmount,
                    orderDiscountAmount: item.orderDiscountAmount,
                    discountedBaseAmount: item.discountedBaseAmount,
                    orderTaxAmount: roundMoney(orderTaxAmount),
                    lineTotal: roundMoney(
                        Number(item.discountedBaseAmount || 0)
                        + Number(item.taxAmount || 0)
                        + roundMoney(orderTaxAmount)
                    ),
                },
            ];
        })
    );
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

    const saleItemsById = new Map(sale.items.map((saleItem) => [Number(saleItem.id), saleItem]));
    const returnedQtyBySaleItem = new Map();
    const returnedAmountBySaleItem = new Map();
    const returnedTaxBySaleItem = new Map();
    const returnedBaseBySaleItem = new Map();
    const returnedOrderDiscountBySaleItem = new Map();
    const returnedOrderTaxBySaleItem = new Map();
    const returnedAllocationsBySaleItem = new Map();
    const pricingEntriesBySaleItem = buildSaleItemPricingEntries(sale);

    for (const saleReturn of existingReturns) {
        const returnItems = parseReturnItems(saleReturn.returnItems);

        for (const item of returnItems) {
            const saleItemId = Number(item.saleItemId);
            if (!saleItemId) continue;
            const saleItem = saleItemsById.get(saleItemId);
            const pricingEntry = pricingEntriesBySaleItem.get(saleItemId);
            const quantity = Number(item.quantity || 0);
            const saleItemQty = Number(saleItem?.quantity || 1);
            const derivedBaseAmount = item.baseAmount !== undefined
                ? Number(item.baseAmount || 0)
                : pricingEntry
                    ? prorateAmount(pricingEntry.baseAmount, quantity, saleItemQty)
                    : roundMoney(Number(item.lineTotal || 0) - Number(item.taxAmount || 0));
            const derivedOrderDiscountAmount = item.orderDiscountAmount !== undefined
                ? Number(item.orderDiscountAmount || 0)
                : pricingEntry
                    ? prorateAmount(pricingEntry.orderDiscountAmount, quantity, saleItemQty)
                    : 0;
            const derivedOrderTaxAmount = item.orderTaxAmount !== undefined
                ? Number(item.orderTaxAmount || 0)
                : pricingEntry
                    ? prorateAmount(pricingEntry.orderTaxAmount, quantity, saleItemQty)
                    : 0;

            returnedQtyBySaleItem.set(
                saleItemId,
                (returnedQtyBySaleItem.get(saleItemId) || 0) + quantity
            );
            returnedAmountBySaleItem.set(
                saleItemId,
                roundMoney((returnedAmountBySaleItem.get(saleItemId) || 0) + Number(item.lineTotal || 0))
            );
            returnedTaxBySaleItem.set(
                saleItemId,
                roundMoney((returnedTaxBySaleItem.get(saleItemId) || 0) + Number(item.taxAmount || 0))
            );
            returnedBaseBySaleItem.set(
                saleItemId,
                roundMoney((returnedBaseBySaleItem.get(saleItemId) || 0) + derivedBaseAmount)
            );
            returnedOrderDiscountBySaleItem.set(
                saleItemId,
                roundMoney((returnedOrderDiscountBySaleItem.get(saleItemId) || 0) + derivedOrderDiscountAmount)
            );
            returnedOrderTaxBySaleItem.set(
                saleItemId,
                roundMoney((returnedOrderTaxBySaleItem.get(saleItemId) || 0) + derivedOrderTaxAmount)
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
        const pricingEntry = pricingEntriesBySaleItem.get(saleItemId) || {
            baseAmount: roundMoney(Number(saleItem.lineTotal || 0) - Number(saleItem.taxAmount || 0)),
            taxAmount: roundMoney(Number(saleItem.taxAmount || 0)),
            orderDiscountAmount: 0,
            discountedBaseAmount: roundMoney(Number(saleItem.lineTotal || 0) - Number(saleItem.taxAmount || 0)),
            orderTaxAmount: 0,
            lineTotal: roundMoney(Number(saleItem.lineTotal || 0)),
        };
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
            Number(pricingEntry.lineTotal || 0) - Number(returnedAmountBySaleItem.get(saleItemId) || 0)
        );
        const availableTaxAmount = roundMoney(
            Number(pricingEntry.taxAmount || 0) - Number(returnedTaxBySaleItem.get(saleItemId) || 0)
        );
        const availableBaseAmount = roundMoney(
            Number(pricingEntry.baseAmount || 0) - Number(returnedBaseBySaleItem.get(saleItemId) || 0)
        );
        const availableOrderDiscountAmount = roundMoney(
            Number(pricingEntry.orderDiscountAmount || 0) - Number(returnedOrderDiscountBySaleItem.get(saleItemId) || 0)
        );
        const availableOrderTaxAmount = roundMoney(
            Number(pricingEntry.orderTaxAmount || 0) - Number(returnedOrderTaxBySaleItem.get(saleItemId) || 0)
        );

        return {
            saleItem,
            availableQty,
            availableLineTotal: Math.max(0, availableLineTotal),
            availableTaxAmount: Math.max(0, availableTaxAmount),
            availableBaseAmount: Math.max(0, availableBaseAmount),
            availableOrderDiscountAmount: Math.max(0, availableOrderDiscountAmount),
            availableOrderTaxAmount: Math.max(0, availableOrderTaxAmount),
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
        const taxAmount = quantity === availabilityEntry.availableQty
            ? roundMoney(availabilityEntry.availableTaxAmount)
            : roundMoney(prorateAmount(availabilityEntry.availableTaxAmount, quantity, availabilityEntry.availableQty));
        const baseAmount = quantity === availabilityEntry.availableQty
            ? roundMoney(availabilityEntry.availableBaseAmount)
            : roundMoney(prorateAmount(availabilityEntry.availableBaseAmount, quantity, availabilityEntry.availableQty));
        const orderDiscountAmount = quantity === availabilityEntry.availableQty
            ? roundMoney(availabilityEntry.availableOrderDiscountAmount)
            : roundMoney(prorateAmount(availabilityEntry.availableOrderDiscountAmount, quantity, availabilityEntry.availableQty));
        const orderTaxAmount = quantity === availabilityEntry.availableQty
            ? roundMoney(availabilityEntry.availableOrderTaxAmount)
            : roundMoney(prorateAmount(availabilityEntry.availableOrderTaxAmount, quantity, availabilityEntry.availableQty));
        const lineTotal = quantity === availabilityEntry.availableQty
            ? roundMoney(availabilityEntry.availableLineTotal)
            : roundMoney(baseAmount - orderDiscountAmount + taxAmount + orderTaxAmount);

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
            baseAmount,
            taxAmount,
            orderDiscountAmount,
            orderTaxAmount,
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
    getSaleReturnRevenueAmount,
    getSaleReturnAvailability,
    getSaleReturnProductIds,
    parseReturnItems,
    shouldRestockSaleReturn,
    validateSaleReturnRequest,
};
