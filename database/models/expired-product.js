"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class ExpiredOnlyProductView extends Model {}
    ExpiredOnlyProductView.init(
        {
            productId: { type: DataTypes.INTEGER, primaryKey: true },
            productName: DataTypes.STRING,
            expiredOnlyQty: DataTypes.DECIMAL(18,2),
        },
        { sequelize, modelName: "ExpiredOnlyProductView", tableName: "v_expired_only_products", timestamps: false }
    );
    return ExpiredOnlyProductView;
};
