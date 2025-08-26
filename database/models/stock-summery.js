"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class StockSummary extends Model {}

    StockSummary.init(
        {
            productId: { type: DataTypes.INTEGER, primaryKey: true },
            quantityOnHand: { type: DataTypes.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
            unexpiredQty:   { type: DataTypes.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
            expiredQty:     { type: DataTypes.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
            reorderPoint:   { type: DataTypes.DECIMAL(18, 2), allowNull: false, defaultValue: 5 },
            lastComputedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        },
        { sequelize, modelName: "StockSummary", tableName: "stock_summaries", timestamps: false }
    );

    return StockSummary;
};
