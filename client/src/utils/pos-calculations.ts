import {
  add,
  subtract,
  multiply,
  divide,
  max,
  lessThan,
  greaterThan,
  percentage,
  isInteger,
  roundTo,
} from "./math-utils";

export interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  discount?: number;
  tax?: number;
}

export interface POSSettings {
  discountType: "none" | "percent" | "fixed";
  discountAmount: number;
  orderTaxPercent: number;
  shippingCharge: number;
}

export interface POSTotals {
  subtotal: number;
  itemDiscounts: number;
  orderDiscount: number;
  itemTaxes: number;
  orderTax: number;
  shipping: number;
  total: number;
}

export const calculatePOSTotals = (
  cartItems: CartItem[],
  settings: POSSettings
): POSTotals => {
  // Calculate subtotal
  let subtotal = 0;
  for (const item of cartItems) {
    const itemPrice = item.price || 0;
    const itemQty = item.quantity || 0;
    const itemTotal = multiply(itemPrice, itemQty);
    subtotal = add(subtotal, itemTotal);
  }
  subtotal = roundTo(subtotal, 2);

  // Calculate item discounts
  let itemDiscounts = 0;
  for (const item of cartItems) {
    const discount = item.discount || 0;
    itemDiscounts = add(itemDiscounts, discount);
  }
  itemDiscounts = roundTo(itemDiscounts, 2);

  // Calculate item taxes
  let itemTaxes = 0;
  for (const item of cartItems) {
    const itemSubtotal = multiply(item.price || 0, item.quantity || 0);
    const itemDiscount = item.discount || 0;
    const taxableAmount = max(subtract(itemSubtotal, itemDiscount), 0);
    const taxPercent = item.tax || 0;
    const itemTax = percentage(taxableAmount, taxPercent);
    itemTaxes = add(itemTaxes, itemTax);
  }
  itemTaxes = roundTo(itemTaxes, 2);

  // Calculate subtotal after item discounts
  const subtotalAfterItemDiscounts = subtract(subtotal, itemDiscounts);

  // Calculate order discount
  let orderDiscount = 0;
  if (settings.discountType === "percent") {
    orderDiscount = percentage(subtotal, settings.discountAmount || 0);
  } else if (settings.discountType === "fixed") {
    orderDiscount = settings.discountAmount || 0;
  }
  orderDiscount = roundTo(orderDiscount, 2);

  // Calculate order tax
  const subtotalForOrderTax = max(
    subtract(subtotalAfterItemDiscounts, orderDiscount),
    0
  );
  const orderTax = percentage(subtotalForOrderTax, settings.orderTaxPercent || 0);

  // Shipping charge
  const shipping = roundTo(settings.shippingCharge || 0, 2);

  // Calculate total
  let total = subtotal;
  total = subtract(total, itemDiscounts);
  total = subtract(total, orderDiscount);
  total = add(total, itemTaxes);
  total = add(total, orderTax);
  total = add(total, shipping);
  total = max(total, 0);
  total = roundTo(total, 2);

  return {
    subtotal,
    itemDiscounts,
    orderDiscount,
    itemTaxes,
    orderTax,
    shipping,
    total,
  };
};

export const validateItemCalculation = (
  unitPrice: number,
  quantity: number,
  discountType: "none" | "percent" | "fixed",
  discountAmount: number,
  taxPercent: number
): { isValid: boolean; lineTotal?: number; error?: string } => {
  try {
    const price = unitPrice || 0;
    const qty = quantity || 0;

    if (!isInteger(qty) || lessThan(qty, 1)) {
      return { isValid: false, error: "Quantity must be a positive integer" };
    }

    if (lessThan(price, 0)) {
      return { isValid: false, error: "Unit price cannot be negative" };
    }

    const base = multiply(price, qty);
    let discount = 0;

    if (discountType === "percent") {
      const discPercent = discountAmount || 0;
      if (
        lessThan(discPercent, 0) ||
        greaterThan(discPercent, 100)
      ) {
        return {
          isValid: false,
          error: "Discount percent must be between 0 and 100",
        };
      }
      discount = percentage(base, discPercent);
    } else if (discountType === "fixed") {
      discount = discountAmount || 0;
      if (greaterThan(discount, base)) {
        return {
          isValid: false,
          error: "Fixed discount cannot exceed item total",
        };
      }
    }

    const taxable = max(subtract(base, discount), 0);
    const taxPercentVal = taxPercent || 0;
    if (
      lessThan(taxPercentVal, 0) ||
      greaterThan(taxPercentVal, 100)
    ) {
      return {
        isValid: false,
        error: "Tax percent must be between 0 and 100",
      };
    }

    const tax = percentage(taxable, taxPercentVal);
    const lineTotal = roundTo(add(taxable, tax), 2);

    return { isValid: true, lineTotal };
  } catch (error) {
    return {
      isValid: false,
      error: `Calculation error: ${(error as any).message}`,
    };
  }
};

export const validateOrderCalculation = (
  subtotal: number,
  discountType: "none" | "percent" | "fixed",
  discountAmount: number,
  orderTaxPercent: number,
  shippingCharge: number
): { isValid: boolean; total?: number; error?: string } => {
  try {
    const subtotalDec = subtotal || 0;
    let discount = 0;

    if (discountType === "percent") {
      const discPercent = discountAmount || 0;
      if (
        lessThan(discPercent, 0) ||
        greaterThan(discPercent, 100)
      ) {
        return {
          isValid: false,
          error: "Order discount percent must be between 0 and 100",
        };
      }
      discount = percentage(subtotalDec, discPercent);
    } else if (discountType === "fixed") {
      discount = discountAmount || 0;
      if (greaterThan(discount, subtotalDec)) {
        return {
          isValid: false,
          error: "Order discount cannot exceed subtotal",
        };
      }
    }

    const afterDiscount = max(subtract(subtotalDec, discount), 0);
    const taxPercVal = orderTaxPercent || 0;
    if (
      lessThan(taxPercVal, 0) ||
      greaterThan(taxPercVal, 100)
    ) {
      return {
        isValid: false,
        error: "Order tax percent must be between 0 and 100",
      };
    }

    const tax = percentage(afterDiscount, taxPercVal);
    const shipping = shippingCharge || 0;
    if (lessThan(shipping, 0)) {
      return {
        isValid: false,
        error: "Shipping charge cannot be negative",
      };
    }

    const total = roundTo(add(add(afterDiscount, tax), shipping), 2);

    return { isValid: true, total };
  } catch (error) {
    return {
      isValid: false,
      error: `Validation error: ${(error as any).message}`,
    };
  }
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const getBreakdownText = (totals: POSTotals): string[] => {
  const lines: string[] = [];
  lines.push(`Subtotal: ${formatCurrency(totals.subtotal)}`);
  if (totals.itemDiscounts > 0) {
    lines.push(`Item Discounts: -${formatCurrency(totals.itemDiscounts)}`);
  }
  if (totals.orderDiscount > 0) {
    lines.push(`Order Discount: -${formatCurrency(totals.orderDiscount)}`);
  }
  if (totals.itemTaxes > 0) {
    lines.push(`Item Taxes: +${formatCurrency(totals.itemTaxes)}`);
  }
  if (totals.orderTax > 0) {
    lines.push(`Order Tax: +${formatCurrency(totals.orderTax)}`);
  }
  if (totals.shipping > 0) {
    lines.push(`Shipping: +${formatCurrency(totals.shipping)}`);
  }
  return lines;
};