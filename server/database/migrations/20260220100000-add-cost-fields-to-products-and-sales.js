"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("products", "lastCost", {
            type: Sequelize.DECIMAL(18, 2),
            allowNull: true,
            defaultValue: null,
            comment: "Cost from the most recent purchase",
        });

        await queryInterface.addColumn("products", "avgCost", {
            type: Sequelize.DECIMAL(18, 2),
            allowNull: true,
            defaultValue: null,
            comment: "Weighted average cost of all purchases",
        });

        await queryInterface.addColumn("sale_items", "costPrice", {
            type: Sequelize.DECIMAL(18, 2),
            allowNull: true,
            defaultValue: null,
            comment: "Cost price at time of sale for profit tracking",
        });

        await queryInterface.addIndex("products", ["avgCost"], {
            name: "idx_products_avg_cost",
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex("products", "idx_products_avg_cost");
        await queryInterface.removeColumn("sale_items", "costPrice");
        await queryInterface.removeColumn("products", "avgCost");
        await queryInterface.removeColumn("products", "lastCost");
    },
};
