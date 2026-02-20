"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        const { DataTypes } = Sequelize;
        const tableOpts = { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_unicode_ci" };

        await queryInterface.createTable(
            "invoices",
            {
                id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

                saleId: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: { model: "sales", key: "id" },
                    onUpdate: "CASCADE",
                    onDelete: "CASCADE",
                },
                customerId: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: { model: "customers", key: "id" },
                    onUpdate: "CASCADE",
                    onDelete: "RESTRICT",
                },

                invoiceNo: { type: DataTypes.STRING(64), allowNull: false, unique: true },
                invoiceDate: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
                dueDate: { type: DataTypes.DATE, allowNull: true },

                subTotal: { type: DataTypes.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
                discountAmount: { type: DataTypes.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
                orderTaxAmount: { type: DataTypes.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
                shippingCharge: { type: DataTypes.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
                totalAmount: { type: DataTypes.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
                amountPaid: { type: DataTypes.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
                balanceDue: { type: DataTypes.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },

                status: { type: DataTypes.ENUM("issued", "paid", "void"), allowNull: false, defaultValue: "issued" },
                notes: { type: DataTypes.TEXT, allowNull: true },

                createdAt: { allowNull: false, type: DataTypes.DATE, defaultValue: Sequelize.fn("NOW") },
                updatedAt: { allowNull: false, type: DataTypes.DATE, defaultValue: Sequelize.fn("NOW") },
            },
            tableOpts
        );

        await queryInterface.addIndex("invoices", ["invoiceNo"]);
        await queryInterface.addIndex("invoices", ["saleId"]);
        await queryInterface.addIndex("invoices", ["customerId"]);
        await queryInterface.addIndex("invoices", ["invoiceDate"]);
    },

    async down(queryInterface /*, Sequelize */) {
        await queryInterface.dropTable("invoices");
    },
};
