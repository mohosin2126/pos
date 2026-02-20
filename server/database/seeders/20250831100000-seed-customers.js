'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    await queryInterface.bulkInsert('customers', [
      {
        id: 1,
        name: 'John Smith',
        phone: '+1-555-0101',
        email: 'john.smith@email.com',
        address: '123 Main Street, New York, NY 10001',
        status: 'active',
        notes: 'Regular customer, prefers email communication',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 2,
        name: 'Sarah Johnson',
        phone: '+1-555-0102',
        email: 'sarah.j@email.com',
        address: '456 Oak Avenue, Los Angeles, CA 90001',
        status: 'active',
        notes: 'VIP customer, eligible for discounts',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 3,
        name: 'Michael Brown',
        phone: '+1-555-0103',
        email: 'mbrown@email.com',
        address: '789 Elm Street, Chicago, IL 60601',
        status: 'active',
        notes: null,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 4,
        name: 'Emily Davis',
        phone: '+1-555-0104',
        email: 'emily.davis@email.com',
        address: '321 Pine Road, Houston, TX 77001',
        status: 'inactive',
        notes: 'Account on hold - payment issues',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 5,
        name: 'David Wilson',
        phone: '+1-555-0105',
        email: 'dwilson@email.com',
        address: '654 Maple Drive, Phoenix, AZ 85001',
        status: 'active',
        notes: 'Wholesale customer, bulk orders',
        createdAt: now,
        updatedAt: now
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('customers', {
      email: [
        'john.smith@email.com',
        'sarah.j@email.com',
        'mbrown@email.com',
        'emily.davis@email.com',
        'dwilson@email.com'
      ]
    }, {});
  }
};
