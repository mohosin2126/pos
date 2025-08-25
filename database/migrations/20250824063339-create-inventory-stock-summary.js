"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS inventory_stock_summary (
                                                           purchaseId      INT PRIMARY KEY,
                                                           nonExpiredQty   DECIMAL(18,2) NOT NULL DEFAULT 0,
        expiredQty      DECIMAL(18,2) NOT NULL DEFAULT 0,
        totalQty        DECIMAL(18,2) AS (nonExpiredQty + expiredQty) STORED,
        updatedAt       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_inventory_stock_summary_purchase
        FOREIGN KEY (purchaseId) REFERENCES purchases(id)
                                                                    ON UPDATE CASCADE
                                                                    ON DELETE RESTRICT
        );
    `);

    try {
      await queryInterface.sequelize.query(
          `CREATE INDEX ix_summary_nonexpired ON inventory_stock_summary (nonExpiredQty);`
      );
    } catch (e) {}
  },

  async down(queryInterface) {
    try {
      await queryInterface.sequelize.query(
          `DROP INDEX ix_summary_nonexpired ON inventory_stock_summary;`
      );
    } catch (e) {}
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS inventory_stock_summary;`);
  },
};
