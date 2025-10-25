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

export default function PurchaseForm() {
    const [form] = Form.useForm();
    const { id } = useParams();
    const navigate = useNavigate();
    const isUpdate = Boolean(id);

    const { createPurchase } = useCreatePurchase();
    const { updatePurchase } = useUpdatePurchase();
    const { purchase } = usePurchase(id);

    const [loading, setLoading] = useState(false);
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
                        label="Unit Price"
                        name="unitPrice"
                        type="number"
                        placeholder="Enter purchase price per unit"
                        rules={[{ required: true, message: "Unit price is required" }]}
                    />

                    <CustomInput
                        label="Selling Price"
                        name="sellingPrice"
                        type="number"
                        placeholder="Enter selling price per unit"
                        rules={[
                            { required: true, message: "Selling price is required" },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    const unitPrice = getFieldValue("unitPrice");
                                    if (!value || !unitPrice || Number(value) >= Number(unitPrice)) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(
                                        new Error("Selling price must not be less than unit price!")
                                    );
                                },
                            }),
                        ]}
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
                            { label: "Ordered", value: "ordered" },
                            { label: "Received", value: "received" },
                            { label: "Partial", value: "partial" },
                            { label: "Draft", value: "draft" },
                            { label: "Cancelled", value: "cancelled" },
                        ]}
                    />

                    <CustomInput
                        label="Total Items"
                        name="totalItems"
                        type="number"
                        placeholder="Enter total items"
                        rules={[{ required: true, message: "Total items is required" }]}
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
                    />

                    <CustomInput
                        label="Order Tax (%)"
                        name="orderTaxPercent"
                        type="number"
                        placeholder="Enter order tax %"
                    />

                    <CustomInput
                        label="Order Tax Amount"
                        name="orderTaxAmount"
                        type="number"
                        placeholder="Enter order tax amount"
                    />

                    <CustomInput
                        label="Shipping Charge"
                        name="shippingCharge"
                        type="number"
                        placeholder="Enter shipping charge"
                    />

                    <CustomInput
                        label="Net Total Amount"
                        name="netTotalAmount"
                        type="number"
                        placeholder="Enter net total amount"
                    />

                    <CustomInput
                        label="Total Amount"
                        name="totalAmount"
                        type="number"
                        placeholder="Enter total amount"
                    />

                    <CustomInput
                        label="Amount Paid"
                        name="amountPaid"
                        type="number"
                        placeholder="Enter amount paid"
                    />

                    <CustomInput
                        label="Warranty Value"
                        name="warrantyValue"
                        type="number"
                        placeholder="Enter warranty value"
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
                    loading={loading}
                    htmlType="submit"
                    className="btn hover:!text-[#69feb0] !mt-5 !px-6"
                >
                    {isUpdate ? "Update Purchase" : "Add Purchase"}
                </Button>
            </Form>
        </Card>
    );
}