"use strict";
const { sequelize } = require("../../database/models");
const { parsePagination, paginated, serverError } = require("../../utils/api-response");

const LOW_STOCK_THRESHOLD = 5;


async function fetchAggregates() {
    const [rows] = await sequelize.query(`
        SELECT
            p.productId,
            COALESCE(SUM(iss.nonExpiredQty), 0) AS nonExpiredPurchased,
            COALESCE(SUM(iss.expiredQty), 0)    AS expiredPurchased,
            COALESCE(SUM(iss.nonExpiredQty), 0) AS available
        FROM inventory_stock_summary iss
                 JOIN purchases p ON p.id = iss.purchaseId
        GROUP BY p.productId
        ORDER BY p.productId
    `);

    return rows.map(r => ({
        productId: r.productId,
        nonExpiredPurchased: Number(r.nonExpiredPurchased || 0),
        expiredPurchased: Number(r.expiredPurchased || 0),
        soldQty: 0, // placeholder if you later join sales
        available: Number(r.available || 0),
    }));
}

/** GET /active-products (status = 'active') */
const listActiveProducts = async (req, res) => {
    try {
        const { page, limit, offset } = parsePagination(req.query);

        const [rows] = await sequelize.query(
            `
                SELECT id AS productId, name, status
                FROM products
                WHERE status = 'active'
                ORDER BY CAST(id AS CHAR)
                    LIMIT :limit OFFSET :offset
            `,
            { replacements: { limit, offset } }
        );

        const [[{ total }]] = await sequelize.query(`
            SELECT COUNT(*) AS total
            FROM products
            WHERE status = 'active'
        `);

        return paginated(
            res,
            { rows, count: Number(total || 0) },
            { page, limit },
            "Fetched successfully"
        );
    } catch (err) {
        return serverError(res, "Failed to fetch active products", err);
    }
};

/** GET /stock-products  (non-expired > 0) */
const listInStockProducts = async (req, res) => {
    try {
        const rows = await fetchAggregates();
        const data = rows
            .filter(r => r.available > 0)
            .sort((a, b) => String(a.productId).localeCompare(String(b.productId)))
            .map(r => ({ productId: r.productId, quantity: r.available }));

        const { page, limit, offset } = parsePagination(req.query);
        const paginatedData = data.slice(offset, offset + limit);

        return paginated(res, { rows: paginatedData, count: data.length }, { page, limit }, "Fetched successfully");
    } catch (err) {
        return serverError(res, "Failed to fetch in-stock products", err);
    }
};

/** GET /low-stock-products (≤ threshold and >0, non-expired) */
const listLowStockProducts = async (req, res) => {
    try {
        const rows = await fetchAggregates();
        const data = rows
            .filter(r => r.available > 0 && r.available <= LOW_STOCK_THRESHOLD)
            .sort((a, b) => String(a.productId).localeCompare(String(b.productId)))
            .map(r => ({ productId: r.productId, quantity: r.available, threshold: LOW_STOCK_THRESHOLD }));

        const { page, limit, offset } = parsePagination(req.query);
        const paginatedData = data.slice(offset, offset + limit);

        return paginated(res, { rows: paginatedData, count: data.length }, { page, limit }, "Fetched successfully");
    } catch (err) {
        return serverError(res, "Failed to fetch low-stock products", err);
    }
};

/** GET /out-of-stock-products (available ≤ 0, non-expired) */
const listOutOfStockProducts = async (req, res) => {
    try {
        const rows = await fetchAggregates();
        const data = rows
            .filter(r => r.available <= 0)
            .sort((a, b) => String(a.productId).localeCompare(String(b.productId)))
            .map(r => ({ productId: r.productId }));

        const { page, limit, offset } = parsePagination(req.query);
        const paginatedData = data.slice(offset, offset + limit);

        return paginated(res, { rows: paginatedData, count: data.length }, { page, limit }, "Fetched successfully");
    } catch (err) {
        return serverError(res, "Failed to fetch out-of-stock products", err);
    }
};

/** GET /expired-products (any expiredPurchased > 0) */
const listExpiredOnlyProducts = async (req, res) => {
    try {
        const rows = await fetchAggregates();
        const data = rows
            .filter(r => r.expiredPurchased > 0)
            .sort((a, b) => String(a.productId).localeCompare(String(b.productId)))
            .map(r => ({ productId: r.productId, expiredQuantity: r.expiredPurchased }));

        const { page, limit, offset } = parsePagination(req.query);
        const paginatedData = data.slice(offset, offset + limit);

        return paginated(res, { rows: paginatedData, count: data.length }, { page, limit }, "Fetched successfully");
    } catch (err) {
        return serverError(res, "Failed to fetch expired-only products", err);
    }
};

/** GET /sellable-products (available > 0, non-expired) */
const listSellableProducts = async (req, res) => {
    try {
        const rows = await fetchAggregates();
        const data = rows
            .filter(r => r.available > 0)
            .sort((a, b) => String(a.productId).localeCompare(String(b.productId)))
            .map(r => ({ productId: r.productId, available: r.available }));

        const { page, limit, offset } = parsePagination(req.query);
        const paginatedData = data.slice(offset, offset + limit);

        return paginated(res, { rows: paginatedData, count: data.length }, { page, limit }, "Fetched successfully");
    } catch (err) {
        return serverError(res, "Failed to fetch sellable products", err);
    }
};

module.exports = {
    listActiveProducts,
    listInStockProducts,
    listLowStockProducts,
    listOutOfStockProducts,
    listExpiredOnlyProducts,
    listSellableProducts,
};
