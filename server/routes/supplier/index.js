const express = require("express");
const {create, getAll, getOne, update, destroy} = require("../../controllers/supplier");
const { requirePermission } = require("../../middleware/authorize");

const router = express.Router();

router.post("/create", requirePermission("create_suppliers"), create);
router.get("/all", requirePermission("view_suppliers"), getAll);
router.get("/:id", requirePermission("view_suppliers"), getOne);
router.put("/update/:id", requirePermission("edit_suppliers"), update);
router.delete("/delete/:id", requirePermission("delete_suppliers"), destroy);

module.exports = router;
