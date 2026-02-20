"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("purchase_items", {
            id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },

            purchaseId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: "purchases", key: "id" },
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
            lineTotal: { type: Sequelize.DECIMAL(18, 2), allowNull: false }, 
            expiryDate: { type: Sequelize.DATE, allowNull: true },
            batchNo: { type: Sequelize.STRING(64), allowNull: true },

            createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
            updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
        });

        await queryInterface.addIndex("purchase_items", ["purchaseId"]);
        await queryInterface.addIndex("purchase_items", ["productId"]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex("purchase_items", ["productId"]);
        await queryInterface.removeIndex("purchase_items", ["purchaseId"]);
        await queryInterface.dropTable("purchase_items");
    },
};
