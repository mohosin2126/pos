
export const PERMISSIONS = {
  // Dashboard
  VIEW_DASHBOARD: "view_dashboard",

  // Users
  VIEW_USERS: "view_users",
  CREATE_USERS: "create_users",
  EDIT_USERS: "edit_users",
  DELETE_USERS: "delete_users",

  // Roles
  VIEW_ROLES: "view_roles",
  CREATE_ROLES: "create_roles",
  EDIT_ROLES: "edit_roles",
  DELETE_ROLES: "delete_roles",

  // Products
  VIEW_PRODUCTS: "view_products",
  CREATE_PRODUCTS: "create_products",
  EDIT_PRODUCTS: "edit_products",
  DELETE_PRODUCTS: "delete_products",

  // Categories
  VIEW_CATEGORIES: "view_categories",
  CREATE_CATEGORIES: "create_categories",
  EDIT_CATEGORIES: "edit_categories",
  DELETE_CATEGORIES: "delete_categories",

  // Suppliers
  VIEW_SUPPLIERS: "view_suppliers",
  CREATE_SUPPLIERS: "create_suppliers",
  EDIT_SUPPLIERS: "edit_suppliers",
  DELETE_SUPPLIERS: "delete_suppliers",

  // Purchases
  VIEW_PURCHASES: "view_purchases",
  CREATE_PURCHASES: "create_purchases",
  EDIT_PURCHASES: "edit_purchases",
  DELETE_PURCHASES: "delete_purchases",

  // Purchase Returns
  VIEW_PURCHASE_RETURNS: "view_purchase_returns",
  CREATE_PURCHASE_RETURNS: "create_purchase_returns",
  EDIT_PURCHASE_RETURNS: "edit_purchase_returns",
  DELETE_PURCHASE_RETURNS: "delete_purchase_returns",

  // Sales
  VIEW_SALES: "view_sales",
  CREATE_SALES: "create_sales",

  // POS
  VIEW_POS: "view_pos",
  CREATE_POS: "create_pos",

  // Customers
  VIEW_CUSTOMERS: "view_customers",

  // Invoices
  VIEW_INVOICES: "view_invoices",

  // Stock / Inventory
  VIEW_STOCK: "view_stock",

  // Reports
  VIEW_REPORTS: "view_reports",

  // Settings
  EDIT_PROFILE: "edit_profile",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];


export interface PermissionGroupDef {
  label: string;
  permissions: Permission[];
}

export const PERMISSION_GROUPS: Record<string, PermissionGroupDef> = {
  dashboard: {
    label: "Dashboard",
    permissions: [PERMISSIONS.VIEW_DASHBOARD],
  },
  users: {
    label: "User Management",
    permissions: [
      PERMISSIONS.VIEW_USERS,
      PERMISSIONS.CREATE_USERS,
      PERMISSIONS.EDIT_USERS,
      PERMISSIONS.DELETE_USERS,
    ],
  },
  roles: {
    label: "Roles",
    permissions: [
      PERMISSIONS.VIEW_ROLES,
      PERMISSIONS.CREATE_ROLES,
      PERMISSIONS.EDIT_ROLES,
      PERMISSIONS.DELETE_ROLES,
    ],
  },
  products: {
    label: "Products",
    permissions: [
      PERMISSIONS.VIEW_PRODUCTS,
      PERMISSIONS.CREATE_PRODUCTS,
      PERMISSIONS.EDIT_PRODUCTS,
      PERMISSIONS.DELETE_PRODUCTS,
    ],
  },
  categories: {
    label: "Categories",
    permissions: [
      PERMISSIONS.VIEW_CATEGORIES,
      PERMISSIONS.CREATE_CATEGORIES,
      PERMISSIONS.EDIT_CATEGORIES,
      PERMISSIONS.DELETE_CATEGORIES,
    ],
  },
  suppliers: {
    label: "Suppliers",
    permissions: [
      PERMISSIONS.VIEW_SUPPLIERS,
      PERMISSIONS.CREATE_SUPPLIERS,
      PERMISSIONS.EDIT_SUPPLIERS,
      PERMISSIONS.DELETE_SUPPLIERS,
    ],
  },
  purchases: {
    label: "Purchases",
    permissions: [
      PERMISSIONS.VIEW_PURCHASES,
      PERMISSIONS.CREATE_PURCHASES,
      PERMISSIONS.EDIT_PURCHASES,
      PERMISSIONS.DELETE_PURCHASES,
    ],
  },
  purchase_returns: {
    label: "Purchase Returns",
    permissions: [
      PERMISSIONS.VIEW_PURCHASE_RETURNS,
      PERMISSIONS.CREATE_PURCHASE_RETURNS,
      PERMISSIONS.EDIT_PURCHASE_RETURNS,
      PERMISSIONS.DELETE_PURCHASE_RETURNS,
    ],
  },
  sales: {
    label: "Sales",
    permissions: [PERMISSIONS.VIEW_SALES, PERMISSIONS.CREATE_SALES],
  },
  pos: {
    label: "POS (Point of Sale)",
    permissions: [PERMISSIONS.VIEW_POS, PERMISSIONS.CREATE_POS],
  },
  customers: {
    label: "Customers",
    permissions: [PERMISSIONS.VIEW_CUSTOMERS],
  },
  invoices: {
    label: "Invoices",
    permissions: [PERMISSIONS.VIEW_INVOICES],
  },
  stock: {
    label: "Stock / Inventory",
    permissions: [PERMISSIONS.VIEW_STOCK],
  },
  reports: {
    label: "Reports",
    permissions: [PERMISSIONS.VIEW_REPORTS],
  },
  settings: {
    label: "Settings",
    permissions: [PERMISSIONS.EDIT_PROFILE],
  },
};

// all permission
export const ALL_PERMISSIONS: Permission[] = Object.values(
  PERMISSION_GROUPS
).flatMap((g) => g.permissions);
