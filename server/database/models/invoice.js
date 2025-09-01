"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            "invoices",
            {
                id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
                saleId: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: { model: "sales", key: "id" },
                    onUpdate: "CASCADE",
                    onDelete: "CASCADE",
                },
                customerId: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: { model: "customers", key: "id" },
                    onUpdate: "CASCADE",
                    onDelete: "RESTRICT",
                },

                invoiceNo: { type: Sequelize.STRING(64), allowNull: false, unique: true },
                invoiceDate: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
                dueDate: { type: Sequelize.DATE, allowNull: true },

                subTotal: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
                discountAmount: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
                orderTaxAmount: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
                shippingCharge: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
                totalAmount: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
                amountPaid: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
                balanceDue: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },

                status: { type: Sequelize.ENUM("issued", "paid", "void"), allowNull: false, defaultValue: "issued" },
                notes: { type: Sequelize.TEXT, allowNull: true },

                createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
                updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
            },
            { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_unicode_ci" }
        );
    },

    async down(queryInterface) {
        await queryInterface.dropTable("invoices");
    },
};
