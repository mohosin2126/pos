'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('list_sellable_products', [
      { productId: 1, unexpiredQty: 47 },
      { productId: 2, unexpiredQty: 95 },
      { productId: 3, unexpiredQty: 27 },
      { productId: 4, unexpiredQty: 25 },
      { productId: 5, unexpiredQty: 96 },
      { productId: 6, unexpiredQty: 48 },
      { productId: 7, unexpiredQty: 48 },
      { productId: 8, unexpiredQty: 79 },
      { productId: 9, unexpiredQty: 37 },
      { productId: 10, unexpiredQty: 28 }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('list_sellable_products', {
      productId: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    }, {});
  }
};
