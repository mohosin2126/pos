"use strict";

const {Model} = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Product extends Model {
        static associate(models) {
            Product.belongsTo(models.Category, {
                foreignKey: "categoryId",
                as: "category",
            });
        }
    }

    Product.init(
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            categoryId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {model: "categories", key: "id"},
            },
            sku: {
                type: DataTypes.STRING,
                allowNull: true,
                unique: true,
            },
            barcode: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            price: {
                type: DataTypes.DECIMAL(18, 2),
                allowNull: false,
                defaultValue: 0
            },
            stockQuantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            reorderLevel: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            isTrackStock: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            imageUrl: {
                type: DataTypes.STRING,
                allowNull: true,
                validate: {isUrl: true},
            },
            status: {
                type: DataTypes.ENUM("active", "inactive"),
                allowNull: false,
                defaultValue: "active",
            },
            tags: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            createdBy: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            updatedBy: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: "Product",
            tableName: "products",
            indexes: [
                {fields: ["categoryId"]},
                {unique: true, fields: ["sku"]},
                {fields: ["status"]},
            ],
        }
    );

    return Product;
};