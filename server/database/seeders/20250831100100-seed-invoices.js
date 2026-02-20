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
    
    const dueSoon = new Date(now);
    dueSoon.setDate(dueSoon.getDate() + 7);
    const dueNextMonth = new Date(now);
    dueNextMonth.setMonth(dueNextMonth.getMonth() + 1);
    const overdue = new Date(now);
    overdue.setDate(overdue.getDate() - 5);
    
    await queryInterface.bulkInsert('invoices', [
      {
        id: 1,
        saleId: 1,
        customerId: 1,
        invoiceNo: 'INV-2026-0001',
        invoiceDate: twoWeeksAgo,
        dueDate: dueSoon,
        subTotal: 52.00,
        discountAmount: 10.00,
        orderTaxAmount: 4.42,
        shippingCharge: 0.00,
        totalAmount: 56.42,
        amountPaid: 56.42,
        balanceDue: 0.00,
        status: 'paid',
        notes: null,
        createdAt: twoWeeksAgo,
        updatedAt: twoWeeksAgo
      },
      {
        id: 2,
        saleId: 2,
        customerId: 2,
        invoiceNo: 'INV-2026-0002',
        invoiceDate: twoWeeksAgo,
        dueDate: dueSoon,
        subTotal: 74.00,
        discountAmount: 5.00,
        orderTaxAmount: 6.29,
        shippingCharge: 5.00,
        totalAmount: 85.29,
        amountPaid: 85.29,
        balanceDue: 0.00,
        status: 'paid',
        notes: 'VIP customer',
        createdAt: twoWeeksAgo,
        updatedAt: twoWeeksAgo
      },
      {
        id: 3,
        saleId: 3,
        customerId: 3,
        invoiceNo: 'INV-2026-0003',
        invoiceDate: weekAgo,
        dueDate: dueNextMonth,
        subTotal: 99.00,
        discountAmount: 0.00,
        orderTaxAmount: 8.42,
        shippingCharge: 0.00,
        totalAmount: 107.42,
        amountPaid: 107.42,
        balanceDue: 0.00,
        status: 'paid',
        notes: null,
        createdAt: weekAgo,
        updatedAt: weekAgo
      },
      {
        id: 4,
        saleId: 4,
        customerId: 5,
        invoiceNo: 'INV-2026-0004',
        invoiceDate: weekAgo,
        dueDate: dueNextMonth,
        subTotal: 30.00,
        discountAmount: 10.00,
        orderTaxAmount: 2.55,
        shippingCharge: 0.00,
        totalAmount: 32.55,
        amountPaid: 32.55,
        balanceDue: 0.00,
        status: 'paid',
        notes: 'Bulk customer',
        createdAt: weekAgo,
        updatedAt: weekAgo
      },
      {
        id: 5,
        saleId: 5,
        customerId: 1,
        invoiceNo: 'INV-2026-0005',
        invoiceDate: threeDaysAgo,
        dueDate: dueNextMonth,
        subTotal: 45.00,
        discountAmount: 5.00,
        orderTaxAmount: 3.83,
        shippingCharge: 0.00,
        totalAmount: 48.83,
        amountPaid: 48.83,
        balanceDue: 0.00,
        status: 'paid',
        notes: null,
        createdAt: threeDaysAgo,
        updatedAt: threeDaysAgo
      },
      {
        id: 6,
        saleId: 6,
        customerId: 3,
        invoiceNo: 'INV-2026-0006',
        invoiceDate: threeDaysAgo,
        dueDate: dueNextMonth,
        subTotal: 125.00,
        discountAmount: 0.00,
        orderTaxAmount: 10.63,
        shippingCharge: 10.00,
        totalAmount: 145.63,
        amountPaid: 70.00,
        balanceDue: 75.63,
        status: 'partial',
        notes: 'Awaiting remaining payment',
        createdAt: threeDaysAgo,
        updatedAt: threeDaysAgo
      },
      {
        id: 7,
        saleId: 7,
        customerId: 2,
        invoiceNo: 'INV-2026-0007',
        invoiceDate: yesterday,
        dueDate: dueNextMonth,
        subTotal: 43.30,
        discountAmount: 8.00,
        orderTaxAmount: 3.68,
        shippingCharge: 0.00,
        totalAmount: 46.98,
        amountPaid: 46.98,
        balanceDue: 0.00,
        status: 'paid',
        notes: null,
        createdAt: yesterday,
        updatedAt: yesterday
      },
      {
        id: 8,
        saleId: 8,
        customerId: 5,
        invoiceNo: 'INV-2026-0008',
        invoiceDate: yesterday,
        dueDate: overdue,
        subTotal: 75.00,
        discountAmount: 15.00,
        orderTaxAmount: 6.38,
        shippingCharge: 5.00,
        totalAmount: 86.38,
        amountPaid: 0.00,
        balanceDue: 86.38,
        status: 'overdue',
        notes: 'Payment overdue, follow up required',
        createdAt: yesterday,
        updatedAt: yesterday
      },
      {
        id: 9,
        saleId: 9,
        customerId: 1,
        invoiceNo: 'INV-2026-0009',
        invoiceDate: now,
        dueDate: dueNextMonth,
        subTotal: 50.00,
        discountAmount: 0.00,
        orderTaxAmount: 4.25,
        shippingCharge: 0.00,
        totalAmount: 54.25,
        amountPaid: 0.00,
        balanceDue: 54.25,
        status: 'unpaid',
        notes: 'Pending order completion',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 10,
        saleId: 10,
        customerId: 3,
        invoiceNo: 'INV-2026-0010',
        invoiceDate: now,
        dueDate: dueNextMonth,
        subTotal: 30.50,
        discountAmount: 5.00,
        orderTaxAmount: 2.59,
        shippingCharge: 0.00,
        totalAmount: 33.09,
        amountPaid: 33.09,
        balanceDue: 0.00,
        status: 'paid',
        notes: null,
        createdAt: now,
        updatedAt: now
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('invoices', {
      invoiceNo: [
        'INV-2026-0001', 'INV-2026-0002', 'INV-2026-0003', 'INV-2026-0004', 'INV-2026-0005',
        'INV-2026-0006', 'INV-2026-0007', 'INV-2026-0008', 'INV-2026-0009', 'INV-2026-0010'
      ]
    }, {});
  }
};
