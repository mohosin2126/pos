"use strict";

const { Purchase, Supplier, Product, PurchaseItem, PurchaseReturn, sequelize } = require("../../database/models");
const {
    success, created, badRequest, notFound, serverError, parsePagination, paginated,
} = require("../../utils/api-response");
const {
    createPurchaseOrderValidation,
    updatePurchaseValidation,
    createPurchaseReturnValidation,
} = require("./validation");

// ===================== inline inventory recompute (no service file) =====================
const LOW_STOCK_THRESHOLD = 5;

async function recomputeForProducts(productIds, t) {
    if (!Array.isArray(productIds) || !productIds.length) return;

    // Get purchased quantities from both purchase (old single-product) and purchase_items (new multi-product)
    const [pLots] = await sequelize.query(
        `SELECT COALESCE(pi.productId, p.productId) AS productId, COALESCE(pi.expiryDate, p.expiryDate) as expiryDate, COALESCE(SUM(COALESCE(pi.quantity, p.totalItems)),0) AS purchasedQty
         FROM purchases p
         LEFT JOIN purchase_items pi ON p.id = pi.purchaseId
         WHERE (p.status='purchase' OR p.status='received' OR p.status='partial')
           AND (COALESCE(pi.productId, p.productId) IN (${productIds.map(() => "?").join(",")}))
         GROUP BY COALESCE(pi.productId, p.productId), COALESCE(pi.expiryDate, p.expiryDate)`,
        { replacements: productIds, transaction: t }
    );

    const [sAllocRows] = await sequelize.query(
        `SELECT si.productId, si.allocations
         FROM sale_items si
                  JOIN sales s ON s.id = si.saleId
         WHERE si.productId IN (${productIds.map(() => "?").join(",")})
           AND s.status='completed'`,
        { replacements: productIds, transaction: t }
    );

    const today = new Date(new Date().toDateString());
    const soldByProdLot = new Map();

    for (const r of sAllocRows) {
        const allocs = Array.isArray(r.allocations) ? r.allocations : (r.allocations ? JSON.parse(r.allocations) : []);
        for (const a of allocs) {
            const lotKey = a.expiryDate ? new Date(a.expiryDate).toISOString().slice(0,10) : "NULL";
            const key = `${r.productId}__${lotKey}`;
            soldByProdLot.set(key, (soldByProdLot.get(key) || 0) + Number(a.qty || 0));
        }
    }

    const byProd = new Map(); // productId -> { unexp, expd }
    for (const row of pLots) {
        const pid = Number(row.productId);
        const lotKey = row.expiryDate ? new Date(row.expiryDate).toISOString().slice(0,10) : "NULL";
        const purchased = Number(row.purchasedQty || 0);
        const sold = Number(soldByProdLot.get(`${pid}__${lotKey}`) || 0);
        const remaining = Math.max(0, purchased - sold);
        const exp = row.expiryDate ? new Date(row.expiryDate) : null;
        const isExpired = exp && exp < today;

        const prev = byProd.get(pid) || { unexp: 0, expd: 0 };
        if (isExpired) prev.expd += remaining; else prev.unexp += remaining;
        byProd.set(pid, prev);
    }

    const now = new Date();
    const upserts = [];
    const inStock = [], lowStock = [], expired = [], sellable = [], oos = [];

    for (const pid of productIds) {
        const agg = byProd.get(pid) || { unexp: 0, expd: 0 };
        const qoh = Number(agg.unexp + agg.expd);
        upserts.push([pid, qoh, agg.unexp, agg.expd, LOW_STOCK_THRESHOLD, now]);

        if (agg.expd > 0) expired.push([pid, agg.expd]);
        if (qoh > 0) {
            inStock.push([pid, qoh]);
            if (qoh < LOW_STOCK_THRESHOLD) lowStock.push([pid, qoh]);
            if (agg.unexp > 0) sellable.push([pid, agg.unexp]);
        } else {
            oos.push([pid, qoh]);
        }
    }

    if (upserts.length) {
        const ph = upserts.map(() => "(?,?,?,?,?,?)").join(",");
        await sequelize.query(
            `INSERT INTO stock_summaries
             (productId, quantityOnHand, unexpiredQty, expiredQty, reorderPoint, lastComputedAt)
             VALUES ${ph}
                 ON DUPLICATE KEY UPDATE
                                      quantityOnHand=VALUES(quantityOnHand),
                                      unexpiredQty=VALUES(unexpiredQty),
                                      expiredQty=VALUES(expiredQty),
                                      reorderPoint=VALUES(reorderPoint),
                                      lastComputedAt=VALUES(lastComputedAt)`,
            { replacements: upserts.flat(), transaction: t }
        );
    }

    const inClause = productIds.map(() => "?").join(",");
    await Promise.all([
        sequelize.query(`DELETE FROM list_in_stock_products WHERE productId IN (${inClause})`, { replacements: productIds, transaction: t }),
        sequelize.query(`DELETE FROM list_low_stock_products WHERE productId IN (${inClause})`, { replacements: productIds, transaction: t }),
        sequelize.query(`DELETE FROM list_expired_products WHERE productId IN (${inClause})`, { replacements: productIds, transaction: t }),
        sequelize.query(`DELETE FROM list_sellable_products WHERE productId IN (${inClause})`, { replacements: productIds, transaction: t }),
        sequelize.query(`DELETE FROM list_out_of_stock_products WHERE productId IN (${inClause})`, { replacements: productIds, transaction: t }),
    ]);

    async function insert(table, cols, rows) {
        if (!rows.length) return;
        const rowPh = rows.map(() => `(${cols.map(() => "?").join(",")})`).join(",");
        await sequelize.query(
            `INSERT INTO ${table} (${cols.join(",")}) VALUES ${rowPh}`,
            { replacements: rows.flat(), transaction: t }
        );
    }

    await insert("list_expired_products", ["productId", "expiredQty"], expired);
    await insert("list_in_stock_products", ["productId", "quantityOnHand"], inStock);
    await insert("list_low_stock_products", ["productId", "quantityOnHand"], lowStock);
    await insert("list_sellable_products", ["productId", "unexpiredQty"], sellable);
    await insert("list_out_of_stock_products", ["productId", "quantityOnHand"], oos);
}
// ===================== end recompute =====================

