"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class InventoryMovement extends Model {
        static associate(models) {
            InventoryMovement.belongsTo(models.Purchase, {
                foreignKey: "purchaseId",
                as: "purchase"
            });
        }
    }
    InventoryMovement.init(
        {
            purchaseId: { type: DataTypes.INTEGER, allowNull: false },
            movementType: {
                type: DataTypes.ENUM("purchase", "sale", "adjustment", "return"),
                allowNull: false
            },
            quantity: { type: DataTypes.DECIMAL(18,2), allowNull: false },
            relatedEntityType: {
                type: DataTypes.ENUM("Purchase", "Sale", "Manual"),
                allowNull: true
            },
            relatedEntityId: { type: DataTypes.INTEGER, allowNull: true },
            lotExpiryDate: { type: DataTypes.DATE, allowNull: true },
        },
        {
            sequelize,
            modelName: "InventoryMovement",
            tableName: "inventory_movements"
        }
    );
    return InventoryMovement;
};
