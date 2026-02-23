const express = require("express");
const { getProfitByProduct, getProfitSummary, getProfitBySale } = require("../../controllers/reports");
const { requirePermission } = require("../../middleware/authorize");

const router = express.Router();

router.get("/profit/by-product", requirePermission("view_reports"), getProfitByProduct);
router.get("/profit/summary", requirePermission("view_reports"), getProfitSummary);
router.get("/profit/by-sale", requirePermission("view_reports"), getProfitBySale);

module.exports = router;
