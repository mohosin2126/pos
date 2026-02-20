'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    await queryInterface.bulkInsert('roles', [
      {
        id: 1,
        name: 'Admin',
        permissions: JSON.stringify({
          users: ['create', 'read', 'update', 'delete'],
          products: ['create', 'read', 'update', 'delete'],
          purchases: ['create', 'read', 'update', 'delete', 'approve'],
          sales: ['create', 'read', 'update', 'delete'],
          inventory: ['read', 'update', 'recount'],
          reports: ['view_all', 'export'],
          settings: ['manage']
        }),
        createdAt: now,
        updatedAt: now
      },
      {
        id: 2,
        name: 'Manager',
        permissions: JSON.stringify({
          products: ['create', 'read', 'update'],
          purchases: ['create', 'read', 'update', 'approve'],
          sales: ['read', 'update'],
          inventory: ['read', 'recount'],
          reports: ['view_all', 'export']
        }),
        createdAt: now,
        updatedAt: now
      },
      {
        id: 3,
        name: 'Cashier',
        permissions: JSON.stringify({
          products: ['read'],
          sales: ['create', 'read'],
          inventory: ['read'],
          reports: ['view_own']
        }),
        createdAt: now,
        updatedAt: now
      },
      {
        id: 4,
        name: 'Stock Manager',
        permissions: JSON.stringify({
          products: ['create', 'read', 'update'],
          purchases: ['create', 'read', 'update'],
          inventory: ['read', 'update', 'recount'],
          reports: ['view_inventory']
        }),
        createdAt: now,
        updatedAt: now
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', {
      name: ['Admin', 'Manager', 'Cashier', 'Stock Manager']
    }, {});
  }
};
