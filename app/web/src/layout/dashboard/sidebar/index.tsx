import { useEffect, useMemo, useState } from "react";
import { NavIconbar } from "../side-nav-icon-bar";
import { useLocation } from "react-router-dom";
import { TSidebarProps } from "@/interface/menu-and-common";
import { getMenuItems } from "@/data";
import NavItem from "@/layout/dashboard/nav-item";
import logoFull from "@/assets/logo/logo-full.svg";
import logoIcon from "@/assets/logo/logo-icon.svg";
import { useUser } from "@/context-api";
import { filterMenuByPermissions } from "@/utils/menu-filter";
import { useBasePath } from "@/hooks/common/use-base-path";

export default function Sidebar({
                                    navOpened,
                                    setNavOpened,
                                    setIsCollapsed,
                                    isCollapsed,
                                }: TSidebarProps) {
    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
    const location = useLocation();
    const { user } = useUser();
    const basePath = useBasePath();

    const filteredMenuItems = useMemo(
        () => filterMenuByPermissions(getMenuItems(basePath), user),
        [user, basePath]
    );

    const handleSubmenuToggle = (label: string) =>
        setOpenSubmenu((prev) => (prev === label ? null : label));

    const closeAllSubmenus = () => setOpenSubmenu(null);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 768px)");

        const handleMediaChange = (e: MediaQueryListEvent) => {
            if (e.matches) {
                setNavOpened(false);
            }
        };

        mediaQuery.addEventListener("change", handleMediaChange);

        if (mediaQuery.matches) {
            setNavOpened(false);
        }

        return () => mediaQuery.removeEventListener("change", handleMediaChange);
    }, [setNavOpened]);

    useEffect(() => {
        const body = document.body;
        if (isCollapsed) {
            body.style.overflow = "hidden";
        } else {
            body.style.overflow = "";
        }

        return () => {
            body.style.overflow = "";
        };
    }, [isCollapsed]);

    return (
        <>
            {/* cover shap */}
            <div
                className={`fixed inset-0 bg-[#005555] z-20 transition-opacity opacity-50 lg:hidden ${
                    isCollapsed ? "block" : "hidden"
                }`}
                onClick={() => setIsCollapsed?.(!isCollapsed)}
            ></div>

            <div
                className={`!fixed inset-y-0 h-screen left-0 z-30 [transition:0.3s] w-64 pb-4 sidebar overflow-y-auto overflow-x-hidden transition bg-[#005555] duration-300 transform lg:translate-x-0
                         ${
                    isCollapsed
                        ? "translate-x-0 ease-out"
                        : "-translate-x-full ease-in"
                }
                         ${
                    navOpened
                        ? "ease-out md:w-16 "
                        : "ease-in md:w-[270px] lg:w-[210px] xl:w-[270px]  "
                }
                         `}
            >
                {/* for desktop  */}
                {!navOpened ? (
                    <>
                        {/* logo  */}
                        <div className="hidden lg:flex items-center justify-center border-b border-b-[#69fec1]/50 py-3">
                            <img src={logoFull} alt="POS" className="mx-auto h-10 w-auto" />
                        </div>

                        <nav className="lg:pt-6 lg:pb-0 pb-4 pt-20">
                            {filteredMenuItems.map((block, blockIndex) => {
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
                                                    menuIndex === menus.length - 1 &&
                                                    blockIndex !== filteredMenuItems.length - 1
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
                            <div className="flex items-center justify-center h-10">
                                <img src={logoIcon} alt="POS" className="h-8 w-auto" />
                            </div>
                        </div>
                        <NavIconbar
                            className={`z-40 h-full flex-1 sidebar lg:pt-6  
                                         ${navOpened && "max-h-screen h-full"}
                                         `}
                            iconLinks={filteredMenuItems.flatMap((block) => block.menu)}
                            currentPath={location.pathname}
                        />
                    </div>
                )}
            </div>
        </>
    );
}
