"use strict";
module.exports = (sequelize, DataTypes) => {
    const ListLowStockProduct = sequelize.define("ListLowStockProduct", {
        productId: { type: DataTypes.INTEGER, primaryKey: true },
        quantityOnHand: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
    }, { tableName: "list_low_stock_products", timestamps: false });
    return ListLowStockProduct;
};
