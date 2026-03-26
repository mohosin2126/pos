"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("purchases", {
            id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },

            supplierId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: "suppliers", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "RESTRICT",
            },
            supplierAddress: { type: Sequelize.STRING(500), allowNull: true },

            referenceNo: { type: Sequelize.STRING(64), allowNull: true, unique: true },
            purchaseDate: { type: Sequelize.DATE, allowNull: false },

            status: {
                type: Sequelize.ENUM(
                    "draft",
                    "po",
                    "ordered",
                    "purchase",
                    "received",
                    "partial",
                    "partial_return",
                    "full_return",
                    "cancelled"
                ),
                allowNull: false,
                defaultValue: "draft",
            },

            payTermValue: { type: Sequelize.INTEGER, allowNull: true },
            payTermUnit: { type: Sequelize.ENUM("days", "months"), allowNull: true },

            discountType: {
                type: Sequelize.ENUM("none", "percent", "fixed"),
                allowNull: false,
                defaultValue: "none",
            },
            discountAmount: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
            orderTaxPercent: { type: Sequelize.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
            orderTaxAmount: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
            shippingCharge: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
            additionalExpenses: { type: Sequelize.JSON, allowNull: true },

            totalItems: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
            netTotalAmount: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
            totalAmount: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
            amountPaid: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },

            notes: { type: Sequelize.TEXT, allowNull: true },
            shippingDetails: { type: Sequelize.TEXT, allowNull: true },

            warrantyValue: { type: Sequelize.INTEGER, allowNull: true },
            warrantyUnit:  { type: Sequelize.ENUM("months", "years"), allowNull: true },
            expiryDate:    { type: Sequelize.DATE, allowNull: true },

            createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
            updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
        });

        await queryInterface.addIndex("purchases", ["supplierId"]);
        await queryInterface.addIndex("purchases", ["status"]);
        await queryInterface.addIndex("purchases", ["purchaseDate"]);
        await queryInterface.addIndex("purchases", ["expiryDate"]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex("purchases", ["expiryDate"]);
        await queryInterface.removeIndex("purchases", ["purchaseDate"]);
        await queryInterface.removeIndex("purchases", ["status"]);
        await queryInterface.removeIndex("purchases", ["supplierId"]);
        await queryInterface.dropTable("purchases");

        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_purchases_status";');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_purchases_discountType";');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_purchases_payTermUnit";');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_purchases_warrantyUnit";');
    },
};