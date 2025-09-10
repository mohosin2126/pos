import Layout from "@/layout/dashboard";
import Dashboard from "@/view/admin/dashboard";
import Unauthorized from "@/components/unauthorized";
import AdminGuard from "@/routes/private";
import Roles from "@/view/admin/roles";
import AllUsers from "@/view/admin/users/all";
import UserForm from "@/view/admin/users/form";
import ViewUser from "@/view/admin/users/view";
import AllSupplier from "@/view/admin/supplier/all";
import SupplierForm from "@/view/admin/supplier/form";
import SupplierDetails from "@/view/admin/supplier/view";
import AllProducts from "@/view/admin/product/all/intex";
import ProductForm from "@/view/admin/product/form";
import ProductDetails from "@/view/admin/product/view";
import CategoriesAll from "@/view/admin/categories/all";

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
                ],
            },
        ],
    },
];

export default adminRoutes;
