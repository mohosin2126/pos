"use strict";

const { Op } = require("sequelize");
const { PurchaseReturn, Purchase, sequelize } = require("../../database/models");
const { recomputeForProducts } = require("../../utils/inventory-recompute");
const {
    buildValidatedReturnItems,
    getReturnAvailability,
    getReturnProductIds,
    syncPurchaseReturnStatus,
    validateReturnRequest,
} = require("../../utils/purchase-returns");
const { roundMoney } = require("../../utils/price-calculator");
const {
    success, created, badRequest, notFound, serverError, parsePagination, paginated,
} = require("../../utils/api-response");

const getAll = async (req, res) => {
    try {
        const { page, limit, offset } = parsePagination(req.query, { page: 1, limit: 20, maxLimit: 100 });
        const search = String(req.query.search || "").trim();
        const status = String(req.query.status || "").trim();
        const where = {};

        if (status) {
            where.refundStatus = status;
        }

        if (search) {
            where[Op.or] = [
                { referenceNo: { [Op.like]: `%${search}%` } },
                { "$purchase.referenceNo$": { [Op.like]: `%${search}%` } },
            ];
        }

        const { rows, count } = await PurchaseReturn.findAndCountAll({
            where,
            include: [{
                model: Purchase,
                as: "purchase",
                required: false,
            }],
            order: [["createdAt", "DESC"]],
            limit, offset,
            distinct: true,
            subQuery: false,
        });
        return paginated(res, { rows, count }, { page, limit }, "Fetched successfully");
    } catch (error) {
        return serverError(res, "Error fetching purchase returns", error);
    }
};

const getOne = async (req, res) => {
    try {
        const { id } = req.params;
        const purchaseReturn = await PurchaseReturn.findByPk(id, {
            include: [{ model: Purchase, as: "purchase" }],
        });
        if (!purchaseReturn) return notFound(res, "Return not found");
        return success(res, "Return fetched successfully", purchaseReturn);
    } catch (error) {
        return serverError(res, "Error fetching return", error);
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const purchaseReturn = await PurchaseReturn.findByPk(id);
        if (!purchaseReturn) return notFound(res, "Return not found");

        if (purchaseReturn.refundStatus !== "pending") {
            return badRequest(res, "Can only update returns with pending refund status");
        }

        const updatable = {
            returnReason: req.body.returnReason,
            returnItems: req.body.returnItems,
            refundAmount: req.body.refundAmount,
            restockingDisposition: req.body.restockingDisposition,
            notes: req.body.notes,
        };

        Object.keys(updatable).forEach(key => updatable[key] === undefined && delete updatable[key]);

        const updated = await sequelize.transaction(async (t) => {
            const purchase = await Purchase.findByPk(purchaseReturn.purchaseId, { transaction: t });
            const availability = await getReturnAvailability(purchaseReturn.purchaseId, t, purchaseReturn.id);
            const requestItems = updatable.returnItems ?? purchaseReturn.returnItems;
            const built = buildValidatedReturnItems(requestItems, availability);
            if (built.error) {
                throw { _badRequest: built.error };
            }

            const validationMessage = validateReturnRequest(purchase, built.returnItems, availability);
            if (validationMessage) {
                throw { _badRequest: validationMessage };
            }

            const totalReturnAmount = roundMoney(
                built.returnItems.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0)
            );
            const requestedRefundAmount =
                updatable.refundAmount === undefined
                    ? purchaseReturn.refundAmount ?? totalReturnAmount
                    : updatable.refundAmount;
            const refundAmount = roundMoney(requestedRefundAmount);

            if (refundAmount < 0) {
                throw { _badRequest: "Refund amount cannot be negative" };
            }

            if (refundAmount > totalReturnAmount + 0.01) {
                throw { _badRequest: "Refund amount cannot exceed the total return amount" };
            }

            const result = await purchaseReturn.update({
                returnReason: updatable.returnReason ?? purchaseReturn.returnReason,
                returnItems: built.returnItems,
                totalReturnAmount,
                refundAmount,
                restockingDisposition: updatable.restockingDisposition ?? purchaseReturn.restockingDisposition,
                notes: updatable.notes ?? purchaseReturn.notes,
            }, { transaction: t });
            await syncPurchaseReturnStatus(purchaseReturn.purchaseId, t);

            const affectedProductIds = getReturnProductIds({ returnItems: built.returnItems });
            if (affectedProductIds.length > 0) {
                await recomputeForProducts(affectedProductIds, t);
            }

            return result;
        });
        return success(res, "Return updated successfully", updated);
    } catch (error) {
        if (error && error._badRequest) return badRequest(res, error._badRequest);
        return serverError(res, "Error updating return", error);
    }
};

