const express = require("express");
const router = express.Router();
const { listActiveProducts, listInStockProducts, listLowStockProducts, listExpiredOnlyProducts, listOutOfStockProducts, listSellableProducts} = require("../../controllers/inventory");

// Active products 
router.get("/active-products", listActiveProducts);

// In-stock
router.get("/stock-products", listInStockProducts);

// Low in stock 
router.get("/low-stock-products", listLowStockProducts);

// Expired-only 
router.get("/expired-products", listExpiredOnlyProducts);
router.get("/sellable-products", listSellableProducts);
router.get("/out-of-stock-products", listOutOfStockProducts);


module.exports = router;
