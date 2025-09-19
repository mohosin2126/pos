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
            placeholder="Select Discount"
            rules={[{ required: true, message: "Discount Type is required" }]}
            mode="single"
            options={[
              { label: "None", value: "none" },
              { label: "Percent", value: "percent" },
              { label: "Fixed", value: "fixed" },
            ]}
          />
          <CustomNumberInput
            label="Discount Amount"
            name="discountAmount"
            size="middle"
            placeholder="Enter discount amount"
            min={0}
            max={100}
            rules={[{ required: true, message: "Amount is required" }]}
          />
          <CustomNumberInput
            label="Order Tax (%)"
            name="orderTaxPercent"
            size="middle"
            placeholder="Enter order tax (%)"
            min={0}
            max={100}
            rules={[{ required: true, message: "Order Tax is required" }]}
          />
          <CustomNumberInput
            label="Order Tax Amount"
            name="orderTaxAmount"
            size="middle"
            placeholder="Enter order tax amount"
            min={0}
            max={100}
            rules={[{ required: true, message: "Amount is required" }]}
          />
          <CustomNumberInput
            label="Shipping Charge"
            name="shippingCharge"
            size="middle"
            placeholder="Enter Shipping Charge"
            min={0}
            rules={[{ required: true, message: "Shipping Charge is required" }]}
          />
        </div>

        <CustomTextArea
          label="Notes"
          name="notes"
          rows={3}
          placeholder="Enter notes"
          rules={[{ required: true, message: "Notes are required" }]}
        />
        {/* Submit */}
        <Button
          icon={<FaSave />}
          loading={loading}
          htmlType="submit"
          className="btn !mt-5 !px-6"
        >
          Save POS
        </Button>
      </Form>
    </Card>
  );
}