const destroy = async (req, res) => {
    try {
        const { id } = req.params;
        const purchaseReturn = await PurchaseReturn.findByPk(id);
        if (!purchaseReturn) return notFound(res, "Return not found");
        if (purchaseReturn.refundStatus !== "pending") {
            return badRequest(res, "Can only delete returns with pending refund status");
        }

        await sequelize.transaction(async (t) => {
            const affectedProductIds = getReturnProductIds(purchaseReturn);
            const purchaseId = purchaseReturn.purchaseId;
            const fallbackStatus = purchaseReturn.basePurchaseStatus;

            await purchaseReturn.destroy({ transaction: t });
            await syncPurchaseReturnStatus(purchaseId, t, { fallbackStatus });

            if (affectedProductIds.length > 0) {
                await recomputeForProducts(affectedProductIds, t);
            }
        });
        return success(res, "Return deleted successfully", null);
    } catch (error) {
        return serverError(res, "Error deleting return", error);
    }
};

const approveReturn = async (req, res) => {
    try {
        const { id } = req.params;
        const { refundAmount, restockingDisposition } = req.body;

        const purchaseReturn = await PurchaseReturn.findByPk(id);
        if (!purchaseReturn) return notFound(res, "Return not found");

        if (purchaseReturn.refundStatus !== "pending") {
            return badRequest(res, "Only pending returns can be approved");
        }

        const updateData = {
            refundStatus: "approved",
            refundAmount: refundAmount ?? purchaseReturn.refundAmount,
            restockingDisposition: restockingDisposition ?? purchaseReturn.restockingDisposition,
        };

        if (Number(updateData.refundAmount || 0) < 0) {
            return badRequest(res, "Refund amount cannot be negative");
        }

        if (Number(updateData.refundAmount || 0) > Number(purchaseReturn.totalReturnAmount || 0) + 0.01) {
            return badRequest(res, "Refund amount cannot exceed the total return amount");
        }

        const approved = await sequelize.transaction(async (t) => {
            const result = await purchaseReturn.update(updateData, { transaction: t });
            await syncPurchaseReturnStatus(purchaseReturn.purchaseId, t);

            const affectedProductIds = getReturnProductIds(purchaseReturn);
            if (affectedProductIds.length > 0) {
                await recomputeForProducts(affectedProductIds, t);
            }

            return result;
        });
        return success(res, "Return approved successfully", approved);
    } catch (error) {
        return serverError(res, "Error approving return", error);
    }
};

const processRefund = async (req, res) => {
    try {
        const { id } = req.params;

        const purchaseReturn = await PurchaseReturn.findByPk(id);
        if (!purchaseReturn) return notFound(res, "Return not found");

        if (purchaseReturn.refundStatus !== "approved") {
            return badRequest(res, "Only approved returns can be processed for refund");
        }

        const refunded = await sequelize.transaction(async (t) => {
            const refundAmount = req.body.refundAmount ?? purchaseReturn.refundAmount;
            if (Number(refundAmount || 0) < 0) {
                throw { _badRequest: "Refund amount cannot be negative" };
            }
            if (Number(refundAmount || 0) > Number(purchaseReturn.totalReturnAmount || 0) + 0.01) {
                throw { _badRequest: "Refund amount cannot exceed the total return amount" };
            }

            const result = await purchaseReturn.update({
                refundStatus: "refunded",
                refundAmount,
            }, { transaction: t });
            await syncPurchaseReturnStatus(purchaseReturn.purchaseId, t);

            const affectedProductIds = getReturnProductIds(purchaseReturn);
            if (affectedProductIds.length > 0) {
                await recomputeForProducts(affectedProductIds, t);
            }

            return result;
        });
        return success(res, "Refund processed successfully", refunded);
    } catch (error) {
        if (error && error._badRequest) return badRequest(res, error._badRequest);
        return serverError(res, "Error processing refund", error);
    }
};

const rejectReturn = async (req, res) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;

        const purchaseReturn = await PurchaseReturn.findByPk(id);
        if (!purchaseReturn) return notFound(res, "Return not found");

        if (purchaseReturn.refundStatus !== "pending") {
            return badRequest(res, "Only pending returns can be rejected");
        }

        const updateData = {
            refundStatus: "rejected",
            notes: notes ?? purchaseReturn.notes,
        };

        const rejected = await sequelize.transaction(async (t) => {
            const result = await purchaseReturn.update(updateData, { transaction: t });
            await syncPurchaseReturnStatus(purchaseReturn.purchaseId, t, {
                fallbackStatus: purchaseReturn.basePurchaseStatus,
            });

            const affectedProductIds = getReturnProductIds(purchaseReturn);
            if (affectedProductIds.length > 0) {
                await recomputeForProducts(affectedProductIds, t);
            }

            return result;
        });
        return success(res, "Return rejected successfully", rejected);
    } catch (error) {
        return serverError(res, "Error rejecting return", error);
    }
};

module.exports = { getAll, getOne, update, destroy, approveReturn, processRefund, rejectReturn };
