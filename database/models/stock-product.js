"use strict";
module.exports = (sequelize, DataTypes) => {
    const ListInStockProduct = sequelize.define("ListInStockProduct", {
        productId: { type: DataTypes.INTEGER, primaryKey: true },
        quantityOnHand: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
    }, { tableName: "list_in_stock_products", timestamps: false });
    return ListInStockProduct;
};
