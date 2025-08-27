const express = require("express");
const router = express.Router();
const {listSellableProducts,checkout}=require("../../controllers/pos");

router.get("/sellable-products",listSellableProducts);
router.post("/checkout",checkout);

module.exports = router;
