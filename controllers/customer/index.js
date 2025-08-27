"use strict";

const { Customer } = require("../../database/models");
const {parsePagination, paginated, serverError, notFound, success} = require("../../utils/api-response");


// GET ALL
const getAll = async (req, res) => {
    try {
        const { page, limit, offset } = parsePagination(req.query, {
            page: 1,
            limit: 20,
            maxLimit: 100,
        });

        const { rows, count } = await Customer.findAndCountAll({
            limit,
            offset,
            order: [["createdAt", "DESC"]],
        });

        return paginated(res, { rows, count }, { page, limit }, "Fetched successfully");
    } catch (err) {
        return serverError(res, err.message, err);
    }
};

// GET ONE
const getOne = async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.params.id);
        if (!customer) return notFound(res, "Customer not found");
        return success(res, "Success", customer);
    } catch (err) {
        return serverError(res, err.message, err);
    }
};

module.exports = { getAll, getOne };
