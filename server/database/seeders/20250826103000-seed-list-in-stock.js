'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('list_in_stock_products', [
      { productId: 1, quantityOnHand: 47 },
      { productId: 2, quantityOnHand: 95 },
      { productId: 3, quantityOnHand: 27 },
      { productId: 4, quantityOnHand: 25 },
      { productId: 5, quantityOnHand: 96 },
      { productId: 6, quantityOnHand: 48 },
      { productId: 7, quantityOnHand: 48 },
      { productId: 8, quantityOnHand: 79 },
      { productId: 9, quantityOnHand: 37 },
      { productId: 10, quantityOnHand: 28 }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('list_in_stock_products', {
      productId: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    }, {});
  }
};
