const express = require("express");
const { create, getAll, getOne, update, destroy, approvePO, createReturn, getReturns } = require("../../controllers/purchase");
const { requirePermission } = require("../../middleware/authorize");

const router = express.Router();

router.post("/create", requirePermission("create_purchases"), create);
router.get("/all", requirePermission("view_purchases"), getAll);
router.get("/:id", requirePermission("view_purchases"), getOne);
router.put("/update/:id", requirePermission("edit_purchases"), update);
router.delete("/delete/:id", requirePermission("delete_purchases"), destroy);

router.post("/:id/approve-po", requirePermission("edit_purchases"), approvePO);
router.post("/:id/return", requirePermission("create_purchase_returns"), createReturn);
router.get("/:purchaseId/returns", requirePermission("view_purchase_returns"), getReturns);

module.exports = router;
