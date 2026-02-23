import {
  Avatar,
  Button,
  Card,
  Input,
  message,
  Select,
  Space,
  Table,
  Tag,
  type TableProps,
} from "antd";
import { DashboardTitle } from "@/components/re-useable/dashboard-titile";
import ToolbarButton from "@/components/re-useable/toolbar-button";
import { useCustomers } from "@/hooks/admin/customer";
import { Link } from "react-router-dom";
import { FaUserPlus } from "react-icons/fa";
import { MdOutlineSearch } from "react-icons/md";
import { ActionButton } from "@/components/re-useable/action-button";
import type { TCustomer } from "@/interface/common";
import { showConfirmDelete } from "@/components/re-useable/delete-modal";
import { useState } from "react";
import type { ColumnsType } from "antd/es/table";
import Loader from "@/components/re-useable/loader";
const { Option } = Select;

export default function AllCustomer() {
  const { customers, refetch, loading } = useCustomers();
  const [searchText, setSearchText] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");

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
        message.success("User deleted successfully");
      },
    });
  };

  const columns: ColumnsType<TCustomer> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name: string) => (
        <Space>
          <Avatar
            shape="square"
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
              name
            )}`}
            size={40}
          />
          <div className="font-medium">{name}</div>
        </Space>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (phone: string) => phone || "—",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email: string) => email || "—",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <ActionButton
          viewUrl={`#customer/view/${record.id}`}
          editUrl={`#customer/update/${record.id}`}
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

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchText.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ? true : customer.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex md:items-center justify-between flex-col md:flex-row gap-6">
        <DashboardTitle
          title="Comsumers"
          description="Show all customer and more view"
        />
        <div className="flex items-center gap-x-3">
          <ToolbarButton onRefreshClick={() => refetch()} />
          <Link to="/admin/user/add">
            <Button
              type="primary"
              className="btn hover:!text-[#69feb0]"
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
          </div>
        }
      >
        <Table
          rowSelection={rowSelection}
          dataSource={filteredCustomers}
          columns={columns}
          loading={Loader({ loading })}
          rowKey="id"
          pagination={
            filteredCustomers.length > 10
              ? {
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} customers`,
                }
              : false
          }
          scroll={{ x: "max-content" }}
        />
      </Card>
    </div>
  );
}
