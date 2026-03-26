"use strict";

const { Op } = require("sequelize");
const { Product, Category, sequelize } = require("../../database/models");
const {badRequest, created, conflict, serverError, parsePagination, paginated, notFound, success} = require("../../utils/api-response");
const { calculateProfitMetrics, validateSellingPrice } = require("../../utils/price-calculator");
const { STOCKED_PURCHASE_STATUSES } = require("../../utils/inventory-recompute");

const normalizeTags = (value) => {
    if (Array.isArray(value)) {
        return value
            .filter((item) => typeof item === "string")
            .map((item) => item.trim())
            .filter((item) => item.length > 0);
    }

    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
                return parsed
                    .filter((item) => typeof item === "string")
                    .map((item) => item.trim())
                    .filter((item) => item.length > 0);
            }
        } catch (_error) {
        }

        return value
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item.length > 0);
    }

    return [];
};

function resolveAnalyticsPeriod(periodRaw) {
    const period = typeof periodRaw === "string" ? periodRaw.toLowerCase() : "month";
    if (!["day", "month", "year", "all"].includes(period)) {
        return { period: "month", start: new Date(new Date().getFullYear(), new Date().getMonth(), 1), end: null };
    }

    if (period === "all") {
        return { period, start: null, end: null };
    }

    const now = new Date();
    let start = new Date(now);

    if (period === "day") {
        start.setHours(0, 0, 0, 0);
    } else if (period === "month") {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === "year") {
        start = new Date(now.getFullYear(), 0, 1);
    }

    return { period, start, end: now };
}

function buildProductWhere(query = {}) {
    const where = {};
    if (query.status) where.status = query.status;
    if (query.categoryId) where.categoryId = Number(query.categoryId);
    if (query.sku) where.sku = query.sku;
    if (query.name) where.name = query.name;
    if (query.search) {
        const search = `%${String(query.search).trim()}%`;
        where[Op.or] = [
            { name: { [Op.like]: search } },
            { sku: { [Op.like]: search } },
            { barcode: { [Op.like]: search } },
        ];
    }
    if (query.isTrackStock !== undefined) {
        where.isTrackStock = query.isTrackStock === "true";
    }
    return where;
}

async function getProductAnalytics(productIds, periodConfig) {
    if (!Array.isArray(productIds) || productIds.length === 0) {
        return new Map();
    }

    const productPlaceholders = productIds.map(() => "?").join(",");
    const salesReplacements = [...productIds];
    const purchaseReplacements = [...productIds, ...STOCKED_PURCHASE_STATUSES];
    const salesDateFilter =
        periodConfig.start && periodConfig.end
            ? "AND s.saleDate >= ? AND s.saleDate <= ?"
            : "";

    if (periodConfig.start && periodConfig.end) {
        salesReplacements.push(periodConfig.start, periodConfig.end);
    }

    const [salesRows] = await sequelize.query(
        `SELECT
             si.productId,
             COALESCE(SUM(si.quantity), 0) AS soldQuantity,
             COALESCE(SUM(
                 (si.lineTotal - si.taxAmount)
                 - CASE
                     WHEN sale_totals.saleBaseAmount > 0
                     THEN s.discountAmount * ((si.lineTotal - si.taxAmount) / sale_totals.saleBaseAmount)
                     ELSE 0
                   END
             ), 0) AS revenue
         FROM sale_items si
         JOIN sales s ON s.id = si.saleId
         JOIN (
             SELECT saleId, COALESCE(SUM(lineTotal - taxAmount), 0) AS saleBaseAmount
             FROM sale_items
             GROUP BY saleId
         ) sale_totals ON sale_totals.saleId = si.saleId
         WHERE si.productId IN (${productPlaceholders})
           AND s.status = 'completed'
           ${salesDateFilter}
         GROUP BY si.productId`,
        { replacements: salesReplacements }
    );

    const purchaseStatusPlaceholders = STOCKED_PURCHASE_STATUSES.map(() => "?").join(",");
    const [costRows] = await sequelize.query(
        `SELECT
             pi.productId,
             COALESCE(SUM(pi.quantity * pi.unitPrice) / NULLIF(SUM(pi.quantity), 0), 0) AS avgCost
         FROM purchase_items pi
         JOIN purchases p ON p.id = pi.purchaseId
         WHERE pi.productId IN (${productPlaceholders})
           AND p.status IN (${purchaseStatusPlaceholders})
         GROUP BY pi.productId`,
        { replacements: purchaseReplacements }
    );

    const salesByProductId = new Map(
        salesRows.map((row) => [
            Number(row.productId),
            {
                soldQuantity: Number(row.soldQuantity || 0),
                revenue: Number(row.revenue || 0),
            },
        ])
    );

    const avgCostByProductId = new Map(
        costRows.map((row) => [Number(row.productId), Number(row.avgCost || 0)])
    );

    const analyticsByProductId = new Map();
    for (const productId of productIds) {
        const salesData = salesByProductId.get(Number(productId)) || { soldQuantity: 0, revenue: 0 };
        const avgCost = avgCostByProductId.get(Number(productId)) || 0;
        const costOfGoodsSold = Number((salesData.soldQuantity * avgCost).toFixed(2));
        const revenue = Number(Number(salesData.revenue || 0).toFixed(2));
        const margin = Number((revenue - costOfGoodsSold).toFixed(2));

        analyticsByProductId.set(Number(productId), {
            analyticsPeriod: periodConfig.period,
            soldQuantity: salesData.soldQuantity,
            revenue,
            averageCost: Number(avgCost.toFixed(2)),
            costOfGoodsSold,
            profit: margin > 0 ? margin : 0,
            loss: margin < 0 ? Math.abs(margin) : 0,
        });
    }

    return analyticsByProductId;
}

