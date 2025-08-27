"use strict";

const { Product, Category } = require("../../database/models");
const {badRequest, created, conflict, serverError, parsePagination, paginated, notFound, success} = require("../../utils/api-response");

// CREATE
const create = async (req, res) => {
    try {
        const {
            name,
            description,
            categoryId,
            sku,
            barcode,
            stockQuantity,
            reorderLevel,
            isTrackStock,
            imageUrl,
            status,
            tags,
            createdBy,
        } = req.body;

        if (!name || !categoryId) {
            return badRequest(res, "name and categoryId are required");
        }

        const category = await Category.findByPk(categoryId);
        if (!category) {
            return badRequest(res, "Invalid categoryId: category not found");
        }

        const product = await Product.create({
            name,
            description,
            categoryId,
            sku,
            barcode,
            stockQuantity,
            reorderLevel,
            isTrackStock,
            imageUrl,
            status,
            tags,
            createdBy,
        });

        return created(res, "Product created", product);
    } catch (err) {
        if (err?.name === "SequelizeUniqueConstraintError") {
            return conflict(res, "SKU must be unique");
        }
        return serverError(res, "Failed to create product", err);
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

        const where = {};
        if (req.query.status) where.status = req.query.status;
        if (req.query.categoryId) where.categoryId = Number(req.query.categoryId);
        if (req.query.sku) where.sku = req.query.sku;
        if (req.query.name) where.name = req.query.name;
        if (req.query.isTrackStock !== undefined) {
            where.isTrackStock = req.query.isTrackStock === "true";
        }

        const sortBy = req.query.sortBy || "name";
        const order =
            req.query.order && req.query.order.toUpperCase() === "DESC"
                ? "DESC"
                : "ASC";

        const result = await Product.findAndCountAll({
            where,
            order: [[sortBy, order]],
            limit,
            offset,
            include: [
                {
                    model: Category,
                    as: "category",
                    attributes: ["name"],
                    required: false,
                },
            ],
        });

        const data = result.rows.map((row) => row.get({ plain: true }));

        return paginated(res, { rows: data, count: result.count }, { page, limit }, "Fetched successfully");
    } catch (err) {
        return serverError(res, "Failed to fetch products", err);
    }
};

// GET ONE
const getOne = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id, {
            include: [
                {
                    model: Category,
                    as: "category",
                    attributes: ["name", "description"],
                    required: false,
                },
            ],
        });

        if (!product) return notFound(res, "Product not found");
        const p = product.get({ plain: true });

        return success(res, "Success", p);
    } catch (err) {
        return serverError(res, "Failed to fetch product", err);
    }
};

// UPDATE
const update = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);
        if (!product) return notFound(res, "Product not found");

        if (req.body.categoryId !== undefined) {
            const category = await Category.findByPk(req.body.categoryId);
            if (!category) {
                return badRequest(res, "Invalid categoryId: category not found");
            }
        }

        const fields = [
            "name",
            "description",
            "categoryId",
            "sku",
            "barcode",
            "stockQuantity",
            "reorderLevel",
            "isTrackStock",
            "imageUrl",
            "status",
            "tags",
            "updatedBy",
        ];
        fields.forEach((field) => {
            if (req.body[field] !== undefined) product[field] = req.body[field];
        });

        await product.save();
        return success(res, "Product updated", product);
    } catch (err) {
        if (err?.name === "SequelizeUniqueConstraintError") {
            return conflict(res, "SKU must be unique");
        }
        return serverError(res, "Failed to update product", err);
    }
};

// DELETE
const destroy = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);
        if (!product) return notFound(res, "Product not found");

        await product.destroy();
        return success(res, "Product deleted", null);
    } catch (err) {
        return serverError(res, "Failed to delete product", err);
    }
};

module.exports = { create, getAll, getOne, update, destroy };
