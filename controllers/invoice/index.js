"use strict";

const { Invoice } = require("../../database/models");
const {parsePagination, paginated, serverError, success, notFound} = require("../../utils/api-response");

// GET ALL
const getAll = async (req, res) => {
    try {
        const { page, limit, offset } = parsePagination(req.query, {
            page: 1,
            limit: 20,
            maxLimit: 100,
        });

        const { rows, count } = await Invoice.findAndCountAll({
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
        const invoice = await Invoice.findByPk(req.params.id);
        if (!invoice) return notFound(res, "Invoice not found");
        return success(res, "Success", invoice);
    } catch (err) {
        return serverError(res, err.message, err);
    }
};

module.exports = { getAll, getOne };
