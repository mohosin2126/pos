import { Card, Input, Table, Tag } from "antd";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { MdOutlineSearch } from "react-icons/md";
import { DashboardTitle } from "@/components/re-useable/dashboard-titile";
import ToolbarButton from "@/components/re-useable/toolbar-button";
import Loader from "@/components/re-useable/loader";
import { useInventorySummary } from "@/hooks/admin/inventory";
import { ActionButton } from "@/components/re-useable/action-button";
import { useBasePath } from "@/hooks/common/use-base-path";

export default function Stock() {
  const basePath = useBasePath();
  const { summary, loading, refetch } = useInventorySummary();
  const [searchText, setSearchText] = useState("");

  const filteredData = useMemo(() => {
    const search = searchText.trim().toLowerCase();
    if (!search) return summary;

    return summary.filter((item) => {
      const name = item.product?.name?.toLowerCase() ?? "";
      const sku = item.product?.sku?.toLowerCase() ?? "";
      const barcode = item.product?.barcode?.toLowerCase() ?? "";
      return (
        name.includes(search) ||
        sku.includes(search) ||
        barcode.includes(search)
      );
    });
  }, [searchText, summary]);

  const columns = [
    {
      title: "Product",
      key: "product",
      render: (_: unknown, record: any) => (
        <div>
          <div className="font-medium">{record?.product?.name}</div>
          <div className="text-xs text-gray-500">#{record?.product?.sku}</div>
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_: unknown, record: any) => (
        <Tag color={record?.product?.status === "active" ? "green" : "red"}>
          {(record?.product?.status || "unknown").toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "On Hand",
      dataIndex: "quantityOnHand",
      key: "quantityOnHand",
    },
    {
      title: "Sellable",
      dataIndex: "unexpiredQty",
      key: "unexpiredQty",
    },
    {
      title: "Expired",
      dataIndex: "expiredQty",
      key: "expiredQty",
    },
    {
      title: "Reorder Point",
      dataIndex: "reorderPoint",
      key: "reorderPoint",
    },
    {
      title: "Last Computed",
      dataIndex: "lastComputedAt",
      key: "lastComputedAt",
      render: (value: string) =>
        value ? dayjs(value).format("DD MMM YYYY, hh:mm A") : "N/A",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: any) => (
        <ActionButton viewUrl={`${basePath}/product/view/${record?.product?.id}`} />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex md:items-center justify-between flex-col md:flex-row gap-6">
        <DashboardTitle
          title="Stock Summary"
          description="Review real-time inventory balances across all tracked products"
        />
        <ToolbarButton onRefreshClick={() => refetch()} />
      </div>

      <Card
        title={
          <Input
            placeholder="Search by product, SKU, or barcode..."
            prefix={<MdOutlineSearch color="gray" size={16} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="md:!w-80 !font-normal"
            allowClear
          />
        }
      >
        <Table
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
                }
              : false
          }
          scroll={{ x: "max-content" }}
        />
      </Card>
    </div>
  );
}
