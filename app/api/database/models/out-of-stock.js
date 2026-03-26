"use strict";
module.exports = (sequelize, DataTypes) => {
    const ListOutOfStockProduct = sequelize.define("ListOutOfStockProduct", {
        productId: { type: DataTypes.INTEGER, primaryKey: true },
        quantityOnHand: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
    }, { tableName: "list_out_of_stock_products", timestamps: false });
    return ListOutOfStockProduct;
};
