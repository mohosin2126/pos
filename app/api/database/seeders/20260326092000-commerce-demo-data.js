"use strict";

const {
    calculateItemTotal,
    calculateOrderTotal,
    calculateSaleOrderTotals,
    Decimal,
    prorateAmount,
    roundMoney,
} = require("../../utils/price-calculator");
const { getSaleReturnRevenueAmount } = require("../../utils/sale-returns");
const { recomputeForProducts } = require("../../utils/inventory-recompute");

const PURCHASE_SEEDS = [
    {
        referenceNo: "PUR-DEMO-1001", supplierCode: "SUP-0001", purchaseDate: "2026-01-12T09:15:00.000Z",
        status: "purchase", payTermValue: 30, payTermUnit: "days", shippingCharge: 200, amountPaid: 21000,
        notes: "Core peripherals restock.",
        items: [
            { sku: "ELEC-KEY-001", quantity: 20, unitPrice: 2100, batchNo: "KB-LOT-2601" },
            { sku: "ELEC-MOU-002", quantity: 30, unitPrice: 900, batchNo: "MO-LOT-2601" },
            { sku: "ELEC-CBL-013", quantity: 10, unitPrice: 260, batchNo: "CBL-LOT-2601" },
        ],
    },
    {
        referenceNo: "PUR-DEMO-1002", supplierCode: "SUP-0010", purchaseDate: "2026-01-20T11:30:00.000Z",
        status: "received", payTermValue: 15, payTermUnit: "days", shippingCharge: 350, amountPaid: 50000,
        notes: "Storage and office stock received.",
        items: [
            { sku: "ELEC-SSD-003", quantity: 12, unitPrice: 7100, batchNo: "SSD-LOT-2601" },
            { sku: "BOOK-NOTE-012", quantity: 40, unitPrice: 90, batchNo: "NOTE-LOT-2601" },
        ],
    },
    {
        referenceNo: "PUR-DEMO-1003", supplierCode: "SUP-0002", purchaseDate: "2026-02-04T10:00:00.000Z",
        status: "partial_return", payTermValue: 45, payTermUnit: "days", amountPaid: 9000,
        notes: "Home care and nutrition items with pending return.",
        items: [
            { sku: "HOME-CLN-007", quantity: 25, unitPrice: 280, expiryDate: "2026-10-31T00:00:00.000Z", batchNo: "CLN-LOT-2602" },
            { sku: "SPORT-GEL-008", quantity: 18, unitPrice: 120, expiryDate: "2026-02-15T00:00:00.000Z", batchNo: "GEL-LOT-OLD" },
            { sku: "ELEC-INK-010", quantity: 18, unitPrice: 900, batchNo: "INK-LOT-2602" },
        ],
    },
    {
        referenceNo: "PUR-DEMO-1004", supplierCode: "SUP-0007", purchaseDate: "2026-02-18T08:45:00.000Z",
        status: "partial_return", payTermValue: 30, payTermUnit: "days", amountPaid: 12000,
        notes: "Lifestyle assortment with processed return.",
        items: [
            { sku: "CLOT-TSH-005", quantity: 24, unitPrice: 320, expiryDate: "2027-01-15T00:00:00.000Z", batchNo: "TSH-LOT-2602" },
            { sku: "HOME-MUG-006", quantity: 18, unitPrice: 180, batchNo: "MUG-LOT-2602" },
            { sku: "SPORT-SHK-009", quantity: 20, unitPrice: 290, batchNo: "SHK-LOT-2602" },
        ],
    },
    {
        referenceNo: "PO-DEMO-1005", supplierCode: "SUP-0005", purchaseDate: "2026-03-01T09:00:00.000Z",
        status: "po", payTermValue: 30, payTermUnit: "days", amountPaid: 0, notes: "Open purchase order for replenishment.",
        items: [
            { sku: "HOME-BAT-011", quantity: 20, unitPrice: 430, batchNo: "BAT-PO-2603" },
            { sku: "BOOK-LEAD-004", quantity: 15, unitPrice: 420, batchNo: "LEAD-PO-2603" },
        ],
    },
    {
        referenceNo: "PUR-DEMO-1006", supplierCode: "SUP-0006", purchaseDate: "2026-03-05T14:20:00.000Z",
        status: "purchase", payTermValue: 15, payTermUnit: "days", shippingCharge: 120, amountPaid: 18000,
        notes: "Fast moving batteries and business books.",
        items: [
            { sku: "HOME-BAT-011", quantity: 16, unitPrice: 440, batchNo: "BAT-LOT-2603" },
            { sku: "BOOK-LEAD-004", quantity: 28, unitPrice: 430, batchNo: "LEAD-LOT-2603" },
        ],
    },
    {
        referenceNo: "PO-DEMO-1007", supplierCode: "SUP-0004", purchaseDate: "2026-03-10T16:10:00.000Z",
        status: "ordered", payTermValue: 60, payTermUnit: "days", amountPaid: 0, notes: "Awaiting delivery from supplier.",
        items: [
            { sku: "ELEC-MOU-002", quantity: 18, unitPrice: 880, batchNo: "MO-PO-2603" },
            { sku: "HOME-MUG-006", quantity: 12, unitPrice: 170, batchNo: "MUG-PO-2603" },
        ],
    },
    {
        referenceNo: "PUR-DEMO-1008", supplierCode: "SUP-0009", purchaseDate: "2026-03-14T12:00:00.000Z",
        status: "purchase", payTermValue: 15, payTermUnit: "days", amountPaid: 4000, notes: "Fresh sports nutrition batch.",
        items: [{ sku: "SPORT-GEL-008", quantity: 16, unitPrice: 125, expiryDate: "2026-09-30T00:00:00.000Z", batchNo: "GEL-LOT-NEW" }],
    },
];

