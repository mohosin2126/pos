import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  message,
} from "antd";
import { MdOutlineSearch } from "react-icons/md";
import { DashboardTitle } from "@/components/re-useable/dashboard-titile";
import ToolbarButton from "@/components/re-useable/toolbar-button";
import Loader from "@/components/re-useable/loader";
import {
  useApproveSaleReturn,
  useDeleteSaleReturn,
  useProcessSaleRefund,
  useRejectSaleReturn,
  useSaleReturns,
} from "@/hooks/admin/sale-return";
import type { TSaleReturn } from "@/interface/common";
import { showConfirmDelete } from "@/components/re-useable/delete-modal";
import { formatCurrency } from "@/utils/pos-calculations";

const { Option } = Select;

export default function SaleReturnPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "approved" | "refunded" | "rejected"
  >("pending");
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<TSaleReturn | null>(null);
  const [form] = Form.useForm();

  const { returns, loading, pagination, refetch } = useSaleReturns({
    page: currentPage,
    limit: pageSize,
    search: searchText || undefined,
    status: filterStatus === "all" ? undefined : filterStatus,
  });
  const { approveSaleReturn, loading: approveLoading } = useApproveSaleReturn();
  const { processSaleRefund, loading: refundLoading } = useProcessSaleRefund();
  const { rejectSaleReturn, loading: rejectLoading } = useRejectSaleReturn();
  const { deleteSaleReturn } = useDeleteSaleReturn();

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchText]);

  const getStatusColor = (status?: string) => {
    if (status === "approved") return "orange";
    if (status === "refunded") return "green";
    if (status === "rejected") return "red";
    return "blue";
  };

  const handleApproveClick = (record: TSaleReturn) => {
    setSelectedReturn(record);
    form.setFieldsValue({
      refundAmount: record.refundAmount ?? record.totalReturnAmount,
      restockingDisposition: record.restockingDisposition ?? "restock",
      notes: record.notes ?? "",
    });
    setApproveModalOpen(true);
  };

  const handleApproveSubmit = async (values: {
    refundAmount?: number;
    restockingDisposition?: string;
    notes?: string;
  }) => {
    if (!selectedReturn?.id) return;
    const result = await approveSaleReturn(String(selectedReturn.id), values);
    if (result) {
      message.success("Sale return approved successfully");
      setApproveModalOpen(false);
      setSelectedReturn(null);
      form.resetFields();
      refetch();
    }
  };

  const handleProcessRefund = async (record: TSaleReturn) => {
    const result = await processSaleRefund(String(record.id));
    if (result) {
      message.success("Refund processed successfully");
      refetch();
    }
  };

  const handleReject = async (record: TSaleReturn) => {
    const result = await rejectSaleReturn(String(record.id));
    if (result) {
      message.success("Sale return rejected successfully");
      refetch();
    }
  };

  const handleDelete = (record: TSaleReturn) => {
    showConfirmDelete({
      title: "Delete Sales Return",
      content: `Are you sure you want to delete "${record.referenceNo}"? This action cannot be undone.`,
      onConfirm: async () => {
        await deleteSaleReturn(String(record.id));
        message.success("Sale return deleted successfully");
        refetch();
      },
    });
  };

  const columns = [
    {
      title: "Return ID",
      dataIndex: "referenceNo",
      key: "referenceNo",
      render: (value?: string) => value || "N/A",
    },
    {
      title: "Sale Ref",
      dataIndex: ["sale", "referenceNo"],
      key: "saleReferenceNo",
      render: (value?: string) => value || "N/A",
    },
    {
      title: "Customer",
      dataIndex: ["sale", "customer", "name"],
      key: "customerName",
      render: (value?: string) => value || "Walk-in Customer",
    },
    {
      title: "Return Date",
      dataIndex: "returnDate",
      key: "returnDate",
      render: (value?: string) =>
        value ? new Date(value).toLocaleDateString() : "N/A",
    },
    {
      title: "Reason",
      dataIndex: "returnReason",
      key: "returnReason",
      render: (value?: string) => (
        <Tag color="purple">{(value || "N/A").replace(/_/g, " ").toUpperCase()}</Tag>
      ),
    },
    {
      title: "Return Amount",
      dataIndex: "totalReturnAmount",
      key: "totalReturnAmount",
      render: (value: number) => formatCurrency(Number(value || 0)),
    },
    {
      title: "Refund Amount",
      dataIndex: "refundAmount",
      key: "refundAmount",
      render: (value?: number) => formatCurrency(Number(value || 0)),
    },
    {
      title: "Restocking",
      dataIndex: "restockingDisposition",
      key: "restockingDisposition",
      render: (value?: string) => (
        <Tag color={value === "restock" ? "green" : value === "scrap" ? "red" : "blue"}>
          {(value || "pending").toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "refundStatus",
      key: "refundStatus",
      render: (value?: string) => (
        <Tag color={getStatusColor(value)}>{(value || "pending").toUpperCase()}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: TSaleReturn) => (
        <Space wrap>
          {record.refundStatus === "pending" && (
            <>
              <Button type="primary" size="small" onClick={() => handleApproveClick(record)}>
                Approve
              </Button>
              <Button danger size="small" onClick={() => handleReject(record)} loading={rejectLoading}>
                Reject
              </Button>
              <Button size="small" danger onClick={() => handleDelete(record)}>
                Delete
              </Button>
            </>
          )}
          {record.refundStatus === "approved" && (
            <Button type="primary" size="small" onClick={() => handleProcessRefund(record)} loading={refundLoading}>
              Process Refund
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex md:items-center justify-between flex-col md:flex-row gap-6">
        <DashboardTitle
          title="Sales Returns"
          description="Manage customer returns, restocking, and refund approvals"
        />
        <div className="flex items-center gap-x-3">
          <ToolbarButton onRefreshClick={() => refetch()} />
        </div>
      </div>

      <Card
        title={
          <div className="flex md:items-center flex-col md:flex-row gap-4 w-full my-6">
            <Input
              placeholder="Search by return, sale, invoice, or customer..."
              prefix={<MdOutlineSearch color="gray" size={16} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="md:!w-80 !font-normal"
              allowClear
            />
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              className="md:!w-40 w-full"
            >
              <Option value="all">All Status</Option>
              <Option value="pending">Pending</Option>
              <Option value="approved">Approved</Option>
              <Option value="refunded">Refunded</Option>
              <Option value="rejected">Rejected</Option>
            </Select>
          </div>
        }
      >
        <Table
          dataSource={returns}
          columns={columns}
          loading={Loader({ loading })}
          rowKey="id"
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} sales returns`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          scroll={{ x: "max-content" }}
        />
      </Card>

      <Modal
        title="Approve Sales Return"
        open={approveModalOpen}
        onCancel={() => {
          setApproveModalOpen(false);
          setSelectedReturn(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={approveLoading}
      >
        <Form form={form} layout="vertical" onFinish={handleApproveSubmit}>
          <Form.Item label="Refund Amount" name="refundAmount" rules={[{ required: true, message: "Refund amount is required" }]}>
            <InputNumber min={0} className="!w-full" />
          </Form.Item>
          <Form.Item
            label="Restocking Disposition"
            name="restockingDisposition"
            rules={[{ required: true, message: "Restocking disposition is required" }]}
          >
            <Select>
              <Option value="restock">Restock</Option>
              <Option value="scrap">Scrap</Option>
              <Option value="donate">Donate</Option>
              <Option value="pending">Pending</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Notes" name="notes">
            <Input.TextArea rows={3} placeholder="Optional approval note" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
