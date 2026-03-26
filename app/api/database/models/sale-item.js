"use strict";
const { Model } = require("sequelize");
const { calculateItemTotal } = require("../../utils/price-calculator");

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

            quantity: { type: DataTypes.INTEGER, allowNull: false },
            unitPrice: { type: DataTypes.DECIMAL(18, 2), allowNull: false },

            discountType: { type: DataTypes.ENUM("none", "percent", "fixed"), allowNull: false, defaultValue: "none" },
            discountAmount: { type: DataTypes.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },

            taxPercent: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
            taxAmount: { type: DataTypes.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },

            lineTotal: { type: DataTypes.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },

            allocations: { type: DataTypes.JSON, allowNull: true },
        },
        { 
            sequelize, 
            modelName: "SaleItem", 
            tableName: "sale_items",
            validate: {
                lineTotalValid() {
                    const itemCalc = calculateItemTotal({
                        quantity: this.quantity,
                        unitPrice: this.unitPrice,
                        discountType: this.discountType || "none",
                        discountAmount: this.discountAmount || 0,
                        taxPercent: this.taxPercent || 0,
                    });

                    if (!itemCalc.isValid) {
                        throw new Error(`Item calculation error: ${itemCalc.error}`);
                    }

                    const expectedLineTotal = itemCalc.lineTotal;
                    const actualLineTotal = parseFloat(this.lineTotal);
                    const lineDiff = Math.abs(actualLineTotal - expectedLineTotal);
                    if (lineDiff > 0.01) {
                        throw new Error(`Line total mismatch. Expected ${expectedLineTotal}, got ${actualLineTotal}`);
                    }

                    const expectedTaxAmount = itemCalc.tax;
                    const actualTaxAmount = parseFloat(this.taxAmount || 0);
                    const taxDiff = Math.abs(actualTaxAmount - expectedTaxAmount);
                    if (taxDiff > 0.01) {
                        throw new Error(`Tax amount mismatch. Expected ${expectedTaxAmount}, got ${actualTaxAmount}`);
                    }
                },
            },
        }
    );

    return SaleItem;
};
