'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('list_expired_products', [], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('list_expired_products', {}, {});
  }
};
