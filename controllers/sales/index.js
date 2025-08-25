"use strict";

const {
    sequelize,
    Sale, SaleItem, SalePayment, Customer, Invoice
} = require("../../database/models");


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
            lineTotal
        };
    });

    let orderLevelDiscount = 0;
    if (discountType === "percent") orderLevelDiscount = (subTotal * Number(discountAmount || 0)) / 100;
    else if (discountType === "fixed") orderLevelDiscount = Number(discountAmount || 0);

    const orderTaxAmount = ((subTotal - orderLevelDiscount) * Number(orderTaxPercent || 0)) / 100;
    const totalAmount = subTotal - orderLevelDiscount + orderTaxAmount + Number(shippingCharge || 0);
    return { normalized, subTotal, orderLevelDiscount, orderTaxAmount, totalAmount };
}

async function assertSellable(it, t) {
    const available = await getSellableAvailable(it.productId, t);
    if (available <= 0) throw new Error("Product is not sellable (no non-expired stock)");
    if (available < Number(it.quantity)) throw new Error("Insufficient sellable (non-expired) stock");
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
            return res.status(400).json({ message: "At least one item is required" });
        }

        for (const it of items) {
            if (!it.productId || !it.quantity || !it.unitPrice) {
                await t.rollback();
                return res.status(400).json({ message: "Each item needs productId, quantity, unitPrice" });
            }
            await assertSellable(it, t);
        }

        // find customer
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
            if ((customerRecord.address == null) && customerAddress) patch.address = customerAddress;
            if (Object.keys(patch).length) await customerRecord.update(patch, { transaction: t });
        }

        const { normalized, subTotal, orderLevelDiscount, orderTaxAmount, totalAmount } =
            computeTotals(items, discountType, discountAmount, orderTaxPercent, shippingCharge);

        const amountPaid = (payments || []).reduce((s, p) => s + Number(p.amount || 0), 0);
        const changeDue = amountPaid > totalAmount ? (amountPaid - totalAmount) : 0;

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

        // Invoice
        const invoiceNumber = makeInvoiceNoForSale(sale.id, sale.saleDate);
        const invoiceStatus = (paymentStatus === "paid" || paymentStatus === "overpaid") ? "paid" : "issued";

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

        const created = await Sale.findByPk(sale.id, {
            include: [
                { model: SaleItem, as: "items" },
                { model: SalePayment, as: "payments" },
                { model: Customer, as: "customer" },
                { model: Invoice, as: "invoice" },
            ],
        });

        return res.status(201).json({ message: "Sale created", data: created });
    } catch (err) {
        await (t?.rollback?.());
        return res.status(400).json({ message: "Failed to create sale", error: err.message });
    }
};

// GET
const getAll = async (_req, res) => {
    try {
        const rows = await Sale.findAll({
            include: [
                { model: SaleItem, as: "items" },
                { model: SalePayment, as: "payments" },
                { model: Customer, as: "customer" },
                { model: Invoice, as: "invoice" },
            ],
            order: [["createdAt", "DESC"]],
        });
        return res.json({ data: rows });
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch sales", error: err.message });
    }
};

// GET
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
        if (!row) return res.status(404).json({ message: "Sale not found" });
        return res.json({ data: row });
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch sale", error: err.message });
    }
};

module.exports = { create, getAll, getOne };
