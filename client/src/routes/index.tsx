import { createBrowserRouter } from "react-router-dom";
import homeRoutes from "./home";

export const routes = createBrowserRouter([
    {
        path: "/",
        children: [
            {
                path: "/",
                children: homeRoutes,
            },

        ],
    },
]);
