import { useInvoices } from "@/hooks/admin/invoice";
import { useParams, Link } from "react-router-dom";
import { Card, Button, Tag, Divider, Typography, Row, Col, Space } from "antd";
import { ArrowLeftOutlined, PrinterOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { DashboardTitle } from "@/components/re-useable/dashboard-titile";
import { TInvoice } from "@/interface/common";

export default function ViewInvoice() {
  const { invoices, loading } = useInvoices();
  const { id } = useParams();

  if (loading) {
    return <div className="text-2xl md:text-4xl ">Loading...</div>;
  }

  const invoice: Partial<TInvoice> =
    invoices?.find((inv) => String(inv?.id) === id) || {};

  // console.log("invoice", invoices);

  const formatDate = (date?: string | null) =>
    date ? dayjs(date).format("DD MMM YYYY") : "—";

  const money = (value?: string | number | null) => {
    if (value === null || value === undefined) return "0.00";
    const num = typeof value === "string" ? Number(value) : value;
    if (Number.isNaN(num)) return String(value);
    return num.toFixed(2);
  };

  const statusColor = (status?: string) => {
    if (!status) return "default" as const;
    if (status === "paid") return "green" as const;
    if (status === "overdue") return "red" as const;
    return "blue" as const; // issued or others
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <DashboardTitle
            title={`Invoice ${invoice?.invoiceNo ?? ""}`}
            description={`Created on ${formatDate(invoice?.invoiceDate ?? "")}`}
          />
        </div>
        <Space wrap>
          <Link to="/admin/invoice/all">
            <Button className="outlet-btn" icon={<ArrowLeftOutlined />}>
              Back
            </Button>
          </Link>
          <Button
            className="btn hover:!text-[#69feb0]"
            icon={<PrinterOutlined />}
            onClick={handlePrint}
          >
            Print
          </Button>
        </Space>
      </div>

      <Card
        id="print-section"
        className="print:shadow-none print:border-0 max-w-3xl !mx-auto"
      >
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded bg-blue-500 text-white flex items-center justify-center text-xl font-bold">
              POS
            </div>
          </div>

          <div className="text-right ml-auto">
            <Typography.Title level={3} className="!mb-2">
              Invoice
            </Typography.Title>
            <div className="text-xs text-gray-500">INVOICE NO.</div>
            <div className="font-medium">{invoice.invoiceNo}</div>
            <div className="mt-3 text-xs text-gray-500">INVOICE DATE</div>
            <div className="font-medium">{formatDate(invoice.invoiceDate)}</div>
          </div>
        </div>

        <Divider className="!my-6" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="text-xs text-gray-500">RECIPIENT</div>
            <div className="font-medium mt-1">
              Customer #{invoice.customerId}
            </div>
            <div className="text-gray-500 text-xs">Address not provided</div>
            <div className="text-gray-500 text-xs">Phone not provided</div>
            <div className="text-gray-500 text-xs">Email not provided</div>
          </div>
          <div className="md:text-right">
            <div className="text-xs text-gray-500">CONTACT</div>
            <div className="text-xs text-gray-500 mt-1">
              support@yourcompany.com
            </div>
            <div className="text-xs text-gray-500">+1 (555) 555-5555</div>
          </div>
        </div>

        <Divider className="!my-6" />

        <div className="overflow-y-auto rounded border border-gray-200">
          <div className="grid grid-cols-12 bg-gray-50 text-[11px] text-gray-500 py-2 px-3">
            <div className="col-span-6">DESCRIPTION</div>
            <div className="col-span-2 text-center">QTY</div>
            <div className="col-span-2 text-center">RATE</div>
            <div className="col-span-2 text-right">AMOUNT</div>
          </div>
          <div className="grid grid-cols-12 items-center py-3 px-3 border-t border-t-gray-200 space-x-4">
            <div className="col-span-6">Sale Reference #{invoice.saleId}</div>
            <div className="col-span-2 text-center">1</div>
            <div className="col-span-2 text-center">
              {money(invoice.subTotal)}
            </div>
            <div className="col-span-2 text-right">
              {money(invoice.subTotal)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="text-sm">
            <div className="inline-flex items-center gap-2">
              <span className="text-gray-500">Status:</span>
              <Tag color={statusColor(invoice.status)}>
                {invoice.status?.toUpperCase()}
              </Tag>
            </div>
            {invoice?.notes ? (
              <div className="mt-3">
                <div className="text-xs text-gray-500">NOTES</div>
                <div className="text-sm">{invoice.notes}</div>
              </div>
            ) : null}
          </div>
          <div>
            <div className="w-full md:w-80 ml-auto">
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-500">SUBTOTAL</span>
                <span>{money(invoice.subTotal)}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-500">DISCOUNT</span>
                <span>- {money(invoice.discountAmount)}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-500">ORDER TAX</span>
                <span>{money(invoice.orderTaxAmount)}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-500">SHIPPING</span>
                <span>{money(invoice.shippingCharge)}</span>
              </div>
              <Divider className="!my-2" />
              <div className="flex items-center justify-between py-1 font-medium">
                <span>TOTAL</span>
                <span>{money(invoice.totalAmount)}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-500">PAID</span>
                <span>{money(invoice.amountPaid)}</span>
              </div>
              <div className="flex items-center justify-between py-1 text-blue-600 font-semibold">
                <span>BALANCE DUE</span>
                <span>{money(invoice.balanceDue)}</span>
              </div>
            </div>
          </div>
        </div>

        <Divider className="!my-6" />

        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Typography.Text type="secondary">Invoice ID</Typography.Text>
            <div className="font-medium">#{invoice.id}</div>
          </Col>
          <Col xs={24} md={8}>
            <Typography.Text type="secondary">Sale ID</Typography.Text>
            <div className="font-medium">{invoice.saleId}</div>
          </Col>
          <Col xs={24} md={8}>
            <Typography.Text type="secondary">Customer ID</Typography.Text>
            <div className="font-medium">{invoice.customerId}</div>
          </Col>
        </Row>

        <Divider className="!my-6" />
        <div className="text-center text-xs text-gray-500">
          Transfer the amount to the business account below. Please include
          invoice number on your payment.
          <div className="mt-2">
            <span className="font-medium">BANK:</span> FTSBUS33 &nbsp;&nbsp;{" "}
            <span className="font-medium">IBAN:</span> GB82-1111-2222-3333
          </div>
        </div>
      </Card>
    </div>
  );
}
