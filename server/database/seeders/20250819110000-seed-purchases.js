'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(now);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    await queryInterface.bulkInsert('purchases', [
      {
        id: 1,
        supplierId: 1,
        supplierAddress: '1200 Market St, Suite 400, San Francisco, CA 94103',
        referenceNo: 'PO-2026-001',
        purchaseDate: lastMonth,
        status: 'completed',
        productId: null,
        payTermValue: 30,
        payTermUnit: 'days',
        discountType: 'percentage',
        discountAmount: 5.00,
        orderTaxPercent: 8.50,
        orderTaxAmount: 18.27,
        shippingCharge: 15.00,
        additionalExpenses: JSON.stringify([
          { description: 'Handling fee', amount: 5.00 }
        ]),
        totalItems: 3,
        netTotalAmount: 215.00,
        totalAmount: 253.27,
        amountPaid: 253.27,
        notes: 'Electronics bulk order',
        shippingDetails: 'Standard shipping via FedEx',
        warrantyValue: 12,
        warrantyUnit: 'months',
        expiryDate: null,
        createdAt: lastMonth,
        updatedAt: lastMonth
      },
      {
        id: 2,
        supplierId: 2,
        supplierAddress: '789 Industrial Blvd, Austin, TX 78701',
        referenceNo: 'PO-2026-002',
        purchaseDate: lastWeek,
        status: 'completed',
        productId: null,
        payTermValue: 15,
        payTermUnit: 'days',
        discountType: 'fixed',
        discountAmount: 20.00,
        orderTaxPercent: 6.00,
        orderTaxAmount: 12.60,
        shippingCharge: 10.00,
        additionalExpenses: null,
        totalItems: 2,
        netTotalAmount: 210.00,
        totalAmount: 222.60,
        amountPaid: 222.60,
        notes: 'Book inventory restock',
        shippingDetails: null,
        warrantyValue: null,
        warrantyUnit: null,
        expiryDate: null,
        createdAt: lastWeek,
        updatedAt: lastWeek
      },
      {
        id: 3,
        supplierId: 3,
        supplierAddress: '456 Fashion Ave, New York, NY 10018',
        referenceNo: 'PO-2026-003',
        purchaseDate: yesterday,
        status: 'partial',
        productId: null,
        payTermValue: 45,
        payTermUnit: 'days',
        discountType: 'percentage',
        discountAmount: 10.00,
        orderTaxPercent: 7.00,
        orderTaxAmount: 31.50,
        shippingCharge: 25.00,
        additionalExpenses: null,
        totalItems: 2,
        netTotalAmount: 450.00,
        totalAmount: 506.50,
        amountPaid: 250.00,
        notes: 'Partial payment received',
        shippingDetails: 'Express delivery requested',
        warrantyValue: 6,
        warrantyUnit: 'months',
        expiryDate: null,
        createdAt: yesterday,
        updatedAt: yesterday
      },
      {
        id: 4,
        supplierId: 4,
        supplierAddress: '321 Kitchenware Rd, Chicago, IL 60601',
        referenceNo: 'PO-2026-004',
        purchaseDate: now,
        status: 'pending',
        productId: null,
        payTermValue: 30,
        payTermUnit: 'days',
        discountType: 'fixed',
        discountAmount: 15.00,
        orderTaxPercent: 8.00,
        orderTaxAmount: 16.80,
        shippingCharge: 12.00,
        additionalExpenses: null,
        totalItems: 2,
        netTotalAmount: 210.00,
        totalAmount: 238.80,
        amountPaid: 0.00,
        notes: 'Awaiting delivery',
        shippingDetails: null,
        warrantyValue: 24,
        warrantyUnit: 'months',
        expiryDate: null,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 5,
        supplierId: 5,
        supplierAddress: '654 Sports Complex, Denver, CO 80201',
        referenceNo: 'PO-2026-005',
        purchaseDate: lastWeek,
        status: 'completed',
        productId: null,
        payTermValue: 20,
        payTermUnit: 'days',
        discountType: 'percentage',
        discountAmount: 8.00,
        orderTaxPercent: 5.50,
        orderTaxAmount: 11.00,
        shippingCharge: 18.00,
        additionalExpenses: JSON.stringify([
          { description: 'Insurance', amount: 10.00 }
        ]),
        totalItems: 2,
        netTotalAmount: 200.00,
        totalAmount: 239.00,
        amountPaid: 239.00,
        notes: 'Sports equipment order',
        shippingDetails: 'Ground shipping',
        warrantyValue: 18,
        warrantyUnit: 'months',
        expiryDate: null,
        createdAt: lastWeek,
        updatedAt: lastWeek
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('purchases', {
      referenceNo: ['PO-2026-001', 'PO-2026-002', 'PO-2026-003', 'PO-2026-004', 'PO-2026-005']
    }, {});
  }
};
