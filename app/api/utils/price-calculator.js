const Decimal = require('decimal.js');

Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

const MONEY_ROUNDING = Decimal.ROUND_HALF_UP;

const toMoneyDecimal = (value = 0) =>
    new Decimal(value || 0).toDecimalPlaces(2, MONEY_ROUNDING);

const roundMoney = (value = 0) => toMoneyDecimal(value).toNumber();

const normalizeDiscountType = (value) => {
    return ["none", "percent", "fixed"].includes(value) ? value : "none";
};

const calculateDiscountAmount = (baseAmount, discount = { type: "none", amount: 0 }, label = "Discount") => {
    try {
        const base = toMoneyDecimal(baseAmount || 0);
        const discountType = normalizeDiscountType(discount?.type);
        const discountValue = toMoneyDecimal(discount?.amount || 0);

        if (discountType === "none") {
            return {
                isValid: true,
                amount: 0,
                type: "none",
            };
        }

        if (discountValue.lessThan(0)) {
            return {
                isValid: false,
                error: `${label} cannot be negative`,
            };
        }

        if (discountType === "percent") {
            if (discountValue.greaterThan(100)) {
                return {
                    isValid: false,
                    error: `${label} percent must be between 0 and 100`,
                };
            }

            return {
                isValid: true,
                amount: base.times(discountValue).dividedBy(100).toDecimalPlaces(2, MONEY_ROUNDING).toNumber(),
                type: discountType,
            };
        }

        if (discountValue.greaterThan(base)) {
            return {
                isValid: false,
                error: `${label} cannot exceed subtotal`,
            };
        }

        return {
            isValid: true,
            amount: discountValue.toNumber(),
            type: discountType,
        };
    } catch (error) {
        return {
            isValid: false,
            error: `${label} calculation error: ${error.message}`,
        };
    }
};

const validateLineTotal = (quantity, unitPrice) => {
    try {
        const qty = new Decimal(quantity);
        const price = new Decimal(unitPrice);

        if (!qty.isInteger() || qty.lessThan(1)) {
            return {
                isValid: false,
                error: "Quantity must be a positive integer"
            };
        }

        if (price.lessThan(0)) {
            return {
                isValid: false,
                error: "Unit price cannot be negative"
            };
        }

        const lineTotal = qty.times(price).toDecimalPlaces(2, MONEY_ROUNDING);

        return {
            quantity: qty.toNumber(),
            unitPrice: price.toNumber(),
            lineTotal: lineTotal.toNumber(),
            isValid: true
        };
    } catch (error) {
        return {
            isValid: false,
            error: `Invalid price values: ${error.message}`
        };
    }
};

const calculateItemTotal = (item) => {
    try {
        const { unitPrice, quantity, discountType = "none", discountAmount = 0, taxPercent = 0 } = item;

        const validated = validateLineTotal(quantity, unitPrice);
        if (!validated.isValid) {
            return { isValid: false, error: validated.error };
        }

        const base = new Decimal(validated.lineTotal);
        const discountResult = calculateDiscountAmount(base, { type: discountType, amount: discountAmount }, "Item discount");
        if (!discountResult.isValid) {
            return { isValid: false, error: discountResult.error };
        }
        const discount = toMoneyDecimal(discountResult.amount);

        const afterDiscountCalc = base.minus(discount);
        const taxable = afterDiscountCalc.lessThan(0) ? new Decimal(0) : afterDiscountCalc;
        const taxPercVal = new Decimal(taxPercent);
        if (taxPercVal.lessThan(0) || taxPercVal.greaterThan(100)) {
            return { isValid: false, error: "Tax percent must be between 0 and 100" };
        }

        const tax = taxable.times(taxPercVal).dividedBy(100).toDecimalPlaces(2, MONEY_ROUNDING);
        const lineTotal = taxable.plus(tax).toDecimalPlaces(2, MONEY_ROUNDING);

        return {
            quantity: validated.quantity,
            unitPrice: validated.unitPrice,
            base: base.toNumber(),
            discount: discount.toNumber(),
            taxable: taxable.toNumber(),
            tax: tax.toNumber(),
            lineTotal: lineTotal.toNumber(),
            isValid: true
        };
    } catch (error) {
        return {
            isValid: false,
            error: `Item calculation error: ${error.message}`
        };
    }
};

