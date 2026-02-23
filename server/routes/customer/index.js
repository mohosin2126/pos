"use strict";

const express = require("express");
const { getAll, getOne } = require("../../controllers/customer");
const { requirePermission } = require("../../middleware/authorize");
const router = express.Router();

router.get("/all", requirePermission("view_customers"), getAll);
router.get("/:id", requirePermission("view_customers"), getOne);

module.exports = router;
