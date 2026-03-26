import Layout from "@/layout/dashboard";
import Dashboard from "@/view/admin/dashboard";
import Roles from "@/view/admin/roles";
import UserForm from "@/view/admin/users/form";
import AllUsers from "@/view/admin/users/all";
import ViewUser from "@/view/admin/users/view";
import Purchases from "@/view/admin/purchases/all";
import PurchaseForm from "@/view/admin/purchases/form";
import PurchaseDetails from "@/view/admin/purchases/view";
import AllSupplier from "@/view/admin/supplier/all";
import SupplierForm from "@/view/admin/supplier/form";
import CategoriesAll from "@/view/admin/categories/all";
import AllProducts from "@/view/admin/product/all";
import ProductForm from "@/view/admin/product/form";
import ProductDetails from "@/view/admin/product/view";
import AllPos from "@/view/admin/pos/all";
import POSForm from "@/view/admin/pos/create";
import PurchaseOrder from "@/view/admin/purchase-order";
import PurchaseReturn from "@/view/admin/purchase-return";
import SalesRecords from "@/view/admin/sales-records/all";
import SaleReturnPage from "@/view/admin/sale-return";
import RolesAndPermissions from "@/view/admin/roles-and-permissions";
import Stock from "@/view/admin/stock";
import OutOfStock from "@/view/admin/activity-products/out-of-stock";
import LowStock from "@/view/admin/activity-products/low-stock";
import ExpiredProducts from "@/view/admin/activity-products/expired-products";
import SellableProducts from "@/view/admin/activity-products/sellable-products";
import SalesDetails from "@/view/admin/sales-records/view";
import POSDetails from "@/view/admin/pos/view";
import SupplierDetails from "@/view/admin/supplier/view";
import AllCustomer from "@/view/admin/customers/all";
import AllInvoice from "@/view/admin/invoices/all/";
import Unauthorized from "@/components/unauthorized";
import AdminGuard from "@/routes/private";
import ViewInvoice from "@/view/admin/invoices/view";
import ViewProfile from "@/view/admin/settings/view-profile";
import PermissionGuard from "@/routes/private/permission-guard";
import { PERMISSIONS } from "@/data/permissions";
import ProductRevenueReport from "@/view/admin/reports/product-revenue";

const P = PERMISSIONS;

