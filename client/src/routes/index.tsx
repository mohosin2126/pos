import { createBrowserRouter } from "react-router-dom";
import adminRoutes from "./admin";
import homeRoutes from "./home";
import Auth from "./auth";

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