const PURCHASE_RETURN_SEEDS = [
    {
        referenceNo: "RET-DEMO-2001", purchaseReferenceNo: "PUR-DEMO-1004", returnDate: "2026-03-02T09:30:00.000Z",
        returnReason: "quality_issue", refundStatus: "refunded", restockingDisposition: "scrap",
        notes: "Fabric issue identified during receiving.",
        items: [
            { sku: "CLOT-TSH-005", quantity: 5, lineTotal: 1600 },
            { sku: "HOME-MUG-006", quantity: 2, lineTotal: 360 },
        ],
    },
    {
        referenceNo: "RET-DEMO-2002", purchaseReferenceNo: "PUR-DEMO-1003", returnDate: "2026-03-08T10:20:00.000Z",
        returnReason: "overstock", refundStatus: "pending", restockingDisposition: "pending",
        notes: "Supplier return still awaiting approval.",
        items: [
            { sku: "HOME-CLN-007", quantity: 4, lineTotal: 1120 },
            { sku: "SPORT-GEL-008", quantity: 3, lineTotal: 360 },
        ],
    },
    {
        referenceNo: "RET-DEMO-2003", purchaseReferenceNo: "PUR-DEMO-1001", returnDate: "2026-03-15T13:00:00.000Z",
        returnReason: "wrong_item", refundStatus: "rejected", restockingDisposition: "pending",
        notes: "Rejected after supplier verification.",
        items: [{ sku: "ELEC-MOU-002", quantity: 2, lineTotal: 1800 }],
    },
];

