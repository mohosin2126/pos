"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class TotalStockView extends Model {}
    TotalStockView.init(
        {
            productId: { type: DataTypes.INTEGER, primaryKey: true },
            productName: DataTypes.STRING,
            onHandAll: DataTypes.DECIMAL(18,2),
        },
        { sequelize, modelName: "TotalStockView", tableName: "v_total_stock", timestamps: false }
    );
    return TotalStockView;
};
