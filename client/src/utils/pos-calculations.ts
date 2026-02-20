
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

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );


  const itemDiscounts = cartItems.reduce(
    (sum, item) => sum + (item.discount || 0),
    0
  );
  const itemTaxes = cartItems.reduce((sum, item) => {
    const itemSubtotal = item.price * item.quantity;
    const itemDiscount = item.discount || 0;
    const taxableAmount = Math.max(0, itemSubtotal - itemDiscount);
    const taxPercent = item.tax || 0;
    return sum + (taxableAmount * taxPercent) / 100;
  }, 0);


  const subtotalAfterItemDiscounts = subtotal - itemDiscounts;
  let orderDiscount = 0;

  if (settings.discountType === "percent") {
  
    orderDiscount = (subtotal * settings.discountAmount) / 100;
  } else if (settings.discountType === "fixed") {
   
    orderDiscount = settings.discountAmount;
  }
  
  const subtotalForOrderTax = Math.max(
    0,
    subtotalAfterItemDiscounts - orderDiscount
  );
  const orderTax = (subtotalForOrderTax * settings.orderTaxPercent) / 100;
  const shipping = settings.shippingCharge || 0;

  const total =
    subtotal -
    itemDiscounts -
    orderDiscount +
    itemTaxes +
    orderTax +
    shipping;

  return {
    subtotal,
    itemDiscounts,
    orderDiscount,
    itemTaxes,
    orderTax,
    shipping,
    total: Math.max(0, Math.round(total * 100) / 100), 
  };
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
