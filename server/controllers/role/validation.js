const Joi = require("joi");
const { ALL_PERMISSIONS } = require("../../utils/permissions");

const createRoleValidation = Joi.object({
    name: Joi.string().trim().min(2).max(50).required(),
    permissions: Joi.array()
        .items(Joi.string().valid(...ALL_PERMISSIONS))
        .min(1)
        .required(),
});

const updateRoleValidation = Joi.object({
    name: Joi.string().trim().min(2).max(50),
    permissions: Joi.array()
        .items(Joi.string().valid(...ALL_PERMISSIONS))
        .min(1),
}).min(1); 

module.exports = { createRoleValidation, updateRoleValidation };
