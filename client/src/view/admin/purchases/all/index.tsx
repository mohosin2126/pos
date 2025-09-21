import { Link } from "react-router-dom";
import { DashboardTitle } from "@/components/re-useable/dashboard-titile";
import ToolbarButton from "@/components/re-useable/toolbar-button";
import { Button, Card, Input, message, Select, Table, Tag } from "antd";
import { MdOutlineSearch } from "react-icons/md";
import { useState } from "react";
import { showConfirmDelete } from "@/components/re-useable/delete-modal";
import type { TableProps } from "antd";
import { ActionButton } from "@/components/re-useable/action-button";
const { Option } = Select;
import { MdAddCircleOutline } from "react-icons/md";
import { useDeletePurchase, usePurchases } from "@/hooks/admin/purchase";
import Loader from "@/components/re-useable/loader";

export default function Purchases() {
  const { purchases, refetch, loading } = usePurchases();
  const [searchText, setSearchText] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const { deletePurchase } = useDeletePurchase();

  const handleDelete = (record: any) => {
    showConfirmDelete({
      title: "Delete Purchase Order",
      content: `Are you sure you want to delete "${record.referenceNo}"? This action cannot be undone.`,
      onConfirm: async () => {
        await deletePurchase(record?.id);
        refetch();
        message.success("Purchase order deleted successfully");
      },
    });
  };

  const rowSelection: TableProps<any>["rowSelection"] = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log("Selected Row Keys: ", selectedRowKeys);
      console.log("Selected Rows: ", selectedRows);
    },
  };

  const columns = [
    {
      title: "Reference No",
      dataIndex: "referenceNo",
      key: "referenceNo",
    },
    {
      title: "Supplier",
      dataIndex: "supplierAddress",
      key: "supplierAddress",
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
        if (status === "ordered") color = "orange";
        if (status === "received") color = "green";
        if (status === "cancelled") color = "red";
        if (status === "pending") color = "gold";
        return <Tag color={color}>{status?.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Items",
      dataIndex: "totalItems",
      key: "totalItems",
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
      title: "Paid",
      dataIndex: "amountPaid",
      key: "amountPaid",
      render: (amount: any) => {
        const num = Number(amount);
        return !isNaN(num) ? `$${num.toFixed(2)}` : "----";
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <ActionButton
          viewUrl={`/admin/purchase/view/${record?.supplierId}`}
          editUrl={`/admin/purchase/update/${record?.supplierId}`}
          onDelete={() => handleDelete(record)}
        />
      ),
    },
  ];

  const filteredData = purchases?.filter((item) => {
    const matchesSearch =
      item.referenceNo.toLowerCase().includes(searchText.toLowerCase()) ||
      item.supplierAddress.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ? true : item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex md:items-center justify-between flex-col md:flex-row gap-6">
        <DashboardTitle
          title="Purchases"
          description="Manage and track all purchase orders in one place"
        />
        <div className="flex items-center gap-x-3">
          <ToolbarButton onRefreshClick={() => refetch()} />
          <Link to="/admin/purchase/add">
            <Button
              type="primary"
              icon={<MdAddCircleOutline />}
              className="btn hover:!text-[#69feb0]"
            >
              Add Purchase
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
              className="md:!w-40 w-full "
            >
              <Option value="all">All Status</Option>
              <Option value="ordered">Ordered</Option>
              <Option value="received">Received</Option>
              <Option value="pending">Pending</Option>
              <Option value="cancelled">Cancelled</Option>
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
                    `${range[0]}-${range[1]} of ${total} purchases`,
                }
              : false
          }
          scroll={{ x: "max-content" }}
        />
      </Card>
    </div>
  );
}
