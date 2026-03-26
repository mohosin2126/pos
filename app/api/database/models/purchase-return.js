"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class PurchaseReturn extends Model {
        static associate(models) {
            PurchaseReturn.belongsTo(models.Purchase, { foreignKey: "purchaseId", as: "purchase" });
        }
    }

    PurchaseReturn.init(
        {
            purchaseId: { type: DataTypes.INTEGER, allowNull: false },

            referenceNo: { type: DataTypes.STRING(64), allowNull: true, unique: true },
            returnDate: { type: DataTypes.DATE, allowNull: false },
            returnReason: {
                type: DataTypes.ENUM("defective", "overstock", "expired", "quality_issue", "wrong_item", "other"),
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
            modelName: "PurchaseReturn",
            tableName: "purchase_returns",
            validate: {
                returnAmountPositive() {
                    if (this.totalReturnAmount <= 0) {
                        throw new Error("Return amount must be greater than 0");
                    }
                },
            },
        }
    );

    return PurchaseReturn;
};
