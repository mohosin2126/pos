import { useEffect, useState } from "react";
import { Button, Checkbox, Form, Input, message, Divider } from "antd";
import { FaSave } from "react-icons/fa";
import CustomModal from "@/components/modal";
import { useCreateRole, useUpdateRole } from "@/hooks/admin/role";
import type { TRole, TRoleFormPayload } from "@/hooks/admin/role";
import {
  PERMISSION_GROUPS,
  ALL_PERMISSIONS,
  type Permission,
} from "@/data/permissions";

interface RoleFormModalProps {
  open: boolean;
  role: TRole | null;
  onClose: (saved?: boolean) => void;
}

export default function RoleFormModal({
  open,
  role,
  onClose,
}: RoleFormModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const { createRole } = useCreateRole();
  const { updateRole } = useUpdateRole();

  const isEdit = !!role;
  const isAdmin = role?.name === "admin";

  useEffect(() => {
    if (open) {
      if (role) {
        form.setFieldsValue({ name: role.name });
        setSelectedPermissions(role.permissions || []);
      } else {
        form.resetFields();
        setSelectedPermissions([]);
      }
    }
  }, [role, open, form]);

  const handleFinish = async (values: { name: string }) => {
    setLoading(true);
    try {
      const payload: TRoleFormPayload = {
        name: values.name,
        permissions: selectedPermissions,
      };

      if (isEdit && role) {
        await updateRole(role.id, payload);
        message.success("Role updated successfully");
      } else {
        await createRole(payload);
        message.success("Role created successfully");
      }
      onClose(true);
    } catch {
      message.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const allSelected = selectedPermissions.length === ALL_PERMISSIONS.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions([...ALL_PERMISSIONS]);
    }
  };

  const isGroupAllSelected = (perms: Permission[]) =>
    perms.every((p) => selectedPermissions.includes(p));

  const isGroupPartial = (perms: Permission[]) =>
    perms.some((p) => selectedPermissions.includes(p)) &&
    !isGroupAllSelected(perms);

  const toggleGroup = (perms: Permission[]) => {
    if (isGroupAllSelected(perms)) {
      setSelectedPermissions((prev) => prev.filter((p) => !perms.includes(p as Permission)));
    } else {
      setSelectedPermissions((prev) => [
        ...new Set([...prev, ...perms]),
      ]);
    }
  };

  const togglePermission = (perm: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const formatPermLabel = (perm: string) =>
    perm
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <CustomModal
      isOpen={open}
      setIsOpen={() => onClose()}
      title={isEdit ? "Edit Role" : "Add Role"}
      description={
        isEdit
          ? "Update the role name and permissions"
          : "Create a new role and assign permissions"
      }
      width={800}
    >
      <Form layout="vertical" form={form} onFinish={handleFinish}>
        <Form.Item
          label="Role Name"
          name="name"
          rules={[
            { required: true, message: "Role name is required" },
            { min: 2, message: "Role name must be at least 2 characters" },
          ]}
        >
          <Input
            placeholder="Enter role name"
            disabled={isAdmin}
            className="!py-2"
          />
        </Form.Item>

        <Divider orientation="left" className="!mb-3 !mt-1">
          Permissions
        </Divider>

        <div className="mb-4">
          <Checkbox
            checked={allSelected}
            indeterminate={
              selectedPermissions.length > 0 && !allSelected
            }
            onChange={toggleSelectAll}
            disabled={isAdmin}
          >
            <span className="font-semibold">Select All Permissions</span>
          </Checkbox>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-2">
          {Object.entries(PERMISSION_GROUPS).map(([key, group]) => (
            <div
              key={key}
              className="border rounded-lg p-3 bg-gray-50/50"
            >
              <Checkbox
                checked={isGroupAllSelected(group.permissions)}
                indeterminate={isGroupPartial(group.permissions)}
                onChange={() => toggleGroup(group.permissions)}
                disabled={isAdmin}
                className="!mb-2"
              >
                <span className="font-semibold text-sm">{group.label}</span>
              </Checkbox>
              <div className="flex flex-col gap-1 ml-6">
                {group.permissions.map((perm) => (
                  <Checkbox
                    key={perm}
                    checked={selectedPermissions.includes(perm)}
                    onChange={() => togglePermission(perm)}
                    disabled={isAdmin}
                  >
                    <span className="text-xs text-gray-600">
                      {formatPermLabel(perm)}
                    </span>
                  </Checkbox>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-2 text-sm text-gray-500">
          {selectedPermissions.length} of {ALL_PERMISSIONS.length} permissions
          selected
        </div>

        <Button
          icon={<FaSave />}
          loading={loading}
          htmlType="submit"
          className="btn hover:!text-[#69feb0] !mt-5 !px-6"
          disabled={isAdmin}
        >
          {isEdit ? "Update Role" : "Add Role"}
        </Button>
      </Form>
    </CustomModal>
  );
}
