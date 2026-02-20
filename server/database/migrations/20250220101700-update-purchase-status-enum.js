"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn("purchases", "status", {
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
        });

    
        await queryInterface.changeColumn("purchases", "productId", {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: { model: "products", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn("purchases", "status", {
            type: Sequelize.ENUM("draft", "ordered", "received", "partial", "cancelled"),
            allowNull: false,
            defaultValue: "ordered",
        });

        await queryInterface.changeColumn("purchases", "productId", {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: "products", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        });

        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_purchases_status";');
    },
};
