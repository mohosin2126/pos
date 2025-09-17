import { Link } from "react-router-dom";
import { DashboardTitle } from "@/components/re-useable/dashboard-titile";
import ToolbarButton from "@/components/re-useable/toolbar-button";
import {
  Button,
  Card,
  Input,
  message,
  Select,
  Table,
  Tag,
  Avatar,
  Space,
} from "antd";
import { MdOutlineSearch, MdAddCircleOutline } from "react-icons/md";
import { useState } from "react";
import { showConfirmDelete } from "@/components/re-useable/delete-modal";
import { ActionButton } from "@/components/re-useable/action-button";
import type { TProductPayload } from "@/interface/common";
import { useDeleteProduct, useProducts } from "@/hooks/admin/products";
import { RiResetLeftFill } from "react-icons/ri";
import Loader from "@/components/re-useable/loader";

const { Option } = Select;

export default function AllProducts() {
  const [searchText, setSearchText] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const { deleteItem } = useDeleteProduct();
  const { products, refetch, loading } = useProducts();
  // console.log("products :", products);

  // Delete product
  const handleDelete = (record: TProductPayload) => {
    if (!record?.id) return;
    showConfirmDelete({
      title: "Delete Product",
      content: `Are you sure you want to delete "${record.name}"?`,
      onConfirm: async () => {
        if (record?.id) {
          await deleteItem(record?.id);
          refetch();
          message.success("Product deleted successfully");
        }
      },
    });
  };

  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
      console.log("Selected Row Keys: ", selectedRowKeys);
      console.log("Selected Rows: ", selectedRows);
    },
  };
  // Table columns
  const columns = [
    {
      title: "Product",
      dataIndex: "name",
      key: "product",
      render: (_: any, record: TProductPayload) => (
        <Space>
          <Avatar
            shape="square"
            src={
              "https://png.pngtree.com/png-vector/20210602/ourmid/pngtree-3d-beauty-cosmetics-product-design-png-image_3350326.jpg"
            }
            size={40}
          />
          <div>
            <div className="font-medium">{record?.name}</div>
            <div className="text-gray-500 text-sm">#{record?.sku}</div>
          </div>
        </Space>
      ),
    },
    { title: "Category ID", dataIndex: "categoryId", key: "categoryId" },
    { title: "Stock", dataIndex: "stockQuantity", key: "stockQuantity" },
    { title: "Re-Order", dataIndex: "reorderLevel", key: "reorderLevel" },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const color = status === "active" ? "green" : "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Track Stock",
      dataIndex: "isTrackStock",
      key: "isTrackStock",
      render: (trackStock: boolean) => {
        const color = trackStock ? "green" : "red";
        const text = trackStock ? "Active" : "Inactive";
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      render: (tags: string) =>
        tags.split(",").map((tag) => (
          <Tag color="blue" className="capitalize" key={tag}>
            {tag.trim()}
          </Tag>
        )),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: TProductPayload) => (
        <ActionButton
          viewUrl={`/admin/product/view/${record.id}`}
          editUrl={`/admin/product/update/${record.id}`}
          onDelete={() => handleDelete(record)}
        />
      ),
    },
  ];

  // Filtered data
  const filteredData = (products as TProductPayload[])?.filter((item) => {
    const matchesSearch =
      (item?.name ?? "").toLowerCase().includes(searchText.toLowerCase()) ||
      (item?.sku ?? "").toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ? true : item?.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex md:items-center justify-between flex-col md:flex-row gap-6">
        <DashboardTitle
          title="Products"
          description="Manage and track all products in one place"
        />
        <div className="flex items-center gap-x-3">
          <ToolbarButton onRefreshClick={() => refetch()} />
          <Link to="/admin/product/create">
            <Button
              type="primary"
              icon={<MdAddCircleOutline />}
              className="btn"
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
          rowKey="id"
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
