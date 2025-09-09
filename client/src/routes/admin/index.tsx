import Layout from "@/layout/dashboard";
import Dashboard from "@/view/admin/dashboard";
import Unauthorized from "@/components/unauthorized";
import AdminGuard from "@/routes/private";
import Roles from "@/view/admin/roles";
import AllUsers from "@/view/admin/users/all";
import UserForm from "@/view/admin/users/form";
import ViewUser from "@/view/admin/users/view";

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
                ],
            },
        ],
    },
];

export default adminRoutes;
