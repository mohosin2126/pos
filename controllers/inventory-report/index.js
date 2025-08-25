"use strict";
const { sequelize } = require("../../database/models");
const {parsePagination, paginated, serverError} = require("../../utils/api-response");


const LOW_STOCK_THRESHOLD = 5;

async function fetchAggregates() {
    const [rows] = await sequelize.query(`
        SELECT
            p.productId,
            COALESCE(SUM(iss.nonExpiredQty), 0) AS nonExpiredPurchased,
            COALESCE(SUM(iss.expiredQty), 0)     AS expiredPurchased,
            COALESCE(SUM(iss.nonExpiredQty), 0)  AS available
        FROM inventory_stock_summary iss
                 JOIN purchases p ON p.id = iss.purchaseId
        GROUP BY p.productId
    `);

    return rows.map((r) => ({
        productId: r.productId,
        nonExpiredPurchased: Number(r.nonExpiredPurchased || 0),
        expiredPurchased: Number(r.expiredPurchased || 0),
        soldQty: 0,
        available: Number(r.available || 0),
    }));
}

// GET /in-stock-products  (not expired & qty > 0)
const listInStockProducts = async (req, res) => {
    try {
        const rows = await fetchAggregates();
        const data = rows
            .filter((r) => r.available > 0)
            .sort((a, b) => String(a.productId).localeCompare(String(b.productId)))
            .map((r) => ({ productId: r.productId, quantity: r.available }));

        const { page, limit, offset } = parsePagination(req.query);
        const paginatedData = data.slice(offset, offset + limit);

        return paginated(
            res,
            { rows: paginatedData, count: data.length },
            { page, limit },
            "Fetched successfully"
        );
    } catch (err) {
        return serverError(res, "Failed to fetch in-stock products", err);
    }
};

// GET /low-stock-products (≤5 and >0, non-expired)
const listLowStockProducts = async (req, res) => {
    try {
        const rows = await fetchAggregates();
        const data = rows
            .filter((r) => r.available > 0 && r.available <= LOW_STOCK_THRESHOLD)
            .sort((a, b) => String(a.productId).localeCompare(String(b.productId)))
            .map((r) => ({
                productId: r.productId,
                quantity: r.available,
                threshold: LOW_STOCK_THRESHOLD,
            }));

        const { page, limit, offset } = parsePagination(req.query);
        const paginatedData = data.slice(offset, offset + limit);

        return paginated(
            res,
            { rows: paginatedData, count: data.length },
            { page, limit },
            "Fetched successfully"
        );
    } catch (err) {
        return serverError(res, "Failed to fetch low-stock products", err);
    }
};

// GET /out-of-stock-products (≤0, non-expired)
const listOutOfStockProducts = async (req, res) => {
    try {
        const rows = await fetchAggregates();
        const data = rows
            .filter((r) => r.available <= 0)
            .sort((a, b) => String(a.productId).localeCompare(String(b.productId)))
            .map((r) => ({ productId: r.productId }));

        const { page, limit, offset } = parsePagination(req.query);
        const paginatedData = data.slice(offset, offset + limit);

        return paginated(
            res,
            { rows: paginatedData, count: data.length },
            { page, limit },
            "Fetched successfully"
        );
    } catch (err) {
        return serverError(res, "Failed to fetch out-of-stock products", err);
    }
};

// GET /expired-only-products (any expiredPurchased > 0)
const listExpiredOnlyProducts = async (req, res) => {
    try {
        const rows = await fetchAggregates();
        const data = rows
            .filter((r) => r.expiredPurchased > 0)
            .sort((a, b) => String(a.productId).localeCompare(String(b.productId)))
            .map((r) => ({
                productId: r.productId,
                expiredQuantity: r.expiredPurchased,
            }));

        const { page, limit, offset } = parsePagination(req.query);
        const paginatedData = data.slice(offset, offset + limit);

        return paginated(
            res,
            { rows: paginatedData, count: data.length },
            { page, limit },
            "Fetched successfully"
        );
    } catch (err) {
        return serverError(res, "Failed to fetch expired-only products", err);
    }
};

// GET /sellable-products (available > 0, non-expired)
const listSellableProducts = async (req, res) => {
    try {
        const rows = await fetchAggregates();
        const data = rows
            .filter((r) => r.available > 0)
            .sort((a, b) => String(a.productId).localeCompare(String(b.productId)))
            .map((r) => ({ productId: r.productId, available: r.available }));

        const { page, limit, offset } = parsePagination(req.query);
        const paginatedData = data.slice(offset, offset + limit);

        return paginated(
            res,
            { rows: paginatedData, count: data.length },
            { page, limit },
            "Fetched successfully"
        );
    } catch (err) {
        return serverError(res, "Failed to fetch sellable products", err);
    }
};

module.exports = {
    listInStockProducts,
    listLowStockProducts,
    listOutOfStockProducts,
    listExpiredOnlyProducts,
    listSellableProducts,
};
