const express = require("express");
const { getProfitByProduct, getProfitSummary, getProfitBySale } = require("../../controllers/reports");

const router = express.Router();

router.get("/profit/by-product", getProfitByProduct);
router.get("/profit/summary", getProfitSummary);
router.get("/profit/by-sale", getProfitBySale);

module.exports = router;
