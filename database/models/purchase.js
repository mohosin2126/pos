"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Purchase extends Model {
        static associate(models) {
            Purchase.belongsTo(models.Supplier, {
                foreignKey: "supplierId",
                as: "supplier",
            });
            Purchase.belongsTo(models.Product, {
                foreignKey: "productId",
                as: "product",
            });
        }
    }

    Purchase.init(
        {
            supplierId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: "suppliers", key: "id" },
            },
            supplierAddress: { type: DataTypes.STRING(500), allowNull: true },

            referenceNo: { type: DataTypes.STRING(64), allowNull: true, unique: true },
            purchaseDate: { type: DataTypes.DATE, allowNull: false },
            status: {
                type: DataTypes.ENUM("draft", "ordered", "received", "partial", "cancelled"),
                allowNull: false,
                defaultValue: "ordered",
            },

            productId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: "products", key: "id" },
            },

            payTermValue: { type: DataTypes.INTEGER, allowNull: true },
            payTermUnit: { type: DataTypes.ENUM("days", "months"), allowNull: true },

            discountType: {
                type: DataTypes.ENUM("none", "percent", "fixed"),
                allowNull: false,
                defaultValue: "none",
            },
            discountAmount: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
            orderTaxPercent: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
            orderTaxAmount: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
            shippingCharge: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
            additionalExpenses: { type: DataTypes.JSON, allowNull: true },

            totalItems: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
            netTotalAmount: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
            totalAmount: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
            amountPaid: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },

            notes: { type: DataTypes.TEXT, allowNull: true },
            shippingDetails: { type: DataTypes.TEXT, allowNull: true },

            warrantyValue: { type: DataTypes.INTEGER, allowNull: true },
            warrantyUnit: { type: DataTypes.ENUM("months", "years"), allowNull: true },
            expiryDate: { type: DataTypes.DATE, allowNull: true },
        },
        {
            sequelize,
            modelName: "Purchase",
            tableName: "purchases",
            validate: {
                warrantyNonNegative() {
                    if (this.warrantyValue != null && this.warrantyValue < 0) {
                        throw new Error("warrantyValue cannot be negative");
                    }
                },
            },
        }
    );

    const ensureActiveProduct = async (purchase) => {
        if (!purchase.productId) {
            throw new Error("productId is required");
        }
        const { Product } = sequelize.models;

        const product = await Product.findByPk(purchase.productId);
        if (!product) {
            throw new Error("Invalid productId: product not found");
        }
        if (product.status !== "active") {
            throw new Error("Purchase requires an active product");
        }
    };

    Purchase.addHook("beforeCreate", ensureActiveProduct);
    Purchase.addHook("beforeUpdate", async (purchase) => {
        if (purchase.changed("productId")) {
            await ensureActiveProduct(purchase);
        }
    });

    return Purchase;
};
