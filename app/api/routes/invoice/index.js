"use strict";

const express = require("express");
const { getAll, getOne } = require("../../controllers/invoice");
const { requirePermission } = require("../../middleware/authorize");
const router = express.Router();

router.get("/all", requirePermission("view_invoices"), getAll);
router.get("/:id", requirePermission("view_invoices"), getOne);

module.exports = router;
