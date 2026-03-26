"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Purchase extends Model {
        static associate(models) {
            Purchase.belongsTo(models.Supplier, { foreignKey: "supplierId", as: "supplier" });
            Purchase.hasMany(models.PurchaseItem, { foreignKey: "purchaseId", as: "items" });
            Purchase.hasMany(models.PurchaseReturn, { foreignKey: "purchaseId", as: "returns" });
        }
    }

    Purchase.init(
        {
            supplierId: { type: DataTypes.INTEGER, allowNull: false },
            supplierAddress: { type: DataTypes.STRING(500), allowNull: true },

            referenceNo: { type: DataTypes.STRING(64), allowNull: true, unique: true },
            purchaseDate: { type: DataTypes.DATE, allowNull: false },
            status: {
                type: DataTypes.ENUM(
                    "draft",
                    "po",
                    "ordered",
                    "purchase",
                    "received",
                    "partial",
                    "partial_return",
                    "full_return",
                    "cancelled"
                ),
                allowNull: false,
                defaultValue: "draft",
            },

            payTermValue: { type: DataTypes.INTEGER, allowNull: true },
            payTermUnit: { type: DataTypes.ENUM("days", "months"), allowNull: true },

            discountType: { type: DataTypes.ENUM("none", "percent", "fixed"), allowNull: false, defaultValue: "none" },
            discountAmount: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
            orderTaxPercent: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
            orderTaxAmount: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
            shippingCharge: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
            additionalExpenses: { type: DataTypes.JSON, allowNull: true },

            totalItems: { type: DataTypes.INTEGER, defaultValue: 0 },
            netTotalAmount: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
            totalAmount: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
            amountPaid: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },

            notes: { type: DataTypes.TEXT, allowNull: true },
            shippingDetails: { type: DataTypes.TEXT, allowNull: true },

            warrantyValue: { type: DataTypes.INTEGER, allowNull: true },
            warrantyUnit:  { type: DataTypes.ENUM("months", "years"), allowNull: true },
            expiryDate:    { type: DataTypes.DATE, allowNull: true },
        },
        {
            sequelize,
            modelName: "Purchase",
            tableName: "purchases",
            validate: {
                warrantyNonNegative() {
                    if (this.warrantyValue != null && this.warrantyValue < 0) {
                        throw new Error("warrantyValue cannot be negative");
                    }
                },
                amountsNonNegative() {
                    if (this.discountAmount < 0) throw new Error("Discount amount cannot be negative");
                    if (this.orderTaxAmount < 0) throw new Error("Order tax amount cannot be negative");
                    if (this.shippingCharge < 0) throw new Error("Shipping charge cannot be negative");
                    if (this.netTotalAmount < 0) throw new Error("Net total amount cannot be negative");
                    if (this.totalAmount < 0) throw new Error("Total amount cannot be negative");
                    if (this.amountPaid < 0) throw new Error("Amount paid cannot be negative");
                },
            },
        }
    );

    return Purchase;
};
