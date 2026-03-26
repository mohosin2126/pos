"use strict";

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
    calculateTotalItems,
    Decimal,
} = require("../../utils/price-calculator");



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

                affected.add(pid);
            }

            const [tot] = await sequelize.query(
                `SELECT
                     COALESCE(SUM(quantity),0) AS totalItems,
                     COALESCE(SUM(lineTotal - taxAmount),0) AS netTotalAmount,
                     COALESCE(SUM(lineTotal),0) AS totalAmount,
                     COALESCE(SUM(taxAmount),0) AS totalTax
                 FROM sale_items WHERE saleId = ?`,
                { replacements: [sale.id], transaction: t }
            );
            const tr = Array.isArray(tot) ? tot[0] : tot;

            const saleItems = await SaleItem.findAll({ where: { saleId: sale.id }, transaction: t });
            const totalItemsCount = calculateTotalItems(saleItems);
            const itemSubtotal = Number(tr.netTotalAmount || 0);
            const itemTaxes = Number(tr.totalTax || 0);
            let orderDiscount = new Decimal(0);

            if (sale.discountType === "percent") {
                orderDiscount = new Decimal(itemSubtotal)
                    .times(new Decimal(sale.discountAmount || 0))
                    .dividedBy(100)
                    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
            } else if (sale.discountType === "fixed") {
                orderDiscount = new Decimal(sale.discountAmount || 0).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
            }

            if (orderDiscount.greaterThan(new Decimal(itemSubtotal))) {
                throw { _badRequest: "Order discount cannot exceed subtotal" };
            }

            const subtotalAfterOrderDiscount = new Decimal(itemSubtotal)
                .minus(orderDiscount)
                .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
            const orderTax = subtotalAfterOrderDiscount
                .times(new Decimal(sale.orderTaxPercent || 0))
                .dividedBy(100)
                .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
            const shippingCharge = new Decimal(sale.shippingCharge || 0).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
            const totalAmount = subtotalAfterOrderDiscount
                .plus(new Decimal(itemTaxes))
                .plus(orderTax)
                .plus(shippingCharge)
                .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

            await sale.update({
                totalItems: totalItemsCount,
                discountAmount: orderDiscount.toNumber(),
                netTotalAmount: itemSubtotal,
                totalAmount: totalAmount.toNumber(),
                orderTaxAmount: orderTax.toNumber(),
            }, { transaction: t });

            if (saleStatus === "completed" && affected.size > 0) {
                await recomputeForProducts([...affected], t);
            }

            if (saleStatus === "completed") {
                const invoiceNo = await generateInvoiceNo(t);
                
                const amountPaid = Number(sale.amountPaid || 0);
                const balanceDue = Math.max(0, totalAmount.toNumber() - amountPaid);
                const status = balanceDue <= 0 ? "paid" : "issued";

                await Invoice.create({
                    saleId: sale.id,
                    customerId: sale.customerId,
                    invoiceNo,
                    invoiceDate: req.body.invoiceDate || new Date(),
                    dueDate: req.body.dueDate || null,
                    subTotal: itemSubtotal,
                    discountAmount: orderDiscount.toNumber(),
                    orderTaxAmount: orderTax.toNumber(),
                    shippingCharge: shippingCharge.toNumber(),
                    totalAmount: totalAmount.toNumber(),
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
        const { rows, count } = await Sale.findAndCountAll({
            include: [
                { model: SaleItem, as: "items", include: [{ model: sequelize.models.Product, as: "product" }] },
                { model: sequelize.models.Customer, as: "customer" },
                { model: sequelize.models.Invoice, as: "invoice" },
            ],
            order: [["createdAt", "DESC"]],
            limit, offset,
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
            ],
        });
        if (!sale) return notFound(res, "Sale not found");
        return success(res, "Success", sale);
    } catch (error) {
        return serverError(res, "Error fetching sale", error);
    }
};

module.exports = { create, getAll, getOne };
