"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("purchase_returns", {
            id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },

            purchaseId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: "purchases", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "RESTRICT",
            },

            referenceNo: { type: Sequelize.STRING(64), allowNull: true, unique: true },
            returnDate: { type: Sequelize.DATE, allowNull: false },
            returnReason: {
                type: Sequelize.ENUM("defective", "overstock", "expired", "quality_issue", "wrong_item", "other"),
                allowNull: false,
            },

            
            returnItems: {
                type: Sequelize.JSON,
                allowNull: false,
                defaultValue: [],
                comment: "Array of {productId, quantity, lineTotal}",
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

        await queryInterface.addIndex("purchase_returns", ["purchaseId"]);
        await queryInterface.addIndex("purchase_returns", ["refundStatus"]);
        await queryInterface.addIndex("purchase_returns", ["returnDate"]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex("purchase_returns", ["returnDate"]);
        await queryInterface.removeIndex("purchase_returns", ["refundStatus"]);
        await queryInterface.removeIndex("purchase_returns", ["purchaseId"]);
        await queryInterface.dropTable("purchase_returns");

        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_purchase_returns_returnReason";');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_purchase_returns_refundStatus";');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_purchase_returns_restockingDisposition";');
    },
};
