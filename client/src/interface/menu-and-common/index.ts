import type { ComponentType, ReactNode } from "react";
// export type TMenuTitle = {
//   title: string;
// };

export type TMenuItem = {
  label: string;
  icon: ComponentType<any>;
  href?: string;
  submenu?: TMenuItem[];
  title?: string;
};

export type TMenuBlock = {
  title: string;
  menu: TMenuItem[];
};
// export type TMenuEntry = TMenuItem | TMenuTitle;

export type TNavItemProps = {
  menu: TMenuItem;
  title?: string;
  openSubmenu?: string | null;
  handleSubmenuToggle: (label: string) => void;
  closeAllSubmenus: () => void;
  setIsCollapsed?: (open: boolean) => void;
  showBorder?: boolean;
};

export type TSidebarProps = {
  navOpened: boolean;
  setNavOpened: React.Dispatch<React.SetStateAction<boolean>>;
  isCollapsed?: boolean;
  setIsCollapsed?: React.Dispatch<React.SetStateAction<boolean>>;
};

export type TNavLinkItem = {
  title: string;
  href: string;
};

// nav-icon-bar
export interface TNavLinkProps {
  navData: TMenuItem;
  currentPath: string;
}

export interface TNavIconbarProps {
  iconLinks?: TMenuItem[];
  className?: string;
  closeNav?: () => void;
  isCollapsed?: boolean;
  currentPath: string;
}

export interface TNavLinkIconDropdownProps {
  submenuData: TMenuItem;
  currentPath: string;
}

// menu end

// for title

export interface TDashboardProps {
  title: string;
  level?: 1 | 2 | 3 | 4 | 5;
  description: string;
}

// for action button

export interface TActionButtonProps {
  viewUrl?: string;
  editUrl?: string;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

// confirmation delete for
export interface TConfirmDeleteProps {
  title: string;
  content: string;
  okText?: string;
  okType?: "primary" | "danger" | "default" | "link";
  cancelText?: string;
  onConfirm: () => Promise<any> | void;
}

// toolbar button
export interface TToolbarButtonProps {
  onPdfClick?: () => void;
  onExcelClick?: () => void;
  onRefreshClick?: () => void;
}

// category card

export interface TCategoryProps {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  onEdit?: () => void;
  onDelete?: (id: number) => void;
}

export interface TCategoryFormProps {
  updateValue?: any;
  isOpen: boolean;
  onClose: () => void;
  refetch: () => void;
}

// for modal
export interface TCustomModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
  width?: number | string;
}

export interface TLang {
  key: string;
  label: string;
  flag: string;
}

export interface TDemoUser {
  firstName?: string;
  lastName?: string;
  email?: string;
}
