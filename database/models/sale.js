"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Sale extends Model {
        static associate(models) {
            Sale.hasMany(models.SaleItem, { foreignKey: "saleId", as: "items" });
            Sale.hasMany(models.SalePayment, { foreignKey: "saleId", as: "payments" });
            Sale.belongsTo(models.Customer, { foreignKey: "customerId", as: "customer" });
            Sale.hasOne(models.Invoice, { foreignKey: "saleId", as: "invoice" });
        }
    }

    Sale.init(
        {
            customerId: { type: DataTypes.INTEGER, allowNull: true },
            invoiceNo: { type: DataTypes.STRING(64), allowNull: true, unique: true },
            saleDate: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
            billerName: { type: DataTypes.STRING(128), allowNull: true },
            customerName: { type: DataTypes.STRING(128), allowNull: true },
            customerPhone: { type: DataTypes.STRING(32), allowNull: true },
            status: { type: DataTypes.ENUM("draft","completed","cancelled","returned"), allowNull: false, defaultValue: "completed" },
            paymentStatus: { type: DataTypes.ENUM("unpaid","partial","paid","overpaid"), allowNull: false, defaultValue: "unpaid" },
            subTotal: { type: DataTypes.DECIMAL(18,2), allowNull: false, defaultValue: 0 },
            discountType: { type: DataTypes.ENUM("none","percent","fixed"), allowNull: false, defaultValue: "none" },
            discountAmount: { type: DataTypes.DECIMAL(18,2), allowNull: false, defaultValue: 0 },
            orderTaxPercent: { type: DataTypes.DECIMAL(5,2), allowNull: false, defaultValue: 0 },
            orderTaxAmount: { type: DataTypes.DECIMAL(18,2), allowNull: false, defaultValue: 0 },
            shippingCharge: { type: DataTypes.DECIMAL(18,2), allowNull: false, defaultValue: 0 },
            totalAmount: { type: DataTypes.DECIMAL(18,2), allowNull: false, defaultValue: 0 },
            amountPaid: { type: DataTypes.DECIMAL(18,2), allowNull: false, defaultValue: 0 },
            changeDue: { type: DataTypes.DECIMAL(18,2), allowNull: false, defaultValue: 0 },
            notes: { type: DataTypes.TEXT, allowNull: true },
        },
        {
            sequelize,
            modelName: "Sale",
            tableName: "sales",
            indexes: [{ fields: ["customerId"] }],
        }
    );

    return Sale;
};
