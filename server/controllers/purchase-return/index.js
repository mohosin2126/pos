"use strict";

const { PurchaseReturn, Purchase, sequelize } = require("../../database/models");
const {
    success, created, badRequest, notFound, serverError, parsePagination, paginated,
} = require("../../utils/api-response");

// GET ALL RETURNS
const getAll = async (req, res) => {
    try {
        const { page, limit, offset } = parsePagination(req.query, { page: 1, limit: 20, maxLimit: 100 });
        const { rows, count } = await PurchaseReturn.findAndCountAll({
            include: [{ model: Purchase, as: "purchase" }],
            order: [["createdAt", "DESC"]],
            limit, offset,
        });
        return paginated(res, { rows, count }, { page, limit }, "Fetched successfully");
    } catch (error) {
        return serverError(res, "Error fetching purchase returns", error);
    }
};

// GET ONE RETURN
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

// UPDATE RETURN
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const purchaseReturn = await PurchaseReturn.findByPk(id);
        if (!purchaseReturn) return notFound(res, "Return not found");

        // Only allow updates to pending returns
        if (purchaseReturn.refundStatus !== "pending") {
            return badRequest(res, "Can only update returns with pending refund status");
        }

        const updatable = {
            returnReason: req.body.returnReason,
            returnItems: req.body.returnItems,
            totalReturnAmount: req.body.totalReturnAmount,
            refundAmount: req.body.refundAmount,
            restockingDisposition: req.body.restockingDisposition,
            notes: req.body.notes,
        };

        // Remove undefined values
        Object.keys(updatable).forEach(key => updatable[key] === undefined && delete updatable[key]);

        const updated = await purchaseReturn.update(updatable);
        return success(res, "Return updated successfully", updated);
    } catch (error) {
        return serverError(res, "Error updating return", error);
    }
};

// DELETE RETURN
const destroy = async (req, res) => {
    try {
        const { id } = req.params;
        const purchaseReturn = await PurchaseReturn.findByPk(id);
        if (!purchaseReturn) return notFound(res, "Return not found");
        if (purchaseReturn.refundStatus !== "pending") {
            return badRequest(res, "Can only delete returns with pending refund status");
        }

        await purchaseReturn.destroy();
        return success(res, "Return deleted successfully", null);
    } catch (error) {
        return serverError(res, "Error deleting return", error);
    }
};

// APPROVE RETURN
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

        const approved = await purchaseReturn.update(updateData);
        return success(res, "Return approved successfully", approved);
    } catch (error) {
        return serverError(res, "Error approving return", error);
    }
};

// PROCESS REFUND
const processRefund = async (req, res) => {
    try {
        const { id } = req.params;

        const purchaseReturn = await PurchaseReturn.findByPk(id);
        if (!purchaseReturn) return notFound(res, "Return not found");

        if (purchaseReturn.refundStatus !== "approved") {
            return badRequest(res, "Only approved returns can be processed for refund");
        }

        const refunded = await purchaseReturn.update({ refundStatus: "refunded" });
        return success(res, "Refund processed successfully", refunded);
    } catch (error) {
        return serverError(res, "Error processing refund", error);
    }
};

// REJECT RETURN
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

        const rejected = await purchaseReturn.update(updateData);
        return success(res, "Return rejected successfully", rejected);
    } catch (error) {
        return serverError(res, "Error rejecting return", error);
    }
};

module.exports = { getAll, getOne, update, destroy, approveReturn, processRefund, rejectReturn };
