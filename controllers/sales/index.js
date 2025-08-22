"use strict";
const {
    sequelize,
    Sale, SaleItem, SalePayment, Product, InventoryMovement
} = require("../../../POS/server/database/models");

// Small helpers inside controller (MySQL-safe)
async function sumNonExpiredQty(productId, t) {
    const [rows] = await sequelize.query(
        `
    SELECT COALESCE(SUM(
      CASE WHEN lotExpiryDate IS NULL OR lotExpiryDate >= CURDATE() THEN quantity ELSE 0 END
    ),0) AS qty
    FROM inventory_movements
    WHERE productId = ?
    `,
        { replacements: [productId], transaction: t }
    );
    return rows?.[0]?.qty ? Number(rows[0].qty) : 0;
}

async function sumAllLots(productId, t) {
    const [rows] = await sequelize.query(
        `SELECT COALESCE(SUM(quantity),0) AS qty FROM inventory_movements WHERE productId = ?`,
        { replacements: [productId], transaction: t }
    );
    return rows?.[0]?.qty ? Number(rows[0].qty) : 0;
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
    if (discountType === "percent") orderLevelDiscount = (subTotal * Number(discountAmount || 0)) / 100;
    else if (discountType === "fixed") orderLevelDiscount = Number(discountAmount || 0);

    const orderTaxAmount = ((subTotal - orderLevelDiscount) * Number(orderTaxPercent || 0)) / 100;
    const totalAmount = subTotal - orderLevelDiscount + orderTaxAmount + Number(shippingCharge || 0);

    return { normalized, subTotal, orderLevelDiscount, orderTaxAmount, totalAmount };
}

// POST /sales  (also used by POS checkout)
const create = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const {
            invoiceNo,
            saleDate,
            billerName, customerName, customerPhone,
            items = [],
            discountType = "none", discountAmount = 0,
            orderTaxPercent = 0, shippingCharge = 0,
            payments = [],
            notes,
        } = req.body;

        if (!items.length) { await t.rollback(); return res.status(400).json({ message: "At least one item is required" }); }

        // Validate: active + in-stock + non-expired
        for (const it of items) {
            if (!it.productId || !it.quantity || !it.unitPrice) {
                await t.rollback(); return res.status(400).json({ message: "Each item needs productId, quantity, unitPrice" });
            }
            const product = await Product.findByPk(it.productId, { transaction: t });
            if (!product) { await t.rollback(); return res.status(404).json({ message: "Product not found" }); }
            if (product.status !== "active") { await t.rollback(); return res.status(400).json({ message: "Product is not active" }); }
            if (product.isTrackStock) {
                const available = await sumNonExpiredQty(it.productId, t);
                if (available < Number(it.quantity)) {
                    await t.rollback(); return res.status(400).json({ message: "Insufficient non-expired stock" });
                }
            }
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

        const sale = await Sale.create({
            invoiceNo: invoiceNo || null,
            saleDate: saleDate || new Date(),
            billerName: billerName || null,
            customerName: customerName || null,
            customerPhone: customerPhone || null,
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
        }, { transaction: t });

        for (const it of normalized) {
            await SaleItem.create({ saleId: sale.id, ...it }, { transaction: t });
        }

        for (const p of payments || []) {
            await SalePayment.create({
                saleId: sale.id,
                paymentDate: p.paymentDate || new Date(),
                amount: Number(p.amount || 0),
                method: p.method || "cash",
                referenceNo: p.referenceNo || null,
                notes: p.notes || null,
            }, { transaction: t });
        }

        // Stock out (negative movements)
        for (const it of normalized) {
            await InventoryMovement.create({
                productId: it.productId,
                movementType: "sale",
                quantity: -Number(it.quantity),
                relatedEntityType: "Sale",
                relatedEntityId: sale.id,
            }, { transaction: t });
        }

        // Optional: sync Product.stockQuantity from movements (keeps your UI field accurate)
        const touchedIds = Array.from(new Set(normalized.map(i => i.productId)));
        for (const pid of touchedIds) {
            const onHand = await sumAllLots(pid, t);
            await Product.update({ stockQuantity: onHand }, { where: { id: pid }, transaction: t });
        }

        await t.commit();

        const created = await Sale.findByPk(sale.id, {
            include: [{ model: SaleItem, as: "items" }, { model: SalePayment, as: "payments" }]
        });
        return res.status(201).json({ message: "Sale created", data: created });
    } catch (err) {
        await (t?.rollback?.());
        return res.status(400).json({ message: "Failed to create sale", error: err.message });
    }
};

// GET /sales
const getAll = async (req, res) => {
    try {
        const rows = await Sale.findAll({
            include: [{ model: SaleItem, as: "items" }, { model: SalePayment, as: "payments" }],
            order: [["createdAt", "DESC"]],
        });
        return res.json({ data: rows });
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch sales", error: err.message });
    }
};

// GET /sales/:id
const getOne = async (req, res) => {
    try {
        const row = await Sale.findByPk(req.params.id, {
            include: [{ model: SaleItem, as: "items" }, { model: SalePayment, as: "payments" }],
        });
        if (!row) return res.status(404).json({ message: "Sale not found" });
        return res.json({ data: row });
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch sale", error: err.message });
    }
};

module.exports = { create,getAll, getOne};
