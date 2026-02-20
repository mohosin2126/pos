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
            return newCost.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
        }

        const currCost = new Decimal(currentAvgCost);
        
        const totalValue = currCost.times(currStock).plus(newCost.times(newQty));
        const totalQty = currStock.plus(newQty);
        
        const avgCost = totalValue.dividedBy(totalQty).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
        
        return avgCost.toNumber();
    } catch (error) {
        throw new Error(`Average cost calculation error: ${error.message}`);
    }
};

const calculateProfitMetrics = (sellingPrice, costPrice) => {
    try {
        const price = new Decimal(sellingPrice || 0);
        const cost = new Decimal(costPrice || 0);

        const margin = price.minus(cost).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
        
        let marginPercent = new Decimal(0);
        if (price.greaterThan(0)) {
            marginPercent = margin.dividedBy(price).times(100).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
        }

        const markup = margin;
        
        let markupPercent = new Decimal(0);
        if (cost.greaterThan(0)) {
            markupPercent = markup.dividedBy(cost).times(100).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
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

        let warning = null;
        if (cost.greaterThan(0) && price.lessThan(cost)) {
            warning = `Warning: Selling price (${price.toFixed(2)}) is below cost price (${cost.toFixed(2)}). Loss per unit: ${Math.abs(metrics.margin).toFixed(2)}`;
        } else if (cost.greaterThan(0) && metrics.marginPercent < 10) {
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
    calculateOrderTotal,
    calculateTotalItems,
    calculateAvgCost,
    calculateProfitMetrics,
    validateSellingPrice,
    Decimal
};
