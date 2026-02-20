"use strict";

const { sequelize, StockSummary } = require("../../database/models");
const { success, serverError } = require("../../utils/api-response");
const { recomputeForProducts } = require("../../utils/inventory-recompute");

function shape(rows, qtyField) {
    return rows.map(r => {
        const product = { ...r };
        delete product[qtyField];
        return { product, [qtyField]: r[qtyField] };
    });
}

const listActiveProducts = async (_req, res) => {
    try {
        const [rows] = await sequelize.query(
            `SELECT p.*
             FROM products p
             WHERE p.status = 'active'
             ORDER BY p.id ASC`
        );
        return success(res, "Success", rows);
    } catch (error) {
        return serverError(res, "Failed to fetch active products", error);
    }
};

const listInStockProducts = async (_req, res) => {
    try {
        const [rows] = await sequelize.query(
            `SELECT p.*, lis.quantityOnHand
             FROM list_in_stock_products lis
             JOIN products p ON p.id = lis.productId
             WHERE p.status = 'active'
             ORDER BY p.id ASC`
        );
        return success(res, "Success", shape(rows, "quantityOnHand"));
    } catch (error) {
        return serverError(res, "Failed to fetch in-stock products", error);
    }
};

const listLowStockProducts = async (_req, res) => {
    try {
        const [rows] = await sequelize.query(
            `SELECT p.*, lls.quantityOnHand
             FROM list_low_stock_products lls
             JOIN products p ON p.id = lls.productId
             WHERE p.status = 'active'
             ORDER BY p.id ASC`
        );
        return success(res, "Success", shape(rows, "quantityOnHand"));
    } catch (error) {
        return serverError(res, "Failed to fetch low-stock products", error);
    }
};

const listExpiredOnlyProducts = async (_req, res) => {
    try {
        const [rows] = await sequelize.query(
            `SELECT p.*, lep.expiredQty
             FROM list_expired_products lep
             JOIN products p ON p.id = lep.productId
             WHERE p.status = 'active'
             ORDER BY p.id ASC`
        );
        return success(res, "Success", shape(rows, "expiredQty"));
    } catch (error) {
        return serverError(res, "Failed to fetch expired products", error);
    }
};

const listSellableProducts = async (_req, res) => {
    try {
        const [rows] = await sequelize.query(
            `SELECT p.*, lsp.unexpiredQty
             FROM list_sellable_products lsp
             JOIN products p ON p.id = lsp.productId
             WHERE p.status = 'active'
             ORDER BY p.id ASC`
        );
        return success(res, "Success", shape(rows, "unexpiredQty"));
    } catch (error) {
        return serverError(res, "Failed to fetch sellable products", error);
    }
};

const listOutOfStockProducts = async (_req, res) => {
    try {
        const [rows] = await sequelize.query(
            `SELECT p.*, loos.quantityOnHand
             FROM list_out_of_stock_products loos
             JOIN products p ON p.id = loos.productId
             WHERE p.status = 'active'
             ORDER BY p.id ASC`
        );
        return success(res, "Success", shape(rows, "quantityOnHand"));
    } catch (error) {
        return serverError(res, "Failed to fetch out-of-stock products", error);
    }
};

// flattened product + summary 
const listSummary = async (_req, res) => {
    try {
        const [rows] = await sequelize.query(
            `SELECT p.*,
                    ss.quantityOnHand, ss.unexpiredQty, ss.expiredQty, ss.reorderPoint, ss.lastComputedAt
             FROM stock_summaries ss
                      JOIN products p ON p.id = ss.productId
             ORDER BY p.id ASC`
        );
        const shaped = rows.map(r => {
            const { quantityOnHand, unexpiredQty, expiredQty, reorderPoint, lastComputedAt, ...product } = r;
            return { product, quantityOnHand, unexpiredQty, expiredQty, reorderPoint, lastComputedAt };
        });
        return success(res, "Success", shaped);
    } catch (error) {
        return serverError(res, "Error fetching summary", error);
    }
};

const rebuild = async (req, res) => {
    try {
        await sequelize.transaction(async (t) => {
            let productIds = Array.isArray(req.body?.productIds)
                ? req.body.productIds.map(Number).filter(Boolean)
                : [];
            if (!productIds.length) {
                const [ids] = await sequelize.query(`SELECT DISTINCT productId FROM purchases`, { transaction: t });
                productIds = ids.map(r => Number(r.productId)).filter(Boolean);
            }
            if (!productIds.length) return;
            await recomputeForProducts(productIds, t);
        });
        return success(res, "Inventory rebuilt");
    } catch (error) {
        return serverError(res, "Error rebuilding inventory", error);
    }
};

module.exports = {
    rebuild,
    listActiveProducts,
    listInStockProducts,
    listLowStockProducts,
    listExpiredOnlyProducts,
    listSellableProducts,
    listOutOfStockProducts,
    listSummary,
};
