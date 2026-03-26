import { PERMISSIONS } from "@/data/permissions";

interface PermittedRoute {
  permission: string;
  path: string;
}

/**
 * Priority-ordered list of routes mapped to the permission required to access them.
 * Order follows the sidebar menu (top-to-bottom).
 */
const ROUTE_PRIORITY: PermittedRoute[] = [
  { permission: PERMISSIONS.VIEW_DASHBOARD, path: "/dashboard" },
  { permission: PERMISSIONS.VIEW_USERS, path: "/user/all" },
  { permission: PERMISSIONS.VIEW_ROLES, path: "/access/roles" },
  { permission: PERMISSIONS.VIEW_REPORTS, path: "/reports/product-revenue" },
  { permission: PERMISSIONS.VIEW_CATEGORIES, path: "/category/all" },
  { permission: PERMISSIONS.VIEW_SUPPLIERS, path: "/supplier/all" },
  { permission: PERMISSIONS.VIEW_PRODUCTS, path: "/product/all" },
  { permission: PERMISSIONS.VIEW_STOCK, path: "/activity-products/low-stock" },
  { permission: PERMISSIONS.VIEW_PURCHASES, path: "/purchase/all" },
  {
    permission: PERMISSIONS.VIEW_PURCHASE_RETURNS,
    path: "/purchase-return",
  },
  { permission: PERMISSIONS.VIEW_SALES, path: "/sales/all" },
  { permission: PERMISSIONS.VIEW_SALE_RETURNS, path: "/sale-return" },
  { permission: PERMISSIONS.CREATE_POS, path: "/pos/create" },
  { permission: PERMISSIONS.VIEW_CUSTOMERS, path: "/customer/all" },
  { permission: PERMISSIONS.VIEW_INVOICES, path: "/invoice/all" },
];

/**
 * Returns the first route the user is permitted to access based on their
 * permissions array.  Admin users should bypass this entirely and go straight
 * to the dashboard.
 *
 * Falls back to `/{roleSlug}/settings/view-profile` which requires no
 * permissions, so the user always has somewhere useful to land.
 */
export function getFirstPermittedRoute(
  permissions: string[],
  roleSlug: string
): string {
  const base = `/${roleSlug}`;

  for (const route of ROUTE_PRIORITY) {
    if (permissions.includes(route.permission)) {
      return `${base}${route.path}`;
    }
  }

  // Ultimate fallback – profile page requires no permissions
  return `${base}/settings/view-profile`;
}
