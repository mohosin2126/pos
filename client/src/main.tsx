import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import "./styles/index.css";
import "antd/dist/reset.css";
import {RouterProvider} from "react-router-dom";
import {routes} from "./routes";
import {UserProvider} from "@/context-api";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <UserProvider>
            <RouterProvider router={routes}/>
        </UserProvider>
    </StrictMode>
);
