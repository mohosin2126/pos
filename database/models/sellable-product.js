"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class SellableProductView extends Model {}
    SellableProductView.init(
        {
            productId: { type: DataTypes.INTEGER, primaryKey: true },
            productName: DataTypes.STRING,
            reorderLevel: DataTypes.INTEGER,
            onHandNotExpired: DataTypes.DECIMAL(18,2),
        },
        { sequelize, modelName: "SellableProductView", tableName: "v_sellable_products", timestamps: false }
    );
    return SellableProductView;
};
