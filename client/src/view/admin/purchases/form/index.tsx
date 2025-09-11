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
import {CustomDate, CustomInput, CustomSelect, CustomTextArea} from "@/components/form";

export default function PurchaseForm() {
  const [form] = Form.useForm();
  const { id } = useParams();
  const navigate = useNavigate();
  const isUpdate = Boolean(id);

  const { createPurchase } = useCreatePurchase();
  const { updatePurchase } = useUpdatePurchase();
  const { purchase } = usePurchase(id);

  const [loading, setLoading] = useState<boolean>(false);
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

  const handleFinish = async (values: any) => {
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
    // console.log("form value : ", formattedValues);
    try {
      if (isUpdate) {
        await updatePurchase(id, formattedValues);
        message.success("Purchase updated successfully!");
        navigate("/admin/purchases");
      } else {
        await createPurchase(formattedValues);
        message.success("Purchase created successfully!");
        form.resetFields();
        navigate("/admin/purchases");
      }
      setLoading(false);
    } catch (error: any) {
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
          {/* Main Purchase Info */}
          <CustomSelect
            label="Supplier"
            name="supplierId"
            placeholder="Select Supplier"
            rules={[{ required: true, message: "Supplier is required" }]}
            mode="single"
            options={suppliersOption}
          />
          {/* <CustomInput
            label="Supplier ID"
            name="supplierId"
            placeholder="Enter supplier ID"
            rules={[{ required: true, message: "Supplier ID is required" }]}
          /> */}

          {/* <CustomInput
            label="Product ID"
            name="productId"
            placeholder="Enter product ID"
            rules={[{ required: true, message: "Product ID is required" }]}
          /> */}
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
            rules={[
              { required: true, message: "Reference number is required" },
            ]}
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
              { label: "Pending", value: "pending" },
              { label: "Received", value: "received" },
              { label: "Cancelled", value: "cancelled" },
            ]}
          />

          <CustomInput
            label="Supplier Address"
            name="supplierAddress"
            placeholder="Enter supplier address"
            rules={[
              { required: true, message: "Supplier address is required" },
            ]}
          />

          <CustomInput
            label="Pay Term Value"
            name="payTermValue"
            placeholder="Enter pay term value"
            type="number"
            rules={[{ required: true, message: "Pay term value is required" }]}
          />

          <CustomSelect
            label="Pay Term Unit"
            name="payTermUnit"
            placeholder="Select pay term unit"
            rules={[{ required: true, message: "Pay term unit is required" }]}
            mode="single"
            options={[
              { label: "Days", value: "days" },
              { label: "Months", value: "months" },
              { label: "Years", value: "years" },
            ]}
          />

          <CustomSelect
            label="Discount Type"
            name="discountType"
            placeholder="Select discount type"
            rules={[{ required: true, message: "Discount type is required" }]}
            mode="single"
            options={[
              { label: "Percent", value: "percent" },
              { label: "Fixed", value: "fixed" },
            ]}
          />

          <CustomInput
            label="Discount Amount"
            name="discountAmount"
            type="number"
            placeholder="Enter discount amount"
            rules={[{ required: true, message: "Discount amount is required" }]}
          />

          <CustomInput
            label="Order Tax (%)"
            name="orderTaxPercent"
            type="number"
            placeholder="Enter order tax %"
            rules={[{ required: true, message: "Order tax % is required" }]}
          />

          <CustomInput
            label="Order Tax Amount"
            name="orderTaxAmount"
            type="number"
            placeholder="Enter order tax amount"
            rules={[
              { required: true, message: "Order tax amount is required" },
            ]}
          />

          <CustomInput
            label="Shipping Charge"
            name="shippingCharge"
            type="number"
            placeholder="Enter shipping charge"
            rules={[{ required: true, message: "Shipping charge is required" }]}
          />

          <CustomInput
            label="Total Items"
            name="totalItems"
            type="number"
            placeholder="Enter total items"
            rules={[{ required: true, message: "Total items is required" }]}
          />

          <CustomInput
            label="Net Total Amount"
            name="netTotalAmount"
            type="number"
            placeholder="Enter net total amount"
            rules={[
              { required: true, message: "Net total amount is required" },
            ]}
          />

          <CustomInput
            label="Total Amount"
            name="totalAmount"
            type="number"
            placeholder="Enter total amount"
            rules={[{ required: true, message: "Total amount is required" }]}
          />

          <CustomInput
            label="Amount Paid"
            name="amountPaid"
            type="number"
            placeholder="Enter amount paid"
            rules={[{ required: true, message: "Amount paid is required" }]}
          />

          <CustomInput
            label="Warranty Value"
            name="warrantyValue"
            type="number"
            placeholder="Enter warranty value"
            rules={[{ required: true, message: "Warranty value is required" }]}
          />

          <CustomSelect
            label="Warranty Unit"
            name="warrantyUnit"
            placeholder="Select warranty unit"
            rules={[{ required: true, message: "Warranty unit is required" }]}
            mode="single"
            options={[
              { label: "Days", value: "days" },
              { label: "Months", value: "months" },
              { label: "Years", value: "years" },
            ]}
          />

          <CustomDate
            label="Expiry Date"
            name="expiryDate"
            placeholder="Select expiry date"
            rules={[{ required: true, message: "Expiry date is required" }]}
          />

          {/* Additional Expenses */}
          <CustomInput
            label="Handling Fee"
            name={["additionalExpenses", 0, "amount"]}
            type="number"
            placeholder="Enter handling fee"
            rules={[{ required: true, message: "Handling Fee is required" }]}
          />

          <CustomInput
            label="Insurance"
            name={["additionalExpenses", 1, "amount"]}
            type="number"
            placeholder="Enter insurance fee"
            rules={[{ required: true, message: "Insurance is required" }]}
          />

          <CustomTextArea
            label="Notes"
            name="notes"
            rows={3}
            placeholder="Enter notes if any"
            rules={[{ required: true, message: "Notes is required" }]}
          />

          <CustomTextArea
            label="Shipping Details"
            name="shippingDetails"
            rows={3}
            placeholder="Enter shipping details"
            rules={[
              { required: true, message: "Shipping Details is required" },
            ]}
          />
        </div>

        <Button
          icon={<FaSave />}
          loading={loading}
          htmlType="submit"
          className="btn !mt-5 !px-6"
        >
          {isUpdate ? "Update Purchase" : "Add Purchase"}
        </Button>
      </Form>
    </Card>
  );
}