// Create Purchase Order (with items)
const create = async (req, res) => {
    try {
        // Validate request
        const { error, value } = createPurchaseOrderValidation.validate(req.body);
        if (error) return badRequest(res, error.details[0].message);

        const { items, supplierId } = value;

        // Verify supplier
        const supplier = await Supplier.findByPk(supplierId);
        if (!supplier) return badRequest(res, "Supplier not found");

        // Verify all products exist and are active
        const productIds = items.map(item => item.productId);
        const products = await Product.findAll({ where: { id: productIds } });
        if (products.length !== productIds.length) {
            return badRequest(res, "One or more products not found");
        }
        for (const prod of products) {
            if (prod.status !== "active") {
                return badRequest(res, `Product ${prod.id} is not active and cannot be purchased`);
            }
        }

        // Create purchase with items in transaction
        const purchase = await sequelize.transaction(async (t) => {
            const p = await Purchase.create(
                {
                    supplierId: value.supplierId,
                    supplierAddress: value.supplierAddress,
                    referenceNo: value.referenceNo,
                    purchaseDate: value.purchaseDate,
                    status: "po", // Default to purchase order status
                    payTermValue: value.payTermValue,
                    payTermUnit: value.payTermUnit,
                    discountType: value.discountType,
                    discountAmount: value.discountAmount,
                    orderTaxPercent: value.orderTaxPercent,
                    orderTaxAmount: value.orderTaxAmount,
                    shippingCharge: value.shippingCharge,
                    additionalExpenses: value.additionalExpenses,
                    netTotalAmount: value.netTotalAmount,
                    totalAmount: value.totalAmount,
                    amountPaid: value.amountPaid,
                    notes: value.notes,
                    shippingDetails: value.shippingDetails,
                    warrantyValue: value.warrantyValue,
                    warrantyUnit: value.warrantyUnit,
                    productId: null, // Multi-item POs don't use this field
                },
                { transaction: t }
            );

            // Create line items
            const createdItems = [];
            for (const item of items) {
                const lineItem = await PurchaseItem.create(
                    {
                        purchaseId: p.id,
                        productId: item.productId,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        lineTotal: item.lineTotal,
                        expiryDate: item.expiryDate,
                        batchNo: item.batchNo,
                    },
                    { transaction: t }
                );
                createdItems.push(lineItem);
            }

            p.items = createdItems;
            return p;
        });

        return created(res, "Purchase Order created successfully", purchase);
    } catch (error) {
        return serverError(res, "Error creating purchase order", error);
    }
};

// GET ALL
const getAll = async (req, res) => {
    try {
        const { page, limit, offset } = parsePagination(req.query, { page: 1, limit: 20, maxLimit: 100 });
        const { rows, count } = await Purchase.findAndCountAll({
            include: [
                { model: Supplier, as: "supplier", attributes: ["id", "name", "contactEmail"] },
                { model: Product, as: "product" },
                { model: PurchaseItem, as: "items", include: { model: Product, as: "product" } },
            ],
            order: [["createdAt", "DESC"]],
            limit, offset,
        });
        return paginated(res, { rows, count }, { page, limit }, "Fetched successfully");
    } catch (error) {
        return serverError(res, "Error fetching purchases", error);
    }
};

