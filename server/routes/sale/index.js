const express = require("express");
const router = express.Router();
const {create,getAll,getOne}=require("../../controllers/sales");
const { requirePermission } = require("../../middleware/authorize");

router.post("/create", requirePermission("create_sales"), create);
router.get("/all", requirePermission("view_sales"), getAll);
router.get("/:id", requirePermission("view_sales"), getOne);

module.exports = router;
