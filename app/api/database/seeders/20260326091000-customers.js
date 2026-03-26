"use strict";

const CUSTOMER_SEEDS = [
    {
        name: "Ayesha Rahman",
        email: "ayesha.rahman@example.com",
        phone: "+8801700000001",
        address: "House 12, Banani, Dhaka",
        status: "active",
        notes: "Loyal walk-in customer",
    },
    {
        name: "Tanvir Hossain",
        email: "tanvir.hossain@example.com",
        phone: "+8801700000002",
        address: "Road 8, Dhanmondi, Dhaka",
        status: "active",
        notes: "Prefers card payments",
    },
    {
        name: "Nusrat Jahan",
        email: "nusrat.jahan@example.com",
        phone: "+8801700000003",
        address: "Zindabazar, Sylhet",
        status: "active",
        notes: "Buys in bulk for office supplies",
    },
    {
        name: "Mehedi Hasan",
        email: "mehedi.hasan@example.com",
        phone: "+8801700000004",
        address: "Agrabad, Chattogram",
        status: "active",
        notes: "Frequently orders sports items",
    },
    {
        name: "Sadia Karim",
        email: "sadia.karim@example.com",
        phone: "+8801700000005",
        address: "Shib Bari, Khulna",
        status: "active",
        notes: "Requested SMS updates",
    },
    {
        name: "Rafiul Islam",
        email: "rafiul.islam@example.com",
        phone: "+8801700000006",
        address: "Saheb Bazar, Rajshahi",
        status: "inactive",
        notes: "Dormant account",
    },
];

module.exports = {
    async up(queryInterface, Sequelize) {
        const now = new Date();
        const { QueryTypes } = Sequelize;

        const existingCustomers = await queryInterface.sequelize.query(
            "SELECT email FROM customers WHERE email IN (:emails)",
            {
                replacements: { emails: CUSTOMER_SEEDS.map((customer) => customer.email) },
                type: QueryTypes.SELECT,
            }
        );
        const existingEmails = new Set(existingCustomers.map((customer) => customer.email));

        const rowsToInsert = CUSTOMER_SEEDS
            .filter((customer) => !existingEmails.has(customer.email))
            .map((customer) => ({
                ...customer,
                createdAt: now,
                updatedAt: now,
            }));

        if (rowsToInsert.length > 0) {
            await queryInterface.bulkInsert("customers", rowsToInsert);
        }
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete(
            "customers",
            { email: CUSTOMER_SEEDS.map((customer) => customer.email) },
            {}
        );
    },
};
