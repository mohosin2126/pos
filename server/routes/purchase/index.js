const express = require("express");
const { create, getAll, getOne, update, destroy, approvePO, createReturn, getReturns } = require("../../controllers/purchase");

const router = express.Router();

router.post("/create", create);
router.get("/all", getAll);
router.get("/:id", getOne);
router.put("/update/:id", update);
router.delete("/delete/:id", destroy);

router.post("/:id/approve-po", approvePO);
router.post("/:id/return", createReturn);
router.get("/:purchaseId/returns", getReturns);

module.exports = router;
