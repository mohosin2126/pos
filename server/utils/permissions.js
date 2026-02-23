"use strict";


const PERMISSION_GROUPS = {
    dashboard: {
        label: "Dashboard",
        permissions: ["view_dashboard"],
    },
    users: {
        label: "User Management",
        permissions: ["view_users", "create_users", "edit_users", "delete_users"],
    },
    roles: {
        label: "Roles",
        permissions: ["view_roles", "create_roles", "edit_roles", "delete_roles"],
    },
    products: {
        label: "Products",
        permissions: ["view_products", "create_products", "edit_products", "delete_products"],
    },
    categories: {
        label: "Categories",
        permissions: ["view_categories", "create_categories", "edit_categories", "delete_categories"],
    },
    suppliers: {
        label: "Suppliers",
        permissions: ["view_suppliers", "create_suppliers", "edit_suppliers", "delete_suppliers"],
    },
    purchases: {
        label: "Purchases",
        permissions: ["view_purchases", "create_purchases", "edit_purchases", "delete_purchases"],
    },
    purchase_returns: {
        label: "Purchase Returns",
        permissions: ["view_purchase_returns", "create_purchase_returns", "edit_purchase_returns", "delete_purchase_returns"],
    },
    sales: {
        label: "Sales",
        permissions: ["view_sales", "create_sales"],
    },
    pos: {
        label: "POS (Point of Sale)",
        permissions: ["view_pos", "create_pos"],
    },
    customers: {
        label: "Customers",
        permissions: ["view_customers"],
    },
    invoices: {
        label: "Invoices",
        permissions: ["view_invoices"],
    },
    stock: {
        label: "Stock / Inventory",
        permissions: ["view_stock"],
    },
    reports: {
        label: "Reports",
        permissions: ["view_reports"],
    },
    settings: {
        label: "Settings",
        permissions: ["edit_profile"],
    },
};

// Flat list 
const ALL_PERMISSIONS = Object.values(PERMISSION_GROUPS).flatMap(
    (group) => group.permissions
);

// Convenience individual exports
const P = {};
ALL_PERMISSIONS.forEach((p) => {

    P[p.toUpperCase()] = p;
});

module.exports = {
    PERMISSION_GROUPS,
    ALL_PERMISSIONS,
    P,
};
