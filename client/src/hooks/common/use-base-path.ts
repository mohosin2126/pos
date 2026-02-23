import { useMemo } from "react";
import { useUser } from "@/context-api";


export function useBasePath(): string {
  const { user } = useUser();
  return useMemo(() => {
    const role = user?.role;
    if (!role) return "/admin";
    return `/${role.toLowerCase().replace(/\s+/g, "-")}`;
  }, [user?.role]);
}
