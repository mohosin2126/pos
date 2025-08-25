"use strict";

const {
    sequelize,
    Sale,
    SaleItem,
    SalePayment,
    Customer,
    Invoice,
} = require("../../database/models");

const {
    success,
    created,
    badRequest,
    notFound,
    serverError,
    parsePagination,
    paginated,
} = require("../../utils/api-response");

async function getNonExpiredPurchased(productId, t) {
    const [rows] = await sequelize.query(
        `SELECT COALESCE(SUM(p.totalItems),0) AS qty
         FROM purchases p
         WHERE p.productId = ?
           AND (p.expiryDate IS NULL OR p.expiryDate >= CURDATE())`,
        { replacements: [productId], transaction: t }
    );
    return Number(rows?.[0]?.qty || 0);
}

async function getTotalSold(productId, t) {
    const [rows] = await sequelize.query(
        `SELECT COALESCE(SUM(si.quantity),0) AS qty
         FROM sale_items si
         WHERE si.productId = ?`,
        { replacements: [productId], transaction: t }
    );
    return Number(rows?.[0]?.qty || 0);
}

async function getSellableAvailable(productId, t) {
    const nonExp = await getNonExpiredPurchased(productId, t);
    const sold = await getTotalSold(productId, t);
    return Math.max(nonExp - sold, 0);
}

function computeTotals(items, discountType, discountAmount, orderTaxPercent, shippingCharge) {
    let subTotal = 0;
    const normalized = items.map((it) => {
        const qty = Number(it.quantity);
        const price = Number(it.unitPrice);
        const lineDiscount = Number(it.discountAmount || 0);
        const taxPct = Number(it.taxPercent || 0);
        const base = qty * price - lineDiscount;
        const taxAmount = (base * taxPct) / 100;
        const lineTotal = base + taxAmount;
        subTotal += lineTotal;
        return {
            productId: it.productId,
            quantity: qty,
            unitPrice: price,
            discountAmount: lineDiscount,
            taxPercent: taxPct,
            taxAmount,
            lineTotal,
        };
    });

    let orderLevelDiscount = 0;
    if (discountType === "percent")
        orderLevelDiscount = (subTotal * Number(discountAmount || 0)) / 100;
    else if (discountType === "fixed") orderLevelDiscount = Number(discountAmount || 0);

    const orderTaxAmount = ((subTotal - orderLevelDiscount) * Number(orderTaxPercent || 0)) / 100;
    const totalAmount =
        subTotal - orderLevelDiscount + orderTaxAmount + Number(shippingCharge || 0);
    return { normalized, subTotal, orderLevelDiscount, orderTaxAmount, totalAmount };
}

async function assertSellable(it, t) {
    const available = await getSellableAvailable(it.productId, t);
    if (available <= 0) throw new Error("Product is not sellable (no non-expired stock)");
    if (available < Number(it.quantity))
        throw new Error("Insufficient sellable (non-expired) stock");
}

function makeInvoiceNoForSale(saleId, date = new Date()) {
    const YYYY = date.getFullYear();
    const MM = String(date.getMonth() + 1).padStart(2, "0");
    const DD = String(date.getDate()).padStart(2, "0");
    return `INV-${YYYY}${MM}${DD}-${saleId}`;
}

