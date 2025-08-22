"use strict";
module.exports = {
  async up(q, Sequelize) {
    await q.createTable("sale_items", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },

      saleId: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: "sales", key: "id" },
        onUpdate: "CASCADE", onDelete: "CASCADE"
      },
      productId: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: "products", key: "id" },
        onUpdate: "CASCADE", onDelete: "RESTRICT"
      },

      quantity: { type: Sequelize.DECIMAL(18,2), allowNull: false },
      unitPrice:{ type: Sequelize.DECIMAL(18,2), allowNull: false },
      discountAmount:{ type: Sequelize.DECIMAL(18,2), allowNull: false, defaultValue: 0 },
      taxPercent:{ type: Sequelize.DECIMAL(5,2), allowNull: false, defaultValue: 0 },
      taxAmount: { type: Sequelize.DECIMAL(18,2), allowNull: false, defaultValue: 0 },

      lineTotal: { type: Sequelize.DECIMAL(18,2), allowNull: false, defaultValue: 0 },

      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
    });

    await q.addConstraint("sale_items", {
      fields: ["saleId","productId"], type: "unique",
      name: "uq_sale_items_sale_product"
    });

    await q.addIndex("sale_items", ["saleId"]);
    await q.addIndex("sale_items", ["productId"]);
  },

  async down(q) {
    await q.removeConstraint("sale_items", "uq_sale_items_sale_product");
    await q.removeIndex("sale_items", ["productId"]);
    await q.removeIndex("sale_items", ["saleId"]);
    await q.dropTable("sale_items");
  },
};
