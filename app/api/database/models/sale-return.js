"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class SaleReturn extends Model {
        static associate(models) {
            SaleReturn.belongsTo(models.Sale, { foreignKey: "saleId", as: "sale" });
            SaleReturn.belongsTo(models.Invoice, { foreignKey: "invoiceId", as: "invoice" });
        }
    }

    SaleReturn.init(
        {
            saleId: { type: DataTypes.INTEGER, allowNull: false },
            invoiceId: { type: DataTypes.INTEGER, allowNull: true },
            referenceNo: { type: DataTypes.STRING(64), allowNull: true, unique: true },
            returnDate: { type: DataTypes.DATE, allowNull: false },
            returnReason: {
                type: DataTypes.ENUM(
                    "defective",
                    "overstock",
                    "expired",
                    "quality_issue",
                    "wrong_item",
                    "customer_request",
                    "other"
                ),
                allowNull: false,
            },
            returnItems: {
                type: DataTypes.JSON,
                allowNull: false,
                defaultValue: [],
            },
            totalReturnAmount: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
            refundAmount: { type: DataTypes.DECIMAL(18, 2), allowNull: true },
            refundStatus: {
                type: DataTypes.ENUM("pending", "approved", "refunded", "rejected"),
                allowNull: false,
                defaultValue: "pending",
            },
            notes: { type: DataTypes.TEXT, allowNull: true },
            restockingDisposition: {
                type: DataTypes.ENUM("restock", "scrap", "donate", "pending"),
                allowNull: false,
                defaultValue: "pending",
            },
        },
        {
            sequelize,
            modelName: "SaleReturn",
            tableName: "sale_returns",
            validate: {
                returnAmountPositive() {
                    if (Number(this.totalReturnAmount || 0) <= 0) {
                        throw new Error("Return amount must be greater than 0");
                    }
                },
            },
        }
    );

    return SaleReturn;
};
