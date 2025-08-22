"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class SaleItem extends Model {
        static associate(models) {
            SaleItem.belongsTo(models.Sale, { foreignKey: "saleId", as: "sale" });
            SaleItem.belongsTo(models.Product, { foreignKey: "productId", as: "product" });
        }
    }
    SaleItem.init(
        {
            saleId: { type: DataTypes.INTEGER, allowNull: false },
            productId: { type: DataTypes.INTEGER, allowNull: false },
            quantity: { type: DataTypes.DECIMAL(18,2), allowNull: false },
            unitPrice: { type: DataTypes.DECIMAL(18,2), allowNull: false },
            discountAmount: { type: DataTypes.DECIMAL(18,2), allowNull: false, defaultValue: 0 },
            taxPercent: { type: DataTypes.DECIMAL(5,2), allowNull: false, defaultValue: 0 },
            taxAmount: { type: DataTypes.DECIMAL(18,2), allowNull: false, defaultValue: 0 },
            lineTotal: { type: DataTypes.DECIMAL(18,2), allowNull: false, defaultValue: 0 },
        },
        { sequelize, modelName: "SaleItem", tableName: "sale_items" }
    );
    return SaleItem;
};
