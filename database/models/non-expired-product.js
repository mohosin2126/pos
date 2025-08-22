"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class NonExpiredStockView extends Model {}
    NonExpiredStockView.init(
        {
            productId: { type: DataTypes.INTEGER, primaryKey: true },
            productName: DataTypes.STRING,
            onHandNotExpired: DataTypes.DECIMAL(18,2),
        },
        { sequelize, modelName: "NonExpiredStockView", tableName: "v_nonexpired_stock", timestamps: false }
    );
    return NonExpiredStockView;
};
