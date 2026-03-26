import { Link } from "react-router-dom";
import { DashboardTitle } from "@/components/re-useable/dashboard-titile";
import ToolbarButton from "@/components/re-useable/toolbar-button";
import { Button, Card, Input, message, Select, Table, Tag } from "antd";
import { MdOutlineSearch } from "react-icons/md";
import { useEffect, useState } from "react";
import { showConfirmDelete } from "@/components/re-useable/delete-modal";
import type { TableProps } from "antd";
import { ActionButton } from "@/components/re-useable/action-button";
const { Option } = Select;
import { MdAddCircleOutline } from "react-icons/md";
import { useDeletePurchase, usePurchases, useApprovePO } from "@/hooks/admin/purchase";
import Loader from "@/components/re-useable/loader";
import { TPurchasePayload } from "@/interface/common";
import { useBasePath } from "@/hooks/common/use-base-path";

export default function PurchaseOrder() {
  const basePath = useBasePath();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { deletePurchase } = useDeletePurchase();
  const { approvePO } = useApprovePO();
  const [searchText, setSearchText] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<"po" | "purchase" | "all">("po");
  const { purchases, refetch, loading, pagination } = usePurchases({
    page: currentPage,
    limit: pageSize,
    search: searchText || undefined,
    ...(filterStatus === "all"
      ? { statuses: ["po", "purchase"] }
      : { status: filterStatus }),
  });

  const handleDelete = (record: TPurchasePayload) => {
    showConfirmDelete({
      title: "Delete Purchase Order",
      content: `Are you sure you want to delete "${record.referenceNo}"? This action cannot be undone.`,
      onConfirm: async () => {
        await deletePurchase(String(record?.id));
        refetch();
        message.success("Purchase order deleted successfully");
      },
    });
  };

  const handleApprovePO = async (record: TPurchasePayload) => {
    if (!record.id) return;
    const result = await approvePO(String(record.id));
    if (result) {
      message.success("Purchase order approved and converted to purchase");
      refetch();
    }
  };

  const rowSelection: TableProps<any>["rowSelection"] = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log("Selected Row Keys: ", selectedRowKeys);
      console.log("Selected Rows: ", selectedRows);
    },
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchText]);

  const columns = [
    {
      title: "Reference No",
      dataIndex: "referenceNo",
      key: "referenceNo",
    },
    {
      title: "Supplier",
      dataIndex: ["supplier", "companyName"],
      key: "supplier",
    },
    {
      title: "Date",
      dataIndex: "purchaseDate",
      key: "purchaseDate",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color = "blue";
        if (status === "po") color = "cyan";
        if (status === "purchase") color = "orange";
        if (status === "cancelled") color = "red";
        return <Tag color={color}>{status?.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Items",
      dataIndex: "items",
      key: "items",
      render: (items: any[]) => items?.length || 0,
    },
    {
      title: "Net Total",
      dataIndex: "netTotalAmount",
      key: "netTotalAmount",
      render: (amount: any) => {
        const num = Number(amount);
        return !isNaN(num) ? `$${num.toFixed(2)}` : "----";
      },
    },
    {
      title: "Grand Total",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: any) => {
        const num = Number(amount);
        return !isNaN(num) ? `$${num.toFixed(2)}` : "----";
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: TPurchasePayload) => (
        <div className="flex gap-2">
          {record.status === "po" && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleApprovePO(record)}
            >
              Approve
            </Button>
          )}
          <ActionButton
            viewUrl={`${basePath}/purchase/view/${record?.id}`}
            editUrl={
              record.status === "po" || record.status === "draft"
                ? `${basePath}/purchase/update/${record?.id}`
                : undefined
            }
            onDelete={() => handleDelete(record)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex md:items-center justify-between flex-col md:flex-row gap-6">
        <DashboardTitle
          title="Purchase Orders"
          description="Create and manage purchase orders with vendors and line items"
        />
        <div className="flex items-center gap-x-3">
          <ToolbarButton onRefreshClick={() => refetch()} />
          <Link to={`${basePath}/purchase/add`}>
            <Button
              type="primary"
              icon={<MdAddCircleOutline />}
              className="btn hover:!text-[#69feb0]"
            >
              New PO
            </Button>
          </Link>
        </div>
      </div>
      <Card
        title={
          <div className="flex md:items-center flex-col md:flex-row gap-4 w-full my-6">
            <Input
              placeholder="Search by reference no or supplier..."
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
              <Option value="po">Draft POs</Option>
              <Option value="purchase">Confirmed</Option>
              <Option value="all">All</Option>
            </Select>
          </div>
        }
      >
        <Table
          rowSelection={rowSelection}
          dataSource={purchases}
          columns={columns}
          loading={Loader({ loading })}
          rowKey="id"
          pagination={
            {
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} purchase orders`,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
            }
          }
          scroll={{ x: "max-content" }}
        />
      </Card>
    </div>
  );
}
