"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("products", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },

            name: {type: Sequelize.STRING, allowNull: false},
            description: {type: Sequelize.TEXT, allowNull: true},
            categoryId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {model: "categories", key: "id"},
                onUpdate: "CASCADE",
                onDelete: "RESTRICT",
            },
            sku: {type: Sequelize.STRING, allowNull: true, unique: true},
            barcode: {type: Sequelize.STRING, allowNull: true},


            stockQuantity: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 0},
            reorderLevel: {type: Sequelize.INTEGER, allowNull: true},
            isTrackStock: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true},


            imageUrl: {type: Sequelize.STRING, allowNull: true},


            status: {
                type: Sequelize.ENUM("active", "inactive"),
                allowNull: false,
                defaultValue: "active",
            },
            tags: {type: Sequelize.JSON, allowNull: true},
            createdBy: {type: Sequelize.INTEGER, allowNull: true},
            updatedBy: {type: Sequelize.INTEGER, allowNull: true},
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn("NOW"),
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn("NOW"),
            },
        });

        await queryInterface.addIndex("products", ["categoryId"]);
        await queryInterface.addIndex("products", ["status"]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex("products", ["categoryId"]);
        await queryInterface.removeIndex("products", ["status"]);
        await queryInterface.dropTable("products");
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_products_status";');
    },
};
