"use strict";

module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable("invoices", {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

      saleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "sales", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      customerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "customers", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      invoiceNo: { type: DataTypes.STRING(64), allowNull: false, unique: true },
      invoiceDate: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      dueDate: { type: DataTypes.DATE, allowNull: true },

      subTotal: { type: DataTypes.DECIMAL(18,2), allowNull: false, defaultValue: 0 },
      discountAmount: { type: DataTypes.DECIMAL(18,2), allowNull: false, defaultValue: 0 },
      orderTaxAmount: { type: DataTypes.DECIMAL(18,2), allowNull: false, defaultValue: 0 },
      shippingCharge: { type: DataTypes.DECIMAL(18,2), allowNull: false, defaultValue: 0 },
      totalAmount: { type: DataTypes.DECIMAL(18,2), allowNull: false, defaultValue: 0 },
      amountPaid: { type: DataTypes.DECIMAL(18,2), allowNull: false, defaultValue: 0 },
      balanceDue: { type: DataTypes.DECIMAL(18,2), allowNull: false, defaultValue: 0 },

      status: { type: DataTypes.ENUM("issued","paid","void"), allowNull: false, defaultValue: "issued" },
      notes: { type: DataTypes.TEXT, allowNull: true },
      pdfUrl: { type: DataTypes.STRING(255), allowNull: true },

      createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    });

    await queryInterface.addIndex("invoices", ["saleId"]);
    await queryInterface.addIndex("invoices", ["customerId"]);
    await queryInterface.addIndex("invoices", ["invoiceNo"], { unique: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("invoices");
  }
};
