import { useEffect, useState } from "react";
import { Avatar, Card, Input, Select, Space, Table, Tag } from "antd";
import { MdOutlineSearch } from "react-icons/md";
import { DashboardTitle } from "@/components/re-useable/dashboard-titile";
import ToolbarButton from "@/components/re-useable/toolbar-button";
import { ActionButton } from "@/components/re-useable/action-button";
import type { TProductAnalyticsPeriod, TProductPayload } from "@/interface/common";
import { useProductRevenueReport } from "@/hooks/admin/products";
import Loader from "@/components/re-useable/loader";
import { normalizeTags } from "@/utils/tag-utils";
import { formatCurrency } from "@/utils/pos-calculations";
import { useBasePath } from "@/hooks/common/use-base-path";

const { Option } = Select;

export default function ProductRevenueReport() {
  const basePath = useBasePath();
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [period, setPeriod] = useState<TProductAnalyticsPeriod>("month");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { products, loading, pagination, reportTotals, refetch } = useProductRevenueReport({
    page: currentPage,
    limit: pageSize,
    search: searchText || undefined,
    status: filterStatus === "all" ? undefined : filterStatus,
    period,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, filterStatus, period]);

  const periodLabel =
    period === "day"
      ? "Today"
      : period === "month"
      ? "This Month"
      : period === "year"
      ? "This Year"
      : "All Time";

  const columns = [
    {
      title: "Product",
      dataIndex: "name",
      key: "product",
      render: (_: unknown, record: TProductPayload) => (
        <Space>
          <Avatar
            shape="square"
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
              record?.name || "Product"
            )}`}
            size={40}
          />
          <div>
            <div className="font-medium">{record?.name}</div>
            <div className="text-gray-500 text-sm">#{record?.sku}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Category",
      dataIndex: ["category", "name"],
      key: "category",
      render: (_: unknown, record: TProductPayload) =>
        record?.category?.name || record?.categoryId || "N/A",
    },
    {
      title: `${periodLabel} Sold`,
      dataIndex: "soldQuantity",
      key: "soldQuantity",
      render: (value: number | undefined) => value ?? 0,
    },
    {
      title: `${periodLabel} Revenue`,
      dataIndex: "revenue",
      key: "revenue",
      render: (value: number | undefined) => formatCurrency(Number(value || 0)),
    },
    {
      title: "Avg Cost",
      dataIndex: "averageCost",
      key: "averageCost",
      render: (value: number | undefined) => formatCurrency(Number(value || 0)),
    },
    {
      title: "COGS",
      dataIndex: "costOfGoodsSold",
      key: "costOfGoodsSold",
      render: (value: number | undefined) => formatCurrency(Number(value || 0)),
    },
    {
      title: "Profit",
      dataIndex: "profit",
      key: "profit",
      render: (value: number | undefined) => (
        <span className="font-medium text-green-700">
          {formatCurrency(Number(value || 0))}
        </span>
      ),
    },
    {
      title: "Loss",
      dataIndex: "loss",
      key: "loss",
      render: (value: number | undefined) => (
        <span className="font-medium text-red-600">
          {formatCurrency(Number(value || 0))}
        </span>
      ),
    },
    {
      title: "Stock",
      dataIndex: "stockQuantity",
      key: "stockQuantity",
      render: (value: number | undefined) => value ?? 0,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {(status || "").toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      render: (tags: unknown) =>
        normalizeTags(tags).map((tag) => (
          <Tag color="blue" className="capitalize" key={tag}>
            {tag}
          </Tag>
        )),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: TProductPayload) => (
        <ActionButton viewUrl={`${basePath}/product/view/${record.id}`} />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex md:items-center justify-between flex-col md:flex-row gap-6">
        <DashboardTitle
          title="Product Revenue"
          description="Track revenue, cost, profit, and loss for each product by day, month, or year"
        />
        <div className="flex items-center gap-x-3">
          <ToolbarButton onRefreshClick={() => refetch()} />
        </div>
      </div>

      {reportTotals && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          <Card bodyStyle={{ padding: "16px" }}>
            <div className="text-sm text-gray-500">Total Products</div>
            <div className="text-2xl font-semibold">{reportTotals.products}</div>
          </Card>
          <Card bodyStyle={{ padding: "16px" }}>
            <div className="text-sm text-gray-500">{periodLabel} Units Sold</div>
            <div className="text-2xl font-semibold">{reportTotals.soldQuantity}</div>
          </Card>
          <Card bodyStyle={{ padding: "16px" }}>
            <div className="text-sm text-gray-500">{periodLabel} Revenue</div>
            <div className="text-2xl font-semibold">{formatCurrency(reportTotals.revenue)}</div>
          </Card>
          <Card bodyStyle={{ padding: "16px" }}>
            <div className="text-sm text-gray-500">Total Profit</div>
            <div className="text-2xl font-semibold text-green-700">
              {formatCurrency(reportTotals.profit)}
            </div>
          </Card>
          <Card bodyStyle={{ padding: "16px" }}>
            <div className="text-sm text-gray-500">Total Loss</div>
            <div className="text-2xl font-semibold text-red-600">
              {formatCurrency(reportTotals.loss)}
            </div>
          </Card>
        </div>
      )}

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
            <Select
              value={period}
              onChange={setPeriod}
              className="md:!w-40 w-full"
            >
              <Option value="day">Day</Option>
              <Option value="month">Month</Option>
              <Option value="year">Year</Option>
              <Option value="all">All Time</Option>
            </Select>
          </div>
        }
      >
        <Table
          dataSource={products}
          columns={columns}
          loading={Loader({ loading })}
          rowKey="id"
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} products`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          scroll={{ x: "max-content" }}
        />
      </Card>
    </div>
  );
}
