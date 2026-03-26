import { Form, message, Button, Card, Table, InputNumber, Select, DatePicker, Tag } from "antd";
import { FaSave, FaPlus, FaTrash } from "react-icons/fa";
import dayjs from "dayjs";
import {
  useCreatePurchase,
  useUpdatePurchase,
  usePurchase,
} from "@/hooks/admin/purchase";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useProducts, useSuppliers } from "@/hooks/common";
import {
  CustomDate,
  CustomInput,
  CustomNumberInput,
  CustomSelect,
  CustomTextArea,
} from "@/components/form";
import { add, subtract, multiply, percentage, max, roundTo } from "@/utils/math-utils";
import { useBasePath } from "@/hooks/common/use-base-path";

type PurchaseLineItem = {
  key: number;
  productId: number | null;
  quantity: number;
  unitPrice: number;
  sellingPrice: number;
  lineTotal: number;
  expiryDate: dayjs.Dayjs | null;
  batchNo: string;
};

export default function PurchaseForm() {
  const [form] = Form.useForm();
  const { id } = useParams();
  const navigate = useNavigate();
  const basePath = useBasePath();
  const isUpdate = Boolean(id);

  const { createPurchase } = useCreatePurchase();
  const { updatePurchase } = useUpdatePurchase();
  const { purchase } = usePurchase(id);

  const [loading, setLoading] = useState(false);
  const { data: suppliersOption } = useSuppliers();
  const { data: productsOption } = useProducts();

  const [lineItems, setLineItems] = useState<PurchaseLineItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  useEffect(() => {
    if (isUpdate && purchase) {
      try {
        form.setFieldsValue({
          ...purchase,
          purchaseDate: purchase.purchaseDate ? dayjs(purchase.purchaseDate) : null,
        });

        if (purchase.items && purchase.items.length > 0) {
          setLineItems(
            purchase.items.map((item: any, idx: number) => ({
              key: idx,
              productId: item.productId,
              quantity: Number(item.quantity || 0),
              unitPrice: Number(item.unitPrice || 0),
              sellingPrice: Number(item.product?.sellingPrice ?? item.product?.price ?? 0),
              lineTotal: Number(item.lineTotal || 0),
              expiryDate: item.expiryDate ? dayjs(item.expiryDate) : null,
              batchNo: item.batchNo || "",
            }))
          );
        }
      } catch (err) {
        console.error(err);
        message.error("Failed to set purchase data.");
      }
    }
  }, [purchase, isUpdate, form]);

  useEffect(() => {
    calculateTotals();
  }, [lineItems]);

  const toNumber = (value: any, fallback = 0) => {
    if (value === null || value === undefined || value === "") return fallback;
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  };

  const calculateTotals = () => {
    const sub = lineItems.reduce((sum, item) => add(sum, item.lineTotal || 0), 0);
    setSubtotal(sub);

    const formValues = form.getFieldsValue();
    const discountType = formValues.discountType || "none";
    const discountAmount = formValues.discountAmount || 0;
    const orderTaxPercent = formValues.orderTaxPercent || 0;
    const shippingCharge = formValues.shippingCharge || 0;

    let orderDiscount = 0;
    if (discountType === "percent") {
      orderDiscount = percentage(sub, discountAmount);
    } else if (discountType === "fixed") {
      orderDiscount = Math.min(discountAmount, sub);
    }

    const afterDiscount = max(subtract(sub, orderDiscount), 0);
    const taxAmount = percentage(afterDiscount, orderTaxPercent);
    const total = roundTo(add(add(afterDiscount, taxAmount), shippingCharge), 2);
    setGrandTotal(total);

    form.setFieldsValue({
      netTotalAmount: roundTo(sub, 2),
      orderTaxAmount: roundTo(taxAmount, 2),
      totalAmount: total,
    });
  };

  const handleFieldChange = (changedValues: any) => {
    if (changedValues.discountType === "none") {
      form.setFieldsValue({ discountAmount: 0 });
    }

    if (
      changedValues.discountType !== undefined ||
      changedValues.discountAmount !== undefined ||
      changedValues.orderTaxPercent !== undefined ||
      changedValues.shippingCharge !== undefined
    ) {
      calculateTotals();
    }
  };

  const addLineItem = () => {
    setLineItems((current) => [
      ...current,
      {
        key: Date.now(),
        productId: null,
        quantity: 1,
        unitPrice: 0,
        sellingPrice: 0,
        lineTotal: 0,
        expiryDate: null,
        batchNo: "",
      },
    ]);
  };

  const removeLineItem = (key: number) => {
    setLineItems((current) => current.filter((item) => item.key !== key));
  };

  const updateLineItem = (key: number, field: keyof PurchaseLineItem, value: any) => {
    setLineItems((current) =>
      current.map((item) => {
        if (item.key !== key) return item;

        const nextItem = { ...item, [field]: value };
        if (field === "quantity" || field === "unitPrice") {
          const qty = field === "quantity" ? Number(value || 0) : Number(nextItem.quantity || 0);
          const price = field === "unitPrice" ? Number(value || 0) : Number(nextItem.unitPrice || 0);
          nextItem.lineTotal = roundTo(multiply(qty, price), 2);
        }

        return nextItem;
      })
    );
  };

  const handleFinish = async (values: any) => {
    setLoading(true);

    if (lineItems.length === 0) {
      message.error("Please add at least one line item");
      setLoading(false);
      return;
    }

    for (const item of lineItems) {
      if (!item.productId) {
        message.error("Please select a product for all line items");
        setLoading(false);
        return;
      }
      if (!item.quantity || item.quantity <= 0) {
        message.error("Quantity must be greater than 0");
        setLoading(false);
        return;
      }
      if (item.unitPrice < 0) {
        message.error("Buying price cannot be negative");
        setLoading(false);
        return;
      }
      if (item.sellingPrice === null || item.sellingPrice === undefined || item.sellingPrice === 0) {
        message.error("Selling price is required for all line items");
        setLoading(false);
        return;
      }
      if (Number(item.sellingPrice) <= Number(item.unitPrice)) {
        message.error("Selling price must be greater than buying price for all line items");
        setLoading(false);
        return;
      }
    }

    const formattedValues = {
      ...values,
      purchaseDate: values.purchaseDate ? dayjs(values.purchaseDate).format("YYYY-MM-DD") : null,
      discountAmount: values.discountType === "none" ? 0 : toNumber(values.discountAmount, 0),
      orderTaxPercent: toNumber(values.orderTaxPercent, 0),
      orderTaxAmount: toNumber(values.orderTaxAmount, 0),
      shippingCharge: toNumber(values.shippingCharge, 0),
      netTotalAmount: toNumber(values.netTotalAmount, 0),
      totalAmount: toNumber(values.totalAmount, 0),
      amountPaid: toNumber(values.amountPaid, 0),
      payTermValue:
        values.payTermValue === null || values.payTermValue === undefined || values.payTermValue === ""
          ? null
          : toNumber(values.payTermValue, 0),
      items: lineItems.map((item) => ({
        productId: item.productId,
        quantity: toNumber(item.quantity, 0),
        unitPrice: toNumber(item.unitPrice, 0),
        sellingPrice: toNumber(item.sellingPrice, 0),
        lineTotal: toNumber(item.lineTotal, 0),
        expiryDate: item.expiryDate ? dayjs(item.expiryDate).format("YYYY-MM-DD") : null,
        batchNo: item.batchNo || null,
      })),
    };

    delete formattedValues.productId;
    delete formattedValues.expiryDate;

    try {
      if (isUpdate) {
        await updatePurchase(id, formattedValues);
        message.success("Purchase updated successfully!");
        navigate(`${basePath}/purchase/all`);
      } else {
        await createPurchase(formattedValues);
        message.success("Purchase created successfully!");
        form.resetFields();
        setLineItems([]);
        navigate(`${basePath}/purchase/all`);
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        `Failed to ${isUpdate ? "update" : "create"} purchase. Please try again.`;
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const lineItemColumns = [
    {
      title: "Product",
      dataIndex: "productId",
      key: "productId",
      width: 260,
      render: (value: number | null, record: PurchaseLineItem) => (
        <Select
          style={{ width: "100%" }}
          placeholder="Select product"
          value={value ?? undefined}
          onChange={(val) => updateLineItem(record.key, "productId", val)}
          options={productsOption}
          showSearch
          allowClear
          optionFilterProp="label"
        />
      ),
    },
    {
      title: "Qty",
      dataIndex: "quantity",
      key: "quantity",
      width: 110,
      render: (value: number, record: PurchaseLineItem) => (
        <InputNumber
          style={{ width: "100%" }}
          min={1}
          value={value}
          onChange={(val) => updateLineItem(record.key, "quantity", val)}
          placeholder="Qty"
        />
      ),
    },
    {
      title: "Buying Price",
      dataIndex: "unitPrice",
      key: "unitPrice",
      width: 150,
      render: (value: number, record: PurchaseLineItem) => (
        <InputNumber
          style={{ width: "100%" }}
          min={0}
          step={0.01}
          value={value}
          onChange={(val) => updateLineItem(record.key, "unitPrice", val)}
          placeholder="0.00"
          addonBefore="BDT"
        />
      ),
    },
    {
      title: "Selling Price",
      dataIndex: "sellingPrice",
      key: "sellingPrice",
      width: 150,
      render: (value: number, record: PurchaseLineItem) => (
        <InputNumber
          style={{ width: "100%" }}
          min={0}
          step={0.01}
          value={value}
          onChange={(val) => updateLineItem(record.key, "sellingPrice", val)}
          placeholder="0.00"
          addonBefore="BDT"
        />
      ),
    },
    {
      title: "Line Total",
      dataIndex: "lineTotal",
      key: "lineTotal",
      width: 140,
      render: (value: number) => (
        <div className="text-right font-semibold text-[#005555]">
          BDT {roundTo(value || 0, 2).toFixed(2)}
        </div>
      ),
    },
    {
      title: "Batch No",
      dataIndex: "batchNo",
      key: "batchNo",
      width: 150,
      render: (value: string, record: PurchaseLineItem) => (
        <input
          type="text"
          className="ant-input"
          value={value}
          onChange={(e) => updateLineItem(record.key, "batchNo", e.target.value)}
          placeholder="Batch code"
        />
      ),
    },
    {
      title: "Expiry Date",
      dataIndex: "expiryDate",
      key: "expiryDate",
      width: 160,
      render: (value: dayjs.Dayjs | null, record: PurchaseLineItem) => (
        <DatePicker
          style={{ width: "100%" }}
          value={value}
          onChange={(val) => updateLineItem(record.key, "expiryDate", val)}
          format="YYYY-MM-DD"
          placeholder="Select date"
        />
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 90,
      render: (_: unknown, record: PurchaseLineItem) => (
        <Button type="text" danger icon={<FaTrash />} onClick={() => removeLineItem(record.key)} />
      ),
    },
  ];

  return (
    <Card>
      <h2 className="text-xl font-semibold !mb-6">
        {isUpdate ? "Update Purchase" : "Add Purchase"}
      </h2>
      <Form
        layout="vertical"
        form={form}
        onFinish={handleFinish}
        onValuesChange={handleFieldChange}
        initialValues={{
          status: "po",
          discountType: "none",
          discountAmount: 0,
          orderTaxPercent: 0,
          shippingCharge: 0,
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
          <CustomSelect
            label="Supplier"
            name="supplierId"
            placeholder="Select Supplier"
            rules={[{ required: true, message: "Supplier is required" }]}
            mode="single"
            options={suppliersOption}
          />

          <CustomInput
            label="Reference No"
            name="referenceNo"
            placeholder="Enter reference number"
          />

          <CustomDate
            label="Purchase Date"
            name="purchaseDate"
            placeholder="Select purchase date"
            rules={[{ required: true, message: "Purchase date is required" }]}
          />

          <CustomSelect
            label="Status"
            name="status"
            placeholder="Select status"
            rules={[{ required: true, message: "Status is required" }]}
            mode="single"
            options={[
              { label: "Draft", value: "draft" },
              { label: "Purchase Order", value: "po" },
              { label: "Ordered", value: "ordered" },
              { label: "Purchase", value: "purchase" },
              { label: "Received", value: "received" },
            ]}
          />

          <CustomInput
            label="Supplier Address"
            name="supplierAddress"
            placeholder="Enter supplier address"
          />

          <CustomSelect
            label="Pay Term"
            name="payTermUnit"
            placeholder="Select pay term unit"
            mode="single"
            options={[
              { label: "Days", value: "days" },
              { label: "Months", value: "months" },
            ]}
          />
        </div>

        <div className="!mt-6">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 md:p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Line Items</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Add purchase rows with buying price, selling price, batch, and expiry information.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Tag color="blue">Items: {lineItems.length}</Tag>
                <Tag color="green">Subtotal: BDT {roundTo(subtotal, 2).toFixed(2)}</Tag>
                <Button type="dashed" onClick={addLineItem} icon={<FaPlus />} className="!flex !items-center">
                  Add Item
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <Table
              dataSource={lineItems}
              pagination={false}
              size="middle"
              bordered
              locale={{ emptyText: "No items added. Click 'Add Item' to start." }}
              columns={lineItemColumns}
              rowKey="key"
              scroll={{ x: 1200 }}
              rowClassName={() => "align-top"}
            />
          </div>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex justify-end">
              <div className="w-full md:w-1/2">
                <div className="flex justify-between mb-2">
                  <span>Subtotal:</span>
                  <span className="font-semibold">BDT {roundTo(subtotal, 2).toFixed(2)}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2">
                  <CustomSelect
                    label=""
                    name="discountType"
                    mode="single"
                    options={[
                      { label: "No Discount", value: "none" },
                      { label: "Percent", value: "percent" },
                      { label: "Fixed", value: "fixed" },
                    ]}
                  />
                  {form.getFieldValue("discountType") !== "none" && (
                    <CustomInput
                      label=""
                      name="discountAmount"
                      type="number"
                      placeholder={form.getFieldValue("discountType") === "percent" ? "%" : "BDT"}
                    />
                  )}
                </div>

                <div className="flex justify-between mb-2">
                  <span>Order Tax (%):</span>
                  <CustomNumberInput
                    label=""
                    name="orderTaxPercent"
                    min={0}
                    step={0.01}
                    placeholder="0"
                    className="!w-24"
                  />
                </div>

                <div className="flex justify-between mb-2">
                  <span>Shipping:</span>
                  <CustomNumberInput
                    label=""
                    name="shippingCharge"
                    min={0}
                    step={0.01}
                    placeholder="0"
                    className="!w-24"
                  />
                </div>

                <div className="flex justify-between mt-3 pt-3 border-t-2 border-gray-300">
                  <span className="font-bold text-lg">Grand Total:</span>
                  <span className="font-bold text-lg text-green-600">
                    BDT {roundTo(grandTotal, 2).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Form.Item name="netTotalAmount" hidden>
          <input />
        </Form.Item>
        <Form.Item name="orderTaxAmount" hidden>
          <input />
        </Form.Item>
        <Form.Item name="totalAmount" hidden>
          <input />
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 !mt-6">
          <CustomInput
            label="Amount Paid"
            name="amountPaid"
            type="number"
            placeholder="Enter amount paid"
          />

          <CustomInput
            label="Pay Term Value"
            name="payTermValue"
            placeholder="Enter pay term value"
            type="number"
          />

          <CustomTextArea
            label="Notes"
            name="notes"
            rows={3}
            placeholder="Enter notes if any"
          />

          <CustomTextArea
            label="Shipping Details"
            name="shippingDetails"
            rows={3}
            placeholder="Enter shipping details"
          />
        </div>

        <Button
          icon={<FaSave />}
          loading={loading}
          htmlType="submit"
          className="btn hover:!text-[#69feb0] !mt-5 !px-6"
          disabled={lineItems.length === 0}
        >
          {isUpdate ? "Update Purchase" : "Create Purchase"}
        </Button>
      </Form>
    </Card>
  );
}
