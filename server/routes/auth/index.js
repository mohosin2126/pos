"use strict";

const { Router } = require("express");
const {login, getProfile, logout} = require("../../controllers/auth");
const requireAuth = require("../../middleware/authenticate");
const router = Router();


router.post("/login", login);
router.get("/profile", requireAuth, getProfile);
router.post("/logout", requireAuth, logout);

module.exports = router;