const SALE_SEEDS = [
    {
        referenceNo: "SALE-DEMO-3001", customerEmail: "ayesha.rahman@example.com", saleDate: "2026-03-20T11:00:00.000Z",
        invoiceDate: "2026-03-20T11:00:00.000Z", dueDate: "2026-03-20T11:00:00.000Z",
        discountType: "percent", discountAmount: 5, orderTaxPercent: 2, shippingCharge: 120, amountPaid: "full",
        notes: "Front counter retail bundle.",
        items: [
            { sku: "ELEC-KEY-001", quantity: 6, unitPrice: 3200, taxPercent: 5, allocations: [{ expiryDate: null, qty: 6 }] },
            { sku: "ELEC-MOU-002", quantity: 4, unitPrice: 1600, discountType: "fixed", discountAmount: 100, taxPercent: 0, allocations: [{ expiryDate: null, qty: 4 }] },
            { sku: "BOOK-NOTE-012", quantity: 5, unitPrice: 180, taxPercent: 0, allocations: [{ expiryDate: null, qty: 5 }] },
        ],
    },
    {
        referenceNo: "SALE-DEMO-3002", customerEmail: "tanvir.hossain@example.com", saleDate: "2026-03-22T14:15:00.000Z",
        invoiceDate: "2026-03-22T14:15:00.000Z", dueDate: "2026-03-29T14:15:00.000Z",
        discountType: "fixed", discountAmount: 300, orderTaxPercent: 3, shippingCharge: 80, amountPaid: 18000,
        notes: "Partial payment for electronics sale.",
        items: [
            { sku: "ELEC-SSD-003", quantity: 3, unitPrice: 9800, taxPercent: 5, allocations: [{ expiryDate: null, qty: 3 }] },
            { sku: "ELEC-INK-010", quantity: 2, unitPrice: 1450, taxPercent: 5, allocations: [{ expiryDate: null, qty: 2 }] },
            { sku: "ELEC-CBL-013", quantity: 4, unitPrice: 550, taxPercent: 0, allocations: [{ expiryDate: null, qty: 4 }] },
        ],
    },
    {
        referenceNo: "SALE-DEMO-3003", customerEmail: "nusrat.jahan@example.com", saleDate: "2026-03-24T16:40:00.000Z",
        invoiceDate: "2026-03-24T16:40:00.000Z", dueDate: "2026-03-24T16:40:00.000Z",
        discountType: "none", discountAmount: 0, orderTaxPercent: 0, shippingCharge: 0, amountPaid: "full",
        notes: "Mixed household and apparel order.",
        items: [
            { sku: "CLOT-TSH-005", quantity: 6, unitPrice: 600, taxPercent: 0, allocations: [{ expiryDate: "2027-01-15", qty: 6 }] },
            { sku: "HOME-MUG-006", quantity: 5, unitPrice: 350, taxPercent: 0, allocations: [{ expiryDate: null, qty: 5 }] },
            { sku: "SPORT-SHK-009", quantity: 4, unitPrice: 480, taxPercent: 0, allocations: [{ expiryDate: null, qty: 4 }] },
            { sku: "BOOK-LEAD-004", quantity: 3, unitPrice: 850, discountType: "percent", discountAmount: 10, taxPercent: 0, allocations: [{ expiryDate: null, qty: 3 }] },
        ],
    },
    {
        referenceNo: "SALE-DEMO-3004", customerEmail: "mehedi.hasan@example.com", saleDate: "2026-03-25T18:05:00.000Z",
        invoiceDate: "2026-03-25T18:05:00.000Z", dueDate: "2026-04-01T18:05:00.000Z",
        discountType: "percent", discountAmount: 3, orderTaxPercent: 1.5, shippingCharge: 60, amountPaid: 4500,
        notes: "Sports and home care order with balance due.",
        items: [
            { sku: "HOME-CLN-007", quantity: 6, unitPrice: 420, taxPercent: 5, allocations: [{ expiryDate: "2026-10-31", qty: 6 }] },
            { sku: "SPORT-GEL-008", quantity: 12, unitPrice: 220, taxPercent: 0, allocations: [{ expiryDate: "2026-09-30", qty: 12 }] },
            { sku: "HOME-BAT-011", quantity: 6, unitPrice: 700, taxPercent: 0, allocations: [{ expiryDate: null, qty: 6 }] },
            { sku: "ELEC-CBL-013", quantity: 6, unitPrice: 550, taxPercent: 0, allocations: [{ expiryDate: null, qty: 6 }] },
            { sku: "BOOK-LEAD-004", quantity: 5, unitPrice: 850, taxPercent: 0, allocations: [{ expiryDate: null, qty: 5 }] },
        ],
    },
    {
        referenceNo: "SALE-DEMO-3005", customerEmail: "sadia.karim@example.com", saleDate: "2026-03-26T09:40:00.000Z",
        invoiceDate: "2026-03-26T09:40:00.000Z", dueDate: "2026-03-26T09:40:00.000Z",
        discountType: "none", discountAmount: 0, orderTaxPercent: 0, shippingCharge: 0, amountPaid: "full",
        notes: "Daily essentials sale.",
        items: [
            { sku: "ELEC-MOU-002", quantity: 5, unitPrice: 1600, taxPercent: 0, allocations: [{ expiryDate: null, qty: 5 }] },
            { sku: "BOOK-NOTE-012", quantity: 9, unitPrice: 180, taxPercent: 0, allocations: [{ expiryDate: null, qty: 9 }] },
            { sku: "SPORT-SHK-009", quantity: 3, unitPrice: 480, taxPercent: 0, allocations: [{ expiryDate: null, qty: 3 }] },
        ],
    },
];

const SALE_RETURN_SEEDS = [
    {
        referenceNo: "SRET-DEMO-4001",
        saleReferenceNo: "SALE-DEMO-3003",
        returnDate: "2026-03-25T10:15:00.000Z",
        returnReason: "customer_request",
        refundStatus: "refunded",
        restockingDisposition: "restock",
        notes: "Customer exchanged two apparel items.",
        items: [
            { sku: "CLOT-TSH-005", quantity: 2 },
            { sku: "HOME-MUG-006", quantity: 1 },
        ],
    },
    {
        referenceNo: "SRET-DEMO-4002",
        saleReferenceNo: "SALE-DEMO-3004",
        returnDate: "2026-03-26T12:20:00.000Z",
        returnReason: "quality_issue",
        refundStatus: "pending",
        restockingDisposition: "pending",
        notes: "Customer reported damaged cleaning bottle.",
        items: [{ sku: "HOME-CLN-007", quantity: 1 }],
    },
];