// GET ONE
const getOne = async (req, res) => {
    try {
        const purchase = await Purchase.findByPk(req.params.id, {
            include: [
                { model: Supplier, as: "supplier", attributes: ["id", "name", "contactEmail", "contactPhone"] },
                { model: Product, as: "product" },
                { model: PurchaseItem, as: "items", include: { model: Product, as: "product" } },
                { model: PurchaseReturn, as: "returns" },
            ],
        });
        if (!purchase) return notFound(res, "Purchase not found");
        return success(res, "Success", purchase);
    } catch (error) {
        return serverError(res, "Error fetching purchase", error);
    }
};

// UPDATE
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const purchase = await Purchase.findByPk(id, { include: { model: PurchaseItem, as: "items" } });
        if (!purchase) return notFound(res, "Purchase not found");

        // Only allow updates to draft or PO status
        if (purchase.status !== "draft" && purchase.status !== "po") {
            return badRequest(res, "Can only update purchases in draft or po status");
        }

        // Validate incoming data
        const { error, value } = updatePurchaseValidation.validate(req.body);
        if (error) return badRequest(res, error.details[0].message);

        // If items are provided, validate products
        if (value.items && value.items.length > 0) {
            const productIds = value.items.map(item => item.productId);
            const products = await Product.findAll({ where: { id: productIds } });
            if (products.length !== productIds.length) {
                return badRequest(res, "One or more products not found");
            }
        }

        // Update in transaction
        const updated = await sequelize.transaction(async (t) => {
            // Update purchase record
            await purchase.update(
                {
                    supplierId: value.supplierId ?? purchase.supplierId,
                    supplierAddress: value.supplierAddress ?? purchase.supplierAddress,
                    referenceNo: value.referenceNo ?? purchase.referenceNo,
                    purchaseDate: value.purchaseDate ?? purchase.purchaseDate,
                    status: value.status ?? purchase.status,
                    payTermValue: value.payTermValue ?? purchase.payTermValue,
                    payTermUnit: value.payTermUnit ?? purchase.payTermUnit,
                    discountType: value.discountType ?? purchase.discountType,
                    discountAmount: value.discountAmount ?? purchase.discountAmount,
                    orderTaxPercent: value.orderTaxPercent ?? purchase.orderTaxPercent,
                    orderTaxAmount: value.orderTaxAmount ?? purchase.orderTaxAmount,
                    shippingCharge: value.shippingCharge ?? purchase.shippingCharge,
                    additionalExpenses: value.additionalExpenses ?? purchase.additionalExpenses,
                    netTotalAmount: value.netTotalAmount ?? purchase.netTotalAmount,
                    totalAmount: value.totalAmount ?? purchase.totalAmount,
                    amountPaid: value.amountPaid ?? purchase.amountPaid,
                    notes: value.notes ?? purchase.notes,
                    shippingDetails: value.shippingDetails ?? purchase.shippingDetails,
                    warrantyValue: value.warrantyValue ?? purchase.warrantyValue,
                    warrantyUnit: value.warrantyUnit ?? purchase.warrantyUnit,
                },
                { transaction: t }
            );

            // Update line items if provided
            if (value.items && value.items.length > 0) {
                // Delete old items
                await PurchaseItem.destroy({ where: { purchaseId: id }, transaction: t });

                // Create new items
                for (const item of value.items) {
                    await PurchaseItem.create(
                        {
                            purchaseId: id,
                            productId: item.productId,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            lineTotal: item.lineTotal,
                            expiryDate: item.expiryDate,
                            batchNo: item.batchNo,
                        },
                        { transaction: t }
                    );
                }
            }

            // Recompute inventory for affected products
            const affectedProductIds = new Set();
            for (const item of purchase.items) {
                affectedProductIds.add(item.productId);
            }
            if (value.items) {
                for (const item of value.items) {
                    affectedProductIds.add(item.productId);
                }
            }
            await recomputeForProducts([...affectedProductIds], t);

            return Purchase.findByPk(id, {
                include: [
                    { model: Supplier, as: "supplier" },
                    { model: Product, as: "product" },
                    { model: PurchaseItem, as: "items", include: { model: Product, as: "product" } },
                ],
                transaction: t,
            });
        });

        return success(res, "Purchase updated successfully", updated);
    } catch (error) {
        return serverError(res, "Error updating purchase", error);
    }
};

