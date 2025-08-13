"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Supplier extends Model {
        static associate(models) {
        }
    }

    Supplier.init(
        {
            supplierCode: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            companyName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            contactPersonName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: true,
                validate: { isEmail: true },
            },
            phone: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            address: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            city: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            state: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            postalCode: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            country: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            website: {
                type: DataTypes.STRING,
                allowNull: true,
                validate: { isUrl: true },
            },
            taxId: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            bankDetails: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            paymentTerms: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            notes: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            status: {
                type: DataTypes.ENUM("active", "inactive"),
                defaultValue: "active",
            },
        },
        {
            sequelize,
            modelName: "Supplier",
            tableName: "suppliers",
        }
    );

    return Supplier;
};