// POST
const create = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const {
            invoiceNo,
            saleDate,

            billerName,
            customerName,
            customerPhone,
            customerEmail,
            customerAddress,

            items = [],
            discountType = "none",
            discountAmount = 0,
            orderTaxPercent = 0,
            shippingCharge = 0,

            payments = [],

            notes,
        } = req.body;

        if (!items.length) {
            await t.rollback();
            return badRequest(res, "At least one item is required");
        }

        for (const it of items) {
            if (!it.productId || !it.quantity || !it.unitPrice) {
                await t.rollback();
                return badRequest(res, "Each item needs productId, quantity, unitPrice");
            }
            await assertSellable(it, t);
        }

        // find or create customer
        let customerRecord = null;
        if (customerPhone) {
            customerRecord = await Customer.findOne({ where: { phone: customerPhone }, transaction: t });
        }
        if (!customerRecord && customerEmail) {
            customerRecord = await Customer.findOne({ where: { email: customerEmail }, transaction: t });
        }
        if (!customerRecord && customerName) {
            customerRecord = await Customer.findOne({ where: { name: customerName }, transaction: t });
        }
        if (!customerRecord) {
            customerRecord = await Customer.create(
                {
                    name: customerName || "Walk-in Customer",
                    phone: customerPhone || null,
                    email: customerEmail || null,
                    address: customerAddress || null,
                    status: "active",
                },
                { transaction: t }
            );
        } else {
            const patch = {};
            if (!customerRecord.name && customerName) patch.name = customerName;
            if (!customerRecord.phone && customerPhone) patch.phone = customerPhone;
            if (!customerRecord.email && customerEmail) patch.email = customerEmail;
            if (customerRecord.address == null && customerAddress) patch.address = customerAddress;
            if (Object.keys(patch).length) await customerRecord.update(patch, { transaction: t });
        }

        const { normalized, subTotal, orderLevelDiscount, orderTaxAmount, totalAmount } =
            computeTotals(items, discountType, discountAmount, orderTaxPercent, shippingCharge);

        const amountPaid = (payments || []).reduce((s, p) => s + Number(p.amount || 0), 0);
        const changeDue = amountPaid > totalAmount ? amountPaid - totalAmount : 0;

        let paymentStatus = "unpaid";
        if (amountPaid <= 0) paymentStatus = "unpaid";
        else if (amountPaid < totalAmount) paymentStatus = "partial";
        else if (amountPaid === totalAmount) paymentStatus = "paid";
        else paymentStatus = "overpaid";

        const sale = await Sale.create(
            {
                customerId: customerRecord.id,
                invoiceNo: invoiceNo || null,
                saleDate: saleDate || new Date(),
                billerName: billerName || null,
                customerName: customerName || customerRecord.name || null,
                customerPhone: customerPhone || customerRecord.phone || null,
                status: "completed",
                paymentStatus,
                subTotal,
                discountType,
                discountAmount: orderLevelDiscount,
                orderTaxPercent,
                orderTaxAmount,
                shippingCharge,
                totalAmount,
                amountPaid,
                changeDue,
                notes: notes || null,
            },
            { transaction: t }
        );

        for (const it of normalized) {
            await SaleItem.create({ saleId: sale.id, ...it }, { transaction: t });
        }

        for (const p of payments || []) {
            await SalePayment.create(
                {
                    saleId: sale.id,
                    paymentDate: p.paymentDate || new Date(),
                    amount: Number(p.amount || 0),
                    method: p.method || "cash",
                    referenceNo: p.referenceNo || null,
                    notes: p.notes || null,
                },
                { transaction: t }
            );
        }

        const invoiceNumber = makeInvoiceNoForSale(sale.id, sale.saleDate);
        const invoiceStatus =
            paymentStatus === "paid" || paymentStatus === "overpaid" ? "paid" : "issued";

        await Invoice.create(
            {
                saleId: sale.id,
                customerId: customerRecord.id,
                invoiceNo: invoiceNumber,
                invoiceDate: sale.saleDate,
                dueDate: null,
                subTotal,
                discountAmount: orderLevelDiscount,
                orderTaxAmount,
                shippingCharge,
                totalAmount,
                amountPaid,
                balanceDue: Math.max(totalAmount - amountPaid, 0),
                status: invoiceStatus,
                notes: notes || null,
                pdfUrl: null,
            },
            { transaction: t }
        );

        await t.commit();

        const createdSale = await Sale.findByPk(sale.id, {
            include: [
                { model: SaleItem, as: "items" },
                { model: SalePayment, as: "payments" },
                { model: Customer, as: "customer" },
                { model: Invoice, as: "invoice" },
            ],
        });

        return created(res, "Sale created", createdSale);
    } catch (err) {
        await t.rollback();
        return serverError(res, "Failed to create sale", err);
    }
};

// GET ALL
const getAll = async (req, res) => {
    try {
        const { page, limit, offset } = parsePagination(req.query, {
            page: 1,
            limit: 20,
            maxLimit: 100,
        });

        const { rows, count } = await Sale.findAndCountAll({
            include: [
                { model: SaleItem, as: "items" },
                { model: SalePayment, as: "payments" },
                { model: Customer, as: "customer" },
                { model: Invoice, as: "invoice" },
            ],
            order: [["createdAt", "DESC"]],
            limit,
            offset,
        });

        return paginated(res, { rows, count }, { page, limit }, "Fetched successfully");
    } catch (err) {
        return serverError(res, "Failed to fetch sales", err);
    }
};

// GET ONE
const getOne = async (req, res) => {
    try {
        const row = await Sale.findByPk(req.params.id, {
            include: [
                { model: SaleItem, as: "items" },
                { model: SalePayment, as: "payments" },
                { model: Customer, as: "customer" },
                { model: Invoice, as: "invoice" },
            ],
        });
        if (!row) return notFound(res, "Sale not found");
        return success(res, "Success", row);
    } catch (err) {
        return serverError(res, "Failed to fetch sale", err);
    }
};

module.exports = { create, getAll, getOne };
