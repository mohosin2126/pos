const express = require("express");
const { getSummary } = require("../../controllers/dashboard");
const { requirePermission } = require("../../middleware/authorize");

const router = express.Router();

router.get("/summary", requirePermission("view_dashboard"), getSummary);

module.exports = router;
