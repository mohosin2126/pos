"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Customer extends Model {
        static associate(models) {
            Customer.hasMany(models.Sale, { foreignKey: "customerId", as: "sales" });
            Customer.hasMany(models.Invoice, { foreignKey: "customerId", as: "invoices" });
        }
    }

    Customer.init(
        {
            name: { type: DataTypes.STRING(128), allowNull: false },
            phone: { type: DataTypes.STRING(32), allowNull: true, unique: true },
            email: { type: DataTypes.STRING(128), allowNull: true, unique: true, validate: { isEmail: true } },
            address: { type: DataTypes.TEXT, allowNull: true },
            status: { type: DataTypes.ENUM("active", "inactive"), allowNull: false, defaultValue: "active" },
            notes: { type: DataTypes.TEXT, allowNull: true },
        },
        { sequelize, modelName: "Customer", tableName: "customers" }
    );

    return Customer;
};
