"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class SalePayment extends Model {
        static associate(models) {
            SalePayment.belongsTo(models.Sale, { foreignKey: "saleId", as: "sale" });
        }
    }
    SalePayment.init(
        {
            saleId: { type: DataTypes.INTEGER, allowNull: false },
            paymentDate: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
            amount: { type: DataTypes.DECIMAL(18,2), allowNull: false, defaultValue: 0 },
            method: { type: DataTypes.ENUM("cash","card","mobile","bank","other"), allowNull: false, defaultValue: "cash" },
            referenceNo: { type: DataTypes.STRING(64), allowNull: true },
            notes: { type: DataTypes.TEXT, allowNull: true },
        },
        { sequelize, modelName: "SalePayment", tableName: "sale_payments" }
    );
    return SalePayment;
};
