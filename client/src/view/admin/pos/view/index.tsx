import {
  Card,
  Typography,
  Tag,
  Space,
  Button,
  Row,
  Col,
  Divider,
  Statistic,
  Avatar,
  Table,
  message,
  Badge,
  Descriptions,
} from "antd";
import {
  ShoppingCartOutlined,
  DollarOutlined,
  DownloadOutlined,
  PrinterOutlined,
  ArrowLeftOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  BarcodeOutlined,
} from "@ant-design/icons";
import { Link, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { IoReceiptOutline, IoPersonOutline } from "react-icons/io5";
import { DashboardTitle } from "@/components/re-useable/dashboard-titile";
import { useSale } from "@/hooks/admin/sales";

const { Title, Text, Paragraph } = Typography;

export default function POSDetails() {
  const { id } = useParams();
  const { sale: posData } = useSale(id);

  // const posData = {
  //   id: 1,
  //   referenceNo: "S-2025-001",
  //   saleDate: "2025-09-04T12:30:00.000Z",
  //   status: "completed",
  //   discountType: "none",
  //   discountAmount: "0.00",
  //   orderTaxPercent: "0.00",
  //   orderTaxAmount: "40.00",
  //   shippingCharge: "0.00",
  //   totalItems: "8.00",
  //   netTotalAmount: "800.00",
  //   totalAmount: "840.00",
  //   amountPaid: "0.00",
  //   notes: "Walk-in customer",
  //   meta: {
  //     cashier: "MD",
  //     channel: "POS",
  //   },
  //   customerId: 1,
  //   createdAt: "2025-09-04T05:06:33.000Z",
  //   updatedAt: "2025-09-04T05:06:33.000Z",
  //   items: [
  //     {
  //       id: 1,
  //       saleId: 1,
  //       productId: 1,
  //       quantity: "8.00",
  //       unitPrice: "100.00",
  //       discountType: "none",
  //       discountAmount: "0.00",
  //       taxPercent: "5.00",
  //       taxAmount: "40.00",
  //       lineTotal: "840.00",
  //       allocations: [
  //         {
  //           qty: 8,
  //           expiryDate: "2027-10-29",
  //         },
  //       ],
  //       createdAt: "2025-09-04T05:06:33.000Z",
  //       updatedAt: "2025-09-04T05:06:33.000Z",
  //       product: {
  //         id: 1,
  //         name: "Sample Product",
  //         description: "Product description",
  //         categoryId: 1,
  //         sku: "SKU12adfasadsfasddgfhdf345",
  //         barcode: "1234567890",
  //         stockQuantity: 50,
  //         reorderLevel: 10,
  //         isTrackStock: true,
  //         imageUrl: "https://example.com/image.png",
  //         status: "active",
  //         tags: "tag1,tag2",
  //         createdBy: 1,
  //         updatedBy: null,
  //         createdAt: "2025-09-04T05:04:17.000Z",
  //         updatedAt: "2025-09-04T05:04:17.000Z",
  //       },
  //     },
  //   ],
  //   customer: {
  //     id: 1,
  //     name: "Rahim Uddin",
  //     phone: "01700000000",
  //     email: "rahim@example.com",
  //     address: "Dhaka",
  //     status: "active",
  //     notes: "First time buyer",
  //     createdAt: "2025-09-04T05:06:33.000Z",
  //     updatedAt: "2025-09-04T05:06:33.000Z",
  //   },
  //   invoice: {
  //     id: 1,
  //     saleId: 1,
  //     customerId: 1,
  //     invoiceNo: "INV-20250904-0001",
  //     invoiceDate: "2025-09-04T05:06:33.000Z",
  //     dueDate: null,
  //     subTotal: "800.00",
  //     discountAmount: "0.00",
  //     orderTaxAmount: "40.00",
  //     shippingCharge: "0.00",
  //     totalAmount: "840.00",
  //     amountPaid: "0.00",
  //     balanceDue: "840.00",
  //     status: "issued",
  //     notes: null,
  //     createdAt: "2025-09-04T05:06:33.000Z",
  //     updatedAt: "2025-09-04T05:06:33.000Z",
  //   },
  // };

  // Mock product data - in real app, fetch this based on productId
  const productNames = {
    101: "Premium Widget",
    102: "Deluxe Gadget",
  };

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(numAmount);
  };

  const formatDateTime = (dateString: string) => {
    return dayjs(dateString).format("MMMM D, YYYY [at] h:mm A");
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("MMM D, YYYY");
  };

  const calculateSubtotal = () => {
    return posData?.items?.reduce(
      (sum, item) =>
        sum + parseFloat(item.quantity) * parseFloat(item.unitPrice),
      0
    );
  };

  const calculateTotalDiscount = () => {
    return posData?.items?.reduce(
      (sum, item) => sum + parseFloat(item.discountAmount),
      0
    );
  };

  const calculateTotalTax = () => {
    return posData?.items?.reduce((sum, item) => {
      const itemSubtotal =
        parseFloat(item.quantity) * parseFloat(item.unitPrice) -
        parseFloat(item.discountAmount);
      return sum + (itemSubtotal * parseFloat(item.taxPercent)) / 100;
    }, 0);
  };

  const getDiscountTypeText = (type: string) => {
    switch (type) {
      case "none":
        return "No Discount";
      case "percent":
        return "Percentage Discount";
      case "fixed":
        return "Fixed Amount Discount";
      default:
        return type;
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method.toLowerCase()) {
      case "cash":
        return "success";
      case "card":
        return "processing";
      case "mobile":
        return "warning";
      default:
        return "default";
    }
  };

  // PDF Download functionality
  const handleDownloadPDF = async () => {
    try {
      message.loading("Generating POS Receipt PDF...", 0);

      setTimeout(() => {
        message.destroy();
        message.success("POS Receipt PDF downloaded successfully!");

        const link = document.createElement("a");
        link.href = "#";
        link.download = `POS-Receipt-${posData?.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, 2000);
    } catch (error) {
      message.destroy();
      message.error("Failed to download PDF");
      console.error("PDF download error:", error);
    }
  };

  // Print functionality
  const handlePrint = () => {
    try {
      message.success("Printed successfully");
    } catch (error) {
      message.destroy();
      message.error("Failed to open print dialog");
      console.error("Print error:", error);
    }
  };

  // Table columns for items
  const itemColumns = [
    {
      title: "Product Details",
      key: "product",
      render: (record: any) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <BarcodeOutlined className="text-gray-400" />
            <Text className="font-semibold text-gray-900">
              {record.product?.name || `Product ${record?.productId}`}
            </Text>
          </div>
          <div className="text-xs text-gray-500 space-y-1">
            <div>SKU: {record.product?.sku || "N/A"}</div>
            <div>Barcode: {record.product?.barcode || "N/A"}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      align: "center" as const,
      render: (quantity: string) => (
        <Badge
          count={parseFloat(quantity)}
          style={{ backgroundColor: "#1890ff" }}
          className="font-medium"
        />
      ),
    },
    {
      title: "Unit Price",
      dataIndex: "unitPrice",
      key: "unitPrice",
      align: "right" as const,
      render: (price: string) => (
        <Text className="font-semibold text-green-600">
          {formatCurrency(price)}
        </Text>
      ),
    },
    {
      title: "Discount",
      dataIndex: "discountAmount",
      key: "discountAmount",
      align: "right" as const,
      render: (discount: string) => (
        <Text className="font-medium text-red-500">
          {parseFloat(discount) > 0
            ? `-${formatCurrency(discount)}`
            : formatCurrency(discount)}
        </Text>
      ),
    },
    {
      title: "Tax",
      key: "tax",
      align: "center" as const,
      render: (record: any) => (
        <div className="text-center">
          <Tag color="purple" className="font-medium">
            {record?.taxPercent}%
          </Tag>
          <div className="text-xs text-gray-500 mt-1">
            {formatCurrency(record?.taxAmount)}
          </div>
        </div>
      ),
    },
    {
      title: "Line Total",
      key: "lineTotal",
      align: "right" as const,
      render: (record: any) => (
        <Text className="font-bold text-gray-900 text-lg">
          {formatCurrency(record?.lineTotal)}
        </Text>
      ),
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="flex md:items-center flex-col md:flex-row justify-between gap-6 mb-6 w-full">
        <DashboardTitle
          title=" POS Order Details"
          description={`Receipt #${posData?.id}`}
        />
        <Space>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            className="btn hover:!text-[#69feb0]"
            onClick={handleDownloadPDF}
          >
            Download Receipt
          </Button>
          <Button
            icon={<PrinterOutlined />}
            className="!border-[#005555] !text-[#005555] hover:!bg-[#005555] hover:!text-white"
            onClick={handlePrint}
          >
            Print Receipt
          </Button>
          <Link to="/admin/pos/all">
            <Button
              icon={<ArrowLeftOutlined />}
              className="!border-[#005555] !text-[#005555] hover:!bg-[#005555] hover:!text-white"
            >
              Back to Sales
            </Button>
          </Link>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* Main POS Information */}
        <Col xs={24} lg={16}>
          <Card className="shadow-sm">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-[#005555]/10 rounded-xl flex items-center justify-center  ">
                  <ShoppingCartOutlined className="text-3xl text-white" />
                </div>
                <div>
                  <Title level={2} className="!mb-2 !text-gray-900">
                    Order
                  </Title>
                  <div className="flex items-center space-x-4">
                    <Text className="text-gray-600">
                      Reference:{" "}
                      <span className="font-semibold text-[#005555]">
                        {posData?.referenceNo}
                      </span>
                    </Text>
                    <Badge
                      status="success"
                      text={
                        posData?.status
                          ? posData.status.charAt(0).toUpperCase() +
                            posData.status.slice(1)
                          : "Unknown"
                      }
                      className="text-sm font-medium"
                    />
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Text className="text-sm text-gray-500 mr-5">
                  Total Amount :
                </Text>
                <Text className="text-2xl font-bold text-[#005555]">
                  {formatCurrency(posData?.totalAmount ?? "")}
                </Text>
              </div>
            </div>

            {/* Order Information Grid */}
            <Card size="small" className="mb-6 bg-gray-50 border-0">
              <Descriptions
                column={2}
                size="small"
                labelStyle={{ fontWeight: 600, color: "#6b7280" }}
                contentStyle={{ fontWeight: 500 }}
              >
                <Descriptions.Item label="Order ID">
                  <Text className="font-semibold text-[#005555]">
                    #{posData?.id}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Cashier">
                  {posData?.meta?.cashier || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Channel">
                  <Tag color="blue">{posData?.meta?.channel || "POS"}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Sale Date">
                  {formatDateTime(posData?.saleDate ?? "")}
                </Descriptions.Item>
                <Descriptions.Item label="Created">
                  {formatDateTime(posData?.createdAt ?? "")}
                </Descriptions.Item>
                <Descriptions.Item label="Updated">
                  {formatDateTime(posData?.updatedAt ?? "")}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Divider />

            {/* Order Items */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <Title level={4} className="!mb-0 flex items-center">
                  <IoReceiptOutline className="mr-2 text-[#005555]" />
                  Order Items ({posData?.items?.length})
                </Title>
                <Tag color="blue" className="text-sm">
                  {posData?.totalItems} Total Items
                </Tag>
              </div>

              <Table
                columns={itemColumns}
                dataSource={posData?.items}
                pagination={false}
                size="middle"
                className="border border-gray-100"
                rowKey="id"
                scroll={{ x: "max-content" }}
                rowClassName="hover:bg-gray-50/10"
              />
            </div>

            <Divider />

            {/* Financial Summary */}
            <div className="mb-8">
              <Title level={4} className="!mb-6 flex items-center">
                <DollarOutlined className="mr-2 text-[#005555]" />
                Financial Breakdown
              </Title>

              <Row gutter={[20, 20]}>
                <Col xs={24} sm={12} md={8}>
                  <Card
                    size="small"
                    className="text-center border-l-4 border-l-green-500 bg-green-50"
                  >
                    <Statistic
                      title="Subtotal"
                      value={parseFloat(posData?.netTotalAmount ?? "")}
                      precision={2}
                      valueStyle={{
                        color: "#16a34a",
                        fontSize: "20px",
                        fontWeight: "bold",
                      }}
                      prefix="$"
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Card
                    size="small"
                    className="text-center border-l-4 border-l-red-500 bg-red-50"
                  >
                    <Statistic
                      title="Total Discount"
                      value={parseFloat(posData?.discountAmount ?? "")}
                      precision={2}
                      valueStyle={{
                        color: "#dc2626",
                        fontSize: "20px",
                        fontWeight: "bold",
                      }}
                      prefix="$"
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Card
                    size="small"
                    className="text-center border-l-4 border-l-purple-500 bg-purple-50"
                  >
                    <Statistic
                      title="Order Tax"
                      value={parseFloat(posData?.orderTaxAmount ?? "")}
                      precision={2}
                      valueStyle={{
                        color: "#7c3aed",
                        fontSize: "20px",
                        fontWeight: "bold",
                      }}
                      prefix="$"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      ({posData?.orderTaxPercent}% rate)
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Card
                    size="small"
                    className="text-center border-l-4 border-l-blue-500 bg-blue-50"
                  >
                    <Statistic
                      title="Shipping"
                      value={parseFloat(posData?.shippingCharge ?? "")}
                      precision={2}
                      valueStyle={{
                        color: "#2563eb",
                        fontSize: "20px",
                        fontWeight: "bold",
                      }}
                      prefix="$"
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Card
                    size="small"
                    className="text-center border-l-4 border-l-orange-500 bg-orange-50"
                  >
                    <Statistic
                      title="Amount Paid"
                      value={parseFloat(posData?.amountPaid ?? "")}
                      precision={2}
                      valueStyle={{
                        color: "#ea580c",
                        fontSize: "20px",
                        fontWeight: "bold",
                      }}
                      prefix="$"
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Card
                    size="small"
                    className="text-center border-l-4 border-l-[#005555] bg-[#005555]/5"
                  >
                    <Statistic
                      title="Total Amount"
                      value={parseFloat(posData?.totalAmount ?? "")}
                      precision={2}
                      valueStyle={{
                        color: "#005555",
                        fontSize: "24px",
                        fontWeight: "bold",
                      }}
                      prefix="$"
                    />
                  </Card>
                </Col>
              </Row>
            </div>

            {/* Notes Section */}
            {posData?.notes && (
              <>
                <Divider />
                <div>
                  <Title level={4} className="!mb-3">
                    Notes
                  </Title>
                  <Card className="bg-gray-50 border-0">
                    <Paragraph className="!mb-0 text-gray-700">
                      {posData.notes}
                    </Paragraph>
                  </Card>
                </div>
              </>
            )}
          </Card>
        </Col>

        {/* Sidebar Information */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size={20} className="w-full">
            {/* Customer Information */}
            <Card className="shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <Avatar
                  size={56}
                  icon={<IoPersonOutline />}
                  className="bg-gradient-to-br from-[#005555] to-[#003d3d] text-white"
                />
                <div className="flex-1">
                  <Title level={4} className="!mb-2 !text-gray-900">
                    {posData?.customer?.name || "Walk-in Customer"}
                  </Title>
                  <Tag color="success" className="text-xs font-medium">
                    {posData?.customer?.status || "Active"} Customer
                  </Tag>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <PhoneOutlined className="text-[#005555] text-lg" />
                  <div className="flex-1">
                    <Text className="text-gray-500 text-xs font-medium">
                      Phone Number
                    </Text>
                    <div className="mt-1">
                      <Text className="font-semibold text-gray-900">
                        {posData?.customer?.phone || "N/A"}
                      </Text>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <MailOutlined className="text-[#005555] text-lg" />
                  <div className="flex-1">
                    <Text className="text-gray-500 text-xs font-medium">
                      Email Address
                    </Text>
                    <div className="mt-1">
                      <Text className="font-semibold text-gray-900">
                        {posData?.customer?.email || "N/A"}
                      </Text>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <EnvironmentOutlined className="text-[#005555] text-lg" />
                  <div className="flex-1">
                    <Text className="text-gray-500 text-xs font-medium">
                      Address
                    </Text>
                    <div className="mt-1">
                      <Text className="font-semibold text-gray-900">
                        {posData?.customer?.address || "N/A"}
                      </Text>
                    </div>
                  </div>
                </div>

                {posData?.customer?.notes && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <Text className="text-blue-600 text-xs font-medium">
                      Customer Notes
                    </Text>
                    <div className="mt-1">
                      <Text className="text-blue-800 text-sm">
                        {posData?.customer?.notes}
                      </Text>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Order Summary */}
            <Card className="shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                  <IoReceiptOutline className="text-xl text-white" />
                </div>
                <div>
                  <Title level={4} className="!mb-1">
                    Order Summary
                  </Title>
                  <Text className="text-gray-600 text-sm">Quick overview</Text>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <Text className="text-gray-600 text-sm font-medium">
                    Total Items
                  </Text>
                  <Badge
                    count={posData?.items?.length}
                    style={{ backgroundColor: "#1890ff" }}
                  />
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <Text className="text-gray-600 text-sm font-medium">
                    Discount Type
                  </Text>
                  <Tag color="orange" className="text-xs font-medium">
                    {getDiscountTypeText(posData?.discountType ?? "")}
                  </Tag>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <Text className="text-gray-600 text-sm font-medium">
                    Order Tax
                  </Text>
                  <Text className="font-semibold text-sm text-purple-600">
                    {posData?.orderTaxPercent}%
                  </Text>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <Text className="text-gray-600 text-sm font-medium">
                    Shipping
                  </Text>
                  <Text className="font-semibold text-sm text-blue-600">
                    {formatCurrency(posData?.shippingCharge ?? 0)}
                  </Text>
                </div>
              </div>
            </Card>

            {/* Invoice Information */}
            <Card className="shadow-sm">
              <Title level={4} className="!mb-6 flex items-center">
                <DollarOutlined className="mr-2 text-[#005555]" />
                Invoice Details
              </Title>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <Text className="text-gray-600 text-xs font-medium">
                      Invoice Number
                    </Text>
                    <Text className="font-semibold text-sm text-[#005555]">
                      {posData?.invoice?.invoiceNo || "N/A"}
                    </Text>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <Text className="text-gray-600 text-xs font-medium">
                      Invoice Date
                    </Text>
                    <Text className="font-medium text-sm">
                      {posData?.invoice?.invoiceDate
                        ? formatDate(posData?.invoice?.invoiceDate)
                        : "N/A"}
                    </Text>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <Text className="text-gray-600 text-xs font-medium">
                      Status
                    </Text>
                    <Tag color="processing" className="text-xs">
                      {posData?.invoice?.status || "Issued"}
                    </Tag>
                  </div>
                  <div className="flex justify-between items-center">
                    <Text className="text-gray-600 text-xs font-medium">
                      Balance Due
                    </Text>
                    <Text className="font-bold text-sm text-red-600">
                      {formatCurrency(
                        posData?.invoice?.balanceDue ??
                          (0 || posData?.totalAmount) ??
                          0
                      )}
                    </Text>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-sm">
              <Title level={4} className="!mb-6">
                Quick Actions
              </Title>

              <Space direction="vertical" className="w-full" size={12}>
                <Button
                  type="primary"
                  block
                  size="large"
                  icon={<DownloadOutlined />}
                  className="btn hover:!text-[#69feb0] h-12 font-semibold"
                  onClick={handleDownloadPDF}
                >
                  Download Receipt
                </Button>
                <Button
                  block
                  size="large"
                  icon={<PrinterOutlined />}
                  className="!border-[#005555] !text-[#005555] hover:!bg-[#005555] hover:!text-white h-12 font-semibold"
                  onClick={handlePrint}
                >
                  Print Receipt
                </Button>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
}
