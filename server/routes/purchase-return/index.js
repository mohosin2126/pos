const express = require("express");
const { getAll, getOne, update, destroy, approveReturn, processRefund, rejectReturn } = require("../../controllers/purchase-return");
const { requirePermission } = require("../../middleware/authorize");

const router = express.Router();

router.get("/all", requirePermission("view_purchase_returns"), getAll);
router.get("/:id", requirePermission("view_purchase_returns"), getOne);
router.put("/:id", requirePermission("edit_purchase_returns"), update);
router.delete("/:id", requirePermission("delete_purchase_returns"), destroy);

router.post("/:id/approve", requirePermission("edit_purchase_returns"), approveReturn);
router.post("/:id/process-refund", requirePermission("edit_purchase_returns"), processRefund);
router.post("/:id/reject", requirePermission("edit_purchase_returns"), rejectReturn);

module.exports = router;
