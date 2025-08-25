"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class InventoryStockSummary extends Model {
        static associate(models) {
            InventoryStockSummary.belongsTo(models.Purchase, {
                foreignKey: "purchaseId",
                as: "purchase",
            });
        }
    }
    InventoryStockSummary.init(
        {
            purchaseId: { type: DataTypes.INTEGER, primaryKey: true },
            nonExpiredQty: { type: DataTypes.DECIMAL(18,2), allowNull: false, defaultValue: 0 },
            expiredQty: { type: DataTypes.DECIMAL(18,2), allowNull: false, defaultValue: 0 },
            totalQty: { type: DataTypes.DECIMAL(18,2), allowNull: false, defaultValue: 0 },
        },
        {
            sequelize,
            modelName: "InventoryStockSummary",
            tableName: "inventory_stock_summary",
            timestamps: false
        }
    );
    return InventoryStockSummary;
};
