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
import AllProducts from "@/view/admin/product/all/intex";
import ProductForm from "@/view/admin/product/form";
import ProductDetails from "@/view/admin/product/view";
import AllPos from "@/view/admin/pos/all";
import POSForm from "@/view/admin/pos/create";
import PurchaseOrder from "@/view/admin/purchase-order";
import PurchaseReturn from "@/view/admin/purchase-return";
import SalesRecords from "@/view/admin/sales-records/all";
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
const adminRoutes = [
  { path: "/unauthorized", element: <Unauthorized /> },
  {
    path: "/admin",
    element: <AdminGuard />,
    children: [
      {
        element: <Layout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "dashboard", element: <Dashboard /> },
          {
            path: "settings",
            children: [
              { path: "view-profile", element: <div>Profile Page</div> },
              {
                path: "update-profile",
                element: <div>Update Profile Page</div>,
              },
              {
                path: "change-password",
                element: <div>Change Password Page</div>,
              },
            ],
          },
          {
            path: "access",
            children: [
              { path: "roles", element: <Roles /> },
            ],
          },
          {
            path: "user",
            children: [
              { path: "all", element: <AllUsers /> },
              { path: "add", element: <UserForm /> },
              { path: "update/:id", element: <UserForm /> },
              { path: "view/:id", element: <ViewUser /> },
            ],
          },
          {
            path: "supplier",
            children: [
              { path: "all", element: <AllSupplier /> },
              { path: "create", element: <SupplierForm /> },
              { path: "update/:id", element: <SupplierForm /> },
              { path: "view/:id", element: <SupplierDetails /> },
            ],
          },
          {
            path: "product",
            children: [
              { path: "all", element: <AllProducts /> },
              { path: "create", element: <ProductForm /> },
              { path: "update/:id", element: <ProductForm /> },
              { path: "view/:id", element: <ProductDetails /> },
            ],
          },
          {
            path: "category",
            children: [{ path: "all", element: <CategoriesAll /> }],
          },
          {
            path: "purchase",
            children: [
              { path: "all", element: <Purchases /> },
              { path: "add", element: <PurchaseForm /> },
              { path: "update/:id", element: <PurchaseForm /> },
              { path: "view/:id", element: <PurchaseDetails /> },
            ],
          },
          { path: "purchase-order", element: <PurchaseOrder /> },
          { path: "purchase-return", element: <PurchaseReturn /> },
          {
            path: "pos",
            children: [
              { path: "all", element: <AllPos /> },
              { path: "create", element: <POSForm /> },
              { path: "view/:id", element: <POSDetails /> },
            ],
          },
          {
            path: "sales",
            children: [
              { path: "all", element: <SalesRecords /> },
              { path: "view/:id", element: <SalesDetails /> },
            ],
          },
          {
            path: "activity-products",
            children: [
              { path: "low-stock", element: <LowStock /> },
              { path: "out-of-stock", element: <OutOfStock /> },
              { path: "expired-products", element: <ExpiredProducts /> },
              { path: "sellable-products", element: <SellableProducts /> },
            ],
          },
          { path: "stock", element: <Stock /> },
          {
            path: "customer",
            children: [{ path: "all", element: <AllCustomer /> }],
          },
          {
            path: "invoice",
            children: [
              { path: "all", element: <AllInvoice /> },
              { path: "view/:id", element: <ViewInvoice /> },
            ],
          },
        ],
      },
    ],
  },
];

export default adminRoutes;
