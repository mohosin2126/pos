import { MdOutlineArrowCircleRight } from "react-icons/md";
import { Link, useLocation } from "react-router-dom";
import { useRef } from "react";
import { IoIosArrowDown } from "react-icons/io";
import {TNavItemProps} from "@/interface/menu-and-common";

export default function NavItem({
  menu,
  title,
  openSubmenu,
  handleSubmenuToggle,
  closeAllSubmenus,
  setIsCollapsed,
  showBorder,
}: TNavItemProps) {
  const { href: to, icon: Icon, label, submenu } = menu || {};
  const submenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const activeClass =
    "bg-[#186566] text-[#69fec1] border-gray-100 font-normal  border-l-2 border-l-slate-300";
  const inactiveClass =
    "border-gray-900 text-white hover:bg-[#186566] hover:text-[#69fec1] font-normal border-l-2 border-l-transparent";

  const handleClick = () => {
    if (!menu?.submenu) {
      closeAllSubmenus();
    }
  };

  const isSubmenuOpen = openSubmenu === label;

  return (
    <div className="px-4">
      {title && (
        <h1 className="text-[#69fec1] font-normal uppercase !text-xs">
          {title}
        </h1>
      )}
      <div
        onClick={submenu ? () => handleSubmenuToggle(label) : handleClick}
        className={`flex items-center px-2 mt-2 duration-200 cursor-pointer text-sm ${
          location.pathname === to ? activeClass : inactiveClass
        }`}
      >
        {!submenu ? (
          <Link
            to={to as string}
            onClick={() => setIsCollapsed?.(false)}
            className="flex items-center py-2 gap-2 w-full"
          >
            <Icon size={16} />
            {label}
          </Link>
        ) : (
          <div className="flex items-center py-2 gap-2 w-full">
            <Icon size={16} />
            {label}
            <span
              className={`ml-auto ${
                isSubmenuOpen ? "transform rotate-180" : ""
              }`}
            >
              <IoIosArrowDown />
            </span>
          </div>
        )}
      </div>

      {/* Render submenu if it exists and is open */}
      {submenu && (
        <div
          ref={submenuRef}
          className={`ml-5 overflow-hidden transition-all duration-500 ease-in-out`}
          style={{
            maxHeight: isSubmenuOpen
              ? `${submenuRef.current?.scrollHeight}px`
              : "0px",
          }}
        >
          {submenu.map((item) => (
            <Link
              key={item?.href}
              to={item?.href as string}
              onClick={() => setIsCollapsed?.(false)}
              className={`flex items-center justify-start pl-2 gap-2 py-2 mt-2 duration-200 text-sm ${
                location.pathname === item?.href ? activeClass : inactiveClass
              }`}
            >
              <MdOutlineArrowCircleRight size={18} />
              <span>{item?.label}</span>
            </Link>
          ))}
        </div>
      )}

      {showBorder && <hr className="mt-3 mb-5 border-[#69fec1]/50" />}
    </div>
  );
}
