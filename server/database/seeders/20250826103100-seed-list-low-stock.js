'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('list_low_stock_products', [
      { productId: 4, quantityOnHand: 25, reorderPoint: 5 },
      { productId: 3, quantityOnHand: 27, reorderPoint: 10 }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('list_low_stock_products', {
      productId: [3, 4]
    }, {});
  }
};
