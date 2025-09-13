import { Card, Table, Tag, Input, Select, Button, Space } from "antd";
import { Link } from "react-router-dom";
import { useState } from "react";
import { MdOutlineSearch } from "react-icons/md";
import { FaFileInvoice } from "react-icons/fa";
import { DashboardTitle } from "@/components/re-useable/dashboard-titile";
import ToolbarButton from "@/components/re-useable/toolbar-button";
import { useInvoices } from "@/hooks/admin/invoice";
import type { ColumnsType } from "antd/es/table";
import type { TInvoice } from "@/interface/common";
import dayjs from "dayjs";
import { ActionButton } from "@/components/re-useable/action-button";

const { Option } = Select;

export default function AllInvoice() {
  const { invoices, loading } = useInvoices();
  const [searchText, setSearchText] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "issued" | "paid" | "overdue"
  >("all");

  const columns: ColumnsType<TInvoice> = [
    {
      title: "Invoice No",
      dataIndex: "invoiceNo",
      key: "invoiceNo",
    },
    {
      title: "Invoice Date",
      dataIndex: "invoiceDate",
      key: "invoiceDate",
      render: (date: string | null) =>
        date ? dayjs(date).format("DD MMM YYYY") : "—",
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (date: string | null) =>
        date ? dayjs(date).format("DD MMM YYYY") : "—",
    },
    {
      title: "Subtotal",
      dataIndex: "subTotal",
      key: "subTotal",
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      key: "totalAmount",
    },
    {
      title: "Paid",
      dataIndex: "amountPaid",
      key: "amountPaid",
    },
    {
      title: "Balance Due",
      dataIndex: "balanceDue",
      key: "balanceDue",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag
          color={
            status === "paid" ? "green" : status === "overdue" ? "red" : "blue"
          }
        >
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <ActionButton viewUrl={`/admin/invoice/view/${record.id}`} />
      ),
    },
  ];

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNo.toLowerCase().includes(searchText.toLowerCase()) ||
      invoice.totalAmount.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ? true : invoice.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex md:items-center justify-between flex-col md:flex-row gap-6">
        <DashboardTitle
          title="Invoices"
          description="Manage and track all invoices with status, payments, and balances"
        />
        <div className="flex items-center gap-x-3">
          <ToolbarButton
            onPdfClick={() => console.log("PDF Export")}
            onExcelClick={() => console.log("Excel Export")}
            onRefreshClick={() => console.log("Data Refreshed")}
          />
          <Link to="#">
            <Button
              type="primary"
              className="btn"
              icon={<FaFileInvoice size={16} />}
            >
              Add Invoice
            </Button>
          </Link>
        </div>
      </div>

      <Card
        title={
          <div className="flex items-center justify-between gap-4 flex-wrap my-6">
            <div className="flex md:items-center justify-between flex-col md:flex-row gap-4 w-full">
              {/* 🔍 Search */}
              <Input
                placeholder="Search by invoice no or amount..."
                prefix={<MdOutlineSearch color="gray" size={16} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="md:!w-72 font-normal "
                allowClear
              />

              <Space>
                <Select
                  value={filterStatus}
                  onChange={setFilterStatus}
                  className="md:!w-40 w-full"
                >
                  <Option value="all">All Status</Option>
                  <Option value="issued">Issued</Option>
                  <Option value="paid">Paid</Option>
                  <Option value="overdue">Overdue</Option>
                </Select>
              </Space>
            </div>
          </div>
        }
      >
        <Table<TInvoice>
          dataSource={filteredInvoices}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={
            filteredInvoices.length > 10
              ? {
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} invoices`,
                }
              : false
          }
          scroll={{ x: "max-content" }}
        />
      </Card>
    </div>
  );
}
