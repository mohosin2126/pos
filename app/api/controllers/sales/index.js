"use strict";

const { Op } = require("sequelize");
const { sequelize, Sale, SaleItem, Customer, Invoice } = require("../../database/models");
const {
    recomputeForProducts,
    getRemainingLotsForProduct,
    STOCKED_PURCHASE_STATUSES,
} = require("../../utils/inventory-recompute");
const {
    success, created, badRequest, notFound, serverError, parsePagination, paginated,
} = require("../../utils/api-response");
const {
    calculateItemTotal,
    calculateSaleOrderTotals,
    calculateTotalItems,
    validateSellingPrice,
} = require("../../utils/price-calculator");
const { getNetPurchaseCostSnapshots } = require("../../utils/costing");



async function resolveCustomerIdFromPayload(payload, t) {
    if (!payload) return null;

    if (payload.customerId) {
        const found = await Customer.findByPk(payload.customerId, { transaction: t });
        if (!found) throw new Error(`Customer ${payload.customerId} not found`);
        return found.id;
    }

    const { name, email, phone, address, notes, status } = payload.customer || {};
    if (!name && !email && !phone) return null;

    let where = {};
    if (email) where.email = email;
    else if (phone) where.phone = phone;

    let existing = (email || phone) ? await Customer.findOne({ where, transaction: t }) : null;

    if (existing) {
        await existing.update(
            {
                name: name ?? existing.name,
                address: address ?? existing.address,
                notes: notes ?? existing.notes,
                status: status ?? existing.status,
            },
            { transaction: t }
        );
        return existing.id;
    }

    if (!name) throw new Error("Customer name is required to create a new customer");
    const created = await Customer.create(
        { name, email: email || null, phone: phone || null, address: address || null, notes: notes || null, status: status || "active" },
        { transaction: t }
    );
    return created.id;
}

async function generateInvoiceNo(t) {
    const today = new Date();
    const ymd = today.toISOString().slice(0, 10).replace(/-/g, "");
    const prefix = `INV-${ymd}-`;

    const [rows] = await sequelize.query(
        `SELECT invoiceNo FROM invoices WHERE invoiceNo LIKE ? ORDER BY invoiceNo DESC LIMIT 1`,
        { replacements: [`${prefix}%`], transaction: t }
    );

    let seq = 1;
    if (rows && rows.length) {
        const last = rows[0].invoiceNo;
        const m = last && last.match(/-(\d+)$/);
        if (m) seq = Number(m[1]) + 1;
    }
    return `${prefix}${seq.toString().padStart(4, "0")}`;
}

