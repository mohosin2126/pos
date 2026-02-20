const Decimal = require('decimal.js');

Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

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

        const lineTotal = qty.times(price).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

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
        let discount = new Decimal(0);

        if (discountType === "percent") {
            const discPercent = new Decimal(discountAmount);
            if (discPercent.lessThan(0) || discPercent.greaterThan(100)) {
                return { isValid: false, error: "Discount percent must be between 0 and 100" };
            }
            discount = base.times(discPercent).dividedBy(100).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
        } else if (discountType === "fixed") {
            discount = new Decimal(discountAmount).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
            if (discount.greaterThan(base)) {
                return { isValid: false, error: "Fixed discount cannot exceed item total" };
            }
        }

        const taxable = base.minus(discount).max(0);
        const taxPercVal = new Decimal(taxPercent);
        if (taxPercVal.lessThan(0) || taxPercVal.greaterThan(100)) {
            return { isValid: false, error: "Tax percent must be between 0 and 100" };
        }

        const tax = taxable.times(taxPercVal).dividedBy(100).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
        const lineTotal = taxable.plus(tax).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

        return {
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

const calculateOrderTotal = (items = [], orderDiscount = { type: "none", amount: 0 }, orderTaxPercent = 0, shippingCharge = 0) => {
    try {
        const subtotal = items.reduce((sum, item) => {
            if (typeof item.lineTotal !== 'number') {
                throw new Error("Invalid item lineTotal");
            }
            return sum.plus(new Decimal(item.lineTotal));
        }, new Decimal(0)).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

        let orderDiscountAmount = new Decimal(0);
        if (orderDiscount.type === "percent") {
            const discPercent = new Decimal(orderDiscount.amount);
            if (discPercent.lessThan(0) || discPercent.greaterThan(100)) {
                return { isValid: false, error: "Order discount percent must be between 0 and 100" };
            }
            orderDiscountAmount = subtotal.times(discPercent).dividedBy(100).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
        } else if (orderDiscount.type === "fixed") {
            orderDiscountAmount = new Decimal(orderDiscount.amount).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
            if (orderDiscountAmount.greaterThan(subtotal)) {
                return { isValid: false, error: "Order discount cannot exceed subtotal" };
            }
        }

        const afterDiscount = subtotal.minus(orderDiscountAmount).max(0);

        const taxPercVal = new Decimal(orderTaxPercent);
        if (taxPercVal.lessThan(0) || taxPercVal.greaterThan(100)) {
            return { isValid: false, error: "Order tax percent must be between 0 and 100" };
        }
        const orderTaxAmount = afterDiscount.times(taxPercVal).dividedBy(100).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

        const shipping = new Decimal(shippingCharge).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
        if (shipping.lessThan(0)) {
            return { isValid: false, error: "Shipping charge cannot be negative" };
        }

        const total = afterDiscount.plus(orderTaxAmount).plus(shipping).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

        return {
            subtotal: subtotal.toNumber(),
            orderDiscount: orderDiscountAmount.toNumber(),
            afterDiscount: afterDiscount.toNumber(),
            orderTax: orderTaxAmount.toNumber(),
            total: total.toNumber(),
            netTotal: afterDiscount.toNumber(),
            isValid: true
        };
    } catch (error) {
        return {
            isValid: false,
            error: `Order calculation error: ${error.message}`
        };
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

module.exports = {
    validateLineTotal,
    calculateItemTotal,
    calculateOrderTotal,
    calculateTotalItems,
    Decimal
};
