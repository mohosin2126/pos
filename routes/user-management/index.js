const express = require("express");
const {create, getAll, getOne, update, destroy} = require("../../controllers/user-management");


const router = express.Router();

router.post("/create", create);
router.get("/all", getAll);
router.get("/:id", getOne);
router.put("/update/:id", update);
router.delete("/delete/:id", destroy);

module.exports = router;
