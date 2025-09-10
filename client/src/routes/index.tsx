import { createBrowserRouter } from "react-router-dom";
import homeRoutes from "./home";
import Auth from "./auth";
import adminRoutes from "@/routes/admin";

export const routes = createBrowserRouter([
    {
        path: "/",
        children: [
            {
                path: "/",
                children: homeRoutes,
            },
            {
                path: "auth",
                element: <Auth />,
            },
            ...adminRoutes,
        ],
    },
]);
