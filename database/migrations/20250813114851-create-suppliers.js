"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("suppliers", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      supplierCode: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      companyName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      contactPersonName: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      address: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      state: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      postalCode: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      country: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      website: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      taxId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      bankDetails: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      paymentTerms: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      status: {
        type: Sequelize.ENUM("active", "inactive"),
        allowNull: false,
        defaultValue: "active",
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal(
            "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });

    await queryInterface.addIndex("suppliers", ["companyName"]);
    await queryInterface.addIndex("suppliers", ["email"]);
    await queryInterface.addIndex("suppliers", ["status"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("suppliers");
  },
};
