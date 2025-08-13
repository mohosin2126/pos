
"use strict";

const Joi = require("joi");

const createSupplierValidation = Joi.object({
    supplierCode: Joi.string().trim().max(50).required(),
    companyName: Joi.string().trim().max(150).required(),
    contactPersonName: Joi.string().trim().max(150).required(),
    email: Joi.string().trim().email().max(150).allow(null, ""),
    phone: Joi.string().trim().max(50).allow(null, ""),
    address: Joi.string().allow(null, ""),
    city: Joi.string().trim().max(100).allow(null, ""),
    state: Joi.string().trim().max(100).allow(null, ""),
    postalCode: Joi.string().trim().max(30).allow(null, ""),
    country: Joi.string().trim().max(100).allow(null, ""),
    website: Joi.string().uri().max(200).allow(null, ""),
    taxId: Joi.string().trim().max(100).allow(null, ""),
    bankDetails: Joi.string().allow(null, ""),
    paymentTerms: Joi.string().trim().max(50).allow(null, ""),
    status: Joi.string().valid("active", "inactive").default("active"),
    _notes: Joi.string().trim().allow(null, ""),

});

module.exports = { createSupplierValidation };
