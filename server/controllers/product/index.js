"use strict";

const { Product, Category, sequelize } = require("../../database/models");
const {badRequest, created, conflict, serverError, parsePagination, paginated, notFound, success} = require("../../utils/api-response");
const { calculateProfitMetrics, validateSellingPrice } = require("../../utils/price-calculator");

const normalizeTags = (value) => {
    if (Array.isArray(value)) {
        return value
            .filter((item) => typeof item === "string")
            .map((item) => item.trim())
            .filter((item) => item.length > 0);
    }

    if (typeof value === "string") {
        return value
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item.length > 0);
    }

    return [];
};

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
            tags: normalizeTags(tags),
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

        const data = result.rows.map((row) => {
            const item = row.get({ plain: true });
            item.tags = normalizeTags(item.tags);
            return item;
        });

        return paginated(res, { rows: data, count: result.count }, { page, limit }, "Fetched successfully");
    } catch (err) {
        return serverError(res, "Failed to fetch products", err);
    }
};

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
        p.tags = normalizeTags(p.tags);

        return success(res, "Success", p);
    } catch (err) {
        return serverError(res, "Failed to fetch product", err);
    }
};

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
            "updatedBy",
        ];

        if (req.body.tags !== undefined) {
            product.tags = normalizeTags(req.body.tags);
        }
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

const getCostFromPurchaseHistory = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);
        if (!product) return notFound(res, "Product not found");

        const [lastPurchase] = await sequelize.query(
            `SELECT pi.unitPrice as lastCost, p.purchaseDate
             FROM purchase_items pi
             JOIN purchases p ON p.id = pi.purchaseId
             WHERE pi.productId = ?
             ORDER BY p.purchaseDate DESC, p.id DESC
             LIMIT 1`,
            { replacements: [id], type: sequelize.QueryTypes.SELECT }
        );

        const [avgCostResult] = await sequelize.query(
            `SELECT 
                SUM(pi.quantity * pi.unitPrice) / NULLIF(SUM(pi.quantity), 0) as avgCost,
                SUM(pi.quantity) as totalPurchased
             FROM purchase_items pi
             JOIN purchases p ON p.id = pi.purchaseId
             WHERE pi.productId = ?
             AND p.status IN ('purchase', 'received')`,
            { replacements: [id], type: sequelize.QueryTypes.SELECT }
        );

        const lastCost = lastPurchase ? parseFloat(lastPurchase.lastCost) : null;
        const avgCost = avgCostResult && avgCostResult.avgCost ? parseFloat(avgCostResult.avgCost) : null;
        const costPrice = avgCost || lastCost || 0;
        const sellingPrice = product.price || 0;

        const profitMetrics = costPrice > 0 ? calculateProfitMetrics(sellingPrice, costPrice) : null;

        return success(res, "Cost data retrieved", {
            productId: product.id,
            productName: product.name,
            price: sellingPrice,
            lastCost: lastCost,
            avgCost: avgCost,
            totalPurchased: avgCostResult ? parseInt(avgCostResult.totalPurchased) || 0 : 0,
            profitMetrics: profitMetrics,
            stockQuantity: product.stockQuantity,
        });
    } catch (err) {
        return serverError(res, "Failed to retrieve cost data", err);
    }
};

module.exports = { create, getAll, getOne, update, destroy, getCostFromPurchaseHistory };
