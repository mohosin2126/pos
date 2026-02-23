import { Navigate } from "react-router-dom";
import { usePermissions } from "@/hooks/common/use-permissions";
import type { ReactNode } from "react";

interface PermissionGuardProps {
 
  requires: string[];
 
  fallback?: ReactNode;
  children: ReactNode;
}


export default function PermissionGuard({
  requires,
  fallback,
  children,
}: PermissionGuardProps) {
  const { hasAllPermissions } = usePermissions();

  if (requires.length === 0 || hasAllPermissions(...requires)) {
    return <>{children}</>;
  }

  if (fallback) return <>{fallback}</>;

  return <Navigate to="/unauthorized" replace />;
}
