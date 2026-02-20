'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const fiveDaysAgo = new Date(now);
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    
    await queryInterface.bulkInsert('purchase_returns', [
      {
        id: 1,
        purchaseId: 1,
        referenceNo: 'PR-2026-001',
        returnDate: twoDaysAgo,
        returnReason: 'damaged',
        returnItems: JSON.stringify([
          { purchaseItemId: 1, productId: 1, quantity: 5, unitPrice: 18.00, lineTotal: 90.00, reason: 'Damaged during shipping' }
        ]),
        totalReturnAmount: 90.00,
        refundAmount: 90.00,
        refundStatus: 'processed',
        notes: 'Items were damaged in transit, full refund issued',
        restockingDisposition: 'discard',
        createdAt: twoDaysAgo,
        updatedAt: twoDaysAgo
      },
      {
        id: 2,
        purchaseId: 2,
        referenceNo: 'PR-2026-002',
        returnDate: fiveDaysAgo,
        returnReason: 'wrong_item',
        returnItems: JSON.stringify([
          { purchaseItemId: 4, productId: 3, quantity: 10, unitPrice: 10.00, lineTotal: 100.00, reason: 'Wrong edition received' }
        ]),
        totalReturnAmount: 100.00,
        refundAmount: 100.00,
        refundStatus: 'approved',
        notes: 'Wrong book edition sent, awaiting refund processing',
        restockingDisposition: 'return_to_supplier',
        createdAt: fiveDaysAgo,
        updatedAt: fiveDaysAgo
      },
      {
        id: 3,
        purchaseId: 3,
        referenceNo: 'PR-2026-003',
        returnDate: now,
        returnReason: 'quality_issue',
        returnItems: JSON.stringify([
          { purchaseItemId: 6, productId: 5, quantity: 15, unitPrice: 12.00, lineTotal: 180.00, reason: 'Fabric defects found' }
        ]),
        totalReturnAmount: 180.00,
        refundAmount: 180.00,
        refundStatus: 'pending',
        notes: 'Quality control failure, return initiated',
        restockingDisposition: 'restock_with_discount',
        createdAt: now,
        updatedAt: now
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('purchase_returns', {
      referenceNo: ['PR-2026-001', 'PR-2026-002', 'PR-2026-003']
    }, {});
  }
};
