"use strict";

const { Op } = require("sequelize");
const {
    SaleReturn,
    Sale,
    SaleItem,
    Product,
    Customer,
    Invoice,
    sequelize,
} = require("../../database/models");
const { recomputeForProducts } = require("../../utils/inventory-recompute");
const {
    success,
    created,
    badRequest,
    notFound,
    serverError,
    parsePagination,
    paginated,
} = require("../../utils/api-response");
const {
    buildValidatedReturnItems,
    getSaleReturnAvailability,
    getSaleReturnProductIds,
    shouldRestockSaleReturn,
    validateSaleReturnRequest,
} = require("../../utils/sale-returns");
const { roundMoney } = require("../../utils/price-calculator");

function toResponseInclude() {
    return [
        {
            model: Sale,
            as: "sale",
            include: [
                { model: Customer, as: "customer" },
                { model: Invoice, as: "invoice" },
            ],
        },
        { model: Invoice, as: "invoice" },
    ];
}

const create = async (req, res) => {
    try {
        const saleId = Number(req.body.saleId);
        if (!saleId) return badRequest(res, "saleId is required");
        if (!req.body.returnReason) return badRequest(res, "returnReason is required");
        if (!req.body.returnDate) return badRequest(res, "returnDate is required");

        const availability = await sequelize.transaction(async (t) => {
            return getSaleReturnAvailability(saleId, t);
        });

        const validationMessage = validateSaleReturnRequest(availability, req.body.returnItems);
        if (validationMessage) return badRequest(res, validationMessage);

        const built = buildValidatedReturnItems(req.body.returnItems, availability);
        if (built.error) return badRequest(res, built.error);

        const totalReturnAmount = Number(
            built.returnItems.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0).toFixed(2)
        );
        if (totalReturnAmount <= 0) return badRequest(res, "Total return amount must be greater than 0");
        const refundAmount = roundMoney(req.body.refundAmount ?? totalReturnAmount);
        if (refundAmount < 0) return badRequest(res, "Refund amount cannot be negative");
        if (refundAmount > totalReturnAmount + 0.01) {
            return badRequest(res, "Refund amount cannot exceed the total return amount");
        }

        const saleReturn = await sequelize.transaction(async (t) => {
            const createdReturn = await SaleReturn.create({
                saleId,
                invoiceId: availability.sale.invoice.id,
                referenceNo: req.body.referenceNo || null,
                returnDate: req.body.returnDate || new Date(),
                returnReason: req.body.returnReason,
                returnItems: built.returnItems,
                totalReturnAmount,
                refundAmount,
                refundStatus: "pending",
                restockingDisposition: req.body.restockingDisposition || "pending",
                notes: req.body.notes || null,
            }, { transaction: t });

            return createdReturn;
        });

        const fullSaleReturn = await SaleReturn.findByPk(saleReturn.id, {
            include: toResponseInclude(),
        });

        return created(res, "Sale return created successfully", fullSaleReturn);
    } catch (error) {
        return serverError(res, "Error creating sale return", error);
    }
};

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
                { "$sale.referenceNo$": { [Op.like]: `%${search}%` } },
                { "$sale.customer.name$": { [Op.like]: `%${search}%` } },
                { "$invoice.invoiceNo$": { [Op.like]: `%${search}%` } },
            ];
        }

        const { rows, count } = await SaleReturn.findAndCountAll({
            where,
            include: toResponseInclude(),
            order: [["createdAt", "DESC"]],
            limit,
            offset,
            distinct: true,
            subQuery: false,
        });

        return paginated(res, { rows, count }, { page, limit }, "Fetched successfully");
    } catch (error) {
        return serverError(res, "Error fetching sale returns", error);
    }
};

const getOne = async (req, res) => {
    try {
        const saleReturn = await SaleReturn.findByPk(req.params.id, {
            include: toResponseInclude(),
        });

        if (!saleReturn) return notFound(res, "Sale return not found");
        return success(res, "Success", saleReturn);
    } catch (error) {
        return serverError(res, "Error fetching sale return", error);
    }
};

