"use strict";

module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable("customers", {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(128), allowNull: false },
      phone: { type: DataTypes.STRING(32), allowNull: true, unique: true },
      email: { type: DataTypes.STRING(128), allowNull: true, unique: true },
      address: { type: DataTypes.TEXT, allowNull: true },
      status: { type: DataTypes.ENUM("active","inactive"), allowNull: false, defaultValue: "active" },
      notes: { type: DataTypes.TEXT, allowNull: true },

      createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("customers");
  }
};
