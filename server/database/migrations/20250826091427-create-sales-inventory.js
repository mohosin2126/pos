"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // SALES
        await queryInterface.createTable("sales", {
            id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
            referenceNo: { type: Sequelize.STRING(64), allowNull: true, unique: true },
            saleDate: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },

            status: {
                type: Sequelize.ENUM("draft", "completed", "cancelled"),
                allowNull: false,
                defaultValue: "completed",
            },

            // Order-level discount/tax/shipping
            discountType: {
                type: Sequelize.ENUM("none", "percent", "fixed"),
                allowNull: false,
                defaultValue: "none",
            },
            discountAmount: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
            orderTaxPercent: { type: Sequelize.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
            orderTaxAmount: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
            shippingCharge: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },

            // Computed totals
            totalItems: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
            netTotalAmount: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
            totalAmount: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
            amountPaid: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
            customerId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: { model: "customers", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },

            // Optional references
            notes: { type: Sequelize.TEXT, allowNull: true },
            meta: { type: Sequelize.JSON, allowNull: true },

            createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
            updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
        });
        await queryInterface.addIndex("sales", ["saleDate"]);
        await queryInterface.addIndex("sales", ["status"]);

        // SALE ITEMS
        await queryInterface.createTable("sale_items", {
            id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
            saleId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: "sales", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            productId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: "products", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "RESTRICT",
            },

            quantity: { type: Sequelize.DECIMAL(18, 2), allowNull: false },
            unitPrice: { type: Sequelize.DECIMAL(18, 2), allowNull: false },

            discountType: {
                type: Sequelize.ENUM("none", "percent", "fixed"),
                allowNull: false,
                defaultValue: "none",
            },
            discountAmount: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },

            taxPercent: { type: Sequelize.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
            taxAmount: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },

            lineTotal: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },

            // FEFO allocations [{expiryDate: 'YYYY-MM-DD'|null, qty: number}]
            allocations: { type: Sequelize.JSON, allowNull: true },

            createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
            updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
        });
        await queryInterface.addIndex("sale_items", ["saleId"]);
        await queryInterface.addIndex("sale_items", ["productId"]);

        // STOCK SUMMARY (canonical store)
        await queryInterface.createTable("stock_summaries", {
            productId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                references: { model: "products", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            quantityOnHand: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
            unexpiredQty:   { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
            expiredQty:     { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
            reorderPoint:   { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 5 },
            lastComputedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
        });

        // LIST TABLES (materialized subsets for fast reads)
        await queryInterface.createTable("list_in_stock_products", {
            productId: { type: Sequelize.INTEGER, primaryKey: true },
            quantityOnHand: { type: Sequelize.DECIMAL(18, 2), allowNull: false },
        });
        await queryInterface.createTable("list_low_stock_products", {
            productId: { type: Sequelize.INTEGER, primaryKey: true },
            quantityOnHand: { type: Sequelize.DECIMAL(18, 2), allowNull: false },
        });
        await queryInterface.createTable("list_expired_products", {
            productId: { type: Sequelize.INTEGER, primaryKey: true },
            expiredQty: { type: Sequelize.DECIMAL(18, 2), allowNull: false },
        });
        await queryInterface.createTable("list_sellable_products", {
            productId: { type: Sequelize.INTEGER, primaryKey: true },
            unexpiredQty: { type: Sequelize.DECIMAL(18, 2), allowNull: false },
        });
        await queryInterface.createTable("list_out_of_stock_products", {
            productId: { type: Sequelize.INTEGER, primaryKey: true },
            quantityOnHand: { type: Sequelize.DECIMAL(18, 2), allowNull: false },
        });
    },

    async down(queryInterface /*, Sequelize */) {
        await queryInterface.dropTable("list_out_of_stock_products");
        await queryInterface.dropTable("list_sellable_products");
        await queryInterface.dropTable("list_expired_products");
        await queryInterface.dropTable("list_low_stock_products");
        await queryInterface.dropTable("list_in_stock_products");
        await queryInterface.dropTable("stock_summaries");
        await queryInterface.dropTable("sale_items");
        await queryInterface.dropTable("sales");
    },
};
