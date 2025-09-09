import Layout from "@/layout/dashboard";
import Dashboard from "@/view/admin/dashboard";
import Unauthorized from "@/components/unauthorized";
import AdminGuard from "@/routes/private";

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
                ],
            },
        ],
    },
];

export default adminRoutes;
