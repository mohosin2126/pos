"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // 1) Active products
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW \`v_active_products\` AS
      SELECT
        p.\`id\`           AS \`productId\`,
        p.\`name\`         AS \`productName\`,
        p.\`status\`       AS \`status\`,
        p.\`isTrackStock\` AS \`isTrackStock\`,
        p.\`reorderLevel\` AS \`reorderLevel\`
      FROM \`products\` p
      WHERE p.\`status\` = 'active';
    `);

    // 2) Total on-hand (all lots)
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW \`v_total_stock\` AS
      SELECT
        p.\`id\`   AS \`productId\`,
        p.\`name\` AS \`productName\`,
        COALESCE(SUM(im.\`quantity\`),0) AS \`onHandAll\`
      FROM \`products\` p
      LEFT JOIN \`inventory_movements\` im ON im.\`productId\` = p.\`id\`
      GROUP BY p.\`id\`, p.\`name\`;
    `);

    // 3) Non-expired on-hand
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW \`v_nonexpired_stock\` AS
      SELECT
        p.\`id\`   AS \`productId\`,
        p.\`name\` AS \`productName\`,
        COALESCE(SUM(
          CASE
            WHEN im.\`lotExpiryDate\` IS NULL OR im.\`lotExpiryDate\` >= CURDATE()
            THEN im.\`quantity\` ELSE 0
          END
        ), 0) AS \`onHandNotExpired\`
      FROM \`products\` p
      LEFT JOIN \`inventory_movements\` im ON im.\`productId\` = p.\`id\`
      GROUP BY p.\`id\`, p.\`name\`;
    `);

    // 4) Sellable = active + track stock + non-expired qty > 0
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW \`v_sellable_products\` AS
      SELECT
        ap.\`productId\`,
        ap.\`productName\`,
        ap.\`reorderLevel\`,
        nes.\`onHandNotExpired\`
      FROM \`v_active_products\` ap
      INNER JOIN \`v_nonexpired_stock\` nes ON nes.\`productId\` = ap.\`productId\`
      WHERE ap.\`isTrackStock\` = 1 AND nes.\`onHandNotExpired\` > 0;
    `);

    // 5) Low stock = sellable and qty <= reorderLevel
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW \`v_low_stock_products\` AS
      SELECT
        sp.\`productId\`, sp.\`productName\`, sp.\`reorderLevel\`, sp.\`onHandNotExpired\`
      FROM \`v_sellable_products\` sp
      WHERE sp.\`reorderLevel\` IS NOT NULL AND sp.\`onHandNotExpired\` > 0
        AND sp.\`onHandNotExpired\` <= sp.\`reorderLevel\`;
    `);

    // 6) Out of stock (non-expired qty = 0 AND total on-hand = 0)
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW \`v_out_of_stock_products\` AS
      SELECT
        t.\`productId\`, t.\`productName\`
      FROM \`v_total_stock\` t
      INNER JOIN \`v_nonexpired_stock\` nes ON nes.\`productId\` = t.\`productId\`
      WHERE nes.\`onHandNotExpired\` = 0 AND t.\`onHandAll\` = 0;
    `);

    // 7) Expired-only: have some stock but all expired (non-expired = 0 AND total > 0)
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW \`v_expired_only_products\` AS
      SELECT
        t.\`productId\`, t.\`productName\`, t.\`onHandAll\` AS \`expiredOnlyQty\`
      FROM \`v_total_stock\` t
      INNER JOIN \`v_nonexpired_stock\` nes ON nes.\`productId\` = t.\`productId\`
      WHERE nes.\`onHandNotExpired\` = 0 AND t.\`onHandAll\` > 0;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query("DROP VIEW IF EXISTS `v_expired_only_products`;");
    await queryInterface.sequelize.query("DROP VIEW IF EXISTS `v_out_of_stock_products`;");
    await queryInterface.sequelize.query("DROP VIEW IF EXISTS `v_low_stock_products`;");
    await queryInterface.sequelize.query("DROP VIEW IF EXISTS `v_sellable_products`;");
    await queryInterface.sequelize.query("DROP VIEW IF EXISTS `v_nonexpired_stock`;");
    await queryInterface.sequelize.query("DROP VIEW IF EXISTS `v_total_stock`;");
    await queryInterface.sequelize.query("DROP VIEW IF EXISTS `v_active_products`;");
  },
};