// DELETE
const destroy = async (req, res) => {
    try {
        const { id } = req.params;
        const purchase = await Purchase.findByPk(id, { include: { model: PurchaseItem, as: "items" } });
        if (!purchase) return notFound(res, "Purchase not found");

        // Only allow deletion of draft or po status
        if (purchase.status !== "draft" && purchase.status !== "po") {
            return badRequest(res, "Can only delete purchases in draft or po status");
        }

        await sequelize.transaction(async (t) => {
            // Collect product IDs from items
            const productIds = new Set();
            for (const item of purchase.items) {
                productIds.add(item.productId);
            }
            if (purchase.productId) {
                productIds.add(purchase.productId);
            }

            // Delete purchase (cascades to items due to FK)
            await purchase.destroy({ transaction: t });

            // Recompute inventory
            if (productIds.size > 0) {
                await recomputeForProducts([...productIds], t);
            }
        });

        return success(res, "Purchase deleted successfully", null);
    } catch (error) {
        return serverError(res, "Error deleting purchase", error);
    }
};

// APPROVE PURCHASE ORDER(convert PO to purchase)
const approvePO = async (req, res) => {
    try {
        const { id } = req.params;
        const purchase = await Purchase.findByPk(id, {
            include: { model: PurchaseItem, as: "items" },
        });
        if (!purchase) return notFound(res, "Purchase not found");

        if (purchase.status !== "po") {
            return badRequest(res, "Only purchase orders (po status) can be approved");
        }

        // Approve and trigger inventory recompute
        const updated = await sequelize.transaction(async (t) => {
            await purchase.update({ status: "purchase" }, { transaction: t });

            // Recompute inventory for all items
            const productIds = purchase.items.map(item => item.productId).filter(Boolean);
            if (productIds.length > 0) {
                await recomputeForProducts(productIds, t);
            }

            return Purchase.findByPk(id, {
                include: [
                    { model: Supplier, as: "supplier" },
                    { model: PurchaseItem, as: "items", include: { model: Product, as: "product" } },
                ],
                transaction: t,
            });
        });

        return success(res, "Purchase Order approved and converted to purchase", updated);
    } catch (error) {
        return serverError(res, "Error approving purchase order", error);
    }
};

// CREATE PURCHASE RETURN
const createReturn = async (req, res) => {
    try {
        // Validate request
        const { error, value } = createPurchaseReturnValidation.validate(req.body);
        if (error) return badRequest(res, error.details[0].message);

        const { purchaseId } = value;

        // Verify purchase exists
        const purchase = await Purchase.findByPk(purchaseId);
        if (!purchase) return notFound(res, "Purchase not found");

        // Verify purchase has items (either in purchase_items or old productId)
        const items = await PurchaseItem.findAll({ where: { purchaseId } });
        if (items.length === 0 && !purchase.productId) {
            return badRequest(res, "Cannot return items from a purchase with no items");
        }

        // Create purchase return
        const purchaseReturn = await sequelize.transaction(async (t) => {
            const pr = await PurchaseReturn.create(
                {
                    purchaseId: value.purchaseId,
                    referenceNo: value.referenceNo,
                    returnDate: value.returnDate,
                    returnReason: value.returnReason,
                    returnItems: value.returnItems,
                    totalReturnAmount: value.totalReturnAmount,
                    refundAmount: value.refundAmount ?? value.totalReturnAmount,
                    refundStatus: "pending",
                    restockingDisposition: value.restockingDisposition,
                    notes: value.notes,
                },
                { transaction: t }
            );

            // Update purchase status based on return
            const totalReturnAmount = parseFloat(value.totalReturnAmount);
            const purchaseTotal = parseFloat(purchase.totalAmount);

            if (Math.abs(totalReturnAmount - purchaseTotal) < 0.01) {
                // Full return
                await purchase.update({ status: "full_return" }, { transaction: t });
            } else {
                // Partial return
                await purchase.update({ status: "partial_return" }, { transaction: t });
            }

            // Recompute inventory for returned products
            const returnedProductIds = value.returnItems.map(item => item.productId);
            if (returnedProductIds.length > 0) {
                await recomputeForProducts(returnedProductIds, t);
            }

            return pr;
        });

        return created(res, "Purchase return created successfully", purchaseReturn);
    } catch (error) {
        return serverError(res, "Error creating purchase return", error);
    }
};

// GET RETURNS FOR A PURCHASE
const getReturns = async (req, res) => {
    try {
        const { purchaseId } = req.params;

        const purchase = await Purchase.findByPk(purchaseId);
        if (!purchase) return notFound(res, "Purchase not found");

        const returns = await PurchaseReturn.findAll({
            where: { purchaseId },
            order: [["createdAt", "DESC"]],
        });

        return success(res, "Returns fetched successfully", returns);
    } catch (error) {
        return serverError(res, "Error fetching returns", error);
    }
};

module.exports = { create, getAll, getOne, update, destroy, approvePO, createReturn, getReturns };
