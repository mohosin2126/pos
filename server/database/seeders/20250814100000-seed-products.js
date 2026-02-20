'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    
    const categories = await queryInterface.sequelize.query(
      'SELECT id, name FROM categories ORDER BY id',
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });
    
    await queryInterface.bulkInsert('products', [
      {
        id: 1,
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse with USB receiver',
        categoryId: categoryMap['Electronics'],
        sku: 'ELEC-WM-001',
        barcode: '1234567890123',
        price: 25.99,
        stockQuantity: 150,
        reorderLevel: 30,
        isTrackStock: true,
        imageUrl: null,
        status: 'active',
        tags: JSON.stringify(['electronics', 'computer', 'peripheral']),
        createdBy: 1,
        updatedBy: 1,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 2,
        name: 'USB-C Cable 2m',
        description: 'Fast charging USB-C to USB-C cable',
        categoryId: categoryMap['Electronics'],
        sku: 'ELEC-USBC-002',
        barcode: '1234567890124',
        price: 12.50,
        stockQuantity: 8,
        reorderLevel: 20,
        isTrackStock: true,
        imageUrl: null,
        status: 'low_stock',
        tags: JSON.stringify(['electronics', 'cable', 'charging']),
        createdBy: 1,
        updatedBy: 1,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 3,
        name: 'The Great Gatsby',
        description: 'Classic novel by F. Scott Fitzgerald',
        categoryId: categoryMap['Books'],
        sku: 'BOOK-GATS-001',
        barcode: '9780743273565',
        price: 14.99,
        stockQuantity: 45,
        reorderLevel: 10,
        isTrackStock: true,
        imageUrl: null,
        status: 'active',
        tags: JSON.stringify(['book', 'fiction', 'classic']),
        createdBy: 1,
        updatedBy: 1,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 4,
        name: 'Python Programming Guide',
        description: 'Comprehensive guide to Python 3.x',
        categoryId: categoryMap['Books'],
        sku: 'BOOK-PYTH-002',
        barcode: '9781593279288',
        price: 39.95,
        stockQuantity: 0,
        reorderLevel: 5,
        isTrackStock: true,
        imageUrl: null,
        status: 'out_of_stock',
        tags: JSON.stringify(['book', 'programming', 'technical']),
        createdBy: 1,
        updatedBy: 1,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 5,
        name: 'Cotton T-Shirt - Blue',
        description: '100% cotton crew neck t-shirt in navy blue',
        categoryId: categoryMap['Clothing'],
        sku: 'CLTH-TSH-001',
        barcode: '2345678901234',
        price: 19.99,
        stockQuantity: 75,
        reorderLevel: 25,
        isTrackStock: true,
        imageUrl: null,
        status: 'active',
        tags: JSON.stringify(['clothing', 'casual', 'cotton']),
        createdBy: 1,
        updatedBy: 1,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 6,
        name: 'Denim Jeans - Black',
        description: 'Slim fit denim jeans in black',
        categoryId: categoryMap['Clothing'],
        sku: 'CLTH-JNS-002',
        barcode: '2345678901235',
        price: 49.99,
        stockQuantity: 12,
        reorderLevel: 15,
        isTrackStock: true,
        imageUrl: null,
        status: 'low_stock',
        tags: JSON.stringify(['clothing', 'denim', 'pants']),
        createdBy: 1,
        updatedBy: 1,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 7,
        name: 'Non-Stick Frying Pan',
        description: '12-inch non-stick frying pan with lid',
        categoryId: categoryMap['Home & Kitchen'],
        sku: 'HOME-PAN-001',
        barcode: '3456789012345',
        price: 34.99,
        stockQuantity: 28,
        reorderLevel: 10,
        isTrackStock: true,
        imageUrl: null,
        status: 'active',
        tags: JSON.stringify(['kitchen', 'cookware', 'pan']),
        createdBy: 1,
        updatedBy: 1,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 8,
        name: 'Stainless Steel Spoon Set',
        description: 'Set of 6 stainless steel spoons',
        categoryId: categoryMap['Home & Kitchen'],
        sku: 'HOME-SPO-002',
        barcode: '3456789012346',
        price: 15.99,
        stockQuantity: 62,
        reorderLevel: 20,
        isTrackStock: true,
        imageUrl: null,
        status: 'active',
        tags: JSON.stringify(['kitchen', 'utensils', 'stainless']),
        createdBy: 1,
        updatedBy: 1,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 9,
        name: 'Yoga Mat Premium',
        description: 'Extra thick yoga mat with carrying strap',
        categoryId: categoryMap['Sports'],
        sku: 'SPRT-YOGA-001',
        barcode: '4567890123456',
        price: 29.99,
        stockQuantity: 35,
        reorderLevel: 15,
        isTrackStock: true,
        imageUrl: null,
        status: 'active',
        tags: JSON.stringify(['sports', 'fitness', 'yoga']),
        createdBy: 1,
        updatedBy: 1,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 10,
        name: 'Basketball Official Size',
        description: 'Official size 7 basketball for outdoor play',
        categoryId: categoryMap['Sports'],
        sku: 'SPRT-BASK-002',
        barcode: '4567890123457',
        price: 24.99,
        stockQuantity: 18,
        reorderLevel: 10,
        isTrackStock: true,
        imageUrl: null,
        status: 'active',
        tags: JSON.stringify(['sports', 'basketball', 'outdoor']),
        createdBy: 1,
        updatedBy: 1,
        createdAt: now,
        updatedAt: now
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('products', {
      sku: [
        'ELEC-WM-001', 'ELEC-USBC-002', 'BOOK-GATS-001', 'BOOK-PYTH-002',
        'CLTH-TSH-001', 'CLTH-JNS-002', 'HOME-PAN-001', 'HOME-SPO-002',
        'SPRT-YOGA-001', 'SPRT-BASK-002'
      ]
    }, {});
  }
};