const calculateOrderAmounts = ({
    subtotal = 0,
    itemTaxTotal = 0,
    orderDiscount = { type: "none", amount: 0 },
    orderTaxPercent = 0,
    shippingCharge = 0,
}) => {
    try {
        const subtotalDec = toMoneyDecimal(subtotal);
        const itemTaxDec = toMoneyDecimal(itemTaxTotal);

        const orderDiscountResult = calculateDiscountAmount(
            subtotalDec,
            orderDiscount,
            "Order discount"
        );
        if (!orderDiscountResult.isValid) {
            return { isValid: false, error: orderDiscountResult.error };
        }
        const orderDiscountAmount = toMoneyDecimal(orderDiscountResult.amount);

        const afterDiscountCalc = subtotalDec.minus(orderDiscountAmount);
        const afterDiscount = afterDiscountCalc.lessThan(0) ? new Decimal(0) : afterDiscountCalc;

        const taxPercVal = new Decimal(orderTaxPercent);
        if (taxPercVal.lessThan(0) || taxPercVal.greaterThan(100)) {
            return { isValid: false, error: "Order tax percent must be between 0 and 100" };
        }
        const orderTaxAmount = afterDiscount.times(taxPercVal).dividedBy(100).toDecimalPlaces(2, MONEY_ROUNDING);

        const shipping = new Decimal(shippingCharge).toDecimalPlaces(2, MONEY_ROUNDING);
        if (shipping.lessThan(0)) {
            return { isValid: false, error: "Shipping charge cannot be negative" };
        }

        const total = afterDiscount
            .plus(itemTaxDec)
            .plus(orderTaxAmount)
            .plus(shipping)
            .toDecimalPlaces(2, MONEY_ROUNDING);

        return {
            subtotal: subtotalDec.toNumber(),
            itemTaxTotal: itemTaxDec.toNumber(),
            orderDiscount: orderDiscountAmount.toNumber(),
            afterDiscount: afterDiscount.toNumber(),
            orderTax: orderTaxAmount.toNumber(),
            shipping: shipping.toNumber(),
            total: total.toNumber(),
            netTotal: subtotalDec.toNumber(),
            isValid: true
        };
    } catch (error) {
        return {
            isValid: false,
            error: `Order calculation error: ${error.message}`
        };
    }
};

const calculateOrderTotal = (items = [], orderDiscount = { type: "none", amount: 0 }, orderTaxPercent = 0, shippingCharge = 0) => {
    try {
        const subtotal = items.reduce((sum, item) => {
            const lineTotalValue = Number(item.lineTotal);
            if (!Number.isFinite(lineTotalValue)) {
                throw new Error("Invalid item lineTotal");
            }
            return sum.plus(new Decimal(lineTotalValue));
        }, new Decimal(0)).toDecimalPlaces(2, MONEY_ROUNDING);

        return calculateOrderAmounts({
            subtotal: subtotal.toNumber(),
            itemTaxTotal: 0,
            orderDiscount,
            orderTaxPercent,
            shippingCharge,
        });
    } catch (error) {
        return {
            isValid: false,
            error: `Order calculation error: ${error.message}`
        };
    }
};

const calculatePurchaseOrderTotals = (items = [], orderDiscount = { type: "none", amount: 0 }, orderTaxPercent = 0, shippingCharge = 0) => {
    try {
        const subtotal = items.reduce((sum, item) => {
            const lineTotalValue = Number(item.lineTotal);
            if (!Number.isFinite(lineTotalValue)) {
                throw new Error("Invalid purchase item lineTotal");
            }
            return sum.plus(new Decimal(lineTotalValue));
        }, new Decimal(0)).toDecimalPlaces(2, MONEY_ROUNDING);

        return calculateOrderAmounts({
            subtotal: subtotal.toNumber(),
            itemTaxTotal: 0,
            orderDiscount,
            orderTaxPercent,
            shippingCharge,
        });
    } catch (error) {
        return {
            isValid: false,
            error: `Purchase order calculation error: ${error.message}`
        };
    }
};

const calculateSaleOrderTotals = (items = [], orderDiscount = { type: "none", amount: 0 }, orderTaxPercent = 0, shippingCharge = 0) => {
    try {
        const totals = items.reduce(
            (acc, item) => {
                const base = Number(item.base);
                const tax = Number(item.tax);

                if (!Number.isFinite(base)) {
                    throw new Error("Invalid sale item base amount");
                }
                if (!Number.isFinite(tax)) {
                    throw new Error("Invalid sale item tax amount");
                }

                return {
                    subtotal: acc.subtotal.plus(new Decimal(base)),
                    itemTaxTotal: acc.itemTaxTotal.plus(new Decimal(tax)),
                };
            },
            {
                subtotal: new Decimal(0),
                itemTaxTotal: new Decimal(0),
            }
        );

        return calculateOrderAmounts({
            subtotal: totals.subtotal.toDecimalPlaces(2, MONEY_ROUNDING).toNumber(),
            itemTaxTotal: totals.itemTaxTotal.toDecimalPlaces(2, MONEY_ROUNDING).toNumber(),
            orderDiscount,
            orderTaxPercent,
            shippingCharge,
        });
    } catch (error) {
        return {
            isValid: false,
            error: `Sale order calculation error: ${error.message}`
        };
    }
};

