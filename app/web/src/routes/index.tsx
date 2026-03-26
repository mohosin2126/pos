import { createBrowserRouter } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import type { RouterProviderProps } from "react-router-dom";
import adminRoutes from "./admin";
import homeRoutes from "./home";
import Auth from "./auth";

const routeConfig: RouteObject[] = [
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
];

export const routes: RouterProviderProps["router"] =
  createBrowserRouter(routeConfig);
