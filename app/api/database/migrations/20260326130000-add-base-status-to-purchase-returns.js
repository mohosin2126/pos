"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("purchase_returns", "basePurchaseStatus", {
            type: Sequelize.ENUM("purchase", "received", "partial"),
            allowNull: true,
            after: "refundAmount",
        });

        await queryInterface.sequelize.query(`
            UPDATE purchase_returns pr
            JOIN purchases p ON p.id = pr.purchaseId
            SET pr.basePurchaseStatus = CASE
                WHEN p.status = 'received' THEN 'received'
                WHEN p.status = 'partial' THEN 'partial'
                ELSE 'purchase'
            END
            WHERE pr.basePurchaseStatus IS NULL
        `);
    },

    async down(queryInterface) {
        await queryInterface.removeColumn("purchase_returns", "basePurchaseStatus");
    },
};
