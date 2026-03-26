import { useState } from "react";
import { Avatar, Button, Card, Input, Select, Space, Table, Tag } from "antd";
import { ActionButton } from "@/components/re-useable/action-button";
import { DashboardTitle } from "@/components/re-useable/dashboard-titile";
import ToolbarButton from "@/components/re-useable/toolbar-button";
import { Link } from "react-router-dom";
import { MdAddCircleOutline, MdOutlineSearch } from "react-icons/md";
import { useLowStockProducts } from "@/hooks/admin/inventory";
import dayjs from "dayjs";
import Loader from "@/components/re-useable/loader";
import { useBasePath } from "@/hooks/common/use-base-path";
import { normalizeTags } from "@/utils/tag-utils";

const { Option } = Select;

export default function LowStock() {
  const basePath = useBasePath();
  const [searchText, setSearchText] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");

  const { products, refetch, loading } = useLowStockProducts();

  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
      console.log("Selected Row Keys: ", selectedRowKeys);
      console.log("Selected Rows: ", selectedRows);
    },
  };

  const columns = [
    {
      title: "Product",
      dataIndex: "name",
      key: "product",
      render: (_: any, record: any) => (
        <Space>
          <Avatar
            shape="square"
            src={
              record?.product?.imageUrl ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                record?.product?.name
              )}`
            }
            size={40}
          />
          <div>
            <div className="font-medium">{record?.product?.name}</div>
            <div className="text-gray-500 text-sm">#{record?.product?.sku}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Category ID",
      dataIndex: "categoryId",
      key: "categoryId",
      render: (_: any, record: any) => (
        <span>{record?.product?.categoryId}</span>
      ),
    },
    {
      title: "Stock",
      dataIndex: "stockQuantity",
      key: "stockQuantity",
      render: (_: any, record: any) => (
        <span>{record?.product?.stockQuantity}</span>
      ),
    },
    {
      title: "Re-Order",
      dataIndex: "reorderLevel",
      key: "reorderLevel",
      render: (_: any, record: any) => (
        <span>{record?.product?.reorderLevel}</span>
      ),
    },
    {
      title: "Qty On Hand",
      dataIndex: "quantityOnHand",
      key: "quantityOnHand",
      render: (_: any, record: any) => <span>{record?.quantityOnHand}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (_: any, record: any) => {
        const color = record?.product?.status === "active" ? "green" : "red";
        return <Tag color={color}>{record?.product?.status}</Tag>;
      },
    },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      render: (_: any, record: any) =>
        record?.product?.tags ? (
          normalizeTags(record?.product?.tags).map((tag: string) => (
            <Tag color="blue" className="capitalize" key={tag}>
              {tag.trim()}
            </Tag>
          ))
        ) : (
          <span>N/A</span>
        ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (_: any, record: any) =>
        dayjs(record?.product?.createdAt).format("DD MMM YYYY"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <ActionButton viewUrl={`${basePath}/product/view/${record?.product?.id}`} />
      ),
    },
  ];

  const filteredData = products?.filter((item) => {
    const name = item?.product?.name ?? "";
    const sku = item?.product?.sku ?? "";
    const status = item?.product?.status ?? "";

    const matchesSearch =
      searchText.trim() === "" ||
      name.toLowerCase().includes(searchText.toLowerCase()) ||
      sku.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ? true : status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex md:items-center justify-between flex-col md:flex-row gap-6">
        <DashboardTitle
          title="Low Stock"
          description="Manage and track all products in one place"
        />
        <div className="flex items-center gap-x-3">
          <ToolbarButton onRefreshClick={() => refetch()} />
          <Link to={`${basePath}/product/create`}>
            <Button
              type="primary"
              icon={<MdAddCircleOutline />}
              className="btn hover:!text-[#69feb0]"
            >
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Table */}
      <Card
        title={
          <div className="flex md:items-center flex-col md:flex-row gap-4 w-full my-6">
            <Input
              placeholder="Search by name or SKU..."
              prefix={<MdOutlineSearch color="gray" size={16} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="md:!w-72 !font-normal"
              allowClear
            />
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
        }
      >
        <Table
          rowSelection={rowSelection}
          dataSource={filteredData}
          columns={columns}
          loading={Loader({ loading })}
          rowKey={(record: any) => record?.product?.id ?? record?.id}
          pagination={
            filteredData.length > 10
              ? {
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} products`,
                }
              : false
          }
          scroll={{ x: "max-content" }}
        />
      </Card>
    </div>
  );
}
