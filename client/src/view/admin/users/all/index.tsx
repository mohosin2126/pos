import { useState } from "react";
import {
  Table,
  Tag,
  Button,
  Card,
  Input,
  Select,
  message,
  Space,
  Avatar,
} from "antd";
import { Link } from "react-router-dom";
import { DashboardTitle } from "@/components/re-useable/dashboard-titile";
import { FaUserPlus } from "react-icons/fa";
import { MdOutlineSearch } from "react-icons/md";
import { ActionButton } from "@/components/re-useable/action-button";
import { showConfirmDelete } from "@/components/re-useable/delete-modal";
const { Option } = Select;
import ToolbarButton from "@/components/re-useable/toolbar-button";
import type { TableProps } from "antd";
import type { TUserPayload, TUseUsersResult } from "@/interface/common";
import { useDeleteUser, useUsers } from "@/hooks/admin/user";
import { RiResetLeftFill } from "react-icons/ri";
import Loader from "@/components/re-useable/loader";

export default function AllUsers() {
  const { users, refetch, loading }: TUseUsersResult = useUsers();
  const [searchText, setSearchText] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [filterRole, setFilterRole] = useState<
    "all" | "admin" | "user" | "moderator"
  >("all");
  const [filterBlood, setFilterBlood] = useState<
    "all" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"
  >("all");

  const { deleteItem } = useDeleteUser();

  const handleDelete = (record: any) => {
    const fullName = `${record?.firstName ?? ""} ${
      record.lastName ?? ""
    }`.trim();
    showConfirmDelete({
      title: "Delete User",
      content: `Are you sure you want to delete "${
        fullName || "this User"
      } "? This action cannot be undone.`,
      onConfirm: async () => {
        await deleteItem(record?.id);
        message.success("User deleted successfully");
        refetch();
      },
    });
  };

  const columns = [
    {
      title: "user",
      dataIndex: "user",
      key: "user",
      render: (_: any, record: TUserPayload) => (
        <Space>
          <Avatar
            shape="square"
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
              record.firstName + " " + record.lastName
            )}`}
            size={40}
          />
          <div>
            <div className="font-medium">
              {`${record.firstName ?? ""} ${record.lastName ?? ""}`.trim() ||
                "—"}
            </div>
            <div className="font-medium">{record?.gender}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      render: (username: string) => username || "—",
    },
    {
      title: "Contact",
      dataIndex: "contact",
      key: "contact",
      render: (_: any, record: TUserPayload) => (
        <div className="!text-start font-medium">
          <p className="!m-0">{record?.email}</p>
          <p className="!m-0">{record?.mobileNumber}</p>
        </div>
      ),
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      render: (_: any, record: TUserPayload) => (
        <Space>
          <div>
            <div>{record?.currentAddress}</div>
            <div>{record?.permanentAddress}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string) => (
        <Tag color={role === "admin" ? "purple" : "blue"}>
          {role.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_: any, record: any) => (
        <Tag color={record.isActive ? "green" : "red"}>
          {record.isActive ? "ACTIVE" : "INACTIVE"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <ActionButton
          viewUrl={`/admin/user/view/${record?.id}`}
          editUrl={`/admin/user/update/${record?.id}`}
          onDelete={() => handleDelete(record)}
        />
      ),
    },
  ];

  const rowSelection: TableProps<any>["rowSelection"] = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log("Selected Row Keys: ", selectedRowKeys);
      console.log("Selected Rows: ", selectedRows);
    },
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (
        user.firstName?.toLowerCase() +
        " " +
        user.lastName?.toLowerCase()
      ).includes(searchText.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "active"
        ? user.isActive
        : !user.isActive;

    const matchesRole = filterRole === "all" ? true : user.role === filterRole;

    const matchesBlood =
      filterBlood === "all" ? true : user.bloodGroup === filterBlood;

    return matchesSearch && matchesStatus && matchesRole && matchesBlood;
  });

  const handleReset = () => {
    setSearchText("");
    setFilterStatus("all");
    setFilterRole("all");
    setFilterBlood("all");
  };

  return (
    <div className="space-y-6">
      <div className="flex md:items-center justify-between flex-col md:flex-row gap-6">
        <DashboardTitle
          title="All User"
          description="Show all user and more view"
        />
        <div className="flex items-center gap-x-3">
          <ToolbarButton onRefreshClick={() => refetch()} />
          <Link to="/admin/user/add">
            <Button
              type="primary"
              className="btn"
              icon={<FaUserPlus size={16} />}
            >
              Add User
            </Button>
          </Link>
        </div>
      </div>
      <Card
        title={
          <div className="flex md:items-center flex-col md:flex-row gap-4 w-full my-6">
            <Input
              placeholder="Search by name or email..."
              prefix={<MdOutlineSearch color="gray" size={16} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="md:!w-72 font-normal "
              allowClear
            />

            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              className="md:!w-40 w-full "
            >
              <Option value="all">All Status</Option>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
              <Option value="suspended">Suspended</Option>
            </Select>
            <Select
              value={filterRole}
              onChange={setFilterRole}
              className="md:!w-40 w-full "
            >
              <Option value="all">All Role</Option>
              <Option value="admin">Admin</Option>
              <Option value="manager">Manager</Option>
              <Option value="user">User</Option>
            </Select>

            <Select
              value={filterBlood}
              onChange={setFilterBlood}
              className="md:!w-40 w-full "
            >
              <Option value="all">All Blood</Option>
              <Option value="A+">A+</Option>
              <Option value="A-">A-</Option>
              <Option value="B+">B+</Option>
              <Option value="B-">B-</Option>
              <Option value="AB+">AB+</Option>
              <Option value="AB-">AB-</Option>
              <Option value="O+">O+</Option>
              <Option value="O-">O-</Option>
            </Select>
            <Button
              type="primary"
              onClick={handleReset}
              danger
              className="w-max"
              icon={<RiResetLeftFill size={16} />}
            >
              Reset
            </Button>
          </div>
        }
      >
        <Table
          rowSelection={rowSelection}
          dataSource={filteredUsers}
          columns={columns}
          loading={Loader({ loading })}
          rowKey="username"
          pagination={
            users.length > 10
              ? {
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} users`,
                }
              : false
          }
          scroll={{ x: "max-content" }}
        />
      </Card>
    </div>
  );
}
