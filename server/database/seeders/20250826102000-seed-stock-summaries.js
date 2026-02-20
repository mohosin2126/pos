'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    
    await queryInterface.bulkInsert('stock_summaries', [
      {
        productId: 1,
        quantityOnHand: 47,
        unexpiredQty: 47,
        expiredQty: 0,
        reorderPoint: 30,
        lastComputedAt: now
      },
      {
        productId: 2,
        quantityOnHand: 95,
        unexpiredQty: 95,
        expiredQty: 0,
        reorderPoint: 20,
        lastComputedAt: now
      },
      {
        productId: 3,
        quantityOnHand: 27,
        unexpiredQty: 27,
        expiredQty: 0,
        reorderPoint: 10,
        lastComputedAt: now
      },
      {
        productId: 4,
        quantityOnHand: 25,
        unexpiredQty: 25,
        expiredQty: 0,
        reorderPoint: 5,
        lastComputedAt: now
      },
      {
        productId: 5,
        quantityOnHand: 96,
        unexpiredQty: 96,
        expiredQty: 0,
        reorderPoint: 25,
        lastComputedAt: now
      },
      {
        productId: 6,
        quantityOnHand: 48,
        unexpiredQty: 48,
        expiredQty: 0,
        reorderPoint: 15,
        lastComputedAt: now
      },
      {
        productId: 7,
        quantityOnHand: 48,
        unexpiredQty: 48,
        expiredQty: 0,
        reorderPoint: 10,
        lastComputedAt: now
      },
      {
        productId: 8,
        quantityOnHand: 79,
        unexpiredQty: 79,
        expiredQty: 0,
        reorderPoint: 20,
        lastComputedAt: now
      },
      {
        productId: 9,
        quantityOnHand: 37,
        unexpiredQty: 37,
        expiredQty: 0,
        reorderPoint: 15,
        lastComputedAt: now
      },
      {
        productId: 10,
        quantityOnHand: 28,
        unexpiredQty: 28,
        expiredQty: 0,
        reorderPoint: 10,
        lastComputedAt: now
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('stock_summaries', {
      productId: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    }, {});
  }
};
