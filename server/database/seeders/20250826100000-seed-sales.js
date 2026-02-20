'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const threeDaysAgo = new Date(now);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    await queryInterface.bulkInsert('sales', [
      {
        id: 1,
        referenceNo: 'SALE-2026-001',
        saleDate: twoWeeksAgo,
        status: 'completed',
        discountType: 'fixed',
        discountAmount: 10.00,
        orderTaxPercent: 8.50,
        orderTaxAmount: 4.42,
        shippingCharge: 0.00,
        totalItems: 2,
        netTotalAmount: 52.00,
        totalAmount: 56.42,
        amountPaid: 56.42,
        customerId: 1,
        notes: 'Walk-in customer',
        meta: null,
        createdAt: twoWeeksAgo,
        updatedAt: twoWeeksAgo
      },
      {
        id: 2,
        referenceNo: 'SALE-2026-002',
        saleDate: twoWeeksAgo,
        status: 'completed',
        discountType: 'percentage',
        discountAmount: 5.00,
        orderTaxPercent: 8.50,
        orderTaxAmount: 6.29,
        shippingCharge: 5.00,
        totalItems: 3,
        netTotalAmount: 74.00,
        totalAmount: 85.29,
        amountPaid: 85.29,
        customerId: 2,
        notes: 'VIP customer discount applied',
        meta: JSON.stringify({ paymentMethod: 'credit_card' }),
        createdAt: twoWeeksAgo,
        updatedAt: twoWeeksAgo
      },
      {
        id: 3,
        referenceNo: 'SALE-2026-003',
        saleDate: weekAgo,
        status: 'completed',
        discountType: null,
        discountAmount: 0.00,
        orderTaxPercent: 8.50,
        orderTaxAmount: 8.42,
        shippingCharge: 0.00,
        totalItems: 2,
        netTotalAmount: 99.00,
        totalAmount: 107.42,
        amountPaid: 107.42,
        customerId: 3,
        notes: null,
        meta: JSON.stringify({ paymentMethod: 'cash' }),
        createdAt: weekAgo,
        updatedAt: weekAgo
      },
      {
        id: 4,
        referenceNo: 'SALE-2026-004',
        saleDate: weekAgo,
        status: 'completed',
        discountType: 'percentage',
        discountAmount: 10.00,
        orderTaxPercent: 8.50,
        orderTaxAmount: 2.55,
        shippingCharge: 0.00,
        totalItems: 1,
        netTotalAmount: 30.00,
        totalAmount: 32.55,
        amountPaid: 32.55,
        customerId: 5,
        notes: 'Bulk customer discount',
        meta: JSON.stringify({ paymentMethod: 'bank_transfer' }),
        createdAt: weekAgo,
        updatedAt: weekAgo
      },
      {
        id: 5,
        referenceNo: 'SALE-2026-005',
        saleDate: threeDaysAgo,
        status: 'completed',
        discountType: 'fixed',
        discountAmount: 5.00,
        orderTaxPercent: 8.50,
        orderTaxAmount: 3.83,
        shippingCharge: 0.00,
        totalItems: 2,
        netTotalAmount: 45.00,
        totalAmount: 48.83,
        amountPaid: 48.83,
        customerId: 1,
        notes: 'Repeat customer',
        meta: null,
        createdAt: threeDaysAgo,
        updatedAt: threeDaysAgo
      },
      {
        id: 6,
        referenceNo: 'SALE-2026-006',
        saleDate: threeDaysAgo,
        status: 'partially_paid',
        discountType: null,
        discountAmount: 0.00,
        orderTaxPercent: 8.50,
        orderTaxAmount: 10.63,
        shippingCharge: 10.00,
        totalItems: 3,
        netTotalAmount: 125.00,
        totalAmount: 145.63,
        amountPaid: 70.00,
        customerId: 3,
        notes: 'Partial payment, balance due',
        meta: JSON.stringify({ paymentMethod: 'cash', balanceDue: 75.63 }),
        createdAt: threeDaysAgo,
        updatedAt: threeDaysAgo
      },
      {
        id: 7,
        referenceNo: 'SALE-2026-007',
        saleDate: yesterday,
        status: 'completed',
        discountType: 'percentage',
        discountAmount: 8.00,
        orderTaxPercent: 8.50,
        orderTaxAmount: 3.68,
        shippingCharge: 0.00,
        totalItems: 2,
        netTotalAmount: 43.30,
        totalAmount: 46.98,
        amountPaid: 46.98,
        customerId: 2,
        notes: null,
        meta: JSON.stringify({ paymentMethod: 'debit_card' }),
        createdAt: yesterday,
        updatedAt: yesterday
      },
      {
        id: 8,
        referenceNo: 'SALE-2026-008',
        saleDate: yesterday,
        status: 'completed',
        discountType: 'fixed',
        discountAmount: 15.00,
        orderTaxPercent: 8.50,
        orderTaxAmount: 6.38,
        shippingCharge: 5.00,
        totalItems: 2,
        netTotalAmount: 75.00,
        totalAmount: 86.38,
        amountPaid: 86.38,
        customerId: 5,
        notes: 'Wholesale customer order',
        meta: JSON.stringify({ paymentMethod: 'bank_transfer' }),
        createdAt: yesterday,
        updatedAt: yesterday
      },
      {
        id: 9,
        referenceNo: 'SALE-2026-009',
        saleDate: now,
        status: 'pending',
        discountType: null,
        discountAmount: 0.00,
        orderTaxPercent: 8.50,
        orderTaxAmount: 4.25,
        shippingCharge: 0.00,
        totalItems: 2,
        netTotalAmount: 50.00,
        totalAmount: 54.25,
        amountPaid: 0.00,
        customerId: 1,
        notes: 'Order being prepared',
        meta: null,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 10,
        referenceNo: 'SALE-2026-010',
        saleDate: now,
        status: 'completed',
        discountType: 'percentage',
        discountAmount: 5.00,
        orderTaxPercent: 8.50,
        orderTaxAmount: 2.59,
        shippingCharge: 0.00,
        totalItems: 1,
        netTotalAmount: 30.50,
        totalAmount: 33.09,
        amountPaid: 33.09,
        customerId: 3,
        notes: null,
        meta: JSON.stringify({ paymentMethod: 'cash' }),
        createdAt: now,
        updatedAt: now
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('sales', {
      referenceNo: [
        'SALE-2026-001', 'SALE-2026-002', 'SALE-2026-003', 'SALE-2026-004', 'SALE-2026-005',
        'SALE-2026-006', 'SALE-2026-007', 'SALE-2026-008', 'SALE-2026-009', 'SALE-2026-010'
      ]
    }, {});
  }
};
