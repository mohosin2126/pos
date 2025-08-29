const Joi = require("joi");

const createUserValidation = Joi.object({
    firstName: Joi.string().trim().max(100).required(),
    lastName: Joi.string().trim().max(100).allow(null, ""),
    email: Joi.string().email().required(),
    isActive: Joi.boolean().default(false),
    allowLogin: Joi.boolean().default(false),
    username: Joi.string().trim().min(3).max(50),
    password: Joi.string().min(6).max(255).required(),
    role: Joi.string().trim().min(2).max(50).required(),

    dateOfBirth: Joi.date().iso().allow(null),
    gender: Joi.string().allow(null, ""),
    maritalStatus: Joi.string().allow(null, ""),
    bloodGroup: Joi.string().allow(null, ""),
    mobileNumber: Joi.string().max(30).allow(null, ""),
    alternateContactNumber: Joi.string().max(30).allow(null, ""),
    familyContactNumber: Joi.string().max(30).allow(null, ""),
    socialMedia1: Joi.string().uri().max(255).allow(null, ""),
    guardianName: Joi.string().allow(null, ""),
    permanentAddress: Joi.string().allow(null, ""),
    currentAddress: Joi.string().allow(null, ""),
    accountHolderName: Joi.string().allow(null, ""),
    accountNumber: Joi.string().allow(null, ""),
    bankName: Joi.string().allow(null, ""),
    bankIdentifierCode: Joi.string().allow(null, ""),
    branch: Joi.string().allow(null, ""),
    taxPayerId: Joi.string().allow(null, ""),
});

module.exports = { createUserValidation };
