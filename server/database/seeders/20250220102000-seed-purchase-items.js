'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const nextYear = new Date(now);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const sixMonths = new Date(now);
    sixMonths.setMonth(sixMonths.getMonth() + 6);
    
    await queryInterface.bulkInsert('purchase_items', [
      {
        id: 1,
        purchaseId: 1,
        productId: 1,
        quantity: 50,
        unitPrice: 18.00,
        lineTotal: 900.00,
        expiryDate: null,
        batchNo: 'BATCH-WM-2026-01',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 2,
        purchaseId: 1,
        productId: 2,
        quantity: 100,
        unitPrice: 8.50,
        lineTotal: 850.00,
        expiryDate: null,
        batchNo: 'BATCH-USBC-2026-01',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 3,
        purchaseId: 1,
        productId: 7,
        quantity: 20,
        unitPrice: 25.00,
        lineTotal: 500.00,
        expiryDate: null,
        batchNo: 'BATCH-PAN-2026-01',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 4,
        purchaseId: 2,
        productId: 3,
        quantity: 30,
        unitPrice: 10.00,
        lineTotal: 300.00,
        expiryDate: null,
        batchNo: 'BATCH-GATS-2026-01',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 5,
        purchaseId: 2,
        productId: 4,
        quantity: 25,
        unitPrice: 28.00,
        lineTotal: 700.00,
        expiryDate: null,
        batchNo: 'BATCH-PYTH-2026-01',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 6,
        purchaseId: 3,
        productId: 5,
        quantity: 100,
        unitPrice: 12.00,
        lineTotal: 1200.00,
        expiryDate: null,
        batchNo: 'BATCH-TSH-2026-01',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 7,
        purchaseId: 3,
        productId: 6,
        quantity: 50,
        unitPrice: 35.00,
        lineTotal: 1750.00,
        expiryDate: null,
        batchNo: 'BATCH-JNS-2026-01',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 8,
        purchaseId: 4,
        productId: 7,
        quantity: 30,
        unitPrice: 22.00,
        lineTotal: 660.00,
        expiryDate: null,
        batchNo: 'BATCH-PAN-2026-02',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 9,
        purchaseId: 4,
        productId: 8,
        quantity: 80,
        unitPrice: 10.00,
        lineTotal: 800.00,
        expiryDate: null,
        batchNo: 'BATCH-SPO-2026-01',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 10,
        purchaseId: 5,
        productId: 9,
        quantity: 40,
        unitPrice: 20.00,
        lineTotal: 800.00,
        expiryDate: null,
        batchNo: 'BATCH-YOGA-2026-01',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 11,
        purchaseId: 5,
        productId: 10,
        quantity: 30,
        unitPrice: 18.00,
        lineTotal: 540.00,
        expiryDate: null,
        batchNo: 'BATCH-BASK-2026-01',
        createdAt: now,
        updatedAt: now
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('purchase_items', {
      batchNo: [
        'BATCH-WM-2026-01', 'BATCH-USBC-2026-01', 'BATCH-PAN-2026-01',
        'BATCH-GATS-2026-01', 'BATCH-PYTH-2026-01', 'BATCH-TSH-2026-01',
        'BATCH-JNS-2026-01', 'BATCH-PAN-2026-02', 'BATCH-SPO-2026-01',
        'BATCH-YOGA-2026-01', 'BATCH-BASK-2026-01'
      ]
    }, {});
  }
};