const adminRoutes = [
  { path: "/unauthorized", element: <Unauthorized /> },
  {
    path: "/:role",
    element: <AdminGuard />,
    children: [
      {
        element: <Layout />,
        children: [
          {
            index: true,
            element: (
              <PermissionGuard requires={[]}>
                <Dashboard />
              </PermissionGuard>
            ),
          },
          {
            path: "dashboard",
            element: (
              <PermissionGuard requires={[]}>
                <Dashboard />
              </PermissionGuard>
            ),
          },
          {
            path: "settings",
            children: [
              {
                path: "view-profile",
                element: (
                  <PermissionGuard requires={[]}>
                    <ViewProfile />
                  </PermissionGuard>
                ),
              },
              {
                path: "update-profile",
                element: (
                  <PermissionGuard requires={[P.EDIT_PROFILE]}>
                    <div>Update Profile Page</div>
                  </PermissionGuard>
                ),
              },
              {
                path: "change-password",
                element: (
                  <PermissionGuard requires={[P.EDIT_PROFILE]}>
                    <div>Change Password Page</div>
                  </PermissionGuard>
                ),
              },
            ],
          },
          {
            path: "access",
            children: [
              {
                path: "roles",
                element: (
                  <PermissionGuard requires={[P.VIEW_ROLES]}>
                    <Roles />
                  </PermissionGuard>
                ),
              },
              {
                path: "roles-and-permissions",
                element: (
                  <PermissionGuard requires={[P.VIEW_ROLES]}>
                    <RolesAndPermissions />
                  </PermissionGuard>
                ),
              },
            ],
          },
          {
            path: "user",
            children: [
              {
                path: "all",
                element: (
                  <PermissionGuard requires={[P.VIEW_USERS]}>
                    <AllUsers />
                  </PermissionGuard>
                ),
              },
              {
                path: "add",
                element: (
                  <PermissionGuard requires={[P.CREATE_USERS]}>
                    <UserForm />
                  </PermissionGuard>
                ),
              },
              {
                path: "update/:id",
                element: (
                  <PermissionGuard requires={[P.EDIT_USERS]}>
                    <UserForm />
                  </PermissionGuard>
                ),
              },
              {
                path: "view/:id",
                element: (
                  <PermissionGuard requires={[P.VIEW_USERS]}>
                    <ViewUser />
                  </PermissionGuard>
                ),
              },
            ],
          },
          {
            path: "supplier",
            children: [
              {
                path: "all",
                element: (
                  <PermissionGuard requires={[P.VIEW_SUPPLIERS]}>
                    <AllSupplier />
                  </PermissionGuard>
                ),
              },
              {
                path: "create",
                element: (
                  <PermissionGuard requires={[P.CREATE_SUPPLIERS]}>
                    <SupplierForm />
                  </PermissionGuard>
                ),
              },
              {
                path: "update/:id",
                element: (
                  <PermissionGuard requires={[P.EDIT_SUPPLIERS]}>
                    <SupplierForm />
                  </PermissionGuard>
                ),
              },
              {
                path: "view/:id",
                element: (
                  <PermissionGuard requires={[P.VIEW_SUPPLIERS]}>
                    <SupplierDetails />
                  </PermissionGuard>
                ),
              },
            ],
          },
          {
            path: "product",
            children: [
              {
                path: "all",
                element: (
                  <PermissionGuard requires={[P.VIEW_PRODUCTS]}>
                    <AllProducts />
                  </PermissionGuard>
                ),
              },
              {
                path: "create",
                element: (
                  <PermissionGuard requires={[P.CREATE_PRODUCTS]}>
                    <ProductForm />
                  </PermissionGuard>
                ),
              },
              {
                path: "update/:id",
                element: (
                  <PermissionGuard requires={[P.EDIT_PRODUCTS]}>
                    <ProductForm />
                  </PermissionGuard>
                ),
              },
              {
                path: "view/:id",
                element: (
                  <PermissionGuard requires={[P.VIEW_PRODUCTS]}>
                    <ProductDetails />
                  </PermissionGuard>
                ),
              },
            ],
          },
          {
            path: "category",
            children: [
              {
                path: "all",
                element: (
                  <PermissionGuard requires={[P.VIEW_CATEGORIES]}>
                    <CategoriesAll />
                  </PermissionGuard>
                ),
              },
            ],
          },
          {
            path: "purchase",
            children: [
              {
                path: "all",
                element: (
                  <PermissionGuard requires={[P.VIEW_PURCHASES]}>
                    <Purchases />
                  </PermissionGuard>
                ),
              },
              {
                path: "add",
                element: (
                  <PermissionGuard requires={[P.CREATE_PURCHASES]}>
                    <PurchaseForm />
                  </PermissionGuard>
                ),
              },
              {
                path: "update/:id",
                element: (
                  <PermissionGuard requires={[P.EDIT_PURCHASES]}>
                    <PurchaseForm />
                  </PermissionGuard>
                ),
              },
              {
                path: "view/:id",
                element: (
                  <PermissionGuard requires={[P.VIEW_PURCHASES]}>
                    <PurchaseDetails />
                  </PermissionGuard>
                ),
              },
            ],
          },
          {
            path: "purchase-order",
            element: (
              <PermissionGuard requires={[P.VIEW_PURCHASES]}>
                <PurchaseOrder />
              </PermissionGuard>
            ),
          },
          {
            path: "purchase-return",
            element: (
              <PermissionGuard requires={[P.VIEW_PURCHASE_RETURNS]}>
                <PurchaseReturn />
              </PermissionGuard>
            ),
          },
          {
            path: "pos",
            children: [
              {
                path: "create",
                element: (
                  <PermissionGuard requires={[P.CREATE_POS]}>
                    <AllPos />
                  </PermissionGuard>
                ),
              },
              {
                path: "view/:id",
                element: (
                  <PermissionGuard requires={[P.VIEW_POS]}>
                    <POSDetails />
                  </PermissionGuard>
                ),
              },
            ],
          },
          {
            path: "sales",
            children: [
              {
                path: "all",
                element: (
                  <PermissionGuard requires={[P.VIEW_SALES]}>
                    <SalesRecords />
                  </PermissionGuard>
                ),
              },
              {
                path: "view/:id",
                element: (
                  <PermissionGuard requires={[P.VIEW_SALES]}>
                    <SalesDetails />
                  </PermissionGuard>
                ),
              },
            ],
          },
          {
            path: "reports",
            children: [
              {
                path: "product-revenue",
                element: (
                  <PermissionGuard requires={[P.VIEW_REPORTS]}>
                    <ProductRevenueReport />
                  </PermissionGuard>
                ),
              },
            ],
          },
          {
            path: "sale-return",
            element: (
              <PermissionGuard requires={[P.VIEW_SALE_RETURNS]}>
                <SaleReturnPage />
              </PermissionGuard>
            ),
          },
          {
            path: "activity-products",
            children: [
              {
                path: "low-stock",
                element: (
                  <PermissionGuard requires={[P.VIEW_STOCK]}>
                    <LowStock />
                  </PermissionGuard>
                ),
              },
              {
                path: "out-of-stock",
                element: (
                  <PermissionGuard requires={[P.VIEW_STOCK]}>
                    <OutOfStock />
                  </PermissionGuard>
                ),
              },
              {
                path: "expired-products",
                element: (
                  <PermissionGuard requires={[P.VIEW_STOCK]}>
                    <ExpiredProducts />
                  </PermissionGuard>
                ),
              },
              {
                path: "sellable-products",
                element: (
                  <PermissionGuard requires={[P.VIEW_STOCK]}>
                    <SellableProducts />
                  </PermissionGuard>
                ),
              },
            ],
          },
          {
            path: "stock",
            element: (
              <PermissionGuard requires={[P.VIEW_STOCK]}>
                <Stock />
              </PermissionGuard>
            ),
          },
          {
            path: "customer",
            children: [
              {
                path: "all",
                element: (
                  <PermissionGuard requires={[P.VIEW_CUSTOMERS]}>
                    <AllCustomer />
                  </PermissionGuard>
                ),
              },
            ],
          },
          {
            path: "invoice",
            children: [
              {
                path: "all",
                element: (
                  <PermissionGuard requires={[P.VIEW_INVOICES]}>
                    <AllInvoice />
                  </PermissionGuard>
                ),
              },
              {
                path: "view/:id",
                element: (
                  <PermissionGuard requires={[P.VIEW_INVOICES]}>
                    <ViewInvoice />
                  </PermissionGuard>
                ),
              },
            ],
          },
        ],
      },
    ],
  },
];

export default adminRoutes;
