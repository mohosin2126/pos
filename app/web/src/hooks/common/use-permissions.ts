import { useMemo, useCallback } from "react";
import { useUser } from "@/context-api";
import type { Permission } from "@/data/permissions";


export function usePermissions() {
  const { user } = useUser();

  const isAdmin = useMemo(() => user?.role === "admin", [user?.role]);
  const permissions = useMemo<string[]>(
    () => user?.permissions ?? [],
    [user?.permissions]
  );

  const hasPermission = useCallback(
    (permission: Permission | string): boolean => {
      if (isAdmin) return true;
      return permissions.includes(permission);
    },
    [isAdmin, permissions]
  );

 
  const hasAnyPermission = useCallback(
    (...perms: (Permission | string)[]): boolean => {
      if (isAdmin) return true;
      return perms.some((p) => permissions.includes(p));
    },
    [isAdmin, permissions]
  );

  const hasAllPermissions = useCallback(
    (...perms: (Permission | string)[]): boolean => {
      if (isAdmin) return true;
      return perms.every((p) => permissions.includes(p));
    },
    [isAdmin, permissions]
  );

  return {
    isAdmin,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}
