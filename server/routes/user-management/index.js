const express = require("express");
const {create, getAll, getOne, update, destroy} = require("../../controllers/user-management");
const { requirePermission } = require("../../middleware/authorize");

const router = express.Router();

router.post("/create", requirePermission("create_users"), create);
router.get("/all", requirePermission("view_users"), getAll);
router.get("/:id", requirePermission("view_users"), getOne);
router.put("/update/:id", requirePermission("edit_users"), update);
router.delete("/delete/:id", requirePermission("delete_users"), destroy);

module.exports = router;
