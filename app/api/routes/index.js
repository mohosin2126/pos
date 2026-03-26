const {sequelize} = require("../database/models");

const userManagement = require("./user-management");
const roleManagement = require("./role");
const supplierManagement = require("./supplier");
const categoryManagement = require("./category");
const productManagement = require("./product");
const purchaseManagement = require("./purchase");
const purchaseReturnManagement = require("./purchase-return");
const saleManagement = require("./sale");
const saleReturnManagement = require("./sale-return");
const inventoryManagement = require("./inventory");
const customerManagement = require("./customer");
const invoiceManagement = require("./invoice");
const dashboardManagement = require("./dashboard");
const authRoutes = require("./auth");
const commonRoutes = require("./common");
const requireAuth = require("../middleware/authenticate");

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
    app.use("/api/v1/admin", requireAuth);
    app.use("/api/v1/admin/dashboard", dashboardManagement);
    app.use("/api/v1/admin/user", userManagement);
    app.use("/api/v1/admin/role", roleManagement);
    app.use("/api/v1/admin/supplier", supplierManagement);
    app.use("/api/v1/admin/category", categoryManagement);
    app.use("/api/v1/admin/product", productManagement);
    app.use("/api/v1/admin/purchase", purchaseManagement);
    app.use("/api/v1/admin/purchase-return", purchaseReturnManagement);
    app.use("/api/v1/admin/sale", saleManagement);
    app.use("/api/v1/admin/sale-return", saleReturnManagement);
    app.use("/api/v1/admin/inventory", inventoryManagement);
    app.use("/api/v1/admin/customer", customerManagement);
    app.use("/api/v1/admin/invoice",invoiceManagement);
    app.use('/api/v1/auth', authRoutes);
    app.use("/api/v1/admin/common", commonRoutes);
};
