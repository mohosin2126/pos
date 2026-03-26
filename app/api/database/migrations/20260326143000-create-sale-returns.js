"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("sale_returns", {
            id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
            saleId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: "sales", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "RESTRICT",
            },
            invoiceId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: { model: "invoices", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },
            referenceNo: { type: Sequelize.STRING(64), allowNull: true, unique: true },
            returnDate: { type: Sequelize.DATE, allowNull: false },
            returnReason: {
                type: Sequelize.ENUM(
                    "defective",
                    "overstock",
                    "expired",
                    "quality_issue",
                    "wrong_item",
                    "customer_request",
                    "other"
                ),
                allowNull: false,
            },
            returnItems: {
                type: Sequelize.JSON,
                allowNull: false,
                defaultValue: [],
                comment: "Array of {saleItemId, productId, quantity, taxAmount, lineTotal, allocations}",
            },
            totalReturnAmount: { type: Sequelize.DECIMAL(18, 2), allowNull: false },
            refundAmount: { type: Sequelize.DECIMAL(18, 2), allowNull: true },
            refundStatus: {
                type: Sequelize.ENUM("pending", "approved", "refunded", "rejected"),
                allowNull: false,
                defaultValue: "pending",
            },
            notes: { type: Sequelize.TEXT, allowNull: true },
            restockingDisposition: {
                type: Sequelize.ENUM("restock", "scrap", "donate", "pending"),
                allowNull: false,
                defaultValue: "pending",
            },
            createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
            updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
        });

        await queryInterface.addIndex("sale_returns", ["saleId"]);
        await queryInterface.addIndex("sale_returns", ["invoiceId"]);
        await queryInterface.addIndex("sale_returns", ["refundStatus"]);
        await queryInterface.addIndex("sale_returns", ["returnDate"]);
    },

    async down(queryInterface) {
        await queryInterface.removeIndex("sale_returns", ["returnDate"]);
        await queryInterface.removeIndex("sale_returns", ["refundStatus"]);
        await queryInterface.removeIndex("sale_returns", ["invoiceId"]);
        await queryInterface.removeIndex("sale_returns", ["saleId"]);
        await queryInterface.dropTable("sale_returns");
    },
};
