import { Form, message, Button, Card } from "antd";
import { FaSave } from "react-icons/fa";
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
import { validateOrderCalculation } from "@/utils/pos-calculations";
import { add, multiply, percentage, max, roundTo } from "@/utils/math-utils";

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
            } catch (err) {
                console.error(err);
                message.error("Failed to set purchase data.");
            }
        }
    }, [purchase, isUpdate, form]);

    const handleFieldChange = (changedValues: any) => {
        setAutoCalculating(true);
        setTimeout(() => {
            const formValues = form.getFieldsValue();
            const {
                discountType,
                discountAmount,
                orderTaxPercent,
                shippingCharge,
                netTotalAmount,
            } = formValues;

            if (orderTaxPercent !== undefined && netTotalAmount) {
                const taxAmount = percentage(netTotalAmount || 0, orderTaxPercent || 0);

                if (changedValues.orderTaxPercent !== undefined) {
                    form.setFieldValue("orderTaxAmount", taxAmount);
                }
            }

            if (netTotalAmount !== undefined) {
                const netTotal = netTotalAmount || 0;
                const taxAmount = formValues.orderTaxAmount || 0;
                const shipping = shippingCharge || 0;

                const totalAmount = max(add(add(netTotal, taxAmount), shipping), 0);

                if (
                    changedValues.orderTaxAmount !== undefined ||
                    changedValues.shippingCharge !== undefined
                ) {
                    form.setFieldValue("totalAmount", totalAmount);
                }
            }

            setAutoCalculating(false);
        }, 100);
    };

    const handleFinish = async (values: { purchaseDate: string | number | Date | dayjs.Dayjs | null | undefined; expiryDate: string | number | Date | dayjs.Dayjs | null | undefined; }) => {
        setLoading(true);
        const formattedValues = {
            ...values,
            purchaseDate: values.purchaseDate
                ? dayjs(values.purchaseDate).format("YYYY-MM-DD")
                : null,
            expiryDate: values.expiryDate
                ? dayjs(values.expiryDate).format("YYYY-MM-DD")
                : null,
        };
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
                initialValues={
                    isUpdate
                        ? {
                            ...purchase,
                            purchaseDate: purchase?.purchaseDate
                                ? dayjs(purchase.purchaseDate)
                                : null,
                            expiryDate: purchase?.expiryDate
                                ? dayjs(purchase.expiryDate)
                                : null,
                        }
                        : {}
                }
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                    <CustomSelect
                        label="Supplier"
                        name="supplierId"
                        placeholder="Select Supplier"
                        rules={[{ required: true, message: "Supplier is required" }]}
                        mode="single"
                        options={suppliersOption}
                    />

                    <CustomSelect
                        label="Product"
                        name="productId"
                        placeholder="Select Product"
                        rules={[{ required: true, message: "Product is required" }]}
                        mode="single"
                        options={productsOption}
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
                            { label: "Partial", value: "partial" },
                            { label: "Partial Return", value: "partial_return" },
                            { label: "Full Return", value: "full_return" },
                            { label: "Cancelled", value: "cancelled" },
                        ]}
                    />

                    <CustomInput
                        label="Total Items"
                        name="totalItems"
                        type="number"
                        placeholder="Enter total items"
                        rules={[
                            { required: true, message: "Total items is required" },
                            { pattern: /^[0-9]+$/, message: "Total items must be a positive integer" }
                        ]}
                    />

                    <CustomInput
                        label="Supplier Address"
                        name="supplierAddress"
                        placeholder="Enter supplier address"
                    />

                    <CustomInput
                        label="Pay Term Value"
                        name="payTermValue"
                        placeholder="Enter pay term value"
                        type="number"
                        rules={[{ pattern: /^[0-9]+$/, message: "Must be a positive integer" }]}
                    />

                    <CustomSelect
                        label="Pay Term Unit"
                        name="payTermUnit"
                        placeholder="Select pay term unit"
                        mode="single"
                        options={[
                            { label: "Days", value: "days" },
                            { label: "Months", value: "months" },
                        ]}
                    />

                    <CustomSelect
                        label="Discount Type"
                        name="discountType"
                        placeholder="Select discount type"
                        mode="single"
                        options={[
                            { label: "None", value: "none" },
                            { label: "Percent", value: "percent" },
                            { label: "Fixed", value: "fixed" },
                        ]}
                    />

                    <CustomInput
                        label="Discount Amount"
                        name="discountAmount"
                        type="number"
                        placeholder="Enter discount amount"
                        rules={[
                            { pattern: /^[0-9]*\.?[0-9]*$/, message: "Invalid amount format" },
                            { min: 0, message: "Discount cannot be negative" }
                        ]}
                    />

                    <CustomInput
                        label="Order Tax (%)"
                        name="orderTaxPercent"
                        type="number"
                        step="0.01"
                        placeholder="Enter order tax %"
                        rules={[
                            { pattern: /^[0-9]*\.?[0-9]*$/, message: "Invalid percentage" },
                            { min: 0, max: 100, message: "Tax must be between 0 and 100" }
                        ]}
                    />

                    <CustomInput
                        label="Order Tax Amount (Auto-calculated)"
                        name="orderTaxAmount"
                        type="number"
                        placeholder="Automatically calculated"
                        disabled
                        rules={[
                            { pattern: /^[0-9]*\.?[0-9]*$/, message: "Invalid amount format" }
                        ]}
                    />

                    <CustomInput
                        label="Shipping Charge"
                        name="shippingCharge"
                        type="number"
                        placeholder="Enter shipping charge"
                        rules={[
                            { pattern: /^[0-9]*\.?[0-9]*$/, message: "Invalid amount format" },
                            { min: 0, message: "Shipping charge cannot be negative" }
                        ]}
                    />

                    <CustomInput
                        label="Net Total Amount"
                        name="netTotalAmount"
                        type="number"
                        placeholder="Subtotal (from items)"
                        rules={[
                            { required: true, message: "Net total is required" },
                            { pattern: /^[0-9]*\.?[0-9]*$/, message: "Invalid amount format" },
                            { min: 0, message: "Amount cannot be negative" }
                        ]}
                    />

                    <CustomInput
                        label="Total Amount (Auto-calculated)"
                        name="totalAmount"
                        type="number"
                        placeholder="Automatically calculated"
                        disabled
                        rules={[
                            { pattern: /^[0-9]*\.?[0-9]*$/, message: "Invalid amount format" }
                        ]}
                    />

                    <CustomInput
                        label="Amount Paid"
                        name="amountPaid"
                        type="number"
                        placeholder="Enter amount paid"
                        rules={[
                            { pattern: /^[0-9]*\.?[0-9]*$/, message: "Invalid amount format" },
                            { min: 0, message: "Amount paid cannot be negative" }
                        ]}
                    />

                    <CustomInput
                        label="Warranty Value"
                        name="warrantyValue"
                        type="number"
                        placeholder="Enter warranty value"
                        rules={[
                            { pattern: /^[0-9]*$/, message: "Must be a positive integer" },
                            { min: 0, message: "Warranty value cannot be negative" }
                        ]}
                    />

                    <CustomSelect
                        label="Warranty Unit"
                        name="warrantyUnit"
                        placeholder="Select warranty unit"
                        mode="single"
                        options={[
                            { label: "Months", value: "months" },
                            { label: "Years", value: "years" },
                        ]}
                    />

                    <CustomDate
                        label="Expiry Date"
                        name="expiryDate"
                        placeholder="Select expiry date"
                    />

                    <CustomTextArea
                        label="Notes"
                        name="notes"
                        rows={3}
                        placeholder="Enter notes if any"
                        className="md:col-span-2"
                    />

                    <CustomTextArea
                        label="Shipping Details"
                        name="shippingDetails"
                        rows={3}
                        placeholder="Enter shipping details"
                        className="md:col-span-2"
                    />
                </div>

                <Button
                    icon={<FaSave />}
                    loading={loading || autoCalculating}
                    htmlType="submit"
                    className="btn hover:!text-[#69feb0] !mt-5 !px-6"
                >
                    {isUpdate ? "Update Purchase" : "Add Purchase"}
                </Button>
            </Form>
        </Card>
    );
}