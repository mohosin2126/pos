import type { TMenuBlock, TMenuItem } from "@/interface/menu-and-common";
import type { TUserPayload } from "@/interface/common";


export function filterMenuByPermissions(
  menuBlocks: TMenuBlock[],
  user: TUserPayload | null
): TMenuBlock[] {
  
  if (!user || user.role === "admin") return menuBlocks;

  const userPerms: string[] = user.permissions ?? [];

  function isItemVisible(item: TMenuItem): boolean {
    if (!item.permission) return true;
    const required = Array.isArray(item.permission)
      ? item.permission
      : [item.permission];
    
    return required.some((p) => userPerms.includes(p));
  }

  function filterItem(item: TMenuItem): TMenuItem | null {
   
    if (item.submenu && item.submenu.length > 0) {
      const filteredSub = item.submenu
        .filter(isItemVisible)
        .map((sub) => filterItem(sub))
        .filter(Boolean) as TMenuItem[];

      if (filteredSub.length === 0) return null; 
      return { ...item, submenu: filteredSub };
    }

    return isItemVisible(item) ? item : null;
  }

  return menuBlocks
    .map((block) => {
      const menus = (Array.isArray(block.menu) ? block.menu : [block.menu])
        .map((item) => filterItem(item))
        .filter(Boolean) as TMenuItem[];

      if (menus.length === 0) return null;
      return { ...block, menu: menus };
    })
    .filter(Boolean) as TMenuBlock[];
}
