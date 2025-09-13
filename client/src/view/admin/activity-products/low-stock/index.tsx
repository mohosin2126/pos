import { useState } from "react";
import type { TProductPayload } from "@/interface/common";
import { useProducts } from "@/hooks/admin/products";
import { showConfirmDelete } from "@/components/re-useable/delete-modal";
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
import { ActionButton } from "@/components/re-useable/action-button";
import { DashboardTitle } from "@/components/re-useable/dashboard-titile";
import ToolbarButton from "@/components/re-useable/toolbar-button";
import { Link } from "react-router-dom";
import { MdAddCircleOutline, MdOutlineSearch } from "react-icons/md";
import { useLowStockProducts } from "@/hooks/admin/inventory";

const { Option } = Select;

export default function LowStock() {
  const [searchText, setSearchText] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");

  const { products } = useLowStockProducts();
  console.log("products :", products);

  // Delete product
  const handleDelete = (record: TProductPayload) => {
    if (!record?.id) return;
    showConfirmDelete({
      title: "Delete Product",
      content: `Are you sure you want to delete "${record.name}"?`,
      onConfirm: async () => {
        if (record?.id) {
          // const result = await deleteItem(record?.id);

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
            <div className="font-medium">{record?.product?.name ?? ""}</div>
            <div className="text-gray-500 text-sm">
              #{record?.product?.sku ?? ""}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Category ID",
      dataIndex: "categoryId",
      key: "categoryId",
      render: (_: any, record: any) => {
        return <span>{record?.product?.categoryId}</span>;
      },
    },
    {
      title: "Stock",
      dataIndex: "stockQuantity",
      key: "stockQuantity",
      render: (_: any, record: any) => {
        return <span>{record?.product?.stockQuantity}</span>;
      },
    },
    {
      title: "Re-Order",
      dataIndex: "reorderLevel",
      key: "reorderLevel",
      render: (_: any, record: any) => {
        return <span>{record?.product?.reorderLevel}</span>;
      },
    },

    {
      title: "Status",
      dataIndex: ["product", "status"],
      render: (_: any, record: any) => {
        const status = record?.product?.status ?? "unknown";
        const color =
          status === "active"
            ? "green"
            : status === "inactive"
            ? "red"
            : "default";

        return <Tag color={color}>{status.toUpperCase()}</Tag>;
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
      key: "tags",
      dataIndex: ["product", "tags"],
      render: (tags: string) =>
        (tags ? tags.split(",") : []).map((t) => (
          <Tag color="blue" className="capitalize" key={t}>
            {t.trim()}
          </Tag>
        )),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: TProductPayload) => (
        <ActionButton
          viewUrl={`#admin/product/view/${record?.product?.id}`}
          editUrl={`#admin/product/update/${record?.product?.id}`}
          onDelete={() => handleDelete(record)}
        />
      ),
    },
  ];

  // Filtered data
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
          <ToolbarButton
            onPdfClick={() => console.log("PDF Export")}
            onExcelClick={() => console.log("Excel Export")}
            onRefreshClick={() => console.log("Data Refreshed")}
          />
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
          <div className="flex items-center justify-between gap-4 flex-wrap my-6">
            <div className="flex md:items-center justify-between flex-col md:flex-row gap-4 w-full">
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
