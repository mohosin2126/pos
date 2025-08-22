"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(q, Sequelize) {
    await q.createTable(
        "inventory_movements",
        {
          id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },

          productId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: "products", key: "id" },
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
          // optional but recommended for MySQL
          engine: "InnoDB",
          charset: "utf8mb4",
          collate: "utf8mb4_unicode_ci",
        }
    );

    await q.addIndex("inventory_movements", ["productId"]);
    await q.addIndex("inventory_movements", ["movementType"]);
    await q.addIndex("inventory_movements", ["lotExpiryDate"]);
  },

  async down(q) {
    await q.removeIndex("inventory_movements", ["lotExpiryDate"]);
    await q.removeIndex("inventory_movements", ["movementType"]);
    await q.removeIndex("inventory_movements", ["productId"]);
    await q.dropTable("inventory_movements");
  },
};
