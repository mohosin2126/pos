"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const tableOpts = { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_unicode_ci" };

        await queryInterface.createTable(
            "customers",
            {
                id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
                name: { type: Sequelize.STRING(128), allowNull: false },
                phone: { type: Sequelize.STRING(32), allowNull: true, unique: true },
                email: { type: Sequelize.STRING(128), allowNull: true, unique: true },
                address: { type: Sequelize.TEXT, allowNull: true },
                status: { type: Sequelize.ENUM("active", "inactive"), allowNull: false, defaultValue: "active" },
                notes: { type: Sequelize.TEXT, allowNull: true },
                createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
                updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
            },
            tableOpts
        );
        await queryInterface.addConstraint("sales", {
            fields: ["customerId"],
            type: "foreign key",
            name: "fk_sales_customer",
            references: { table: "customers", field: "id" },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        });
    },

    async down(queryInterface /*, Sequelize */) {
        try {
            await queryInterface.removeConstraint("sales", "fk_sales_customer");
        } catch (e) {
        }
        await queryInterface.dropTable("customers");
    },
};