const create = async (req, res) => {
    try {
        const { items } = req.body;
        if (!Array.isArray(items) || !items.length) return badRequest(res, "items are required");

        const productIds = [...new Set(items.map(i => Number(i.productId)).filter(Boolean))];
        if (!productIds.length) return badRequest(res, "At least one valid product is required");
        const statusPlaceholders = STOCKED_PURCHASE_STATUSES.map(() => "?").join(",");
        const [seen] = await sequelize.query(
            `SELECT DISTINCT pi.productId
             FROM purchase_items pi
             JOIN purchases p ON p.id = pi.purchaseId
             WHERE pi.productId IN (${productIds.map(() => "?").join(",")})
               AND p.status IN (${statusPlaceholders})`,
            { replacements: [...productIds, ...STOCKED_PURCHASE_STATUSES] }
        );
        const purchasedSet = new Set(seen.map(r => Number(r.productId)));
        const notPurchased = productIds.filter(id => !purchasedSet.has(id));
        if (notPurchased.length) return badRequest(res, `Cannot sell unpurchased products: ${notPurchased.join(", ")}`);

        const sale = await sequelize.transaction(async (t) => {
            const saleStatus = req.body.status || "completed";
            const costSnapshotsByProductId = await getNetPurchaseCostSnapshots(productIds, t);
            let resolvedCustomerId = null;
            try {
                resolvedCustomerId = await resolveCustomerIdFromPayload(
                    { customerId: req.body.customerId, customer: req.body.customer }, t
                );
            } catch (e) {
                throw { _badRequest: e.message };
            }

            if (saleStatus === "completed" && !resolvedCustomerId) {
                throw { _badRequest: "Customer is required to complete a sale" };
            }

            const sale = await Sale.create({
                referenceNo: req.body.referenceNo || null,
                saleDate: req.body.saleDate || new Date(),
                status: saleStatus,
                discountType: req.body.discountType || "none",
                discountAmount: req.body.discountAmount || 0,
                orderTaxPercent: req.body.orderTaxPercent || 0,
                orderTaxAmount: req.body.orderTaxAmount || 0,
                shippingCharge: req.body.shippingCharge || 0,
                totalItems: 0,
                netTotalAmount: 0,
                totalAmount: 0,
                amountPaid: req.body.amountPaid || 0,
                notes: req.body.notes || null,
                customerId: resolvedCustomerId || null,
                meta: req.body.meta || null,
            }, { transaction: t });

            const affected = new Set();
            const calculatedItems = [];

            for (const item of items) {
                const pid = Number(item.productId);
                const qty = Number(item.quantity);
                if (!pid || qty <= 0) continue;

                let allocations = null;
                if (saleStatus === "completed") {
                    const { unexpiredLots } = await getRemainingLotsForProduct(pid, t);

                    let remaining = qty;
                    allocations = [];
                    for (const lot of unexpiredLots) {
                        const take = Math.min(lot.qty, remaining);
                        if (take > 0) {
                            allocations.push({
                                expiryDate: lot.expiryDate ? lot.expiryDate.toISOString().slice(0, 10) : null,
                                qty: take,
                            });
                            remaining -= take;
                            if (remaining <= 0) break;
                        }
                    }
                    if (remaining > 0) throw { _badRequest: `Insufficient stock for product ${pid}. Need ${qty}.` };
                }

                const itemCalc = calculateItemTotal({
                    quantity: qty,
                    unitPrice: item.unitPrice,
                    discountType: item.discountType || "none",
                    discountAmount: item.discountAmount || 0,
                    taxPercent: item.taxPercent || 0,
                });

                if (!itemCalc.isValid) {
                    throw { _badRequest: `Item calculation error for product ${pid}: ${itemCalc.error}` };
                }

                const costSnapshot = costSnapshotsByProductId.get(pid) || null;
                const buyingPrice = Number(costSnapshot?.avgCost || costSnapshot?.lastCost || 0);
                const sellingPriceValidation = validateSellingPrice(
                    itemCalc.unitPrice,
                    buyingPrice
                );
                if (!sellingPriceValidation.isValid) {
                    throw {
                        _badRequest: `Selling price for product ${pid} is invalid: ${sellingPriceValidation.error}`,
                    };
                }

                await SaleItem.create({
                    saleId: sale.id,
                    productId: pid,
                    quantity: itemCalc.quantity,
                    unitPrice: itemCalc.unitPrice,
                    discountType: item.discountType || "none",
                    discountAmount: itemCalc.discount,
                    taxPercent: item.taxPercent || 0,
                    taxAmount: itemCalc.tax,
                    lineTotal: itemCalc.lineTotal,
                    allocations,
                }, { transaction: t });

                calculatedItems.push({
                    ...itemCalc,
                    productId: pid,
                    discountType: item.discountType || "none",
                    taxPercent: item.taxPercent || 0,
                    allocations,
                });

                affected.add(pid);
            }

            const totals = calculateSaleOrderTotals(
                calculatedItems,
                { type: sale.discountType || "none", amount: sale.discountAmount || 0 },
                sale.orderTaxPercent || 0,
                sale.shippingCharge || 0
            );
            if (!totals.isValid) {
                throw { _badRequest: totals.error };
            }

            const totalItemsCount = calculateTotalItems(calculatedItems);

            await sale.update({
                totalItems: totalItemsCount,
                discountAmount: totals.orderDiscount,
                netTotalAmount: totals.netTotal,
                totalAmount: totals.total,
                orderTaxAmount: totals.orderTax,
            }, { transaction: t });

            if (saleStatus === "completed" && affected.size > 0) {
                await recomputeForProducts([...affected], t);
            }

            if (saleStatus === "completed") {
                const invoiceNo = await generateInvoiceNo(t);
                
                const amountPaid = Number(sale.amountPaid || 0);
                const balanceDue = Math.max(0, totals.total - amountPaid);
                const status = balanceDue <= 0 ? "paid" : "issued";

                await Invoice.create({
                    saleId: sale.id,
                    customerId: sale.customerId,
                    invoiceNo,
                    invoiceDate: req.body.invoiceDate || new Date(),
                    dueDate: req.body.dueDate || null,
                    subTotal: totals.subtotal,
                    discountAmount: totals.orderDiscount,
                    orderTaxAmount: totals.orderTax,
                    shippingCharge: totals.shipping,
                    totalAmount: totals.total,
                    amountPaid,
                    balanceDue,
                    status,
                    notes: req.body.invoiceNotes || null,
                }, { transaction: t });
            }

            return sale;
        });

    
        const fullSale = await Sale.findByPk(sale.id, {
            include: [
                { model: SaleItem, as: "items", include: [{ model: sequelize.models.Product, as: "product" }] },
                { model: sequelize.models.Customer, as: "customer" },
                { model: sequelize.models.Invoice, as: "invoice" },
                { model: sequelize.models.SaleReturn, as: "returns" },
            ],
        });

        return created(res, "Sale created successfully", fullSale);
    } catch (error) {
        if (error && error._badRequest) return badRequest(res, error._badRequest);
        return serverError(res, "Error creating sale", error);
    }
};

