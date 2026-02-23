const express = require("express");
const {create, getAll, getOne, update, destroy} = require("../../controllers/category");
const { requirePermission } = require("../../middleware/authorize");
const router = express.Router();

router.post("/create", requirePermission("create_categories"), create);
router.get("/all", requirePermission("view_categories"), getAll);
router.get("/:id", requirePermission("view_categories"), getOne);
router.put("/update/:id", requirePermission("edit_categories"), update);
router.delete("/delete/:id", requirePermission("delete_categories"), destroy);

module.exports = router;
