"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class LowStockProductView extends Model {}
    LowStockProductView.init(
        {
            productId: { type: DataTypes.INTEGER, primaryKey: true },
            productName: DataTypes.STRING,
            reorderLevel: DataTypes.INTEGER,
            onHandNotExpired: DataTypes.DECIMAL(18,2),
        },
        { sequelize, modelName: "LowStockProductView", tableName: "v_low_stock_products", timestamps: false }
    );
    return LowStockProductView;
};