const getAll = async (req, res) => {
    try {
        const { page, limit, offset } = parsePagination(req.query, { page: 1, limit: 20, maxLimit: 100 });
        const search = String(req.query.search || "").trim();
        const invoiceStatus = String(req.query.invoiceStatus || "").trim();
        const where = {};
        const invoiceWhere = {};

        if (search) {
            where[Op.or] = [
                { referenceNo: { [Op.like]: `%${search}%` } },
                sequelize.where(sequelize.cast(sequelize.col("Sale.customerId"), "CHAR"), {
                    [Op.like]: `%${search}%`,
                }),
                { "$customer.name$": { [Op.like]: `%${search}%` } },
                { "$invoice.invoiceNo$": { [Op.like]: `%${search}%` } },
            ];
        }

        if (invoiceStatus) {
            invoiceWhere.status = invoiceStatus;
        }

        const { rows, count } = await Sale.findAndCountAll({
            where,
            include: [
                { model: SaleItem, as: "items", include: [{ model: sequelize.models.Product, as: "product" }] },
                {
                    model: sequelize.models.Customer,
                    as: "customer",
                    required: false,
                },
                {
                    model: sequelize.models.Invoice,
                    as: "invoice",
                    where: Object.keys(invoiceWhere).length ? invoiceWhere : undefined,
                    required: Boolean(invoiceStatus),
                },
            ],
            order: [["createdAt", "DESC"]],
            limit, offset,
            distinct: true,
            subQuery: false,
        });
        return paginated(res, { rows, count }, { page, limit }, "Fetched successfully");
    } catch (error) {
        return serverError(res, "Error fetching sales", error);
    }
};

const getOne = async (req, res) => {
    try {
        const sale = await Sale.findByPk(req.params.id, {
            include: [
                { model: SaleItem, as: "items", include: [{ model: sequelize.models.Product, as: "product" }] },
                { model: sequelize.models.Customer, as: "customer" },
                { model: sequelize.models.Invoice, as: "invoice" },
                { model: sequelize.models.SaleReturn, as: "returns" },
            ],
        });
        if (!sale) return notFound(res, "Sale not found");
        return success(res, "Success", sale);
    } catch (error) {
        return serverError(res, "Error fetching sale", error);
    }
};

module.exports = { create, getAll, getOne };
