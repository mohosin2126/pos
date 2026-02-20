'use strict';

module.exports = {
    async up (queryInterface, Sequelize) {
        const now = new Date();
        await queryInterface.bulkInsert('categories', [
            { name: 'Electronics',   description: 'Gadgets, components, and devices.', createdAt: now, updatedAt: now },
            { name: 'Books',         description: 'Printed and digital books across genres.', createdAt: now, updatedAt: now },
            { name: 'Clothing',      description: 'Apparel and accessories.', createdAt: now, updatedAt: now },
            { name: 'Home & Kitchen',description: 'Furniture, cookware, and home goods.', createdAt: now, updatedAt: now },
            { name: 'Sports',        description: 'Sports gear and outdoor equipment.', createdAt: now, updatedAt: now },
        ], {});
    },

    async down (queryInterface) {
        const names = [
            'Electronics',
            'Books',
            'Clothing',
            'Home & Kitchen',
            'Sports'
        ];
        const placeholders = names.map(() => '?').join(', ');
        await queryInterface.sequelize.query(
            `DELETE FROM \`categories\` WHERE \`name\` IN (${placeholders})`,
            { replacements: names }
        );

    }
};
