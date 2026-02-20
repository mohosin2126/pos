import { Card, Row, Col, Tag, Typography, Divider, Table } from "antd";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";
import { usePurchase } from "@/hooks/admin/purchase";

const { Title } = Typography;

export default function PurchaseDetails() {
  const { id } = useParams();
  const { purchase } = usePurchase(id);
  const InfoRow = ({ label, value }: { label: string; value: any }) => (
    <Row className="mb-2">
      <Col span={10} className="text-gray-500 font-medium">
        {label}
      </Col>
      <Col span={14} className="font-semibold text-gray-800">
        {value || "—"}
      </Col>
    </Row>
  );

  return (
    <div className="!space-y-6">
      <Card className="rounded-2xl overflow-hidden">
        <Title level={3}>Purchase Overview</Title>
        <Divider />
        <Row gutter={16}>
          <Col span={12}>
            <InfoRow label="Reference No :" value={purchase?.referenceNo} />
          </Col>
          <Col span={12}>
            <InfoRow
              label="Purchase Date :"
              value={
                purchase?.purchaseDate
                  ? dayjs(purchase?.purchaseDate).format("DD MMM YYYY")
                  : "-"
              }
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <InfoRow label="Supplier ID :" value={purchase?.supplierId} />
          </Col>
          <Col span={12}>
            <InfoRow
              label="Supplier Address :"
              value={purchase?.supplierAddress}
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <InfoRow label="Product ID :" value={purchase?.productId} />
          </Col>
          <Col span={12}>
            <InfoRow
              label="Status :"
              value={
                <Tag
                  color={
                    purchase?.status === "ordered"
                      ? "blue"
                      : purchase?.status === "received"
                      ? "green"
                      : "red"
                  }
                >
                  {purchase?.status?.toUpperCase()}
                </Tag>
              }
            />
          </Col>
        </Row>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card title="💰 Financial Information">
          <InfoRow
            label="Pay Term :"
            value={`${purchase?.payTermValue} ${purchase?.payTermUnit}`}
          />
          <InfoRow
            label="Discount :"
            value={`${purchase?.discountAmount} ${
              purchase?.discountType === "percent" ? "%" : "$"
            }`}
          />
          <InfoRow
            label="Order Tax :"
            value={`${purchase?.orderTaxPercent}% ($${purchase?.orderTaxAmount})`}
          />
          <InfoRow
            label="Shipping Charge :"
            value={`$${purchase?.shippingCharge}`}
          />
          <InfoRow label="Net Total :" value={`$${purchase?.netTotalAmount}`} />
          <InfoRow label="Total Amount :" value={`$${purchase?.totalAmount}`} />
          <InfoRow label="Amount Paid :" value={`$${purchase?.amountPaid}`} />
          <InfoRow
            label="Warranty :"
            value={`${purchase?.warrantyValue} ${purchase?.warrantyUnit}`}
          />
          <InfoRow
            label="Expiry Date :"
            value={
              purchase?.expiryDate
                ? dayjs(purchase?.expiryDate).format("DD MMM YYYY")
                : "-"
            }
          />
        </Card>

        <Card title="📦 Shipping & Notes">
          <InfoRow
            label="Shipping Details :"
            value={purchase?.shippingDetails}
          />
          <InfoRow label="Notes :" value={purchase?.notes} />
        </Card>

        <Card title="💵 Additional Expenses">
          <Table
            columns={[
              {
                title: "Expense Name",
                dataIndex: "name",
                key: "name",
                render: (name: string) => name?.trim() || "Not Specified",
              },
              {
                title: "Amount",
                dataIndex: "amount",
                key: "amount",
                render: (amount: any) => {
                  const num = Number(amount);
                  return !isNaN(num) ? `$${num.toFixed(2)}` : "----";
                },
              },
            ]}
            dataSource={purchase?.additionalExpenses || []}
            pagination={false}
            rowKey={(record) => record?.name}
          />
        </Card>

        {purchase?.items && purchase?.items?.length > 0 && (
          <Card title="📋 Line Items" className="lg:col-span-2">
            <Table
              columns={[
                {
                  title: "Product",
                  dataIndex: ["product", "name"],
                  key: "product",
                },
                {
                  title: "Quantity",
                  dataIndex: "quantity",
                  key: "quantity",
                },
                {
                  title: "Unit Price",
                  dataIndex: "unitPrice",
                  key: "unitPrice",
                  render: (price: any) => {
                    const num = Number(price);
                    return !isNaN(num) ? `$${num.toFixed(2)}` : "----";
                  },
                },
                {
                  title: "Line Total",
                  dataIndex: "lineTotal",
                  key: "lineTotal",
                  render: (total: any) => {
                    const num = Number(total);
                    return !isNaN(num) ? `$${num.toFixed(2)}` : "----";
                  },
                },
                {
                  title: "Expiry Date",
                  dataIndex: "expiryDate",
                  key: "expiryDate",
                  render: (date: string) =>
                    date ? dayjs(date).format("DD MMM YYYY") : "-",
                },
                {
                  title: "Batch No",
                  dataIndex: "batchNo",
                  key: "batchNo",
                },
              ]}
              dataSource={purchase?.items}
              pagination={false}
              rowKey={(record) => record?.id || Math.random()}
            />
          </Card>
        )}

        {purchase?.returns && purchase?.returns?.length > 0 && (
          <Card title="↩️ Returns" className="lg:col-span-2">
            <Table
              columns={[
                {
                  title: "Return ID",
                  dataIndex: "referenceNo",
                  key: "referenceNo",
                },
                {
                  title: "Return Date",
                  dataIndex: "returnDate",
                  key: "returnDate",
                  render: (date: string) => dayjs(date).format("DD MMM YYYY"),
                },
                {
                  title: "Reason",
                  dataIndex: "returnReason",
                  key: "returnReason",
                  render: (reason: string) => (
                    <Tag color="orange">{reason?.toUpperCase()}</Tag>
                  ),
                },
                {
                  title: "Total Return",
                  dataIndex: "totalReturnAmount",
                  key: "totalReturnAmount",
                  render: (amount: any) => {
                    const num = Number(amount);
                    return !isNaN(num) ? `$${num.toFixed(2)}` : "----";
                  },
                },
                {
                  title: "Refund Status",
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
              ]}
              dataSource={purchase?.returns}
              pagination={false}
              rowKey={(record) => record?.id}
            />
          </Card>
        )}
      </div>
    </div>
    );
}
