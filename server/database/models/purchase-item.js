"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class PurchaseItem extends Model {
        static associate(models) {
            PurchaseItem.belongsTo(models.Purchase, { foreignKey: "purchaseId", as: "purchase" });
            PurchaseItem.belongsTo(models.Product,  { foreignKey: "productId",  as: "product"  });
        }
    }

    PurchaseItem.init(
        {
            purchaseId: { type: DataTypes.INTEGER, allowNull: false },
            productId: { type: DataTypes.INTEGER, allowNull: false },

            quantity: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
            unitPrice: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
            lineTotal: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
            expiryDate: { type: DataTypes.DATE, allowNull: true },
            batchNo: { type: DataTypes.STRING(64), allowNull: true },
        },
        {
            sequelize,
            modelName: "PurchaseItem",
            tableName: "purchase_items",
            validate: {
                quantityPositive() {
                    if (this.quantity <= 0) {
                        throw new Error("Quantity must be greater than 0");
                    }
                },
                priceNonNegative() {
                    if (this.unitPrice < 0) {
                        throw new Error("Unit price cannot be negative");
                    }
                },
                lineTotalValid() {
                    const expected = parseFloat(this.quantity) * parseFloat(this.unitPrice);
                    if (Math.abs(parseFloat(this.lineTotal) - expected) > 0.01) {
                        throw new Error("Line total must equal quantity * unitPrice");
                    }
                },
            },
        }
    );

    return PurchaseItem;
};
