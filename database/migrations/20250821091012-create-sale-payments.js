"use strict";
module.exports = {
  async up(q, Sequelize) {
    await q.createTable("sale_payments", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },

      saleId: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: "sales", key: "id" },
        onUpdate: "CASCADE", onDelete: "CASCADE"
      },

      paymentDate: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      amount: { type: Sequelize.DECIMAL(18,2), allowNull: false, defaultValue: 0 },
      method: { type: Sequelize.ENUM("cash","card","mobile","bank","other"), allowNull: false, defaultValue: "cash" },
      referenceNo: { type: Sequelize.STRING(64), allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },

      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
    });

    await q.addIndex("sale_payments", ["saleId"]);
    await q.addIndex("sale_payments", ["paymentDate"]);
    await q.addIndex("sale_payments", ["method"]);
  },

  async down(q) {
    await q.removeIndex("sale_payments", ["method"]);
    await q.removeIndex("sale_payments", ["paymentDate"]);
    await q.removeIndex("sale_payments", ["saleId"]);
    await q.dropTable("sale_payments");
  },
};
