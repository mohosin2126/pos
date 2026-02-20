const express = require("express");
const router = express.Router();
const { listActiveProducts, listInStockProducts, listLowStockProducts, listExpiredOnlyProducts, listOutOfStockProducts, listSellableProducts} = require("../../controllers/inventory");

router.get("/active-products", listActiveProducts);
router.get("/stock-products", listInStockProducts);
router.get("/low-stock-products", listLowStockProducts);
router.get("/expired-products", listExpiredOnlyProducts);
router.get("/sellable-products", listSellableProducts);
router.get("/out-of-stock-products", listOutOfStockProducts);


module.exports = router;
