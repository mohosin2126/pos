"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(q, Sequelize) {
    await q.createTable("sales", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },

      invoiceNo: { type: Sequelize.STRING(64), allowNull: true, unique: true },
      saleDate: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },

      billerName: { type: Sequelize.STRING(128), allowNull: true },
      customerName: { type: Sequelize.STRING(128), allowNull: true },
      customerPhone: { type: Sequelize.STRING(32), allowNull: true },

      status: {
        type: Sequelize.ENUM("draft", "completed", "cancelled", "returned"),
        allowNull: false,
        defaultValue: "completed",
      },
      paymentStatus: {
        type: Sequelize.ENUM("unpaid", "partial", "paid", "overpaid"),
        allowNull: false,
        defaultValue: "unpaid",
      },

      subTotal: { type: Sequelize.DECIMAL(18,2), allowNull: false, defaultValue: 0 },
      discountType: { type: Sequelize.ENUM("none","percent","fixed"), allowNull: false, defaultValue: "none" },
      discountAmount: { type: Sequelize.DECIMAL(18,2), allowNull: false, defaultValue: 0 },
      orderTaxPercent: { type: Sequelize.DECIMAL(5,2), allowNull: false, defaultValue: 0 },
      orderTaxAmount: { type: Sequelize.DECIMAL(18,2), allowNull: false, defaultValue: 0 },
      shippingCharge: { type: Sequelize.DECIMAL(18,2), allowNull: false, defaultValue: 0 },

      totalAmount: { type: Sequelize.DECIMAL(18,2), allowNull: false, defaultValue: 0 },
      amountPaid:  { type: Sequelize.DECIMAL(18,2), allowNull: false, defaultValue: 0 },
      changeDue:   { type: Sequelize.DECIMAL(18,2), allowNull: false, defaultValue: 0 },

      notes: { type: Sequelize.TEXT, allowNull: true },

      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
    });

    await q.addIndex("sales", ["saleDate"]);
    await q.addIndex("sales", ["paymentStatus"]);
    await q.addIndex("sales", ["status"]);
  },

  async down(q) {
    await q.removeIndex("sales", ["status"]);
    await q.removeIndex("sales", ["paymentStatus"]);
    await q.removeIndex("sales", ["saleDate"]);
    await q.dropTable("sales");
  },
};
