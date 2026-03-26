const express = require("express");
const router = express.Router();
const {
    approveReturn,
    create,
    destroy,
    getAll,
    getOne,
    processRefund,
    rejectReturn,
    update,
} = require("../../controllers/sale-return");
const { requirePermission } = require("../../middleware/authorize");

router.post("/create", requirePermission("create_sale_returns"), create);
router.get("/all", requirePermission("view_sale_returns"), getAll);
router.get("/:id", requirePermission("view_sale_returns"), getOne);
router.put("/:id", requirePermission("edit_sale_returns"), update);
router.delete("/:id", requirePermission("delete_sale_returns"), destroy);
router.post("/:id/approve", requirePermission("edit_sale_returns"), approveReturn);
router.post("/:id/process-refund", requirePermission("edit_sale_returns"), processRefund);
router.post("/:id/reject", requirePermission("edit_sale_returns"), rejectReturn);

module.exports = router;
