import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar";
import Header from "./header";
import { ConfigProvider } from "antd";

export default function Layout() {
  const [navOpened, setNavOpened] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: "Inter, sans-serif",
        },
      }}
    >
      <div className="flex min-h-screen h-full font-secondary">
        <Sidebar
          setNavOpened={setNavOpened}
          navOpened={navOpened}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

        <div
          className={`flex flex-col w-full transition-all duration-300 
          ${navOpened ? "lg:pl-16" : "lg:pl-[270px]"}`}
        >
          <Header
            setNavOpened={setNavOpened}
            navOpened={navOpened}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />

          <main className="w-full bg-[#f2f4f7] p-4 md:p-6 min-h-[calc(100vh-116px)] h-full sidebar">
            <Outlet />
          </main>
        </div>
      </div>
    </ConfigProvider>
  );
}
