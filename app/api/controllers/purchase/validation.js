const Joi = require("joi");

const purchaseItemSchema = Joi.object({
    productId: Joi.number().integer().positive().required(),
    quantity: Joi.number().integer().positive().max(9999999).required(),
    unitPrice: Joi.number().min(0).max(99999999.99).required(),
    lineTotal: Joi.number().min(0).max(99999999.99).required(),
    expiryDate: Joi.date().iso().allow(null),
    batchNo: Joi.string().max(64).allow(null, ""),
});

const createPurchaseOrderValidation = Joi.object({
    supplierId: Joi.number().integer().positive().required(),
    supplierAddress: Joi.string().max(500).allow(null, ""),
    referenceNo: Joi.string().max(64).allow(null, ""),
    purchaseDate: Joi.date().iso().required(),
    status: Joi.string().valid("draft", "po", "ordered", "purchase", "received", "partial", "partial_return", "full_return", "cancelled").default("po"),
    items: Joi.array().items(purchaseItemSchema).min(1).required(),
    totalItems: Joi.forbidden().messages({
        'any.unknown': '"totalItems" is calculated server-side and should not be included in the request'
    }),

    payTermValue: Joi.number().integer().min(0).allow(null),
    payTermUnit: Joi.string().valid("days", "months").allow(null),

    discountType: Joi.string().valid("none", "percent", "fixed").default("none"),
    discountAmount: Joi.number().min(0).max(99999999.99).default(0),
    orderTaxPercent: Joi.number().min(0).max(100).default(0),
    orderTaxAmount: Joi.number().min(0).max(99999999.99).default(0),
    shippingCharge: Joi.number().min(0).max(99999999.99).default(0),
    additionalExpenses: Joi.object().allow(null),

    netTotalAmount: Joi.number().min(0).max(99999999.99).required(),
    totalAmount: Joi.number().min(0).max(99999999.99).required(),
    amountPaid: Joi.number().min(0).max(99999999.99).default(0),

    notes: Joi.string().allow(null, ""),
    shippingDetails: Joi.string().allow(null, ""),

    warrantyValue: Joi.number().integer().min(0).allow(null),
    warrantyUnit: Joi.string().valid("months", "years").allow(null),
}).external(async (value) => {
    if (value.discountType === "none" && value.discountAmount && value.discountAmount !== 0) {
        throw new Error("Discount amount must be 0 when discount type is 'none'");
    }
});

const updatePurchaseValidation = Joi.object({
    supplierId: Joi.number().integer().positive(),
    supplierAddress: Joi.string().max(500).allow(null, ""),
    referenceNo: Joi.string().max(64).allow(null, ""),
    purchaseDate: Joi.date().iso(),
    status: Joi.string().valid("draft", "po", "ordered", "purchase", "received", "partial", "partial_return", "full_return", "cancelled"),
    items: Joi.array().items(purchaseItemSchema).min(1),
    totalItems: Joi.forbidden().messages({
        'any.unknown': '"totalItems" is calculated server-side and should not be included in the request'
    }),

    payTermValue: Joi.number().integer().min(0).allow(null),
    payTermUnit: Joi.string().valid("days", "months").allow(null),

    discountType: Joi.string().valid("none", "percent", "fixed"),
    discountAmount: Joi.number().min(0).max(99999999.99),
    orderTaxPercent: Joi.number().min(0).max(100),
    orderTaxAmount: Joi.number().min(0).max(99999999.99),
    shippingCharge: Joi.number().min(0).max(99999999.99),
    additionalExpenses: Joi.object().allow(null),

    netTotalAmount: Joi.number().min(0).max(99999999.99),
    totalAmount: Joi.number().min(0).max(99999999.99),
    amountPaid: Joi.number().min(0).max(99999999.99),

    notes: Joi.string().allow(null, ""),
    shippingDetails: Joi.string().allow(null, ""),

    warrantyValue: Joi.number().integer().min(0).allow(null),
    warrantyUnit: Joi.string().valid("months", "years").allow(null),
}).external(async (value) => {
    if (value.discountType === "none" && value.discountAmount && value.discountAmount !== 0) {
        throw new Error("Discount amount must be 0 when discount type is 'none'");
    }
});

const createPurchaseReturnValidation = Joi.object({
    purchaseId: Joi.number().integer().positive().required(),
    referenceNo: Joi.string().max(64).allow(null, ""),
    returnDate: Joi.date().iso().required(),
    returnReason: Joi.string()
        .valid("defective", "overstock", "expired", "quality_issue", "wrong_item", "other")
        .required(),

    returnItems: Joi.array()
        .items(
            Joi.object({
                productId: Joi.number().integer().positive().required(),
                quantity: Joi.number().positive().required(),
                lineTotal: Joi.number().positive().required(),
            })
        )
        .min(1)
        .required(),

    totalReturnAmount: Joi.number().positive().required(),
    refundAmount: Joi.number().min(0).allow(null),
    restockingDisposition: Joi.string()
        .valid("restock", "scrap", "donate", "pending")
        .default("pending"),

    notes: Joi.string().allow(null, ""),
});

const approvePurchaseOrderValidation = Joi.object({
    id: Joi.number().integer().positive().required(),
});

module.exports = {
    createPurchaseOrderValidation,
    updatePurchaseValidation,
    createPurchaseReturnValidation,
    approvePurchaseOrderValidation,
    purchaseItemSchema,
};