function fetchRows(queryInterface, Sequelize, sql, replacements) {
    return queryInterface.sequelize.query(sql, { replacements, type: Sequelize.QueryTypes.SELECT });
}

function toMap(rows, key) {
    return new Map(rows.map((row) => [row[key], row]));
}

function normalizeSaleItems(items, productBySku) {
    return items.map((item) => {
        const product = productBySku.get(item.sku);
        const calculation = calculateItemTotal({
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discountType: item.discountType || "none",
            discountAmount: item.discountAmount || 0,
            taxPercent: item.taxPercent || 0,
        });

        if (!product) throw new Error(`Missing product for SKU ${item.sku}`);
        if (!calculation.isValid) throw new Error(`Invalid sale item for ${item.sku}: ${calculation.error}`);

        return {
            productId: product.id,
            quantity: calculation.quantity,
            unitPrice: calculation.unitPrice,
            base: calculation.base,
            discountType: item.discountType || "none",
            discountAmount: calculation.discount,
            taxable: calculation.taxable,
            taxPercent: item.taxPercent || 0,
            tax: calculation.tax,
            taxAmount: calculation.tax,
            lineTotal: calculation.lineTotal,
            allocations: item.allocations || null,
        };
    });
}

function parseJsonArray(value) {
    if (Array.isArray(value)) return value;
    if (!value) return [];

    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch (_error) {
        return [];
    }
}

function computeSaleTotals(seed, normalizedItems) {
    const totals = calculateSaleOrderTotals(
        normalizedItems,
        { type: seed.discountType || "none", amount: seed.discountAmount || 0 },
        seed.orderTaxPercent || 0,
        seed.shippingCharge || 0
    );
    if (!totals.isValid) {
        throw new Error(`Invalid sale totals for ${seed.referenceNo}: ${totals.error}`);
    }
    const amountPaid = seed.amountPaid === "full"
        ? new Decimal(totals.total).toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
        : new Decimal(seed.amountPaid || 0).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    const balanceDue = Decimal.max(new Decimal(0), new Decimal(totals.total).minus(amountPaid)).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    return {
        totalItems: normalizedItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
        netTotalAmount: roundMoney(totals.netTotal),
        discountAmount: roundMoney(totals.orderDiscount),
        orderTaxAmount: roundMoney(totals.orderTax),
        shippingCharge: roundMoney(totals.shipping),
        totalAmount: roundMoney(totals.total),
        amountPaid: roundMoney(amountPaid),
        balanceDue: roundMoney(balanceDue),
        invoiceStatus: balanceDue.equals(0) ? "paid" : "issued",
    };
}

function buildPurchaseRows(seed, supplierByCode, productBySku, now) {
    const supplier = supplierByCode.get(seed.supplierCode);
    if (!supplier) throw new Error(`Missing supplier for code ${seed.supplierCode}`);

    const calculatedItems = seed.items.map((item) => {
        const product = productBySku.get(item.sku);
        if (!product) throw new Error(`Missing product for SKU ${item.sku}`);

        return {
            productId: product.id,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: roundMoney(new Decimal(item.quantity).times(new Decimal(item.unitPrice))),
            expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
            batchNo: item.batchNo || null,
        };
    });

    const totals = calculateOrderTotal(calculatedItems, { type: "none", amount: 0 }, 0, seed.shippingCharge || 0);
    if (!totals.isValid) throw new Error(`Invalid purchase totals for ${seed.referenceNo}: ${totals.error}`);

    return {
        purchase: {
            supplierId: supplier.id,
            supplierAddress: supplier.address || `${supplier.city || ""}, ${supplier.country || ""}`.trim() || null,
            referenceNo: seed.referenceNo,
            purchaseDate: new Date(seed.purchaseDate),
            status: seed.status,
            payTermValue: seed.payTermValue || null,
            payTermUnit: seed.payTermUnit || null,
            discountType: "none",
            discountAmount: 0,
            orderTaxPercent: 0,
            orderTaxAmount: 0,
            shippingCharge: roundMoney(seed.shippingCharge || 0),
            additionalExpenses: null,
            totalItems: calculatedItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
            netTotalAmount: roundMoney(totals.subtotal),
            totalAmount: roundMoney(totals.total),
            amountPaid: roundMoney(seed.amountPaid || 0),
            notes: seed.notes || null,
            shippingDetails: null,
            warrantyValue: null,
            warrantyUnit: null,
            createdAt: now,
            updatedAt: now,
        },
        items: calculatedItems,
    };
}

