import { useEffect, useState } from "react";
import { NavIconbar } from "../side-nav-icon-bar";
import { useLocation } from "react-router-dom";
import {TSidebarProps} from "@/interface/menu-and-common";
import {adminMenuItems} from "@/data";
import NavItem from "@/layout/dashboard/nav-item";

export default function Sidebar({
  navOpened,
  setNavOpened,
  setIsCollapsed,
  isCollapsed,
}: TSidebarProps) {
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const location = useLocation();

  // Toggle submenu open/close
  const handleSubmenuToggle = (label: string) =>
    setOpenSubmenu((prev) => (prev === label ? null : label));

  // Close all submenus
  const closeAllSubmenus = () => setOpenSubmenu(null);

  // Ensure sidebar starts expanded on desktop
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)"); // Small / medium devices

    // Always close nav on small screens
    const handleMediaChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setNavOpened(false);
      }
    };

    // Listen for screen size changes
    mediaQuery.addEventListener("change", handleMediaChange);

    // Set initial state
    if (mediaQuery.matches) {
      setNavOpened(false);
    }

    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, [setNavOpened]);

  // console.log("sidebar open consition : ", isCollapsed);

  return (
    <>
      {/* cover shap */}
      <div
        className={`fixed inset-0 bg-gray-900 z-20 transition-opacity opacity-50 lg:hidden ${
          isCollapsed ? "block" : "hidden"
        }`}
        onClick={() => setIsCollapsed?.(!isCollapsed)}
      ></div>

      <div
        className={`!fixed inset-y-0 h-screen left-0 z-30 [transition:0.3s] sidebar w-64 pb-4 overflow-y-auto overflow-x-hidden transition bg-[#005555] duration-300 transform lg:translate-x-0
                         ${
                           isCollapsed
                             ? "translate-x-0 ease-out"
                             : "-translate-x-full ease-in"
                         }
                         ${
                           navOpened
                             ? "ease-out md:w-16 "
                             : "ease-in md:w-[270px]  "
                         }
                         `}
      >
        {/* for dextop  */}
        {!navOpened ? (
          <>
            {/* logo  */}
            <div className="hidden lg:flex items-center justify-center border-b border-b-[#69fec1]/50 py-3">
              <div className="mx-auto w-24 h-10 text-4xl text-white">logo</div>
            </div>

            <nav className="pt-20 lg:pt-6">
              {adminMenuItems.map((block, blockIndex) => {
                const menus = Array.isArray(block.menu)
                  ? block.menu
                  : [block.menu];

                return (
                  <div key={blockIndex}>
                    {block.title && (
                      <h1 className="px-4 text-[#69fec1] uppercase !text-[11px]">
                        {block.title}
                      </h1>
                    )}

                    {menus.map((menu, menuIndex) => (
                      <NavItem
                        key={menuIndex}
                        menu={menu}
                        openSubmenu={openSubmenu}
                        handleSubmenuToggle={handleSubmenuToggle}
                        closeAllSubmenus={closeAllSubmenus}
                        setIsCollapsed={setIsCollapsed}
                        showBorder={
                          // show border after last menu in block, except for last block
                          menuIndex === menus.length - 1 &&
                          blockIndex !== adminMenuItems.length - 1
                        }
                      />
                    ))}
                  </div>
                );
              })}
            </nav>
          </>
        ) : (
          <div className="hidden lg:block">
            <div className="border-b border-b-[#69fec1]/50 p-3 w-full">
              <div className="flex items-center justify-center h-10 text-2xl text-white ">
                Lo
              </div>
            </div>
            <NavIconbar
              className={`z-40 h-full flex-1 sidebar lg:pt-6  
                                         ${navOpened && "max-h-screen h-full"}
                                         `}
              iconLinks={adminMenuItems.flatMap((block) => block.menu)}
              currentPath={location.pathname}
            />
          </div>
        )}
      </div>
    </>
  );
}