const update = async (req, res) => {
    try {
        const saleReturn = await SaleReturn.findByPk(req.params.id);
        if (!saleReturn) return notFound(res, "Sale return not found");

        if (saleReturn.refundStatus !== "pending") {
            return badRequest(res, "Can only update returns with pending refund status");
        }

        const updatedReturn = await sequelize.transaction(async (t) => {
            const availability = await getSaleReturnAvailability(saleReturn.saleId, t, saleReturn.id);
            const requestItems = req.body.returnItems ?? saleReturn.returnItems;
            const validationMessage = validateSaleReturnRequest(availability, requestItems);
            if (validationMessage) {
                throw { _badRequest: validationMessage };
            }

            const built = buildValidatedReturnItems(requestItems, availability);
            if (built.error) {
                throw { _badRequest: built.error };
            }

            const totalReturnAmount = Number(
                built.returnItems.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0).toFixed(2)
            );
            const refundAmount = roundMoney(req.body.refundAmount ?? saleReturn.refundAmount ?? totalReturnAmount);
            if (refundAmount < 0) {
                throw { _badRequest: "Refund amount cannot be negative" };
            }
            if (refundAmount > totalReturnAmount + 0.01) {
                throw { _badRequest: "Refund amount cannot exceed the total return amount" };
            }

            const result = await saleReturn.update({
                returnReason: req.body.returnReason ?? saleReturn.returnReason,
                returnItems: built.returnItems,
                totalReturnAmount,
                refundAmount,
                restockingDisposition: req.body.restockingDisposition ?? saleReturn.restockingDisposition,
                notes: req.body.notes ?? saleReturn.notes,
            }, { transaction: t });

            return result;
        });

        return success(res, "Sale return updated successfully", updatedReturn);
    } catch (error) {
        if (error && error._badRequest) return badRequest(res, error._badRequest);
        return serverError(res, "Error updating sale return", error);
    }
};

const destroy = async (req, res) => {
    try {
        const saleReturn = await SaleReturn.findByPk(req.params.id);
        if (!saleReturn) return notFound(res, "Sale return not found");

        if (saleReturn.refundStatus !== "pending") {
            return badRequest(res, "Can only delete returns with pending refund status");
        }

        await saleReturn.destroy();
        return success(res, "Sale return deleted successfully", null);
    } catch (error) {
        return serverError(res, "Error deleting sale return", error);
    }
};

const approveReturn = async (req, res) => {
    try {
        const saleReturn = await SaleReturn.findByPk(req.params.id);
        if (!saleReturn) return notFound(res, "Sale return not found");

        if (saleReturn.refundStatus !== "pending") {
            return badRequest(res, "Only pending returns can be approved");
        }

        const approved = await sequelize.transaction(async (t) => {
            const refundAmount = roundMoney(
                req.body.refundAmount ?? saleReturn.refundAmount ?? saleReturn.totalReturnAmount
            );
            if (refundAmount < 0) {
                throw { _badRequest: "Refund amount cannot be negative" };
            }
            if (refundAmount > Number(saleReturn.totalReturnAmount || 0) + 0.01) {
                throw { _badRequest: "Refund amount cannot exceed the total return amount" };
            }

            const result = await saleReturn.update({
                refundStatus: "approved",
                refundAmount,
                restockingDisposition: req.body.restockingDisposition ?? saleReturn.restockingDisposition,
                notes: req.body.notes ?? saleReturn.notes,
            }, { transaction: t });

            if (shouldRestockSaleReturn(result)) {
                const productIds = getSaleReturnProductIds(result);
                if (productIds.length > 0) {
                    await recomputeForProducts(productIds, t);
                }
            }

            return result;
        });

        return success(res, "Sale return approved successfully", approved);
    } catch (error) {
        if (error && error._badRequest) return badRequest(res, error._badRequest);
        return serverError(res, "Error approving sale return", error);
    }
};

const processRefund = async (req, res) => {
    try {
        const saleReturn = await SaleReturn.findByPk(req.params.id);
        if (!saleReturn) return notFound(res, "Sale return not found");

        if (saleReturn.refundStatus !== "approved") {
            return badRequest(res, "Only approved returns can be processed for refund");
        }

        const refunded = await sequelize.transaction(async (t) => {
            const refundAmount = roundMoney(req.body.refundAmount ?? saleReturn.refundAmount);
            if (refundAmount < 0) {
                throw { _badRequest: "Refund amount cannot be negative" };
            }
            if (refundAmount > Number(saleReturn.totalReturnAmount || 0) + 0.01) {
                throw { _badRequest: "Refund amount cannot exceed the total return amount" };
            }

            const result = await saleReturn.update({
                refundStatus: "refunded",
                refundAmount,
            }, { transaction: t });

            if (shouldRestockSaleReturn(result)) {
                const productIds = getSaleReturnProductIds(result);
                if (productIds.length > 0) {
                    await recomputeForProducts(productIds, t);
                }
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
        const saleReturn = await SaleReturn.findByPk(req.params.id);
        if (!saleReturn) return notFound(res, "Sale return not found");

        if (saleReturn.refundStatus !== "pending") {
            return badRequest(res, "Only pending returns can be rejected");
        }

        const rejected = await saleReturn.update({
            refundStatus: "rejected",
            notes: req.body.notes ?? saleReturn.notes,
        });

        return success(res, "Sale return rejected successfully", rejected);
    } catch (error) {
        return serverError(res, "Error rejecting sale return", error);
    }
};

module.exports = {
    approveReturn,
    create,
    destroy,
    getAll,
    getOne,
    processRefund,
    rejectReturn,
    update,
};
