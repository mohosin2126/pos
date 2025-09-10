import { Dropdown, Tooltip } from "antd";
import { Link } from "react-router-dom";
import {TMenuItem, TNavIconbarProps, TNavLinkIconDropdownProps, TNavLinkProps} from "@/interface/menu-and-common";


/* NavLinkIconDropdown */
function NavLinkIconDropdown({
  submenuData,
  currentPath,
}: TNavLinkIconDropdownProps) {
  const { icon: Icon, submenu = [] } = submenuData || {};

  const menuItems =
    submenu &&
    submenu?.map(({ label, href }) => ({
      key: `${href} + 1`,
      label: (
        <Link
          to={href as string}
          className={`block text-xs ${
            currentPath === href ? "!text-[#005555]" : ""
          } hover:!text-[#005555]`}
        >
          {label}
        </Link>
      ),
    }));

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={["hover"]}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      placement={"rightTop" as any}
      popupRender={(menu) => <div className="ml-6">{menu}</div>}
    >
      <div className="flex items-center justify-center cursor-pointer">
        {Icon ? (
          <Icon
            className={`h-8 flex items-center justify-center flex-col ${
              currentPath === submenuData.href
                ? "text-[#69fec1]"
                : "!text-gray-200"
            }`}
          />
        ) : (
          <span className="text-gray-400"></span>
        )}
      </div>
    </Dropdown>
  );
}

/* NavLink */
function NavLink({ navData, currentPath }: TNavLinkProps) {
  const { icon: Icon, label, href } = navData || {};

  if (!href) return null;

  return (
    <>
      {navData && (
        <Tooltip title={label} placement="right" className="px-5">
          <Link
            to={href}
            className={`h-8 flex items-center justify-center flex-col
                     ${
                       currentPath === href ? "text-[#69fec1]" : "text-gray-200"
                     }`}
          >
            {Icon && <Icon />}
          </Link>
        </Tooltip>
      )}
    </>
  );
}

/* NavIconbar */
export function NavIconbar({
  iconLinks,
  className,
  currentPath,
}: TNavIconbarProps) {
  const renderLink = ({
    navData,
    index,
  }: {
    navData: TMenuItem;
    index: number;
  }) => {
    if (navData?.submenu) {
      return (
        <NavLinkIconDropdown
          submenuData={navData}
          currentPath={currentPath}
          key={index}
        />
      );
    }
    return <NavLink navData={navData} currentPath={currentPath} key={index} />;
  };
  return (
    <div
      className={`border-b bg-background py-2 transition-all duration-500 md:border-none ${className}`}
    >
      <nav className="flex flex-col items-center justify-center gap-2">
        {iconLinks?.map((navData, index) => renderLink({ navData, index }))}
      </nav>
    </div>
  );
}
