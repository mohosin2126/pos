import Layout from "@/layout/dashboard";
import Dashboard from "@/view/admin/dashboard";
import Unauthorized from "@/components/unauthorized";
import AdminGuard from "@/routes/private";
import Roles from "@/view/admin/roles";

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
                ],
            },
        ],
    },
];

export default adminRoutes;