const prorateAmount = (totalAmount, quantity, totalQuantity) => {
    try {
        const total = toMoneyDecimal(totalAmount);
        const qty = new Decimal(quantity || 0);
        const totalQty = new Decimal(totalQuantity || 0);

        if (!qty.isFinite() || qty.lessThan(0)) {
            throw new Error("Quantity must be zero or greater");
        }

        if (!totalQty.isFinite() || totalQty.lessThanOrEqualTo(0)) {
            throw new Error("Total quantity must be greater than 0");
        }

        return total.times(qty).dividedBy(totalQty).toDecimalPlaces(2, MONEY_ROUNDING).toNumber();
    } catch (error) {
        throw new Error(`Proration error: ${error.message}`);
    }
};

const calculateTotalItems = (items = []) => {
    try {
        const total = items.reduce((sum, item) => {
            const qty = new Decimal(item.quantity || 0);
            return sum.plus(qty);
        }, new Decimal(0));

        return total.toNumber();
    } catch (error) {
        throw new Error(`Cannot calculate total items: ${error.message}`);
    }
};

const calculateAvgCost = (currentAvgCost, currentStock, newQuantity, newUnitCost) => {
    try {
        const newQty = new Decimal(newQuantity);
        const newCost = new Decimal(newUnitCost);

        if (newQty.lessThanOrEqualTo(0)) {
            throw new Error("New quantity must be greater than 0");
        }
        if (newCost.lessThan(0)) {
            throw new Error("New unit cost cannot be negative");
        }

        const currStock = new Decimal(currentStock || 0);
        
        if (currStock.lessThanOrEqualTo(0) || !currentAvgCost) {
            return newCost.toDecimalPlaces(2, MONEY_ROUNDING).toNumber();
        }

        const currCost = new Decimal(currentAvgCost);
        
        const totalValue = currCost.times(currStock).plus(newCost.times(newQty));
        const totalQty = currStock.plus(newQty);
        
        const avgCost = totalValue.dividedBy(totalQty).toDecimalPlaces(2, MONEY_ROUNDING);
        
        return avgCost.toNumber();
    } catch (error) {
        throw new Error(`Average cost calculation error: ${error.message}`);
    }
};

const calculateProfitMetrics = (sellingPrice, costPrice) => {
    try {
        const price = new Decimal(sellingPrice || 0);
        const cost = new Decimal(costPrice || 0);

        const margin = price.minus(cost).toDecimalPlaces(2, MONEY_ROUNDING);
        
        let marginPercent = new Decimal(0);
        if (price.greaterThan(0)) {
            marginPercent = margin.dividedBy(price).times(100).toDecimalPlaces(2, MONEY_ROUNDING);
        }

        const markup = margin;
        
        let markupPercent = new Decimal(0);
        if (cost.greaterThan(0)) {
            markupPercent = markup.dividedBy(cost).times(100).toDecimalPlaces(2, MONEY_ROUNDING);
        }

        return {
            margin: margin.toNumber(),
            marginPercent: marginPercent.toNumber(),
            markup: markup.toNumber(),
            markupPercent: markupPercent.toNumber(),
            isProfit: margin.greaterThanOrEqualTo(0)
        };
    } catch (error) {
        throw new Error(`Profit calculation error: ${error.message}`);
    }
};

const validateSellingPrice = (sellingPrice, costPrice) => {
    try {
        const price = new Decimal(sellingPrice || 0);
        const cost = new Decimal(costPrice || 0);

        if (price.lessThan(0)) {
            return {
                isValid: false,
                error: "Selling price cannot be negative",
                warning: null,
                metrics: null
            };
        }

        const metrics = calculateProfitMetrics(sellingPrice, costPrice);

        if (cost.greaterThan(0) && price.lessThanOrEqualTo(cost)) {
            return {
                isValid: false,
                error: `Selling price (${price.toFixed(2)}) must be greater than buying price (${cost.toFixed(2)})`,
                warning: null,
                metrics,
            };
        }

        let warning = null;
        if (cost.greaterThan(0) && metrics.marginPercent < 10) {
            warning = `Low margin warning: Margin is only ${metrics.marginPercent.toFixed(2)}%. Consider increasing price.`;
        }

        return {
            isValid: true,
            warning: warning,
            metrics: metrics
        };
    } catch (error) {
        return {
            isValid: false,
            error: `Price validation error: ${error.message}`,
            warning: null,
            metrics: null
        };
    }
};

module.exports = {
    validateLineTotal,
    calculateItemTotal,
    calculateDiscountAmount,
    calculateOrderAmounts,
    calculateOrderTotal,
    calculatePurchaseOrderTotals,
    calculateSaleOrderTotals,
    calculateTotalItems,
    calculateAvgCost,
    calculateProfitMetrics,
    normalizeDiscountType,
    prorateAmount,
    roundMoney,
    toMoneyDecimal,
    validateSellingPrice,
    Decimal
};
