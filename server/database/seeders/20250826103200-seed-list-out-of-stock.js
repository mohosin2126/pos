'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('list_out_of_stock_products', [], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('list_out_of_stock_products', {}, {});
  }
};