module.exports = {
    async up(queryInterface, Sequelize) {
        const now = new Date();
        const productSkus = [...new Set(
            [
                ...PURCHASE_SEEDS.flatMap((purchase) => purchase.items.map((item) => item.sku)),
                ...PURCHASE_RETURN_SEEDS.flatMap((purchaseReturn) => purchaseReturn.items.map((item) => item.sku)),
                ...SALE_SEEDS.flatMap((sale) => sale.items.map((item) => item.sku)),
            ]
        )];

        const productBySku = toMap(
            await fetchRows(queryInterface, Sequelize, "SELECT id, sku FROM products WHERE sku IN (:skus)", { skus: productSkus }),
            "sku"
        );
        const missingProducts = productSkus.filter((sku) => !productBySku.has(sku));
        if (missingProducts.length > 0) throw new Error(`Missing products for commerce seed: ${missingProducts.join(", ")}`);

        const supplierCodes = [...new Set(PURCHASE_SEEDS.map((purchase) => purchase.supplierCode))];
        const supplierByCode = toMap(
            await fetchRows(
                queryInterface,
                Sequelize,
                "SELECT id, supplierCode, address, city, country FROM suppliers WHERE supplierCode IN (:codes)",
                { codes: supplierCodes }
            ),
            "supplierCode"
        );
        const missingSuppliers = supplierCodes.filter((code) => !supplierByCode.has(code));
        if (missingSuppliers.length > 0) throw new Error(`Missing suppliers for commerce seed: ${missingSuppliers.join(", ")}`);

        const customerEmails = [...new Set(SALE_SEEDS.map((sale) => sale.customerEmail))];
        const customerByEmail = toMap(
            await fetchRows(queryInterface, Sequelize, "SELECT id, email FROM customers WHERE email IN (:emails)", { emails: customerEmails }),
            "email"
        );
        const missingCustomers = customerEmails.filter((email) => !customerByEmail.has(email));
        if (missingCustomers.length > 0) throw new Error(`Missing customers for commerce seed: ${missingCustomers.join(", ")}`);

        const existingPurchaseByReference = toMap(
            await fetchRows(
                queryInterface,
                Sequelize,
                "SELECT id, referenceNo, totalAmount FROM purchases WHERE referenceNo IN (:referenceNos)",
                { referenceNos: PURCHASE_SEEDS.map((purchase) => purchase.referenceNo) }
            ),
            "referenceNo"
        );

        const purchasesToInsert = PURCHASE_SEEDS
            .filter((purchase) => !existingPurchaseByReference.has(purchase.referenceNo))
            .map((purchase) => buildPurchaseRows(purchase, supplierByCode, productBySku, now));

        if (purchasesToInsert.length > 0) {
            await queryInterface.bulkInsert("purchases", purchasesToInsert.map((entry) => entry.purchase), {});

            const insertedPurchaseByReference = toMap(
                await fetchRows(
                    queryInterface,
                    Sequelize,
                    "SELECT id, referenceNo FROM purchases WHERE referenceNo IN (:referenceNos)",
                    { referenceNos: purchasesToInsert.map((entry) => entry.purchase.referenceNo) }
                ),
                "referenceNo"
            );

            const purchaseItems = purchasesToInsert.flatMap((entry) =>
                entry.items.map((item) => ({
                    purchaseId: insertedPurchaseByReference.get(entry.purchase.referenceNo).id,
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    lineTotal: item.lineTotal,
                    expiryDate: item.expiryDate,
                    batchNo: item.batchNo,
                    createdAt: now,
                    updatedAt: now,
                }))
            );

            if (purchaseItems.length > 0) {
                await queryInterface.bulkInsert("purchase_items", purchaseItems, {});
            }
        }

        const purchaseByReference = toMap(
            await fetchRows(
                queryInterface,
                Sequelize,
                "SELECT id, referenceNo, totalAmount FROM purchases WHERE referenceNo IN (:referenceNos)",
                { referenceNos: PURCHASE_SEEDS.map((purchase) => purchase.referenceNo) }
            ),
            "referenceNo"
        );

        const existingReturnByReference = toMap(
            await fetchRows(
                queryInterface,
                Sequelize,
                "SELECT id, referenceNo FROM purchase_returns WHERE referenceNo IN (:referenceNos)",
                { referenceNos: PURCHASE_RETURN_SEEDS.map((purchaseReturn) => purchaseReturn.referenceNo) }
            ),
            "referenceNo"
        );

        const returnsToInsert = PURCHASE_RETURN_SEEDS
            .filter((purchaseReturn) => !existingReturnByReference.has(purchaseReturn.referenceNo))
            .map((purchaseReturn) => {
                const purchase = purchaseByReference.get(purchaseReturn.purchaseReferenceNo);
                if (!purchase) throw new Error(`Missing purchase for return ${purchaseReturn.referenceNo}`);

                const returnItems = purchaseReturn.items.map((item) => ({
                    productId: productBySku.get(item.sku).id,
                    quantity: item.quantity,
                    lineTotal: roundMoney(item.lineTotal),
                }));
                const totalReturnAmount = roundMoney(returnItems.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0));
                if (totalReturnAmount > roundMoney(purchase.totalAmount) + 0.01) {
                    throw new Error(`Return total exceeds purchase total for ${purchaseReturn.referenceNo}`);
                }

                return {
                    purchaseId: purchase.id,
                    referenceNo: purchaseReturn.referenceNo,
                    returnDate: new Date(purchaseReturn.returnDate),
                    returnReason: purchaseReturn.returnReason,
                    returnItems: JSON.stringify(returnItems),
                    totalReturnAmount,
                    refundAmount: totalReturnAmount,
                    refundStatus: purchaseReturn.refundStatus,
                    restockingDisposition: purchaseReturn.restockingDisposition,
                    notes: purchaseReturn.notes || null,
                    createdAt: now,
                    updatedAt: now,
                };
            });

        if (returnsToInsert.length > 0) {
            await queryInterface.bulkInsert("purchase_returns", returnsToInsert, {});
        }

        const existingSaleByReference = toMap(
            await fetchRows(
                queryInterface,
                Sequelize,
                "SELECT id, referenceNo FROM sales WHERE referenceNo IN (:referenceNos)",
                { referenceNos: SALE_SEEDS.map((sale) => sale.referenceNo) }
            ),
            "referenceNo"
        );

        const salesToInsert = SALE_SEEDS
            .filter((sale) => !existingSaleByReference.has(sale.referenceNo))
            .map((sale) => {
                const normalizedItems = normalizeSaleItems(sale.items, productBySku);
                const totals = computeSaleTotals(sale, normalizedItems);
                const customer = customerByEmail.get(sale.customerEmail);

                return {
                    sale: {
                        referenceNo: sale.referenceNo,
                        saleDate: new Date(sale.saleDate),
                        status: "completed",
                        discountType: sale.discountType,
                        discountAmount: totals.discountAmount,
                        orderTaxPercent: roundMoney(sale.orderTaxPercent || 0),
                        orderTaxAmount: totals.orderTaxAmount,
                        shippingCharge: totals.shippingCharge,
                        totalItems: totals.totalItems,
                        netTotalAmount: totals.netTotalAmount,
                        totalAmount: totals.totalAmount,
                        amountPaid: totals.amountPaid,
                        notes: sale.notes || null,
                        meta: JSON.stringify({ seeded: true }),
                        customerId: customer.id,
                        createdAt: now,
                        updatedAt: now,
                    },
                    items: normalizedItems,
                    invoice: {
                        invoiceNo: sale.referenceNo.replace("SALE", "INV"),
                        invoiceDate: new Date(sale.invoiceDate),
                        dueDate: sale.dueDate ? new Date(sale.dueDate) : null,
                        customerId: customer.id,
                        subTotal: totals.netTotalAmount,
                        discountAmount: totals.discountAmount,
                        orderTaxAmount: totals.orderTaxAmount,
                        shippingCharge: totals.shippingCharge,
                        totalAmount: totals.totalAmount,
                        amountPaid: totals.amountPaid,
                        balanceDue: totals.balanceDue,
                        status: totals.invoiceStatus,
                        notes: `Seeded invoice for ${sale.referenceNo}`,
                    },
                };
            });

        if (salesToInsert.length > 0) {
            await queryInterface.bulkInsert("sales", salesToInsert.map((entry) => entry.sale), {});

            const saleByReference = toMap(
                await fetchRows(
                    queryInterface,
                    Sequelize,
                    "SELECT id, referenceNo FROM sales WHERE referenceNo IN (:referenceNos)",
                    { referenceNos: salesToInsert.map((entry) => entry.sale.referenceNo) }
                ),
                "referenceNo"
            );

            const saleItems = salesToInsert.flatMap((entry) =>
                entry.items.map((item) => ({
                    saleId: saleByReference.get(entry.sale.referenceNo).id,
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    discountType: item.discountType,
                    discountAmount: item.discountAmount,
                    taxPercent: item.taxPercent,
                    taxAmount: item.taxAmount,
                    lineTotal: item.lineTotal,
                    allocations: JSON.stringify(item.allocations),
                    createdAt: now,
                    updatedAt: now,
                }))
            );

            if (saleItems.length > 0) {
                await queryInterface.bulkInsert("sale_items", saleItems, {});
            }

            const invoices = salesToInsert.map((entry) => ({
                saleId: saleByReference.get(entry.sale.referenceNo).id,
                customerId: entry.invoice.customerId,
                invoiceNo: entry.invoice.invoiceNo,
                invoiceDate: entry.invoice.invoiceDate,
                dueDate: entry.invoice.dueDate,
                subTotal: entry.invoice.subTotal,
                discountAmount: entry.invoice.discountAmount,
                orderTaxAmount: entry.invoice.orderTaxAmount,
                shippingCharge: entry.invoice.shippingCharge,
                totalAmount: entry.invoice.totalAmount,
                amountPaid: entry.invoice.amountPaid,
                balanceDue: entry.invoice.balanceDue,
                status: entry.invoice.status,
                notes: entry.invoice.notes,
                createdAt: now,
                updatedAt: now,
            }));

            if (invoices.length > 0) {
                await queryInterface.bulkInsert("invoices", invoices, {});
            }
        }

        const saleByReference = toMap(
            await fetchRows(
                queryInterface,
                Sequelize,
                "SELECT id, referenceNo, discountAmount, orderTaxAmount, netTotalAmount FROM sales WHERE referenceNo IN (:referenceNos)",
                { referenceNos: SALE_SEEDS.map((sale) => sale.referenceNo) }
            ),
            "referenceNo"
        );
        const invoiceBySaleId = toMap(
            await fetchRows(
                queryInterface,
                Sequelize,
                "SELECT id, saleId FROM invoices WHERE saleId IN (:saleIds)",
                { saleIds: [...saleByReference.values()].map((sale) => sale.id) }
            ),
            "saleId"
        );
        const saleItemsBySaleId = await fetchRows(
            queryInterface,
            Sequelize,
            `SELECT si.id, si.saleId, si.productId, si.quantity, si.taxAmount, si.lineTotal, si.allocations, p.sku
             FROM sale_items si
             JOIN products p ON p.id = si.productId
             WHERE si.saleId IN (:saleIds)`,
            { saleIds: [...saleByReference.values()].map((sale) => sale.id) }
        );

        const existingSaleReturnByReference = toMap(
            await fetchRows(
                queryInterface,
                Sequelize,
                "SELECT id, referenceNo FROM sale_returns WHERE referenceNo IN (:referenceNos)",
                { referenceNos: SALE_RETURN_SEEDS.map((saleReturn) => saleReturn.referenceNo) }
            ),
            "referenceNo"
        );

        const saleReturnsToInsert = SALE_RETURN_SEEDS
            .filter((saleReturn) => !existingSaleReturnByReference.has(saleReturn.referenceNo))
            .map((saleReturn) => {
                const sale = saleByReference.get(saleReturn.saleReferenceNo);
                if (!sale) throw new Error(`Missing sale for sales return ${saleReturn.referenceNo}`);

                const saleItems = saleItemsBySaleId.filter((item) => Number(item.saleId) === Number(sale.id));
                const returnItems = saleReturn.items.map((item) => {
                    const saleItem = saleItems.find((row) => row.sku === item.sku);
                    if (!saleItem) {
                        throw new Error(`Missing sale item for SKU ${item.sku} in ${saleReturn.referenceNo}`);
                    }

                    const quantity = Number(item.quantity || 0);
                    const originalQty = Number(saleItem.quantity || 0);
                    const originalLineTotal = Number(saleItem.lineTotal || 0);
                    const originalTaxAmount = Number(saleItem.taxAmount || 0);
                    const originalBaseAmount = roundMoney(originalLineTotal - originalTaxAmount);
                    const originalAllocations = parseJsonArray(saleItem.allocations);
                    const totalOrderDiscount = roundMoney(sale.discountAmount || 0);
                    const fullSubtotal = roundMoney(sale.netTotalAmount || 0);
                    const orderDiscountAmount = fullSubtotal > 0
                        ? roundMoney((originalBaseAmount * totalOrderDiscount) / fullSubtotal)
                        : 0;
                    const discountedBaseAmount = roundMoney(originalBaseAmount - orderDiscountAmount);
                    const discountedSubtotal = roundMoney(fullSubtotal - totalOrderDiscount);
                    const totalOrderTax = roundMoney(sale.orderTaxAmount || 0);
                    const orderTaxAmount = discountedSubtotal > 0
                        ? roundMoney((discountedBaseAmount * totalOrderTax) / discountedSubtotal)
                        : 0;
                    let remaining = quantity;
                    const allocations = [];

                    for (const allocation of originalAllocations) {
                        if (remaining <= 0) break;
                        const qty = Math.min(Number(allocation.qty || 0), remaining);
                        allocations.push({
                            expiryDate: allocation.expiryDate || null,
                            qty,
                        });
                        remaining -= qty;
                    }

                    if (remaining > 0) {
                        throw new Error(`Insufficient allocations for ${saleReturn.referenceNo}`);
                    }

                    return {
                        saleItemId: saleItem.id,
                        productId: saleItem.productId,
                        quantity,
                        baseAmount: roundMoney(prorateAmount(originalBaseAmount, quantity, originalQty)),
                        taxAmount: roundMoney(prorateAmount(originalTaxAmount, quantity, originalQty)),
                        orderDiscountAmount: roundMoney(prorateAmount(orderDiscountAmount, quantity, originalQty)),
                        orderTaxAmount: roundMoney(prorateAmount(orderTaxAmount, quantity, originalQty)),
                        lineTotal: roundMoney(
                            getSaleReturnRevenueAmount({
                                baseAmount: roundMoney(prorateAmount(originalBaseAmount, quantity, originalQty)),
                                orderDiscountAmount: roundMoney(prorateAmount(orderDiscountAmount, quantity, originalQty)),
                            })
                            + roundMoney(prorateAmount(originalTaxAmount, quantity, originalQty))
                            + roundMoney(prorateAmount(orderTaxAmount, quantity, originalQty))
                        ),
                        allocations,
                    };
                });

                const totalReturnAmount = roundMoney(
                    returnItems.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0)
                );

                return {
                    saleId: sale.id,
                    invoiceId: invoiceBySaleId.get(sale.id)?.id || null,
                    referenceNo: saleReturn.referenceNo,
                    returnDate: new Date(saleReturn.returnDate),
                    returnReason: saleReturn.returnReason,
                    returnItems: JSON.stringify(returnItems),
                    totalReturnAmount,
                    refundAmount: totalReturnAmount,
                    refundStatus: saleReturn.refundStatus,
                    restockingDisposition: saleReturn.restockingDisposition,
                    notes: saleReturn.notes || null,
                    createdAt: now,
                    updatedAt: now,
                };
            });

        if (saleReturnsToInsert.length > 0) {
            await queryInterface.bulkInsert("sale_returns", saleReturnsToInsert, {});
        }

        await recomputeForProducts([...productBySku.values()].map((product) => Number(product.id)).filter(Boolean));
    },

    async down(queryInterface, Sequelize) {
        const saleReferenceNos = SALE_SEEDS.map((sale) => sale.referenceNo);
        const purchaseReferenceNos = PURCHASE_SEEDS.map((purchase) => purchase.referenceNo);
        const returnReferenceNos = PURCHASE_RETURN_SEEDS.map((purchaseReturn) => purchaseReturn.referenceNo);
        const saleReturnReferenceNos = SALE_RETURN_SEEDS.map((saleReturn) => saleReturn.referenceNo);
        const invoiceNos = SALE_SEEDS.map((sale) => sale.referenceNo.replace("SALE", "INV"));

        await queryInterface.sequelize.query(
            "DELETE FROM sale_returns WHERE referenceNo IN (:referenceNos)",
            { replacements: { referenceNos: saleReturnReferenceNos } }
        );
        await queryInterface.sequelize.query(
            "DELETE FROM sale_items WHERE saleId IN (SELECT id FROM sales WHERE referenceNo IN (:referenceNos))",
            { replacements: { referenceNos: saleReferenceNos } }
        );
        await queryInterface.sequelize.query(
            "DELETE FROM invoices WHERE invoiceNo IN (:invoiceNos)",
            { replacements: { invoiceNos } }
        );
        await queryInterface.sequelize.query(
            "DELETE FROM sales WHERE referenceNo IN (:referenceNos)",
            { replacements: { referenceNos: saleReferenceNos } }
        );
        await queryInterface.sequelize.query(
            "DELETE FROM purchase_returns WHERE referenceNo IN (:referenceNos)",
            { replacements: { referenceNos: returnReferenceNos } }
        );
        await queryInterface.sequelize.query(
            "DELETE FROM purchase_items WHERE purchaseId IN (SELECT id FROM purchases WHERE referenceNo IN (:referenceNos))",
            { replacements: { referenceNos: purchaseReferenceNos } }
        );
        await queryInterface.sequelize.query(
            "DELETE FROM purchases WHERE referenceNo IN (:referenceNos)",
            { replacements: { referenceNos: purchaseReferenceNos } }
        );

        const recomputeRows = await fetchRows(
            queryInterface,
            Sequelize,
            "SELECT id FROM products WHERE sku IN (:skus)",
            {
                skus: [...new Set(
                    [
                        ...PURCHASE_SEEDS.flatMap((purchase) => purchase.items.map((item) => item.sku)),
                        ...SALE_SEEDS.flatMap((sale) => sale.items.map((item) => item.sku)),
                    ]
                )],
            }
        );

        await recomputeForProducts(recomputeRows.map((product) => Number(product.id)).filter(Boolean));
    },
};
