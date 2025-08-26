"use strict";
module.exports = (sequelize, DataTypes) => {
    const ListSellableProduct = sequelize.define("ListSellableProduct", {
        productId: { type: DataTypes.INTEGER, primaryKey: true },
        unexpiredQty: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
    }, { tableName: "list_sellable_products", timestamps: false });
    return ListSellableProduct;
};
