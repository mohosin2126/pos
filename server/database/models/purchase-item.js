"use strict";
const { Model } = require("sequelize");
const { validateLineTotal } = require("../../utils/price-calculator");

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

            quantity: { type: DataTypes.INTEGER, allowNull: false },
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
                lineTotalValid() {
                    const result = validateLineTotal(this.quantity, this.unitPrice);
                    if (!result.isValid) {
                        throw new Error(result.error);
                    }
                    const expectedLineTotal = result.lineTotal;
                    const actualLineTotal = parseFloat(this.lineTotal);
                    const diff = Math.abs(actualLineTotal - expectedLineTotal);
                    if (diff > 0.01) {
                        throw new Error(`Line total must equal quantity × unitPrice. Expected ${expectedLineTotal}, got ${actualLineTotal}`);
                    }
                },
            },
        }
    );

    return PurchaseItem;
};
