const express = require("express");
const {create, getAll, getOne, update, destroy, getCostFromPurchaseHistory} = require("../../controllers/product");


const router = express.Router();

router.post("/create", create);
router.get("/all", getAll);
router.get("/:id", getOne);
router.get("/:id/cost-history", getCostFromPurchaseHistory);
router.put("/update/:id", update);
router.delete("/delete/:id", destroy);

module.exports = router;
