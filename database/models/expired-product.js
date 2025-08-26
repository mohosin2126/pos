"use strict";
module.exports = (sequelize, DataTypes) => {
    const ListExpiredProduct = sequelize.define("ListExpiredProduct", {
        productId: { type: DataTypes.INTEGER, primaryKey: true },
        expiredQty: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
    }, { tableName: "list_expired_products", timestamps: false });
    return ListExpiredProduct;
};
