const express = require("express");
const {getAllSupplier, getAllCategory, getAllProduct} = require("../../controllers/common");

const router = express.Router();

router.get("/suppliers", getAllSupplier);
router.get("/categories", getAllCategory);
router.get("/products", getAllProduct);

module.exports = router;
