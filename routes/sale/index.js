const express = require("express");
const router = express.Router();
const {create,getAll,getOne}=require("../../controllers/sales");

router.post("/create", create);
router.get("/all", getAll);
router.get("/:id",getOne);

module.exports = router;
