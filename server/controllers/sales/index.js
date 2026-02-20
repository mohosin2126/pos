"use strict";

const { sequelize, Sale, SaleItem, Customer, Invoice } = require("../../database/models");
const { recomputeForProducts } = require("../../utils/inventory-recompute");
const {
    success, created, badRequest, notFound, serverError, parsePagination, paginated,
} = require("../../utils/api-response");
const {
    validateLineTotal,
    calculateItemTotal,
    calculateOrderTotal,
    calculateTotalItems,
} = require("../../utils/price-calculator");

async function getRemainingLots(productId, t) {
    const [pRows] = await sequelize.query(
        `SELECT expiryDate, COALESCE(SUM(totalItems),0) AS purchasedQty
         FROM purchases
         WHERE productId = ?
         GROUP BY expiryDate`,
        { replacements: [productId], transaction: t }
    );

    const [sRows] = await sequelize.query(
        `SELECT si.allocations
         FROM sale_items si
                  JOIN sales s ON s.id = si.saleId
         WHERE si.productId = ? AND s.status = 'completed'`,
        { replacements: [productId], transaction: t }
    );

    const soldByLot = new Map();
    for (const r of sRows) {
        const allocs = Array.isArray(r.allocations) ? r.allocations : (r.allocations ? JSON.parse(r.allocations) : []);
        for (const a of allocs) {
            const key = a.expiryDate ? new Date(a.expiryDate).toISOString().slice(0,10) : "NULL";
            soldByLot.set(key, (soldByLot.get(key) || 0) + Number(a.qty || 0));
        }
    }

    const lotMap = new Map();
    for (const p of pRows) {
        const key = p.expiryDate ? new Date(p.expiryDate).toISOString().slice(0,10) : "NULL";
        const rem = Number(p.purchasedQty || 0) - Number(soldByLot.get(key) || 0);
        lotMap.set(key, Math.max(0, rem));
    }

    const today = new Date(new Date().toDateString());
    const lots = [];
    for (const [key, qty] of lotMap.entries()) {
        const exp = (key === "NULL") ? null : new Date(key);
        const isExpired = exp && exp < today;
        lots.push({ expiryDate: exp, qty, isExpired });
    }

    const unexpiredLots = lots
        .filter(l => !l.isExpired)
        .sort((a, b) => {
            if (a.expiryDate === null && b.expiryDate === null) return 0;
            if (a.expiryDate === null) return 1;
            if (b.expiryDate === null) return -1;
            return a.expiryDate - b.expiryDate;
        });

    return { unexpiredLots, allLots: lots };
}



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
        const [seen] = await sequelize.query(
            `SELECT DISTINCT productId FROM purchases WHERE productId IN (${productIds.map(() => "?").join(",")})`,
            { replacements: productIds }
        );
        const purchasedSet = new Set(seen.map(r => Number(r.productId)));
        const notPurchased = productIds.filter(id => !purchasedSet.has(id));
        if (notPurchased.length) return badRequest(res, `Cannot sell unpurchased products: ${notPurchased.join(", ")}`);

        const sale = await sequelize.transaction(async (t) => {
            let resolvedCustomerId = null;
            try {
                resolvedCustomerId = await resolveCustomerIdFromPayload(
                    { customerId: req.body.customerId, customer: req.body.customer }, t
                );
            } catch (e) {
                throw { _badRequest: e.message };
            }

            const sale = await Sale.create({
                referenceNo: req.body.referenceNo || null,
                saleDate: req.body.saleDate || new Date(),
                status: req.body.status || "completed",
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

                const { unexpiredLots } = await getRemainingLots(pid, t);

                let remaining = qty;
                const allocations = [];
                for (const lot of unexpiredLots) {
                    const take = Math.min(lot.qty, remaining);
                    if (take > 0) {
                        allocations.push({
                            expiryDate: lot.expiryDate ? lot.expiryDate.toISOString().slice(0,10) : null,
                            qty: take,
                        });
                        remaining -= take;
                        if (remaining <= 0) break;
                    }
                }
                if (remaining > 0) throw { _badRequest: `Insufficient stock for product ${pid}. Need ${qty}.` };

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

            const orderCalc = calculateOrderTotal(
                saleItems,
                { type: sale.discountType || "none", amount: sale.discountAmount || 0 },
                sale.orderTaxPercent || 0,
                sale.shippingCharge || 0
            );

            if (!orderCalc.isValid) {
                throw { _badRequest: `Order calculation error: ${orderCalc.error}` };
            }

            const totalItemsCount = calculateTotalItems(saleItems);

            await sale.update({
                totalItems: totalItemsCount,
                netTotalAmount: orderCalc.subtotal,
                totalAmount: orderCalc.total,
                orderTaxAmount: orderCalc.orderTax,
            }, { transaction: t });

            await recomputeForProducts([...affected], t);

            if (sale.status === "completed") {
                const invoiceNo = await generateInvoiceNo(t);

               
                const itemSubtotal = Number(tr.netTotalAmount || 0);
                const itemTaxes = Number(tr.totalTax || 0);
                
                let orderDiscount = 0;
                if (sale.discountType === "percent") {
                    orderDiscount = (itemSubtotal * sale.discountAmount) / 100;
                } else if (sale.discountType === "fixed") {
                    orderDiscount = sale.discountAmount;
                }
                
            
                const subtotalAfterOrderDiscount = Math.max(0, itemSubtotal - orderDiscount);
                const orderTax = (subtotalAfterOrderDiscount * (sale.orderTaxPercent || 0)) / 100;
                
                const shippingCharge = Number(sale.shippingCharge || 0);
                const totalAmount = itemSubtotal - orderDiscount + itemTaxes + orderTax + shippingCharge;
                
                const amountPaid = Number(sale.amountPaid || 0);
                const balanceDue = Math.max(0, totalAmount - amountPaid);
                const status = balanceDue <= 0 ? "paid" : "issued";

                await Invoice.create({
                    saleId: sale.id,
                    customerId: sale.customerId,
                    invoiceNo,
                    invoiceDate: req.body.invoiceDate || new Date(),
                    dueDate: req.body.dueDate || null,
                    subTotal: itemSubtotal,
                    discountAmount: orderDiscount,
                    orderTaxAmount: orderTax,
                    shippingCharge,
                    totalAmount,
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
