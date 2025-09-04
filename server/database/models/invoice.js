"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Invoice extends Model {
        static associate(models) {
            Invoice.belongsTo(models.Sale, { foreignKey: "saleId", as: "sale" });
            Invoice.belongsTo(models.Customer, { foreignKey: "customerId", as: "customer" });
        }
    }

    Invoice.init(
        {
            saleId: { type: DataTypes.INTEGER, allowNull: false },
            customerId: { type: DataTypes.INTEGER, allowNull: false },
            invoiceNo: { type: DataTypes.STRING(64), allowNull: false, unique: true },
            invoiceDate: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
            dueDate: { type: DataTypes.DATE, allowNull: true },
            subTotal: { type: DataTypes.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
            discountAmount: { type: DataTypes.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
            orderTaxAmount: { type: DataTypes.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
            shippingCharge: { type: DataTypes.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
            totalAmount: { type: DataTypes.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
            amountPaid: { type: DataTypes.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
            balanceDue: { type: DataTypes.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
            status: { type: DataTypes.ENUM("issued", "paid", "void"), allowNull: false, defaultValue: "issued" },
            notes: { type: DataTypes.TEXT, allowNull: true },
        },
        { sequelize, modelName: "Invoice", tableName: "invoices" }
    );

    return Invoice;
};
