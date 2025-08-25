"use strict";

const { Purchase, Supplier, Product } = require("../../database/models");
const {
    success,
    created,
    badRequest,
    notFound,
    serverError,
    parsePagination,
    paginated,
} = require("../../utils/api-response");

// CREATE
const create = async (req, res) => {
    try {
        const { productId, totalItems } = req.body;

        if (!productId) {
            return badRequest(res, "productId is required");
        }
        const product = await Product.findByPk(productId);
        if (!product) {
            return badRequest(res, "Invalid productId: product not found");
        }
        if (product.status !== "active") {
            return badRequest(res, "Cannot create purchase for an inactive product");
        }
        if (totalItems == null || Number(totalItems) < 0) {
            return badRequest(res, "totalItems must be ≥ 0");
        }
        const purchase = await Purchase.create(req.body);

        return created(res, "Purchase created successfully", purchase);
    } catch (error) {
        return serverError(res, "Error creating purchase", error);
    }
};

// GET ALL
const getAll = async (req, res) => {
    try {
        const { page, limit, offset } = parsePagination(req.query, {
            page: 1,
            limit: 20,
            maxLimit: 100,
        });

        const { rows, count } = await Purchase.findAndCountAll({
            include: [
                { model: Supplier, as: "supplier" },
                { model: Product, as: "product" },
            ],
            order: [["createdAt", "DESC"]],
            limit,
            offset,
        });

        return paginated(res, { rows, count }, { page, limit }, "Fetched successfully");
    } catch (error) {
        return serverError(res, "Error fetching purchases", error);
    }
};

// GET ONE
const getOne = async (req, res) => {
    try {
        const { id } = req.params;
        const purchase = await Purchase.findByPk(id, {
            include: [
                { model: Supplier, as: "supplier" },
                { model: Product, as: "product" },
            ],
        });

        if (!purchase) {
            return notFound(res, "Purchase not found");
        }

        return success(res, "Success", purchase);
    } catch (error) {
        return serverError(res, "Error fetching purchase", error);
    }
};

// UPDATE
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const purchase = await Purchase.findByPk(id);

        if (!purchase) {
            return notFound(res, "Purchase not found");
        }
        if (req.body.productId !== undefined) {
            const product = await Product.findByPk(req.body.productId);
            if (!product) {
                return badRequest(res, "Invalid productId: product not found");
            }
            if (product.status !== "active") {
                return badRequest(res, "Cannot set purchase to an inactive product");
            }
        }

        await purchase.update(req.body);

        return success(res, "Purchase updated successfully", purchase);
    } catch (error) {
        return serverError(res, "Error updating purchase", error);
    }
};

// DELETE
const destroy = async (req, res) => {
    try {
        const { id } = req.params;
        const purchase = await Purchase.findByPk(id);

        if (!purchase) {
            return notFound(res, "Purchase not found");
        }

        await purchase.destroy();

        return success(res, "Purchase deleted successfully", null);
    } catch (error) {
        return serverError(res, "Error deleting purchase", error);
    }
};

module.exports = { create, getAll, getOne, update, destroy };
