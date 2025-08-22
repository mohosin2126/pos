const {sequelize} = require("../database/models");

const userManagement = require("./user-management");
const roleManagement = require("./role");
const supplierManagement = require("./supplier");
const categoryManagement = require("./category");
const productManagement = require("./product");
const purchaseManagement = require("./purchase");

const saleManagement = require("./sale");
const posManagement = require("./pos");
const inventoryManagement = require("./inventory");

const commonRoutes = require("./common");

module.exports = function registerRoutes(app) {
    app.get("/", (req, res) => {
        res.send("Hello World!");
    });

    app.get("/health", async (req, res) => {
        try {
            await sequelize.authenticate();
            res.status(200).json({status: "ok", db: "connected", time: new Date().toISOString()});
        } catch (e) {
            res.status(500).json({status: "error", error: e.message});
        }
    });

    app.use("/api/v1/admin/user", userManagement);
    app.use("/api/v1/admin/role", roleManagement);
    app.use("/api/v1/admin/supplier", supplierManagement);
    app.use("/api/v1/admin/category", categoryManagement);
    app.use("/api/v1/admin/product", productManagement);
    app.use("/api/v1/admin/purchase", purchaseManagement);
    app.use("/api/v1/admin/sale", saleManagement);
    app.use("/api/v1/admin/pos", posManagement);
    app.use("/api/v1/admin/inventory", inventoryManagement);


    // common routes
    app.use("/api/v1/admin/common", commonRoutes);
};