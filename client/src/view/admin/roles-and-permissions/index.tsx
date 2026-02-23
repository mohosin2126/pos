import { useState, useMemo } from "react";
import { Checkbox, message, Spin, Tag, Tooltip } from "antd";
import { DashboardTitle } from "@/components/re-useable/dashboard-titile";
import ToolbarButton from "@/components/re-useable/toolbar-button";
import { useRoles, useUpdateRole } from "@/hooks/admin/role";
import type { TRole } from "@/hooks/admin/role";
import { PERMISSION_GROUPS, ALL_PERMISSIONS } from "@/data/permissions";
import { usePermissions } from "@/hooks/common/use-permissions";
import { PERMISSIONS } from "@/data/permissions";

export default function RolesAndPermissions() {
  const { roles, loading, refetch } = useRoles();
  const { updateRole } = useUpdateRole();
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission(PERMISSIONS.EDIT_ROLES);

  const [saving, setSaving] = useState<number | null>(null);

  const groups = useMemo(
    () => Object.entries(PERMISSION_GROUPS),
    []
  );

  const handleToggle = async (role: TRole, perm: string) => {
    if (role.name === "admin") return;
    if (!canEdit) return;

    const current = role.permissions || [];
    const updated = current.includes(perm)
      ? current.filter((p) => p !== perm)
      : [...current, perm];

    setSaving(role.id);
    try {
      await updateRole(role.id, { name: role.name, permissions: updated });
      message.success(`Updated ${role.name} permissions`);
      refetch();
    } catch {
      message.error("Failed to update permissions");
    } finally {
      setSaving(null);
    }
  };

  const handleToggleGroup = async (
    role: TRole,
    groupPerms: string[]
  ) => {
    if (role.name === "admin" || !canEdit) return;

    const current = role.permissions || [];
    const allChecked = groupPerms.every((p) => current.includes(p));
    const updated = allChecked
      ? current.filter((p) => !groupPerms.includes(p))
      : [...new Set([...current, ...groupPerms])];

    setSaving(role.id);
    try {
      await updateRole(role.id, { name: role.name, permissions: updated });
      message.success(`Updated ${role.name} permissions`);
      refetch();
    } catch {
      message.error("Failed to update permissions");
    } finally {
      setSaving(null);
    }
  };

  const formatPermLabel = (perm: string) =>
    perm
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex md:items-center justify-between flex-col md:flex-row gap-6">
        <DashboardTitle
          title="Roles & Permissions"
          description="View and manage permission assignments for each role"
        />
        <div className="flex items-center gap-x-3">
          <ToolbarButton
            onPdfClick={() => console.log("PDF Export")}
            onExcelClick={() => console.log("Excel Export")}
            onRefreshClick={refetch}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-3 min-w-[200px] sticky left-0 bg-gray-50 z-10">
                Permission
              </th>
              {roles.map((role) => (
                <th
                  key={role.id}
                  className="text-center p-3 min-w-[120px]"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="capitalize font-semibold">
                      {role.name}
                    </span>
                    <Tag color={role.name === "admin" ? "gold" : "blue"}>
                      {role.permissions?.length || 0}/{ALL_PERMISSIONS.length}
                    </Tag>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map(([groupKey, group]) => (
              <>
                {/* Group Header Row */}
                <tr key={`group-${groupKey}`} className="bg-gray-100/70">
                  <td className="p-2 pl-3 font-semibold text-gray-700 sticky left-0 bg-gray-100/70 z-10">
                    {group.label}
                  </td>
                  {roles.map((role) => {
                    const allChecked = group.permissions.every((p) =>
                      role.permissions?.includes(p)
                    );
                    const someChecked =
                      group.permissions.some((p) =>
                        role.permissions?.includes(p)
                      ) && !allChecked;

                    return (
                      <td key={role.id} className="text-center p-2">
                        {saving === role.id ? (
                          <Spin size="small" />
                        ) : (
                          <Tooltip
                            title={
                              role.name === "admin"
                                ? "Admin has all permissions"
                                : canEdit
                                ? `Toggle all ${group.label}`
                                : "No edit permission"
                            }
                          >
                            <Checkbox
                              checked={allChecked}
                              indeterminate={someChecked}
                              disabled={
                                role.name === "admin" || !canEdit
                              }
                              onChange={() =>
                                handleToggleGroup(role, [...group.permissions])
                              }
                            />
                          </Tooltip>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Individual Permission Rows */}
                {group.permissions.map((perm) => (
                  <tr
                    key={`${groupKey}-${perm}`}
                    className="border-b border-gray-100 hover:bg-gray-50/50"
                  >
                    <td className="p-2 pl-8 text-gray-600 sticky left-0 bg-white z-10">
                      {formatPermLabel(perm)}
                    </td>
                    {roles.map((role) => (
                      <td key={role.id} className="text-center p-2">
                        {saving === role.id ? (
                          <Spin size="small" />
                        ) : (
                          <Checkbox
                            checked={role.permissions?.includes(perm)}
                            disabled={
                              role.name === "admin" || !canEdit
                            }
                            onChange={() => handleToggle(role, perm)}
                          />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
