import { useState } from "react";
import { Button, Table, Tag, Popconfirm, message, Space, Tooltip } from "antd";
import { MdAddCircleOutline } from "react-icons/md";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { DashboardTitle } from "@/components/re-useable/dashboard-titile";
import ToolbarButton from "@/components/re-useable/toolbar-button";
import { useRoles, useDeleteRole } from "@/hooks/admin/role";
import type { TRole } from "@/hooks/admin/role";
import { usePermissions } from "@/hooks/common/use-permissions";
import { PERMISSIONS } from "@/data/permissions";
import RoleFormModal from "./form";

export default function Roles() {
  const { roles, loading, refetch } = useRoles();
  const { deleteItem } = useDeleteRole();
  const { hasPermission } = usePermissions();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<TRole | null>(null);

  const handleAdd = () => {
    setEditingRole(null);
    setModalOpen(true);
  };

  const handleEdit = (role: TRole) => {
    setEditingRole(role);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteItem(id);
      message.success("Role deleted successfully");
      refetch();
    } catch {
      message.error("Failed to delete role");
    }
  };

  const handleModalClose = (saved?: boolean) => {
    setModalOpen(false);
    setEditingRole(null);
    if (saved) refetch();
  };

  const builtInRoles = ["admin", "manager", "employee"];

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 60,
    },
    {
      title: "Role Name",
      dataIndex: "name",
      key: "name",
      render: (name: string) => (
        <span className="font-medium capitalize">{name}</span>
      ),
    },
    {
      title: "Permissions",
      dataIndex: "permissions",
      key: "permissions",
      render: (permissions: string[]) => (
        <div className="flex flex-wrap gap-1">
          <Tag color="blue">{permissions?.length || 0} permissions</Tag>
        </div>
      ),
    },
    {
      title: "Users",
      dataIndex: "users",
      key: "users",
      render: (users: TRole["users"]) => (
        <Tag color="green">{users?.length || 0} users</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 140,
      render: (_: unknown, record: TRole) => (
        <Space>
          {hasPermission(PERMISSIONS.EDIT_ROLES) && (
            <Tooltip title="Edit">
              <Button
                type="text"
                size="small"
                icon={<FiEdit2 />}
                onClick={() => handleEdit(record)}
              />
            </Tooltip>
          )}
          {hasPermission(PERMISSIONS.DELETE_ROLES) &&
            !builtInRoles.includes(record.name) && (
              <Popconfirm
                title="Delete this role?"
                description="This action cannot be undone."
                onConfirm={() => handleDelete(record.id)}
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <Tooltip title="Delete">
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<FiTrash2 />}
                  />
                </Tooltip>
              </Popconfirm>
            )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex md:items-center justify-between flex-col md:flex-row gap-6">
        <DashboardTitle
          title="Roles"
          description="Manage and assign user roles to control access and permissions"
        />
        <div className="flex items-center gap-x-3">
          <ToolbarButton
            onPdfClick={() => console.log("PDF Export")}
            onExcelClick={() => console.log("Excel Export")}
            onRefreshClick={refetch}
          />
          {hasPermission(PERMISSIONS.CREATE_ROLES) && (
            <Button
              type="primary"
              icon={<MdAddCircleOutline />}
              className="btn hover:!text-[#69feb0]"
              onClick={handleAdd}
            >
              Add Role
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border p-1">
        <Table
          dataSource={roles}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          size="middle"
        />
      </div>

      <RoleFormModal
        open={modalOpen}
        role={editingRole}
        onClose={handleModalClose}
      />
    </div>
  );
}
