const express = require("express");
const router = express.Router();
const {
    rebuild,
    listActiveProducts,
    listInStockProducts,
    listLowStockProducts,
    listExpiredOnlyProducts,
    listOutOfStockProducts,
    listSellableProducts,
    listSummary,
} = require("../../controllers/inventory");
const { requirePermission } = require("../../middleware/authorize");

router.get("/active-products", requirePermission("view_stock"), listActiveProducts);
router.get("/stock-products", requirePermission("view_stock"), listInStockProducts);
router.get("/low-stock-products", requirePermission("view_stock"), listLowStockProducts);
router.get("/expired-products", requirePermission("view_stock"), listExpiredOnlyProducts);
router.get("/sellable-products", requirePermission("view_stock"), listSellableProducts);
router.get("/out-of-stock-products", requirePermission("view_stock"), listOutOfStockProducts);
router.get("/summary", requirePermission("view_stock"), listSummary);
router.post("/rebuild", requirePermission("view_stock"), rebuild);

module.exports = router;
