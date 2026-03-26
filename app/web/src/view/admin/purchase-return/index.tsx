import { Link } from "react-router-dom";
import { DashboardTitle } from "@/components/re-useable/dashboard-titile";
import ToolbarButton from "@/components/re-useable/toolbar-button";
import { Button, Card, Input, message, Select, Table, Tag, Modal, Form, InputNumber, Space } from "antd";
import { MdOutlineSearch } from "react-icons/md";
import { useState } from "react";
import { showConfirmDelete } from "@/components/re-useable/delete-modal";
import type { TableProps } from "antd";
import { MdAddCircleOutline } from "react-icons/md";
import {
  usePurchaseReturns,
  useDeleteReturn,
  useApproveReturn,
  useProcessRefund,
  useRejectReturn,
} from "@/hooks/admin/purchase-return";
import Loader from "@/components/re-useable/loader";
import { TPurchaseReturn } from "@/interface/common";
import { useBasePath } from "@/hooks/common/use-base-path";
const { Option } = Select;

export default function PurchaseReturnPage() {
  const basePath = useBasePath();
  const { returns, refetch, loading } = usePurchaseReturns();
  const { deleteReturn } = useDeleteReturn();
  const { approveReturn, loading: approveLoading } = useApproveReturn();
  const { processRefund, loading: refundLoading } = useProcessRefund();
  const { rejectReturn, loading: rejectLoading } = useRejectReturn();

  const [searchText, setSearchText] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "refunded" | "rejected">("pending");
  const [approveModal, setApproveModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<TPurchaseReturn | null>(null);
  const [form] = Form.useForm();

  const filteredReturns = returns?.filter((item) => {
    const matchesSearch =
      (item.referenceNo?.toLowerCase() || "").includes(searchText.toLowerCase());
    const matchesStatus = filterStatus === "all" ? true : item.refundStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (record: TPurchaseReturn) => {
    showConfirmDelete({
      title: "Delete Return",
      content: `Are you sure you want to delete this return? This action cannot be undone.`,
      onConfirm: async () => {
        await deleteReturn(String(record?.id));
        refetch();
        message.success("Return deleted successfully");
      },
    });
  };

  const handleApproveClick = (record: TPurchaseReturn) => {
    setSelectedReturn(record);
    form.setFieldsValue({
      refundAmount: record.totalReturnAmount,
      restockingDisposition: record.restockingDisposition,
    });
    setApproveModal(true);
  };

  const handleApproveSubmit = async (values: any) => {
    if (!selectedReturn?.id) return;
    const result = await approveReturn(String(selectedReturn.id), {
      refundAmount: values.refundAmount,
      restockingDisposition: values.restockingDisposition,
    });
    if (result) {
      message.success("Return approved successfully");
      setApproveModal(false);
      refetch();
    }
  };

  const handleProcessRefund = async (record: TPurchaseReturn) => {
    Modal.confirm({
      title: "Process Refund",
      content: `Are you sure you want to process the refund for $${record.refundAmount?.toFixed(2)}?`,
      onOk: async () => {
        const result = await processRefund(String(record.id));
        if (result) {
          message.success("Refund processed successfully");
          refetch();
        }
      },
    });
  };

  const handleRejectClick = (record: TPurchaseReturn) => {
    Modal.confirm({
      title: "Reject Return",
      content: "Are you sure you want to reject this return?",
      onOk: async () => {
        const result = await rejectReturn(String(record.id));
        if (result) {
          message.success("Return rejected successfully");
          refetch();
        }
      },
    });
  };

  const columns = [
    {
      title: "Return ID",
      dataIndex: "referenceNo",
      key: "referenceNo",
    },
    {
      title: "Purchase ID",
      dataIndex: ["purchase", "referenceNo"],
      key: "purchase",
    },
    {
      title: "Return Date",
      dataIndex: "returnDate",
      key: "returnDate",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Reason",
      dataIndex: "returnReason",
      key: "returnReason",
      render: (reason: string) => {
        const colors: any = {
          defective: "red",
          overstock: "orange",
          expired: "volcano",
          quality_issue: "purple",
          wrong_item: "blue",
          other: "default",
        };
        return <Tag color={colors[reason]}>{reason?.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Return Amount",
      dataIndex: "totalReturnAmount",
      key: "totalReturnAmount",
      render: (amount: any) => {
        const num = Number(amount);
        return !isNaN(num) ? `$${num.toFixed(2)}` : "----";
      },
    },
    {
      title: "Refund Amount",
      dataIndex: "refundAmount",
      key: "refundAmount",
      render: (amount: any) => {
        const num = Number(amount);
        return !isNaN(num) ? `$${num.toFixed(2)}` : "----";
      },
    },
    {
      title: "Status",
      dataIndex: "refundStatus",
      key: "refundStatus",
      render: (status: string) => {
        const colors: any = {
          pending: "blue",
          approved: "orange",
          refunded: "green",
          rejected: "red",
        };
        return <Tag color={colors[status]}>{status?.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: TPurchaseReturn) => (
        <Space size="small" wrap>
          {record.refundStatus === "pending" && (
            <>
              <Button
                type="primary"
                size="small"
                onClick={() => handleApproveClick(record)}
                loading={approveLoading}
              >
                Approve
              </Button>
              <Button
                danger
                size="small"
                onClick={() => handleRejectClick(record)}
                loading={rejectLoading}
              >
                Reject
              </Button>
            </>
          )}
          {record.refundStatus === "approved" && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleProcessRefund(record)}
              loading={refundLoading}
            >
              Process Refund
            </Button>
          )}
          {(record.refundStatus === "pending" || record.refundStatus === "rejected") && (
            <Button
              danger
              size="small"
              onClick={() => handleDelete(record)}
            >
              Delete
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
          title="Purchase Returns"
          description="Manage and track all purchase returns and refunds"
        />
        <div className="flex items-center gap-x-3">
          <ToolbarButton onRefreshClick={() => refetch()} />
          <Link to={`${basePath}/purchase/all`}>
            <Button
              type="primary"
              icon={<MdAddCircleOutline />}
              className="btn hover:!text-[#69feb0]"
            >
              New Return
            </Button>
          </Link>
        </div>
      </div>
      <Card
        title={
          <div className="flex md:items-center flex-col md:flex-row gap-4 w-full my-6">
            <Input
              placeholder="Search by return ID..."
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
              <Option value="pending">Pending</Option>
              <Option value="approved">Approved</Option>
              <Option value="refunded">Refunded</Option>
              <Option value="rejected">Rejected</Option>
            </Select>
          </div>
        }
      >
        <Table
          dataSource={filteredReturns}
          columns={columns}
          loading={Loader({ loading })}
          rowKey="id"
          pagination={
            filteredReturns.length > 10
              ? {
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} returns`,
                }
              : false
          }
          scroll={{ x: "max-content" }}
        />
      </Card>

      {/* Approve Return Modal */}
      <Modal
        title="Approve Return"
        open={approveModal}
        onCancel={() => setApproveModal(false)}
        onOk={() => form.submit()}
        confirmLoading={approveLoading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleApproveSubmit}
        >
          <Form.Item
            label="Return Amount"
            name="returnAmount"
            initialValue={selectedReturn?.totalReturnAmount}
          >
            <InputNumber disabled prefix="$" />
          </Form.Item>
          <Form.Item
            label="Refund Amount"
            name="refundAmount"
            rules={[{ required: true, message: "Refund amount is required" }]}
          >
            <InputNumber prefix="$" min={0} />
          </Form.Item>
          <Form.Item
            label="Restocking Disposition"
            name="restockingDisposition"
            rules={[{ required: true, message: "Disposition is required" }]}
          >
            <Select placeholder="Select disposition">
              <Option value="restock">Restock</Option>
              <Option value="scrap">Scrap</Option>
              <Option value="donate">Donate</Option>
              <Option value="pending">Pending</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
