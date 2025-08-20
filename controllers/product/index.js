"use strict";

const {Product, Category} = require("../../database/models");

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
            return res.status(400).json({message: "name and categoryId are required"});
        }

        const category = await Category.findByPk(categoryId);
        if (!category) {
            return res.status(400).json({message: "Invalid categoryId: category not found"});
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

        return res.status(201).json({message: "Product created", data: product});
    } catch (err) {
        if (err?.name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({message: "SKU must be unique"});
        }
        return res.status(500).json({message: "Failed to create product", error: err.message});
    }
};

// GET ALL
const getAll = async (req, res) => {
    try {
        const page = Number(req.query.page || 1);
        const limit = Number(req.query.limit || 20);
        const offset = (page - 1) * limit;

        const where = {};
        if (req.query.status) where.status = req.query.status;
        if (req.query.categoryId) where.categoryId = Number(req.query.categoryId);
        if (req.query.sku) where.sku = req.query.sku;
        if (req.query.name) where.name = req.query.name;
        if (req.query.isTrackStock !== undefined) {
            where.isTrackStock = req.query.isTrackStock === "true";
        }

        const sortBy = req.query.sortBy || "name";
        const order = req.query.order && req.query.order.toUpperCase() === "DESC" ? "DESC" : "ASC";

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

        const data = result.rows.map((row) => {
            const p = row.get({plain: true});
            return {
                ...p,
            };
        });

        return res.json({
            total: result.count,
            page,
            pages: Math.ceil(result.count / limit),
            data,
        });
    } catch (err) {
        return res.status(500).json({message: "Failed to fetch products", error: err.message});
    }
};

// GET ONE
const getOne = async (req, res) => {
    try {
        const {id} = req.params;

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

        if (!product) return res.status(404).json({message: "Product not found"});
        const p = product.get({plain: true});


        return res.json({
            data: {
                ...p,
            },
        });
    } catch (err) {
        return res.status(500).json({message: "Failed to fetch product", error: err.message});
    }
};

// UPDATE
const update = async (req, res) => {
    try {
        const {id} = req.params;

        const product = await Product.findByPk(id);
        if (!product) return res.status(404).json({message: "Product not found"});

        if (req.body.categoryId !== undefined) {
            const category = await Category.findByPk(req.body.categoryId);
            if (!category) {
                return res.status(400).json({message: "Invalid categoryId: category not found"});
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
        return res.json({message: "Product updated", data: product});
    } catch (err) {
        if (err?.name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({message: "SKU must be unique"});
        }
        return res.status(500).json({message: "Failed to update product", error: err.message});
    }
};

// DELETE
const destroy = async (req, res) => {
    try {
        const {id} = req.params;

        const product = await Product.findByPk(id);
        if (!product) return res.status(404).json({message: "Product not found"});

        await product.destroy();
        return res.json({message: "Product deleted"});
    } catch (err) {
        return res.status(500).json({message: "Failed to delete product", error: err.message});
    }
};

module.exports = {create, getAll, getOne, update, destroy};
