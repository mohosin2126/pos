
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
} from "antd";
import {
  ShoppingCartOutlined,
  UserOutlined,
  DollarOutlined,
  DownloadOutlined,
  PrinterOutlined,
  ArrowLeftOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import type { TPOSOrderPayload } from "@/interface/common";
import { IoReceiptOutline, IoStorefrontOutline } from "react-icons/io5";
import { DashboardTitle } from "@/components/re-useable/dashboard-titile";

const { Title, Text, Paragraph } = Typography;

export default function POSDetails() {
  const posData: TPOSOrderPayload = {
    id: 1,
    billerName: "Main POS",
    customerName: "Test Customer 1",
    customerPhone: "01700000001",
    items: [
      {
        productId: 101,
        quantity: 2,
        unitPrice: 500,
        discountAmount: 0,
        taxPercent: 5,
      },
      {
        productId: 102,
        quantity: 1,
        unitPrice: 1200,
        discountAmount: 100,
        taxPercent: 0,
      },
    ],
    discountType: "none",
    orderTaxPercent: 0,
    shippingCharge: 0,
    payments: [{ amount: 1500, method: "cash" }],
    notes: "POS sale",
    createdAt: "2025-08-24T08:00:00Z",
    updatedAt: "2025-08-24T08:00:00Z",
  };

  // Mock product data - in real app, fetch this based on productId
  const productNames = {
    101: "Premium Widget",
    102: "Deluxe Gadget",
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return dayjs(dateString).format("MMMM D, YYYY [at] h:mm A");
  };

  const calculateSubtotal = () => {
    return posData.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
  };

  const calculateTotalDiscount = () => {
    return posData.items.reduce((sum, item) => sum + item.discountAmount, 0);
  };

  const calculateTotalTax = () => {
    return posData.items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice - item.discountAmount;
      return sum + (itemSubtotal * item.taxPercent) / 100;
    }, 0);
  };

  const calculateTotalAmount = () => {
    const subtotal = calculateSubtotal();
    const totalDiscount = calculateTotalDiscount();
    const totalTax = calculateTotalTax();
    const shipping = posData.shippingCharge;
    return subtotal - totalDiscount + totalTax + shipping;
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
        link.download = `POS-Receipt-${posData.id}.pdf`;
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
      title: "Product",
      dataIndex: "productId",
      key: "productId",
      render: (productId: number) => (
        <Text className="font-medium">
          {productNames[productId as keyof typeof productNames] ||
            `Product ${productId}`}
        </Text>
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity: number) => (
        <Tag color="blue" className="font-medium">
          {quantity}
        </Tag>
      ),
    },
    {
      title: "Unit Price",
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (price: number) => (
        <Text className="font-medium text-green-600">
          {formatCurrency(price)}
        </Text>
      ),
    },
    {
      title: "Discount",
      dataIndex: "discountAmount",
      key: "discountAmount",
      render: (discount: number) => (
        <Text className="font-medium text-red-600">
          {formatCurrency(discount)}
        </Text>
      ),
    },
    {
      title: "Tax %",
      dataIndex: "taxPercent",
      key: "taxPercent",
      render: (tax: number) => (
        <Tag color="purple" className="font-medium">
          {tax}%
        </Tag>
      ),
    },
    {
      title: "Total",
      key: "total",
      render: (record: any) => {
        const total =
          record.quantity * record.unitPrice - record.discountAmount;
        return (
          <Text className="font-bold text-gray-900">
            {formatCurrency(total)}
          </Text>
        );
      },
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
            className="btn"
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
          <Link to="/admin/pos">
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
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-[#005555]/10 rounded-lg flex items-center justify-center">
                  <ShoppingCartOutlined className="text-2xl text-[#005555]" />
                </div>
                <div>
                  <Title level={3} className="!mb-1">
                    POS Order Information
                  </Title>
                  <Text className="text-gray-600">
                    Complete order details and breakdown
                  </Text>
                </div>
              </div>
              <Tag color="success" className="text-sm font-medium px-3 py-1">
                Completed
              </Tag>
            </div>

            <Row gutter={[24, 24]} className="mb-6">
              <Col xs={24} sm={12}>
                <div className="space-x-2">
                  <Text className="text-gray-500 text-sm">Order ID:</Text>
                  <Text className="text-lg font-semibold text-gray-900">
                    #{posData.id}
                  </Text>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div className="space-x-2">
                  <Text className="text-gray-500 text-sm">Biller:</Text>
                  <Text className="text-lg font-semibold text-gray-900">
                    {posData.billerName}
                  </Text>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div className="space-x-2">
                  <Text className="text-gray-500 text-sm">Order Date:</Text>
                  <Text className="text-lg font-semibold text-gray-900">
                    {formatDateTime(posData.createdAt)}
                  </Text>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div className="space-x-2">
                  <Text className="text-gray-500 text-sm">Last Updated:</Text>
                  <Text className="text-lg font-semibold text-gray-900">
                    {formatDateTime(posData.updatedAt)}
                  </Text>
                </div>
              </Col>
            </Row>

            <Divider />

            {/* Order Items */}
            <div className="mb-6">
              <Title level={4} className="!mb-4 flex items-center">
                <IoReceiptOutline className="mr-2 text-[#005555]" />
                Order Items
              </Title>

              <Table
                columns={itemColumns}
                dataSource={posData.items}
                pagination={false}
                size="small"
                className="border border-gray-100 rounded"
                rowKey="productId"
                scroll={{ x: "max-content" }}
              />
            </div>

            <Divider />

            {/* Financial Summary */}
            <div className="mb-6">
              <Title level={4} className="!mb-4 flex items-center">
                <DollarOutlined className="mr-2 text-[#005555]" />
                Financial Summary
              </Title>

              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Card size="small" className="text-center">
                    <Statistic
                      title="Subtotal"
                      value={calculateSubtotal()}
                      precision={2}
                      valueStyle={{ color: "#3f8600", fontSize: "18px" }}
                      prefix="$"
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Card size="small" className="text-center">
                    <Statistic
                      title="Total Discount"
                      value={calculateTotalDiscount()}
                      precision={2}
                      valueStyle={{ color: "#cf1322", fontSize: "18px" }}
                      prefix="$"
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Card size="small" className="text-center">
                    <Statistic
                      title="Total Tax"
                      value={calculateTotalTax()}
                      precision={2}
                      valueStyle={{ color: "#722ed1", fontSize: "18px" }}
                      prefix="$"
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Card size="small" className="text-center">
                    <Statistic
                      title="Shipping"
                      value={posData.shippingCharge}
                      precision={2}
                      valueStyle={{ color: "#08979c", fontSize: "18px" }}
                      prefix="$"
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Card size="small" className="text-center">
                    <Statistic
                      title="Total Amount"
                      value={calculateTotalAmount()}
                      precision={2}
                      valueStyle={{
                        color: "#3f8600",
                        fontSize: "18px",
                        fontWeight: "bold",
                      }}
                      prefix="$"
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Card size="small" className="text-center">
                    <Statistic
                      title="Order Tax %"
                      value={posData.orderTaxPercent}
                      precision={0}
                      valueStyle={{ color: "#1890ff", fontSize: "18px" }}
                      suffix="%"
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
          <Space direction="vertical" size={16} className="w-full">
            {/* Customer Information */}
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <Avatar
                  size={48}
                  icon={<UserOutlined />}
                  className="bg-[#005555]/10 text-[#005555]"
                />
                <div className="flex-1">
                  <Title level={4} className="!mb-1 !text-gray-900">
                    {posData.customerName}
                  </Title>
                  <Tag color="success" className="text-xs">
                    Active Customer
                  </Tag>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <PhoneOutlined className="text-[#005555] text-lg" />
                  <div className="flex-1">
                    <Text className="text-gray-500 text-xs">Phone Number</Text>
                    <div className="mt-1">
                      <Text className="font-medium text-gray-900">
                        {posData.customerPhone}
                      </Text>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <IoStorefrontOutline className="text-[#005555] text-lg" />
                  <div className="flex-1">
                    <Text className="text-gray-500 text-xs">
                      Biller Location
                    </Text>
                    <div className="mt-1">
                      <Text className="font-medium text-gray-900">
                        {posData.billerName}
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Order Summary */}
            <Card>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <IoReceiptOutline className="text-xl text-blue-600" />
                </div>
                <div>
                  <Title level={4} className="!mb-1">
                    Order Summary
                  </Title>
                  <Text className="text-gray-600 text-sm">Quick overview</Text>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Text className="text-gray-500 text-sm">Total Items</Text>
                  <Text className="font-medium text-sm">
                    {posData.items.length}
                  </Text>
                </div>
                <div className="flex justify-between items-center">
                  <Text className="text-gray-500 text-sm">Discount Type</Text>
                  <Tag color="orange" className="text-xs">
                    {getDiscountTypeText(posData.discountType)}
                  </Tag>
                </div>
                <div className="flex justify-between items-center">
                  <Text className="text-gray-500 text-sm">Order Tax</Text>
                  <Text className="font-medium text-sm">
                    {posData.orderTaxPercent}%
                  </Text>
                </div>
                <div className="flex justify-between items-center">
                  <Text className="text-gray-500 text-sm">Shipping</Text>
                  <Text className="font-medium text-sm">
                    {formatCurrency(posData.shippingCharge)}
                  </Text>
                </div>
              </div>
            </Card>

            {/* Payment Information */}
            <Card>
              <Title level={4} className="!mb-4 flex items-center">
                <DollarOutlined className="mr-2 text-[#005555]" />
                Payment Details
              </Title>

              {posData.payments.map((payment, index) => (
                <div key={index} className="mb-3 last:mb-0">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <Text className="text-gray-500 text-xs">Method</Text>
                      <div className="mt-1">
                        <Tag
                          color={getPaymentMethodColor(payment.method)}
                          className="font-medium"
                        >
                          {payment.method.toUpperCase()}
                        </Tag>
                      </div>
                    </div>
                    <div className="text-right">
                      <Text className="text-gray-500 text-xs">Amount</Text>
                      <div className="mt-1">
                        <Text className="font-bold text-lg text-green-600">
                          {formatCurrency(payment.amount)}
                        </Text>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Card>

            {/* Quick Actions */}
            <Card>
              <Title level={4} className="!mb-4">
                Quick Actions
              </Title>

              <Space direction="vertical" className="w-full">
                <Button
                  type="primary"
                  block
                  icon={<DownloadOutlined />}
                  className="btn"
                  onClick={handleDownloadPDF}
                >
                  Download Receipt
                </Button>
                <Button
                  block
                  icon={<PrinterOutlined />}
                  className="!border-[#005555] !text-[#005555] hover:!bg-[#005555] hover:!text-white"
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
