"use strict";

const PRODUCT_SEEDS = [
    {
        sku: "ELEC-KEY-001",
        name: "Mechanical Keyboard Pro",
        categoryName: "Electronics",
        barcode: "880100000001",
        price: 3200,
        reorderLevel: 8,
        status: "active",
        tags: ["keyboard", "gaming", "peripheral"],
    },
    {
        sku: "ELEC-MOU-002",
        name: "Wireless Mouse Lite",
        categoryName: "Electronics",
        barcode: "880100000002",
        price: 1600,
        reorderLevel: 12,
        status: "active",
        tags: ["mouse", "office"],
    },
    {
        sku: "ELEC-SSD-003",
        name: "Portable SSD 1TB",
        categoryName: "Electronics",
        barcode: "880100000003",
        price: 9800,
        reorderLevel: 10,
        status: "active",
        tags: ["storage", "ssd"],
    },
    {
        sku: "BOOK-LEAD-004",
        name: "Leadership Handbook",
        categoryName: "Books",
        barcode: "880100000004",
        price: 850,
        reorderLevel: 25,
        status: "active",
        tags: ["book", "management"],
    },
    {
        sku: "CLOT-TSH-005",
        name: "Premium Cotton T-Shirt",
        categoryName: "Clothing",
        barcode: "880100000005",
        price: 600,
        reorderLevel: 15,
        status: "active",
        tags: ["tshirt", "fashion"],
    },
    {
        sku: "HOME-MUG-006",
        name: "Ceramic Coffee Mug",
        categoryName: "Home & Kitchen",
        barcode: "880100000006",
        price: 350,
        reorderLevel: 18,
        status: "active",
        tags: ["mug", "kitchen"],
    },
    {
        sku: "HOME-CLN-007",
        name: "Kitchen Cleaner Spray",
        categoryName: "Home & Kitchen",
        barcode: "880100000007",
        price: 420,
        reorderLevel: 10,
        status: "active",
        tags: ["cleaner", "spray"],
    },
    {
        sku: "SPORT-GEL-008",
        name: "Energy Gel Pack",
        categoryName: "Sports",
        barcode: "880100000008",
        price: 220,
        reorderLevel: 12,
        status: "active",
        tags: ["energy", "sports"],
    },
    {
        sku: "SPORT-SHK-009",
        name: "Protein Shaker Bottle",
        categoryName: "Sports",
        barcode: "880100000009",
        price: 480,
        reorderLevel: 8,
        status: "active",
        tags: ["fitness", "shaker"],
    },
    {
        sku: "ELEC-INK-010",
        name: "Printer Ink Cyan",
        categoryName: "Electronics",
        barcode: "880100000010",
        price: 1450,
        reorderLevel: 15,
        status: "active",
        tags: ["printer", "ink"],
    },
    {
        sku: "HOME-BAT-011",
        name: "AA Battery Pack",
        categoryName: "Home & Kitchen",
        barcode: "880100000011",
        price: 700,
        reorderLevel: 14,
        status: "active",
        tags: ["battery", "power"],
    },
    {
        sku: "BOOK-NOTE-012",
        name: "Business Notebook",
        categoryName: "Books",
        barcode: "880100000012",
        price: 180,
        reorderLevel: 20,
        status: "active",
        tags: ["notebook", "office"],
    },
    {
        sku: "ELEC-CBL-013",
        name: "USB-C Fast Charging Cable",
        categoryName: "Electronics",
        barcode: "880100000013",
        price: 550,
        reorderLevel: 6,
        status: "active",
        tags: ["cable", "charging"],
    },
];

module.exports = {
    async up(queryInterface, Sequelize) {
        const now = new Date();
        const { QueryTypes } = Sequelize;
        const categoryNames = [...new Set(PRODUCT_SEEDS.map((product) => product.categoryName))];

        const categories = await queryInterface.sequelize.query(
            "SELECT id, name FROM categories WHERE name IN (:names)",
            {
                replacements: { names: categoryNames },
                type: QueryTypes.SELECT,
            }
        );
        const categoryByName = new Map(categories.map((category) => [category.name, category.id]));

        const missingCategories = categoryNames.filter((name) => !categoryByName.has(name));
        if (missingCategories.length > 0) {
            throw new Error(`Missing categories for product seed: ${missingCategories.join(", ")}`);
        }

        const existingProducts = await queryInterface.sequelize.query(
            "SELECT sku FROM products WHERE sku IN (:skus)",
            {
                replacements: { skus: PRODUCT_SEEDS.map((product) => product.sku) },
                type: QueryTypes.SELECT,
            }
        );
        const existingSkus = new Set(existingProducts.map((product) => product.sku));

        const rowsToInsert = PRODUCT_SEEDS
            .filter((product) => !existingSkus.has(product.sku))
            .map((product) => ({
                name: product.name,
                description: `${product.name} demo item for inventory, sales, and purchase flows.`,
                categoryId: categoryByName.get(product.categoryName),
                sku: product.sku,
                barcode: product.barcode,
                price: product.price,
                stockQuantity: 0,
                reorderLevel: product.reorderLevel,
                isTrackStock: true,
                imageUrl: null,
                status: product.status,
                tags: JSON.stringify(product.tags),
                createdBy: 1,
                updatedBy: 1,
                createdAt: now,
                updatedAt: now,
            }));

        if (rowsToInsert.length > 0) {
            await queryInterface.bulkInsert("products", rowsToInsert);
        }
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete(
            "products",
            { sku: PRODUCT_SEEDS.map((product) => product.sku) },
            {}
        );
    },
};
