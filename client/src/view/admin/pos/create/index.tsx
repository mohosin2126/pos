import { Button, Card, Form, InputNumber, Select, message } from "antd";
import {
  CustomInput,
  CustomNumberInput,
  CustomSelect,
  CustomTextArea,
} from "@/components/form";
import { FaSave } from "react-icons/fa";
import { useState } from "react";
import type { TPOSOrderPayload } from "@/interface/common";

export default function POSForm({ setPosAddress, setIsOpen }: any) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [discountType, setDiscountType] = useState<"none" | "percent" | "fixed">("none");


  const handleFinish = async (values: TPOSOrderPayload) => {
    setLoading(true);
    try {
      message.success("Add information successfully!");
      setPosAddress(values);
      form.resetFields();

      setIsOpen(false);
    } catch (error) {
      console.error(error);
      message.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <Card>
      <Form layout="vertical" form={form} onFinish={handleFinish}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          {/* Basic Info */}
          <CustomInput
            label="Email"
            name="email"
            type="email"
            size="middle"
            placeholder="Enter email"
            rules={[{ required: true, message: "Email is required" }]}
          />
          <CustomInput
            label="Address"
            name="address"
            size="middle"
            placeholder="Enter address"
            rules={[{ required: true, message: "Address is required" }]}
          />

          <CustomSelect
            label="Discount Type"
            name="discountType"
            size="middle"
            placeholder="Select Discount Type"
            rules={[{ required: true, message: "Discount Type is required" }]}
            mode="single"
            options={[
              { label: "None - No Discount", value: "none" },
              { label: "Percent (%) - Percentage of Subtotal", value: "percent" },
              { label: "Fixed Amount - Fixed Taka Amount", value: "fixed" },
            ]}
            onChange={(value) => {
              setDiscountType(value as "none" | "percent" | "fixed");
              if (value === "none") {
                form.setFieldValue("discountAmount", 0);
              }
            }}
          />
          
          {discountType !== "none" && (
            <CustomNumberInput
              label={`Discount Amount ${discountType === "percent" ? "(%)" : "(৳)"}`}
              name="discountAmount"
              size="middle"
              placeholder={`Enter discount ${discountType === "percent" ? "percentage" : "amount"}`}
              min={0}
              step={discountType === "percent" ? 0.01 : 1}
              rules={[{ required: true, message: "Discount amount is required" }]}
            />
          )}
          
          <Form.Item name="discountAmount" hidden>
            <InputNumber />
          </Form.Item>

          <CustomNumberInput
            label="Order Tax Percent (%)"
            name="orderTaxPercent"
            size="middle"
            placeholder="Enter tax percentage (e.g., 15 for 15%)"
            min={0}
            max={100}
            step={0.01}
            rules={[{ required: true, message: "Order Tax is required" }]}
          />

          <CustomNumberInput
            label="Shipping Charge (৳)"
            name="shippingCharge"
            size="middle"
            placeholder="Enter shipping charge amount (e.g., 50)"
            min={0}
            step={1}
            rules={[{ required: true, message: "Shipping Charge is required" }]}
          />
        </div>

        <CustomTextArea
          label="Notes (Optional)"
          name="notes"
          rows={3}
          placeholder="Enter additional notes or customer information"
        />
        {/* Submit */}
        <Button
          icon={<FaSave />}
          loading={loading}
          htmlType="submit"
          className="btn hover:!text-[#69feb0] !mt-5 !px-6"
        >
          Save POS
        </Button>
      </Form>
    </Card>
  );
}
