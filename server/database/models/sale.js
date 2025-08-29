"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Sale extends Model {
        static associate(models) {
            Sale.hasMany(models.SaleItem, { foreignKey: "saleId", as: "items" });
        }
    }

    Sale.init(
        {
            referenceNo: { type: DataTypes.STRING(64), allowNull: true, unique: true },
            saleDate: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },

            status: {
                type: DataTypes.ENUM("draft", "completed", "cancelled"),
                allowNull: false,
                defaultValue: "completed",
            },

            discountType: {
                type: DataTypes.ENUM("none", "percent", "fixed"),
                allowNull: false,
                defaultValue: "none",
            },
            discountAmount: { type: DataTypes.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
            orderTaxPercent: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
            orderTaxAmount: { type: DataTypes.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
            shippingCharge: { type: DataTypes.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },

            totalItems: { type: DataTypes.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
            netTotalAmount: { type: DataTypes.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
            totalAmount: { type: DataTypes.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
            amountPaid: { type: DataTypes.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },

            notes: { type: DataTypes.TEXT, allowNull: true },
            customerId: { type: DataTypes.INTEGER, allowNull: true },
            meta: { type: DataTypes.JSON, allowNull: true },
        },
        { sequelize, modelName: "Sale", tableName: "sales" }
    );

    return Sale;
};
