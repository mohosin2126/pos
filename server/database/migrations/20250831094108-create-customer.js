"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const { DataTypes } = Sequelize;

        await queryInterface.createTable(
            "customers",
            {
                id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
                name: { type: DataTypes.STRING(128), allowNull: false },
                phone: { type: DataTypes.STRING(32), allowNull: true, unique: true },
                email: { type: DataTypes.STRING(128), allowNull: true, unique: true },
                address: { type: DataTypes.TEXT, allowNull: true },
                status: { type: DataTypes.ENUM("active", "inactive"), allowNull: false, defaultValue: "active" },
                notes: { type: DataTypes.TEXT, allowNull: true },
                createdAt: { allowNull: false, type: DataTypes.DATE, defaultValue: Sequelize.fn("NOW") },
                updatedAt: { allowNull: false, type: DataTypes.DATE, defaultValue: Sequelize.fn("NOW") },
            },
            {
                engine: "InnoDB",
                charset: "utf8mb4",
                collate: "utf8mb4_unicode_ci",
            }
        );
    },

    async down(queryInterface) {
        await queryInterface.dropTable("customers");
    },
};
