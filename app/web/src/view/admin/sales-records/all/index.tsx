import { useEffect, useState } from "react";
import { Card, Input, Select, Table, Tag, Button } from "antd";
import { MdOutlineSearch } from "react-icons/md";
import { MdAddCircleOutline } from "react-icons/md";
import type { TableProps } from "antd";
import { DashboardTitle } from "@/components/re-useable/dashboard-titile";
import ToolbarButton from "@/components/re-useable/toolbar-button";
import { ActionButton } from "@/components/re-useable/action-button";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { useSales } from "@/hooks/admin/sales";
import Loader from "@/components/re-useable/loader";
import { formatCurrency } from "@/utils/pos-calculations";
import { useBasePath } from "@/hooks/common/use-base-path";

const { Option } = Select;

export default function SalesRecords() {
  const basePath = useBasePath();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "issued" | "paid" | "void"
  >("all");
  const { sales, refetch, loading, pagination } = useSales({
    page: currentPage,
    limit: pageSize,
    search: searchText || undefined,
    invoiceStatus: filterStatus === "all" ? undefined : filterStatus,
  });

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
      title: "Invoice No",
      dataIndex: ["invoice", "invoiceNo"],
      key: "invoiceNo",
      render: (invoiceNo: string) => invoiceNo || "N/A",
    },
    {
      title: "Customer ID",
      dataIndex: "customerId",
      key: "customerId",
    },
    {
      title: "Invoice Date",
      dataIndex: ["invoice", "invoiceDate"],
      key: "invoiceDate",
      render: (date?: string) =>
        date ? dayjs(date).format("DD MMM YYYY") : "N/A",
    },
    {
      title: "Status",
      dataIndex: ["invoice", "status"],
      key: "status",
      render: (status: string) => {
        let color = "blue";
        if (status === "issued") color = "orange";
        if (status === "paid") color = "green";
        if (status === "void") color = "red";
        return (
          <Tag color={color} className="!text-xs">
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Subtotal",
      dataIndex: ["invoice", "subTotal"],
      key: "subTotal",
      render: (amount?: string) =>
        amount ? formatCurrency(Number(amount)) : "N/A",
    },
    {
      title: "Discount",
      dataIndex: ["invoice", "discountAmount"],
      key: "discountAmount",
      render: (amount?: string) =>
        amount ? formatCurrency(Number(amount)) : "N/A",
    },
    {
      title: "Tax",
      dataIndex: ["invoice", "orderTaxAmount"],
      key: "orderTaxAmount",
      render: (amount?: string) =>
        amount ? formatCurrency(Number(amount)) : "N/A",
    },
    {
      title: "Shipping",
      dataIndex: ["invoice", "shippingCharge"],
      key: "shippingCharge",
      render: (amount?: string) =>
        amount ? formatCurrency(Number(amount)) : "N/A",
    },
    {
      title: "Total",
      dataIndex: ["invoice", "totalAmount"],
      key: "totalAmount",
      render: (amount?: string) =>
        amount ? formatCurrency(Number(amount)) : "N/A",
    },
    {
      title: "Paid",
      dataIndex: ["invoice", "amountPaid"],
      key: "amountPaid",
      render: (amount?: string) =>
        amount ? `$${Number(amount).toFixed(2)}` : "N/A",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <ActionButton viewUrl={`${basePath}/sales/view/${record?.id}`} />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex md:items-center justify-between flex-col md:flex-row gap-6">
        <DashboardTitle
          title="Sales Records"
          description="Manage and track all sales invoices"
        />
        <div className="flex items-center gap-x-3">
          <ToolbarButton onRefreshClick={() => refetch()} />
          <Link to={`${basePath}/pos/create`}>
            <Button
              type="primary"
              icon={<MdAddCircleOutline />}
              className="btn hover:!text-[#69feb0]"
            >
              Add Sale
            </Button>
          </Link>
        </div>
      </div>

      <Card
        title={
          <div className="flex md:items-center flex-col md:flex-row gap-4 w-full my-6">
            <Input
              placeholder="Search by invoice no or customer ID..."
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
              <Option value="issued">Issued</Option>
              <Option value="paid">Paid</Option>
              <Option value="void">Void</Option>
            </Select>
          </div>
        }
      >
        <Table
          rowSelection={rowSelection}
          dataSource={sales}
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
                `${range[0]}-${range[1]} of ${total} invoices`,
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
