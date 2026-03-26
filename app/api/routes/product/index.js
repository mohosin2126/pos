const express = require("express");
const {create, getAll, getOne, update, destroy, getCostFromPurchaseHistory, getRevenueReport} = require("../../controllers/product");
const { requirePermission } = require("../../middleware/authorize");

const router = express.Router();

router.post("/create", requirePermission("create_products"), create);
router.get("/all", requirePermission("view_products"), getAll);
router.get("/revenue-report", requirePermission("view_reports"), getRevenueReport);
router.get("/:id", requirePermission("view_products"), getOne);
router.get("/:id/cost-history", requirePermission("view_products"), getCostFromPurchaseHistory);
router.put("/update/:id", requirePermission("edit_products"), update);
router.delete("/delete/:id", requirePermission("delete_products"), destroy);

module.exports = router;
