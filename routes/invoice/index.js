"use strict";

const express = require("express");
const { getAll, getOne } = require("../../controllers/invoice");
const router = express.Router();

router.get("/all", getAll);
router.get("/:id", getOne);

module.exports = router;
