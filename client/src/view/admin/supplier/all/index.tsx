import { Link } from "react-router-dom";
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
} from "antd";
import { MdOutlineSearch, MdAddCircleOutline } from "react-icons/md";
import { useState } from "react";
import { showConfirmDelete } from "@/components/re-useable/delete-modal";
import { ActionButton } from "@/components/re-useable/action-button";
import type { TSupplierPayload } from "@/interface/common";
import { useSuppliers } from "@/hooks/admin/supplier";
import { DashboardTitle } from "@/components/re-useable/dashboard-titile";
import ToolbarButton from "@/components/re-useable/toolbar-button";

const { Option } = Select;

export default function AllSupplier() {
  const [searchText, setSearchText] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const { suppliers, refetch } = useSuppliers();

  const handleDelete = (record: any) => {
    showConfirmDelete({
      title: "Delete Supplier",
      content: `Are you sure you want to delete "${record.companyName}"? This action cannot be undone.`,
      onConfirm: async () => {
        message.success("Supplier deleted successfully");
        refetch();
      },
    });
  };

  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
      console.log("Selected Row Keys: ", selectedRowKeys);
      console.log("Selected Rows: ", selectedRows);
    },
  };

  const columns = [
    {
      title: "Supplier",
      dataIndex: "supplier",
      key: "supplier",
      render: (_: any, record: TSupplierPayload) => (
        <Space>
          <Avatar
            shape="square"
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
              record?.contactPersonName
            )}`}
            size={40}
          />
          <div>
            <div className="font-medium">{record?.contactPersonName}</div>
            <div className="font-medium">{record?.supplierCode}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Company Name",
      dataIndex: "companyName",
      key: "companyName",
    },
    {
      title: "Contact",
      dataIndex: "email",
      key: "email",
      render: (_: any, record: TSupplierPayload) => (
        <Space>
          <div>
            <div>{record?.email}</div>
            <div>{record?.phone}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      render: (_: any, record: TSupplierPayload) => (
        <Space>
          <div>
            <div>
              {record?.city} ({record?.state})
            </div>
            <div>{record?.address}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const color = status === "active" ? "green" : "red";
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <ActionButton
          viewUrl={`/admin/supplier/view/${record.id}`}
          editUrl={`/admin/supplier/update/${record.id}`}
          onDelete={() => handleDelete(record)}
        />
      ),
    },
  ];

  const filteredData = suppliers?.filter((item) => {
    const matchesSearch =
      item.companyName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.contactPersonName.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ? true : item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex md:items-center justify-between flex-col md:flex-row gap-6">
        <DashboardTitle
          title="Suppliers"
          description="Manage and track all suppliers in one place"
        />
        <div className="flex items-center gap-x-3">
          <ToolbarButton
            onPdfClick={() => console.log("PDF Export")}
            onExcelClick={() => console.log("Excel Export")}
            onRefreshClick={() => console.log("Data Refreshed")}
          />
          <Link to="/admin/supplier/create">
            <Button
              type="primary"
              icon={<MdAddCircleOutline />}
              className="btn"
            >
              Add Supplier
            </Button>
          </Link>
        </div>
      </div>

      <Card
        title={
          <div className="flex items-center justify-between gap-4 flex-wrap my-6">
            <div className="flex md:items-center justify-between flex-col md:flex-row gap-4 w-full">
              <Input
                placeholder="Search by company or contact..."
                prefix={<MdOutlineSearch color="gray" size={16} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="md:!w-72"
                allowClear
              />
              <div className="flex items-center gap-4">
                <Select
                  value={filterStatus}
                  onChange={setFilterStatus}
                  className="md:!w-40 w-full"
                >
                  <Option value="all">All Status</Option>
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                </Select>
              </div>
            </div>
          </div>
        }
      >
        <Table
          rowSelection={rowSelection}
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          pagination={
            filteredData.length > 10
              ? {
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} suppliers`,
                }
              : false
          }
          scroll={{ x: "max-content" }}
        />
      </Card>
    </div>
  );
}
