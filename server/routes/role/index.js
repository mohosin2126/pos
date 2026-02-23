const express = require("express");
const {create, getAll, getOne, update, destroy, getPermissions} = require("../../controllers/role");
const { requirePermission } = require("../../middleware/authorize");

const router = express.Router();

router.get("/permissions", requirePermission("view_roles"), getPermissions);
router.post("/create", requirePermission("create_roles"), create);
router.get("/all", requirePermission("view_roles"), getAll);
router.get("/:id", requirePermission("view_roles"), getOne);
router.put("/update/:id", requirePermission("edit_roles"), update);
router.delete("/delete/:id", requirePermission("delete_roles"), destroy);

module.exports = router;