async function fetchProductsList(req, { includeAnalytics = false } = {}) {
    const { page, limit, offset } = parsePagination(req.query, {
        page: 1,
        limit: 20,
        maxLimit: 100,
    });

    const where = buildProductWhere(req.query);

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

    const analyticsConfig = resolveAnalyticsPeriod(req.query.period);
    const productIds = result.rows.map((row) => Number(row.id)).filter(Boolean);
    const analyticsByProductId = includeAnalytics
        ? await getProductAnalytics(productIds, analyticsConfig)
        : new Map();

    const data = result.rows.map((row) => {
        const item = row.get({ plain: true });
        item.tags = normalizeTags(item.tags);
        if (includeAnalytics) {
            Object.assign(item, analyticsByProductId.get(Number(item.id)) || {
                analyticsPeriod: analyticsConfig.period,
                soldQuantity: 0,
                revenue: 0,
                averageCost: 0,
                costOfGoodsSold: 0,
                profit: 0,
                loss: 0,
            });
        }
        return item;
    });

    return { page, limit, count: result.count, rows: data };
}

const create = async (req, res) => {
    try {
        const {
            name,
            description,
            categoryId,
            sku,
            barcode,
            price,
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
            price,
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
        const result = await fetchProductsList(req, {
            includeAnalytics: req.query.includeAnalytics === "true",
        });
        return paginated(res, { rows: result.rows, count: result.count }, { page: result.page, limit: result.limit }, "Fetched successfully");
    } catch (err) {
        return serverError(res, "Failed to fetch products", err);
    }
};

const getRevenueReport = async (req, res) => {
    try {
        const result = await fetchProductsList(req, { includeAnalytics: true });
        const where = buildProductWhere(req.query);
        const analyticsConfig = resolveAnalyticsPeriod(req.query.period);
        const matchedProducts = await Product.findAll({
            where,
            attributes: ["id"],
        });
        const allMatchedIds = matchedProducts.map((product) => Number(product.id)).filter(Boolean);
        const allAnalytics = await getProductAnalytics(allMatchedIds, analyticsConfig);

        const reportTotals = {
            analyticsPeriod: analyticsConfig.period,
            products: allMatchedIds.length,
            soldQuantity: 0,
            revenue: 0,
            costOfGoodsSold: 0,
            profit: 0,
            loss: 0,
        };

        for (const analytics of allAnalytics.values()) {
            reportTotals.soldQuantity += Number(analytics.soldQuantity || 0);
            reportTotals.revenue += Number(analytics.revenue || 0);
            reportTotals.costOfGoodsSold += Number(analytics.costOfGoodsSold || 0);
            reportTotals.profit += Number(analytics.profit || 0);
            reportTotals.loss += Number(analytics.loss || 0);
        }

        reportTotals.revenue = Number(reportTotals.revenue.toFixed(2));
        reportTotals.costOfGoodsSold = Number(reportTotals.costOfGoodsSold.toFixed(2));
        reportTotals.profit = Number(reportTotals.profit.toFixed(2));
        reportTotals.loss = Number(reportTotals.loss.toFixed(2));

        return paginated(
            res,
            { rows: result.rows, count: result.count },
            { page: result.page, limit: result.limit },
            "Revenue report fetched successfully",
            { reportTotals }
        );
    } catch (err) {
        return serverError(res, "Failed to fetch revenue report", err);
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
            "price",
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

module.exports = { create, getAll, getOne, update, destroy, getCostFromPurchaseHistory, getRevenueReport };
