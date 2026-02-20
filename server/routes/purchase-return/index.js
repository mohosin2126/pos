const express = require("express");
const { getAll, getOne, update, destroy, approveReturn, processRefund, rejectReturn } = require("../../controllers/purchase-return");

const router = express.Router();


router.get("/all", getAll);
router.get("/:id", getOne);
router.put("/:id", update);
router.delete("/:id", destroy);

router.post("/:id/approve", approveReturn);
router.post("/:id/process-refund", processRefund);
router.post("/:id/reject", rejectReturn);

module.exports = router;
