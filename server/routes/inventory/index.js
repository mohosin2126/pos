const express = require("express");
const router = express.Router();
const { listInStockProducts, listLowStockProducts, listExpiredOnlyProducts, listOutOfStockProducts,  listSellableProducts} = require("../../controllers/inventory");

// In-stock (non-expired > 0)
router.get("/stock-products", listInStockProducts);

// Low in stock (<= reorderLevel and > 0)
router.get("/low-stock-products", listLowStockProducts);

// Expired-only (have stock but all expired)
router.get("/expired-products", listExpiredOnlyProducts);
router.get("/sellable-products", listSellableProducts);
router.get("/out-of-stock-products", listOutOfStockProducts);


module.exports = router;
