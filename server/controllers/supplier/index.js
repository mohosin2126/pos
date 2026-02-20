"use strict";

const { Supplier } = require("../../database/models");
const {badRequest, conflict, created, serverError, parsePagination, paginated, notFound, success, noContent} = require("../../utils/api-response");

const create = async (req, res) => {
    try {
        const value = req.body || {};

        if (!value.supplierCode || String(value.supplierCode).trim() === "") {
            return badRequest(res, "supplierCode is required");
        }

        const exists = await Supplier.findOne({
            where: { supplierCode: value.supplierCode },
        });
        if (exists) {
            return conflict(res, "Supplier code already in use");
        }

        const createdSupplier = await Supplier.create(value, {
            fields: Object.keys(value),
        });

        return created(res, "Supplier created successfully", createdSupplier);
    } catch (err) {
        return serverError(res, err.message || "Something went wrong", err);
    }
};

const getAll = async (req, res) => {
    try {
        const { page, limit, offset } = parsePagination(req.query, {
            page: 1,
            limit: 20,
            maxLimit: 100,
        });

        const where = {};
        const allowedFilters = [
            "status",
            "supplierCode",
            "companyName",
            "contactPersonName",
            "email",
            "phone",
            "country",
        ];
        for (const key of allowedFilters) {
            if (req.query[key] !== undefined && String(req.query[key]).trim() !== "") {
                where[key] = String(req.query[key]).trim();
            }
        }

        const { rows, count } = await Supplier.findAndCountAll({
            where,
            limit,
            offset,
            order: [["createdAt", "DESC"]],
        });

        return paginated(
            res,
            { rows, count },
            { page, limit },
            "Fetched successfully"
        );
    } catch (err) {
        return serverError(res, "Failed to fetch suppliers", err);
    }
};

const getOne = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!id) return badRequest(res, "Invalid supplier id");

        const supplier = await Supplier.findByPk(id);
        if (!supplier) return notFound(res, "Supplier not found");

        return success(res, "Success", supplier);
    } catch (err) {
        return serverError(res, "Failed to fetch supplier", err);
    }
};

const update = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!id) return badRequest(res, "Invalid supplier id");

        if (req.body.supplierCode !== undefined) {
            return badRequest(res, "supplierCode cannot be updated");
        }

        if (Object.keys(req.body).length === 0) {
            return badRequest(res, "No fields provided for update");
        }

        const [affected] = await Supplier.update(req.body, { where: { id } });
        if (!affected) return notFound(res, "Supplier not found");

        const updated = await Supplier.findByPk(id);
        return success(res, "Supplier updated successfully", updated);
    } catch (err) {
        return serverError(res, "Failed to update supplier", err);
    }
};

const destroy = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!id) return badRequest(res, "Invalid supplier id");

        const deleted = await Supplier.destroy({ where: { id } });
        if (!deleted) return notFound(res, "Supplier not found");

        return noContent(res);
    } catch (err) {
        return serverError(res, "Failed to delete supplier", err);
    }
};

module.exports = { create, getAll, getOne, update, destroy };
