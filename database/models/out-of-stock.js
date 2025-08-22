"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class OutOfStockProductView extends Model {}
    OutOfStockProductView.init(
        {
            productId: { type: DataTypes.INTEGER, primaryKey: true },
            productName: DataTypes.STRING,
        },
        { sequelize, modelName: "OutOfStockProductView", tableName: "v_out_of_stock_products", timestamps: false }
    );
    return OutOfStockProductView;
};
