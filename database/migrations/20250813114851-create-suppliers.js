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

      // Unique company code (e.g., SUP-0001)
      supplierCode: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },

      companyName: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      contactPersonName: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },

      email: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      phone: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },

      address: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      state: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      postalCode: {
        type: Sequelize.STRING(30),
        allowNull: true,
      },
      country: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },

      website: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },

      // Finance & compliance
      taxId: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      bankDetails: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      paymentTerms: {
        type: Sequelize.STRING(50), // e.g., "Net 30"
        allowNull: true,
      },

      status: {
        type: Sequelize.ENUM("active", "inactive"),
        allowNull: false,
        defaultValue: "active",
      },

      // Timestamps
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
