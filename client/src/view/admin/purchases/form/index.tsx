import { Form, message, Button, Card, Table, InputNumber, Select, DatePicker, Space } from "antd";
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
    CustomSelect,
    CustomTextArea,
} from "@/components/form";
import { validateLineTotal, validateOrderCalculation } from "@/utils/pos-calculations";
import { add, subtract, multiply, percentage, max, roundTo } from "@/utils/math-utils";
import type { TLineItem } from "@/interface/common";

export default function PurchaseForm() {
    const [form] = Form.useForm();
    const { id } = useParams();
    const navigate = useNavigate();
    const isUpdate = Boolean(id);

    const { createPurchase } = useCreatePurchase();
    const { updatePurchase } = useUpdatePurchase();
    const { purchase } = usePurchase(id);

    const [loading, setLoading] = useState(false);
    const [autoCalculating, setAutoCalculating] = useState(false);
    const { data: suppliersOption } = useSuppliers();
    const { data: productsOption } = useProducts();

    // Line items state
    const [lineItems, setLineItems] = useState<any[]>([]);
    const [subtotal, setSubtotal] = useState(0);
    const [grandTotal, setGrandTotal] = useState(0);

    useEffect(() => {
        if (isUpdate && purchase) {
            try {
                form.setFieldsValue({
                    ...purchase,
                    purchaseDate: purchase.purchaseDate
                        ? dayjs(purchase.purchaseDate)
                        : null,
                    expiryDate: purchase.expiryDate ? dayjs(purchase.expiryDate) : null,
                });
                
                // Load existing line items
                if (purchase.items && purchase.items.length > 0) {
                    setLineItems(purchase.items.map((item: any, idx: number) => ({
                        key: idx,
                        productId: item.productId,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        lineTotal: item.lineTotal,
                        expiryDate: item.expiryDate ? dayjs(item.expiryDate) : null,
                        batchNo: item.batchNo,
                    })));
                }
            } catch (err) {
                console.error(err);
                message.error("Failed to set purchase data.");
            }
        }
    }, [purchase, isUpdate, form]);

    // Recalculate totals when line items or form values change
    useEffect(() => {
        calculateTotals();
    }, [lineItems]);

    const calculateTotals = () => {
        // Calculate subtotal from line items
        const sub = lineItems.reduce((sum, item) => add(sum, item.lineTotal || 0), 0);
        setSubtotal(sub);

        const formValues = form.getFieldsValue();
        const discountType = formValues.discountType || "none";
        const discountAmount = formValues.discountAmount || 0;
        const orderTaxPercent = formValues.orderTaxPercent || 0;
        const shippingCharge = formValues.shippingCharge || 0;

        // Calculate order discount
        let orderDiscount = 0;
        if (discountType === "percent") {
            orderDiscount = percentage(sub, discountAmount);
        } else if (discountType === "fixed") {
            orderDiscount = Math.min(discountAmount, sub);
        }

        // Calculate tax on (subtotal - discount)
        const afterDiscount = max(subtract(sub, orderDiscount), 0);
        const taxAmount = percentage(afterDiscount, orderTaxPercent);

        // Calculate grand total
        const total = roundTo(add(add(afterDiscount, taxAmount), shippingCharge), 2);
        setGrandTotal(total);

        // Update form fields
        form.setFieldsValue({
            netTotalAmount: roundTo(sub, 2),
            orderTaxAmount: roundTo(taxAmount, 2),
            totalAmount: total,
            totalItems: lineItems.reduce((sum, item) => add(sum, item.quantity || 0), 0),
        });
    };

    const handleFieldChange = (changedValues: any) => {
        // Recalculate when discount, tax, or shipping changes
        if (changedValues.discountType !== undefined ||
            changedValues.discountAmount !== undefined ||
            changedValues.orderTaxPercent !== undefined ||
            changedValues.shippingCharge !== undefined) {
            calculateTotals();
        }
    };

    const addLineItem = () => {
        const newItem = {
            key: Date.now(),
            productId: null,
            quantity: 1,
            unitPrice: 0,
            lineTotal: 0,
            expiryDate: null,
            batchNo: "",
        };
        setLineItems([...lineItems, newItem]);
    };

    const removeLineItem = (key: number) => {
        setLineItems(lineItems.filter(item => item.key !== key));
    };

    const updateLineItem = (key: number, field: string, value: any) => {
        setLineItems(lineItems.map(item => {
            if (item.key === key) {
                const updated = { ...item, [field]: value };
                
                // Recalculate line total when quantity or unitPrice changes
                if (field === 'quantity' || field === 'unitPrice') {
                    const qty = field === 'quantity' ? value : updated.quantity;
                    const price = field === 'unitPrice' ? value : updated.unitPrice;
                    updated.lineTotal = roundTo(multiply(qty || 0, price || 0), 2);
                }
                
                return updated;
            }
            return item;
        }));
    };

    const handleFinish = async (values: any) => {
        setLoading(true);

        // Validate line items
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
                message.error("Unit price cannot be negative");
                setLoading(false);
                return;
            }
        }

        const formattedValues = {
            ...values,
            purchaseDate: values.purchaseDate
                ? dayjs(values.purchaseDate).format("YYYY-MM-DD")
                : null,
            items: lineItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                lineTotal: item.lineTotal,
                expiryDate: item.expiryDate
                    ? dayjs(item.expiryDate).format("YYYY-MM-DD")
                    : null,
                batchNo: item.batchNo || null,
            })),
        };

        // Remove single product field
        delete formattedValues.productId;
        delete formattedValues.expiryDate;
        try {
            if (isUpdate) {
                await updatePurchase(id, formattedValues);
                message.success("Purchase updated successfully!");
                navigate("/admin/purchase/all");
            } else {
                await createPurchase(formattedValues);
                message.success("Purchase created successfully!");
                form.resetFields();
                navigate("/admin/purchase/all");
            }
            setLoading(false);
        } catch (error) {
            setLoading(false);
            message.error(
                error?.response?.data?.message ||
                `Failed to ${
                    isUpdate ? "update" : "create"
                } purchase. Please try again.`
            );
        }
    };

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
                {/* Supplier and Basic Info */}
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

                {/* Line Items Table */}
                <div className="!mt-6">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold">Line Items</h3>
                        <Button
                            type="dashed"
                            onClick={addLineItem}
                            icon={<FaPlus />}
                            className="!flex !items-center"
                        >
                            Add Item
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        <Table
                            dataSource={lineItems}
                            pagination={false}
                            size="small"
                            locale={{ emptyText: "No items added. Click 'Add Item' to start." }}
                            columns={[
                                {
                                    title: "Product",
                                    dataIndex: "productId",
                                    key: "productId",
                                    width: "25%",
                                    render: (value, record) => (
                                        <Select
                                            style={{ width: "100%" }}
                                            placeholder="Select product"
                                            value={value}
                                            onChange={(val) => updateLineItem(record.key, "productId", val)}
                                            options={productsOption}
                                            showSearch
                                            optionFilterProp="label"
                                        />
                                    ),
                                },
                                {
                                    title: "Quantity",
                                    dataIndex: "quantity",
                                    key: "quantity",
                                    width: "12%",
                                    render: (value, record) => (
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
                                    title: "Unit Price",
                                    dataIndex: "unitPrice",
                                    key: "unitPrice",
                                    width: "15%",
                                    render: (value, record) => (
                                        <InputNumber
                                            style={{ width: "100%" }}
                                            min={0}
                                            step={0.01}
                                            value={value}
                                            onChange={(val) => updateLineItem(record.key, "unitPrice", val)}
                                            placeholder="0.00"
                                            prefix="৳"
                                        />
                                    ),
                                },
                                {
                                    title: "Line Total",
                                    dataIndex: "lineTotal",
                                    key: "lineTotal",
                                    width: "15%",
                                    render: (value) => (
                                        <span className="font-semibold">৳{roundTo(value || 0, 2).toFixed(2)}</span>
                                    ),
                                },
                                {
                                    title: "Batch No",
                                    dataIndex: "batchNo",
                                    key: "batchNo",
                                    width: "15%",
                                    render: (value, record) => (
                                        <input
                                            type="text"
                                            className="ant-input"
                                            value={value}
                                            onChange={(e) => updateLineItem(record.key, "batchNo", e.target.value)}
                                            placeholder="Batch"
                                        />
                                    ),
                                },
                                {
                                    title: "Expiry Date",
                                    dataIndex: "expiryDate",
                                    key: "expiryDate",
                                    width: "15%",
                                    render: (value, record) => (
                                        <DatePicker
                                            style={{ width: "100%" }}
                                            value={value}
                                            onChange={(val) => updateLineItem(record.key, "expiryDate", val)}
                                            format="YYYY-MM-DD"
                                        />
                                    ),
                                },
                                {
                                    title: "Action",
                                    key: "action",
                                    width: "8%",
                                    render: (_, record) => (
                                        <Button
                                            type="text"
                                            danger
                                            icon={<FaTrash />}
                                            onClick={() => removeLineItem(record.key)}
                                        />
                                    ),
                                },
                            ]}
                        />
                    </div>

                    {/* Totals Summary */}
                    <div className="mt-4 p-4 bg-gray-50 rounded">
                        <div className="flex justify-end">
                            <div className="w-full md:w-1/2">
                                <div className="flex justify-between mb-2">
                                    <span>Subtotal:</span>
                                    <span className="font-semibold">৳{roundTo(subtotal, 2).toFixed(2)}</span>
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
                                    <CustomInput
                                        label=""
                                        name="discountAmount"
                                        type="number"
                                        placeholder="0"
                                    />
                                </div>

                                <div className="flex justify-between mb-2">
                                    <span>Order Tax (%):</span>
                                    <CustomInput
                                        label=""
                                        name="orderTaxPercent"
                                        type="number"
                                        placeholder="0"
                                        className="!w-24"
                                    />
                                </div>

                                <div className="flex justify-between mb-2">
                                    <span>Shipping:</span>
                                    <CustomInput
                                        label=""
                                        name="shippingCharge"
                                        type="number"
                                        placeholder="0"
                                        className="!w-24"
                                    />
                                </div>

                                <div className="flex justify-between mt-3 pt-3 border-t-2 border-gray-300">
                                    <span className="font-bold text-lg">Grand Total:</span>
                                    <span className="font-bold text-lg text-green-600">
                                        ৳{roundTo(grandTotal, 2).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hidden fields for backend compatibility */}
                <input type="hidden" name="totalItems" />
                <input type="hidden" name="netTotalAmount" />
                <input type="hidden" name="orderTaxAmount" />
                <input type="hidden" name="totalAmount" />

                {/* Additional Fields */}
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