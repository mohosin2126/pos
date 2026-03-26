"use strict";

const { ALL_PERMISSIONS } = require("../../utils/permissions");

module.exports = {
    async up(queryInterface) {
        const now = new Date();


        const existingRoles = await queryInterface.sequelize.query(
            `SELECT name FROM roles`,
            { type: queryInterface.sequelize.constructor.QueryTypes.SELECT }
        );
        const existingNames = existingRoles.map((r) => r.name);

        const rolesToInsert = [];

        if (!existingNames.includes("admin")) {
            rolesToInsert.push({
                name: "admin",
                permissions: JSON.stringify(ALL_PERMISSIONS),
                createdAt: now,
                updatedAt: now,
            });
        }

        if (!existingNames.includes("manager")) {
            rolesToInsert.push({
                name: "manager",
                permissions: JSON.stringify([
                    "view_dashboard",
                    "view_products",
                    "create_products",
                    "edit_products",
                    "view_categories",
                    "create_categories",
                    "edit_categories",
                    "view_suppliers",
                    "create_suppliers",
                    "edit_suppliers",
                    "view_purchases",
                    "create_purchases",
                    "edit_purchases",
                    "view_purchase_returns",
                    "create_purchase_returns",
                    "view_sales",
                    "create_sales",
                    "view_pos",
                    "create_pos",
                    "view_customers",
                    "view_invoices",
                    "view_stock",
                    "view_reports",
                    "edit_profile",
                ]),
                createdAt: now,
                updatedAt: now,
            });
        }

        if (!existingNames.includes("employee")) {
            rolesToInsert.push({
                name: "employee",
                permissions: JSON.stringify([
                    "view_dashboard",
                    "view_products",
                    "view_categories",
                    "view_suppliers",
                    "view_purchases",
                    "view_sales",
                    "create_sales",
                    "view_pos",
                    "create_pos",
                    "view_customers",
                    "view_invoices",
                    "view_stock",
                    "edit_profile",
                ]),
                createdAt: now,
                updatedAt: now,
            });
        }

        if (rolesToInsert.length) {
            await queryInterface.bulkInsert("roles", rolesToInsert);
        }
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete("roles", {
            name: ["admin", "manager", "employee"],
        });
    },
};
