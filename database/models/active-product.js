"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class ActiveProductView extends Model {}
    ActiveProductView.init(
        {
            productId: { type: DataTypes.INTEGER, primaryKey: true },
            productName: DataTypes.STRING,
            status: DataTypes.STRING,
            isTrackStock: DataTypes.BOOLEAN,
            reorderLevel: DataTypes.INTEGER,
        },
        { sequelize, modelName: "ActiveProductView", tableName: "v_active_products", timestamps: false }
    );
    return ActiveProductView;
};
