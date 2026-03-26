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
  message,
  Table,
  Badge,
  Avatar,
  Modal,
  Form,
  DatePicker,
  Input,
  InputNumber,
  Select,
} from "antd";
import {
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  DownloadOutlined,
  PrinterOutlined,
  ArrowLeftOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  ShoppingCartOutlined,
  BarcodeOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { DashboardTitle } from "@/components/re-useable/dashboard-titile";
import { useSale } from "@/hooks/admin/sales";
import { useCreateSaleReturn } from "@/hooks/admin/sale-return";
import { useBasePath } from "@/hooks/common/use-base-path";
import type { TSaleReturn } from "@/interface/common";

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;

export default function SalesDetails() {
  const { id } = useParams();
  const { sale, refetch } = useSale(id);
  const basePath = useBasePath();
  const { createSaleReturn, loading: creatingReturn } = useCreateSaleReturn();
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnQuantities, setReturnQuantities] = useState<Record<number, number>>({});
  const [returnForm] = Form.useForm();

  // console.log("sales data :", sale);

  const detailsData = sale?.invoice;
  const customerData = sale?.customer;
  const saleReturns = sale?.returns || [];
  const activeReturns = saleReturns.filter(
    (saleReturn) => saleReturn.refundStatus !== "rejected"
  );
  const existingReturnedQtyBySaleItem = activeReturns.reduce<Record<number, number>>(
    (acc, saleReturn) => {
      saleReturn.returnItems?.forEach((item) => {
        acc[item.saleItemId] = (acc[item.saleItemId] || 0) + Number(item.quantity || 0);
      });
      return acc;
    },
    {}
  );
  const returnableItems = (sale?.items || []).map((item) => {
    const returnedQty = existingReturnedQtyBySaleItem[item.id] || 0;
    const availableQty = Math.max(0, Number(item.quantity || 0) - returnedQty);

    return {
      ...item,
      returnedQty,
      availableQty,
    };
  });
  const totalReturnedAmount = activeReturns.reduce(
    (sum, saleReturn) => sum + Number(saleReturn.totalReturnAmount || 0),
    0
  );
  const refundedAmount = saleReturns
    .filter((saleReturn) => saleReturn.refundStatus === "refunded")
    .reduce((sum, saleReturn) => sum + Number(saleReturn.refundAmount || 0), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "success";
      case "active":
        return "success";
      case "issued":
        return "processing";
      case "inactive":
        return "processing";
      case "void":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    return status?.charAt(0).toUpperCase() + status?.slice(1);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "—";
    return dayjs(dateString).format("MMMM D, YYYY");
  };

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return "—";
    return dayjs(dateString).format("MMMM D, YYYY [at] h:mm A");
  };

  // PDF Download functionality
  const handleDownloadPDF = async () => {
    try {
      message.loading("Generating PDF...", 0);

      setTimeout(() => {
        message.destroy();
        message.success("PDF downloaded successfully!");

        const link = document.createElement("a");
        link.href = "#";
        link.download = `Invoice-${detailsData?.invoiceNo}.pdf`;
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
      message.loading("Preparing for print...", 0);
      setTimeout(() => {
        message.destroy();
        window.print();
      }, 300);
    } catch (error: any) {
      console.log(error);
      message.destroy();
      message.error("Failed to open print dialog");
    }
  };

  const openReturnModal = () => {
    setReturnQuantities({});
    returnForm.setFieldsValue({
      returnDate: dayjs(),
      returnReason: "customer_request",
      restockingDisposition: "restock",
      notes: "",
    });
    setIsReturnModalOpen(true);
  };

  const handleCreateReturn = async (values: {
    returnDate: dayjs.Dayjs;
    returnReason: TSaleReturn["returnReason"];
    restockingDisposition: TSaleReturn["restockingDisposition"];
    notes?: string;
  }) => {
    if (!sale?.id) return;

    const returnItems = Object.entries(returnQuantities)
      .map(([saleItemId, quantity]) => ({
        saleItemId: Number(saleItemId),
        quantity: Number(quantity || 0),
      }))
      .filter((item) => item.quantity > 0);

    if (returnItems.length === 0) {
      message.error("Select at least one item quantity to return");
      return;
    }

    const result = await createSaleReturn({
      saleId: sale.id,
      referenceNo: `SRET-${Date.now()}`,
      returnDate: values.returnDate.toISOString(),
      returnReason: values.returnReason,
      restockingDisposition: values.restockingDisposition,
      notes: values.notes,
      returnItems,
    });

    if (result) {
      message.success("Sales return created successfully");
      setIsReturnModalOpen(false);
      setReturnQuantities({});
      returnForm.resetFields();
      refetch();
    }
  };

  return (
    <div className=" min-h-screen">
      {/* Header Section */}
      <div className="flex md:items-center flex-col md:flex-row justify-between gap-6 mb-6 w-full">
        <DashboardTitle
          title="Sales Details"
          description={`Invoice #${detailsData?.invoiceNo}`}
        />

        <Space>
          <Button
            type="primary"
            onClick={openReturnModal}
            disabled={
              sale?.status !== "completed" ||
              returnableItems.every((item) => item.availableQty <= 0)
            }
          >
            Create Return
          </Button>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            className="btn hover:!text-[#69feb0]"
            onClick={handleDownloadPDF}
          >
            Download PDF
          </Button>
          <Button
            icon={<PrinterOutlined />}
            className="!border-[#005555] !text-[#005555] hover:!bg-[#005555] hover:!text-white"
            onClick={handlePrint}
          >
            Print
          </Button>
          <Link to={`${basePath}/sales/all`}>
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
        {/* Main Invoice Information */}
        <Col xs={24} lg={16}>
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-[#005555]/10 rounded-lg flex items-center justify-center">
                  <FileTextOutlined className="text-2xl text-[#005555]" />
                </div>
                <div>
                  <Title level={3} className="!mb-1">
                    Invoice Information
                  </Title>
                  <Text className="text-gray-600">
                    Complete invoice details and breakdown
                  </Text>
                </div>
              </div>
              <Tag
                color={getStatusColor(detailsData?.status ?? "")}
                className="text-sm font-medium px-3 py-1"
              >
                {getStatusText(detailsData?.status ?? "")}
              </Tag>
            </div>

            <Row gutter={[24, 24]} className="mb-6">
              <Col xs={24} sm={12}>
                <div className="space-x-2">
                  <Text className="text-gray-500 text-sm">Invoice Number:</Text>
                  <Text className="text-lg font-semibold text-gray-900">
                    {detailsData?.invoiceNo}
                  </Text>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div className="space-x-2">
                  <Text className="text-gray-500 text-sm">Sale ID:</Text>
                  <Text className="text-lg font-semibold text-gray-900">
                    #{detailsData?.saleId}
                  </Text>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div className="space-x-2">
                  <Text className="text-gray-500 text-sm">Invoice Date:</Text>
                  <Text className="text-lg font-semibold text-gray-900">
                    {formatDateTime(detailsData?.invoiceDate)}
                  </Text>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div className="space-x-2">
                  <Text className="text-gray-500 text-sm">Due Date:</Text>
                  <Text className="text-lg font-semibold text-gray-900">
                    {formatDate(detailsData?.dueDate)}
                  </Text>
                </div>
              </Col>
            </Row>

            <Divider />

            {/* Product Items Table */}
            <div className="mb-6">
              <Title level={4} className="!mb-4 flex items-center">
                <ShoppingCartOutlined className="mr-2 text-[#005555]" />
                Product Items ({sale?.items?.length || 0})
              </Title>

              <Table
                dataSource={sale?.items || []}
                pagination={false}
                size="middle"
                className="product-items-table"
                rowKey="id"
                scroll={{ x: 800 }}
                columns={[
                  {
                    title: "Product",
                    key: "product",
                    width: 250,
                    render: (_, record) => (
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {record.product?.imageUrl ? (
                            <img
                              src={
                                record?.product?.imageUrl
                                  ? record?.product?.imageUrl
                                  : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                                      record?.product?.name ?? ""
                                    )}`
                              }
                              alt={record?.product?.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <ShoppingCartOutlined className="text-gray-400 text-lg" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {record.product?.name}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            <Tag
                              color={getStatusColor(
                                record?.product?.status ?? ""
                              )}
                              className="text-sm font-medium px-3 py-1"
                            >
                              {getStatusText(record?.product?.status ?? "")}
                            </Tag>
                          </div>
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: "Identity",
                    dataIndex: "identity",
                    key: "identity",
                    render: (_, record) => (
                      <div className="">
                        <div className="flex items-center space-x-2">
                          <BarcodeOutlined className="text-xs" />
                          <span>SKU: {record.product?.sku}</span>
                        </div>
                        {record.product?.barcode && (
                          <div className="flex items-center space-x-2 mt-1">
                            <BarcodeOutlined className="text-xs" />
                            <span>Barcode: {record.product.barcode}</span>
                          </div>
                        )}
                      </div>
                    ),
                  },
                  {
                    title: "Quantity",
                    dataIndex: "quantity",
                    key: "quantity",
                    width: 100,
                    align: "center",
                    render: (quantity: string | number) => (
                      <Badge
                        count={Number(quantity).toFixed(0)}
                        style={{
                          backgroundColor: "#005555",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      />
                    ),
                  },
                  {
                    title: "Unit Price",
                    dataIndex: "unitPrice",
                    key: "unitPrice",
                    width: 120,
                    align: "right",
                    render: (price) => (
                      <span className="font-medium">
                        ${parseFloat(price).toFixed(2)}
                      </span>
                    ),
                  },
                  {
                    title: "Discount",
                    key: "discount",
                    width: 120,
                    align: "right",
                    render: (_, record) => (
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          {record.discountType === "none"
                            ? "No Discount"
                            : record.discountType}
                        </div>
                        <div className="font-medium text-red-600">
                          -${parseFloat(record.discountAmount).toFixed(2)}
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: "Tax",
                    key: "tax",
                    width: 120,
                    align: "right",
                    render: (_, record) => (
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          {record.taxPercent}%
                        </div>
                        <div className="font-medium text-purple-600">
                          ${parseFloat(record.taxAmount).toFixed(2)}
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: "Line Total",
                    dataIndex: "lineTotal",
                    key: "lineTotal",
                    width: 120,
                    align: "right",
                    render: (total) => (
                      <span className="font-bold text-lg text-[#005555]">
                        ${parseFloat(total).toFixed(2)}
                      </span>
                    ),
                  },
                ]}
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
                  <Card
                    size="small"
                    className="text-center border-l-4 border-l-green-500"
                  >
                    <Statistic
                      title="Total Items"
                      value={sale?.totalItems}
                      precision={2}
                      valueStyle={{ color: "#3f8600", fontSize: "18px" }}
                      prefix=""
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Card
                    size="small"
                    className="text-center border-l-4 border-l-purple-500"
                  >
                    <Statistic
                      title="Tax Amount"
                      value={sale?.orderTaxAmount}
                      precision={2}
                      valueStyle={{ color: "#722ed1", fontSize: "18px" }}
                      prefix="$"
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Card
                    size="small"
                    className="text-center border-l-4 border-l-red-500"
                  >
                    <Statistic
                      title="Discount"
                      value={sale?.discountAmount}
                      precision={2}
                      valueStyle={{ color: "#cf1322", fontSize: "18px" }}
                      prefix="$"
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Card
                    size="small"
                    className="text-center border-l-4 border-l-cyan-500"
                  >
                    <Statistic
                      title="Shipping"
                      value={detailsData?.shippingCharge}
                      precision={2}
                      valueStyle={{ color: "#08979c", fontSize: "18px" }}
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
                      value={detailsData?.totalAmount}
                      precision={2}
                      valueStyle={{
                        color: "#005555",
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
                    className="text-center border-l-4 border-l-orange-500"
                  >
                    <Statistic
                      title="Returned Amount"
                      value={totalReturnedAmount}
                      precision={2}
                      valueStyle={{
                        color: "#fa8c16",
                        fontSize: "18px",
                        fontWeight: "bold",
                      }}
                      prefix="$"
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Card
                    size="small"
                    className="text-center border-l-4 border-l-cyan-500"
                  >
                    <Statistic
                      title="Refunded Amount"
                      value={refundedAmount}
                      precision={2}
                      valueStyle={{
                        color: "#08979c",
                        fontSize: "18px",
                        fontWeight: "bold",
                      }}
                      prefix="$"
                    />
                  </Card>
                </Col>
              </Row>
            </div>

            <Divider />

            {/* Payment Information */}
            <div className="mb-6">
              <Title level={4} className="!mb-4 flex items-center">
                <DollarOutlined className="mr-2 text-[#005555]" />
                Payment Information
              </Title>

              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Card
                    size="small"
                    className="text-center border-l-4 border-l-green-500"
                  >
                    <Statistic
                      title="Amount Paid"
                      value={detailsData?.amountPaid}
                      precision={2}
                      valueStyle={{ color: "#3f8600", fontSize: "18px" }}
                      prefix="$"
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12}>
                  <Card
                    size="small"
                    className="text-center border-l-4 border-l-red-500"
                  >
                    <Statistic
                      title="Balance Due"
                      value={detailsData?.balanceDue}
                      precision={2}
                      valueStyle={{ color: "#cf1322", fontSize: "18px" }}
                      prefix="$"
                    />
                  </Card>
                </Col>
              </Row>
            </div>
            <Divider />

            {saleReturns.length > 0 && (
              <>
                <div className="mb-6">
                  <Title level={4} className="!mb-4 flex items-center">
                    <InfoCircleOutlined className="mr-2 text-[#005555]" />
                    Return History
                  </Title>

                  <Table
                    dataSource={saleReturns}
                    pagination={false}
                    rowKey="id"
                    size="small"
                    scroll={{ x: 800 }}
                    columns={[
                      {
                        title: "Return Ref",
                        dataIndex: "referenceNo",
                        key: "referenceNo",
                        render: (value) => value || "N/A",
                      },
                      {
                        title: "Date",
                        dataIndex: "returnDate",
                        key: "returnDate",
                        render: (value) =>
                          value ? dayjs(value).format("DD MMM YYYY") : "N/A",
                      },
                      {
                        title: "Reason",
                        dataIndex: "returnReason",
                        key: "returnReason",
                        render: (value) => (
                          <Tag color="purple">
                            {(value || "").replace(/_/g, " ").toUpperCase()}
                          </Tag>
                        ),
                      },
                      {
                        title: "Items",
                        key: "items",
                        render: (_, record) =>
                          record.returnItems?.reduce(
                            (sum, item) => sum + Number(item.quantity || 0),
                            0
                          ) || 0,
                      },
                      {
                        title: "Return Amount",
                        dataIndex: "totalReturnAmount",
                        key: "totalReturnAmount",
                        render: (value) => `$${Number(value || 0).toFixed(2)}`,
                      },
                      {
                        title: "Refund",
                        dataIndex: "refundAmount",
                        key: "refundAmount",
                        render: (value) => `$${Number(value || 0).toFixed(2)}`,
                      },
                      {
                        title: "Status",
                        dataIndex: "refundStatus",
                        key: "refundStatus",
                        render: (value) => (
                          <Tag
                            color={
                              value === "approved"
                                ? "orange"
                                : value === "refunded"
                                ? "green"
                                : value === "rejected"
                                ? "red"
                                : "blue"
                            }
                          >
                            {(value || "pending").toUpperCase()}
                          </Tag>
                        ),
                      },
                    ]}
                  />
                </div>

                <Divider />
              </>
            )}

            {/* Sales Metadata */}
            <div className="mb-6">
              <Title level={4} className="!mb-4 flex items-center">
                <InfoCircleOutlined className="mr-2 text-[#005555]" />
                Sales Information
              </Title>

              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Card size="small" className="text-center">
                    <div className="text-sm text-gray-500 mb-1">
                      Reference No.
                    </div>
                    <div className="font-semibold text-lg text-[#005555]">
                      {sale?.referenceNo}
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Card size="small" className="text-center">
                    <div className="text-sm text-gray-500 mb-1">
                      Total Items
                    </div>
                    <div className="font-semibold text-lg text-[#005555]">
                      {sale?.totalItems}
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Card size="small" className="text-center">
                    <div className="text-sm text-gray-500 mb-1">
                      Sale Status
                    </div>
                    <Tag
                      color={getStatusColor(sale?.status ?? "")}
                      className="text-sm font-medium px-3 py-1"
                    >
                      {getStatusText(sale?.status ?? "")}
                    </Tag>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Card size="small" className="text-center">
                    <div className="text-sm text-gray-500 mb-1">Cashier</div>
                    <div className="font-semibold text-lg text-[#005555]">
                      {sale?.meta?.cashier || "—"}
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Card size="small" className="text-center">
                    <div className="text-sm text-gray-500 mb-1">Channel</div>
                    <div className="font-semibold text-lg text-[#005555]">
                      {sale?.meta?.channel || "—"}
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Card size="small" className="text-center">
                    <div className="text-sm text-gray-500 mb-1">Sale Date</div>
                    <div className="font-semibold text-[15px] text-[#005555]">
                      {formatDateTime(sale?.saleDate)}
                    </div>
                  </Card>
                </Col>
              </Row>
            </div>
          </Card>
        </Col>

        {/* Sidebar Information */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" className="w-full space-y-4">
            {/* Customer Information */}
            <Card>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <UserOutlined className="text-xl text-blue-600" />
                </div>
                <div>
                  <Title level={4} className="!mb-1">
                    Customer Details
                  </Title>
                  <Text className="text-gray-600 text-sm">
                    Customer information
                  </Text>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Avatar
                      size={40}
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                        customerData?.name ?? ""
                      )}`}
                    />
                    <div className="flex flex-col gap-1">
                      <h2 className="text-base font-semibold !m-0">
                        {customerData?.name}
                      </h2>
                      <Tag color="blue" className="text-xs w-max">
                        {getStatusText(customerData?.status ?? "")}
                      </Tag>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <MailOutlined className="text-[#005555] text-lg" />
                  <div className="flex-1">
                    <Text className="text-gray-500 text-xs">Email Address</Text>
                    <div className="mt-1">
                      <Text className="font-medium text-gray-900">
                        {customerData?.email || "—"}
                      </Text>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <PhoneOutlined className="text-[#005555] text-lg" />
                  <div className="flex-1">
                    <Text className="text-gray-500 text-xs">Phone Number</Text>
                    <div className="mt-1">
                      <Text className="font-medium text-gray-900">
                        {customerData?.phone || "—"}
                      </Text>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <EnvironmentOutlined className="text-[#005555] text-lg mt-1" />
                  <div className="flex-1">
                    <Text className="text-gray-500 text-xs">Address</Text>
                    <div className="mt-1">
                      <Text className="font-medium text-gray-900">
                        {customerData?.address || "—"}
                      </Text>
                      {customerData?.city && (
                        <>
                          <br />
                          <Text className="text-gray-600 text-sm">
                            {customerData.city}, {customerData.state}{" "}
                            {customerData.postalCode}
                          </Text>
                        </>
                      )}
                      {customerData?.country && (
                        <>
                          <br />
                          <Text className="text-gray-600 text-sm">
                            {customerData.country}
                          </Text>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <GlobalOutlined className="text-[#005555] text-lg" />
                  <div className="flex-1">
                    <Text className="text-gray-500 text-xs">
                      Customer Since
                    </Text>
                    <div className="mt-1">
                      <Text className="font-medium text-gray-900">
                        {formatDate(customerData?.createdAt)}
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Product Allocations */}
            <Card>
              {/* Product Allocations */}
              {sale?.items?.some((item) => item.allocations?.length > 0) && (
                <div className="mb-6">
                  <Title level={4} className="!mb-4 flex items-center">
                    <InfoCircleOutlined className="mr-2 text-[#005555]" />
                    Product Allocations
                  </Title>

                  <div className="space-y-4">
                    {sale.items.map(
                      (item) =>
                        item.allocations?.length > 0 && (
                          <Card
                            key={item.id}
                            size="small"
                            className="bg-gray-50"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="font-medium text-gray-900">
                                {item.product?.name}
                              </div>
                              <Badge
                                count={`${item.allocations.reduce(
                                  (sum, alloc) => sum + alloc.qty,
                                  0
                                )} units`}
                                style={{ backgroundColor: "#005555" }}
                              />
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                              {item.allocations.map((allocation, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-2 bg-white rounded border"
                                >
                                  <div>
                                    <div className="text-sm font-medium">
                                      Qty: {allocation.qty}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      Expires:{" "}
                                      {dayjs(allocation.expiryDate).format(
                                        "MMM DD, YYYY"
                                      )}
                                    </div>
                                  </div>
                                  <Tag color="blue" className="text-xs">
                                    {dayjs(allocation.expiryDate).diff(
                                      dayjs(),
                                      "days"
                                    ) > 0
                                      ? `in ${dayjs(allocation.expiryDate).diff(
                                          dayjs(),
                                          "days"
                                        )} days`
                                      : `${Math.abs(
                                          dayjs(allocation.expiryDate).diff(
                                            dayjs(),
                                            "days"
                                          )
                                        )} days ago`}
                                  </Tag>
                                </div>
                              ))}
                            </div>
                          </Card>
                        )
                    )}
                  </div>
                </div>
              )}
            </Card>

            {/* Timeline Information */}
            <Card>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CalendarOutlined className="text-xl text-green-600" />
                </div>
                <div>
                  <Title level={4} className="!mb-1">
                    Timeline
                  </Title>
                  <Text className="text-gray-600 text-sm">Important dates</Text>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Text className="text-gray-500 text-sm">Created</Text>
                  <Text className="font-medium text-sm">
                    {formatDate(detailsData?.invoiceDate)}
                  </Text>
                </div>
                <div className="flex justify-between items-center">
                  <Text className="text-gray-500 text-sm">Due Date</Text>
                  <Text className="font-medium text-sm">
                    {formatDate(detailsData?.dueDate)}
                  </Text>
                </div>
                <div className="flex justify-between items-center">
                  <Text className="text-gray-500 text-sm">Status</Text>
                  <Tag
                    color={getStatusColor(detailsData?.status ?? "")}
                    className="text-xs"
                  >
                    {getStatusText(detailsData?.status ?? "")}
                  </Tag>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card>
              <Title level={4} className="!mb-4">
                Quick Actions
              </Title>

              <Space direction="vertical" className="w-full space-y-2">
                <Button
                  type="primary"
                  block
                  icon={<DownloadOutlined />}
                  className="btn hover:!text-[#69feb0]"
                  onClick={handleDownloadPDF}
                >
                  Download Invoice
                </Button>
                <Button
                  block
                  icon={<PrinterOutlined />}
                  className="!border-[#005555] !text-[#005555] hover:!bg-[#005555] hover:!text-white"
                  onClick={handlePrint}
                >
                  Print Invoice
                </Button>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>
      {/* Notes Section */}
      {sale?.notes && (
        <div className="space-x-3 p-3 bg-white rounded-lg w-full mt-6">
          <Title level={4} className="!mb-3">
            Notes
          </Title>
          <Card className="bg-gray-50 border-0 ">
            <Paragraph className="!mb-0 text-gray-700">{sale.notes}</Paragraph>
          </Card>
        </div>
      )}

      <Modal
        title="Create Sales Return"
        open={isReturnModalOpen}
        onCancel={() => {
          setIsReturnModalOpen(false);
          setReturnQuantities({});
          returnForm.resetFields();
        }}
        onOk={() => returnForm.submit()}
        confirmLoading={creatingReturn}
        width={900}
      >
        <Form form={returnForm} layout="vertical" onFinish={handleCreateReturn}>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Return Date"
                name="returnDate"
                rules={[{ required: true, message: "Return date is required" }]}
              >
                <DatePicker className="!w-full" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Reason"
                name="returnReason"
                rules={[{ required: true, message: "Reason is required" }]}
              >
                <Select>
                  <Select.Option value="customer_request">Customer Request</Select.Option>
                  <Select.Option value="wrong_item">Wrong Item</Select.Option>
                  <Select.Option value="defective">Defective</Select.Option>
                  <Select.Option value="quality_issue">Quality Issue</Select.Option>
                  <Select.Option value="expired">Expired</Select.Option>
                  <Select.Option value="other">Other</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Restocking"
                name="restockingDisposition"
                rules={[{ required: true, message: "Restocking disposition is required" }]}
              >
                <Select>
                  <Select.Option value="restock">Restock</Select.Option>
                  <Select.Option value="scrap">Scrap</Select.Option>
                  <Select.Option value="donate">Donate</Select.Option>
                  <Select.Option value="pending">Pending</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Table
            dataSource={returnableItems}
            pagination={false}
            rowKey="id"
            size="small"
            scroll={{ x: 800 }}
            columns={[
              {
                title: "Product",
                key: "product",
                render: (_, record) => record.product?.name || `Product #${record.productId}`,
              },
              {
                title: "Sold Qty",
                dataIndex: "quantity",
                key: "quantity",
                render: (value) => Number(value || 0),
              },
              {
                title: "Already Returned",
                dataIndex: "returnedQty",
                key: "returnedQty",
              },
              {
                title: "Available",
                dataIndex: "availableQty",
                key: "availableQty",
              },
              {
                title: "Unit Price",
                dataIndex: "unitPrice",
                key: "unitPrice",
                render: (value) => `$${Number(value || 0).toFixed(2)}`,
              },
              {
                title: "Return Qty",
                key: "returnQty",
                render: (_, record) => (
                  <InputNumber
                    min={0}
                    max={record.availableQty}
                    value={returnQuantities[record.id] || 0}
                    disabled={record.availableQty <= 0}
                    onChange={(value) =>
                      setReturnQuantities((prev) => ({
                        ...prev,
                        [record.id]: Number(value || 0),
                      }))
                    }
                  />
                ),
              },
            ]}
          />

          <Form.Item label="Notes" name="notes" className="!mt-4">
            <Input.TextArea rows={3} placeholder="Optional note for this return" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
