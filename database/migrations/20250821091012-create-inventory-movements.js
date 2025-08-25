"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(q, Sequelize) {
        await q.createTable(
            "inventory_movements",
            {
                id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },

                purchaseId: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: { model: "purchases", key: "id" },
                    onUpdate: "CASCADE",
                    onDelete: "RESTRICT",
                },

                movementType: {
                    type: Sequelize.ENUM("purchase", "sale", "adjustment", "return"),
                    allowNull: false,
                },

                quantity: { type: Sequelize.DECIMAL(18, 2), allowNull: false },

                relatedEntityType: {
                    type: Sequelize.ENUM("Purchase", "Sale", "Manual"),
                    allowNull: true,
                },
                relatedEntityId: { type: Sequelize.INTEGER, allowNull: true },

                lotExpiryDate: { type: Sequelize.DATE, allowNull: true },

                createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
                updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
            },
            {
                engine: "InnoDB",
                charset: "utf8mb4",
                collate: "utf8mb4_unicode_ci",
            }
        );

        await q.addIndex("inventory_movements", ["purchaseId"]);
        await q.addIndex("inventory_movements", ["movementType"]);
        await q.addIndex("inventory_movements", ["lotExpiryDate"]);
    },

    async down(q) {
        await q.removeIndex("inventory_movements", ["lotExpiryDate"]);
        await q.removeIndex("inventory_movements", ["movementType"]);
        await q.removeIndex("inventory_movements", ["purchaseId"]);
        await q.dropTable("inventory_movements");
    },
};
