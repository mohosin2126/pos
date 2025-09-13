/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { useNavigate } from "react-router-dom";

export default function POSForm() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleFinish = async (values: TPOSOrderPayload) => {
    setLoading(true);
    try {
      const newPos: TPOSOrderPayload = {
        ...values,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as any;

      console.log("POS Created:", newPos);
      message.success("POS created successfully!");
      form.resetFields();
      return navigate("/admin/pos");
    } catch (error) {
      console.error(error);
      message.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-semibold !mb-6">
        Create POS (Point of Sale)
      </h2>
      <Form layout="vertical" form={form} onFinish={handleFinish}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          {/* Basic Info */}
          <CustomInput
            label="Biller Name"
            name="billerName"
            placeholder="Enter biller name"
            rules={[{ required: true, message: "Biller Name is required" }]}
          />
          <CustomInput
            label="Customer Name"
            name="customerName"
            placeholder="Enter customer name"
            rules={[{ required: true, message: "Customer Name is required" }]}
          />
          <CustomInput
            label="Customer Phone"
            name="customerPhone"
            placeholder="Enter phone number"
            rules={[{ required: true, message: "Customer Phone is required" }]}
          />
          <CustomSelect
            label="Discount Type"
            name="discountType"
            placeholder="Select Discount"
            rules={[{ required: true, message: "Discount Type is required" }]}
            mode="single"
            options={[
              { label: "None", value: "none" },
              { label: "Percent", value: "percent" },
              { label: "Fixed", value: "fixed" },
            ]}
          />
          {/* Discount, Tax & Shipping */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 w-full">
            <CustomNumberInput
              label="Order Tax (%)"
              name="orderTaxPercent"
              placeholder="Enter Order Tax (%)"
              min={0}
              max={100}
              rules={[{ required: true, message: "Order Tax is required" }]}
            />
            <CustomNumberInput
              label="Shipping Charge"
              name="shippingCharge"
              placeholder="Enter Shipping Charge"
              min={0}
              rules={[
                { required: true, message: "Shipping Charge is required" },
              ]}
            />
          </div>

          {/* Items Section */}
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <div className="space-y-4">
                {fields.map((field) => (
                  <div
                    key={field.key}
                    className="grid grid-cols-2 md:grid-cols-3 gap-3 items-center"
                  >
                    <Form.Item
                      key={`productId-${field.key}`}
                      name={[field.name, "productId"]}
                      label="Product ID"
                      rules={[
                        { required: true, message: "Product ID is required" },
                      ]}
                    >
                      <InputNumber
                        placeholder="Product ID"
                        className="!w-full"
                      />
                    </Form.Item>

                    <Form.Item
                      key={`qty-${field.key}`}
                      name={[field.name, "quantity"]}
                      label="Quantity"
                      rules={[
                        { required: true, message: "Quantity is required" },
                      ]}
                    >
                      <InputNumber
                        min={1}
                        placeholder="Quantity"
                        className="!w-full"
                      />
                    </Form.Item>

                    <Form.Item
                      key={`unitPrice-${field.key}`}
                      name={[field.name, "unitPrice"]}
                      label="Unit Price"
                      rules={[
                        { required: true, message: "Unit Price is required" },
                      ]}
                    >
                      <InputNumber
                        min={0}
                        placeholder="Unit Price"
                        className="!w-full"
                      />
                    </Form.Item>

                    <Form.Item
                      key={`discount-${field.key}`}
                      name={[field.name, "discountAmount"]}
                      label="Discount"
                      rules={[
                        { required: true, message: "Discount is required" },
                      ]}
                    >
                      <InputNumber
                        min={0}
                        placeholder="Discount"
                        className="!w-full"
                      />
                    </Form.Item>

                    <Form.Item
                      key={`tax-${field.key}`}
                      name={[field.name, "taxPercent"]}
                      label="Tax %"
                      rules={[{ required: true, message: "Tax % is required" }]}
                    >
                      <InputNumber
                        min={0}
                        max={100}
                        placeholder="Tax %"
                        className="!w-full"
                      />
                    </Form.Item>

                    <Button danger onClick={() => remove(field.name)}>
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="dashed"
                  className="hover:!border-[#005555] hover:!text-[#005555] !py-5 !mb-6"
                  onClick={() => add()}
                  block
                >
                  + Add Item
                </Button>
              </div>
            )}
          </Form.List>
          {/* Notes */}
          <CustomTextArea
            label="Notes"
            name="notes"
            rows={3}
            placeholder="Enter notes"
            rules={[{ required: true, message: "Notes are required" }]}
          />
          {/* Payments Section */}
          <Form.List name="payments">
            {(fields, { add, remove }) => (
              <div className="space-y-4">
                {fields.map((field) => (
                  <div
                    key={field.key}
                    className="grid grid-cols-2 md:grid-cols-3 gap-3 items-center"
                  >
                    <Form.Item
                      key={`amount-${field.key}`}
                      name={[field.name, "amount"]}
                      label="Amount"
                      rules={[
                        { required: true, message: "Amount is required" },
                      ]}
                    >
                      <InputNumber
                        min={0}
                        placeholder="Amount"
                        className="!w-full"
                      />
                    </Form.Item>

                    <Form.Item
                      key={`method-${field.key}`}
                      name={[field.name, "method"]}
                      label="Method"
                      rules={[
                        {
                          required: true,
                          message: "Payment method is required",
                        },
                      ]}
                    >
                      <Select placeholder="Payment method">
                        <Select.Option value="cash">Cash</Select.Option>
                        <Select.Option value="card">Card</Select.Option>
                        <Select.Option value="bank">Bank</Select.Option>
                      </Select>
                    </Form.Item>

                    <Button danger onClick={() => remove(field.name)}>
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="dashed"
                  className="hover:!border-[#005555] hover:!text-[#005555] !py-5 "
                  onClick={() => add()}
                  block
                >
                  + Add Payment
                </Button>
              </div>
            )}
          </Form.List>
        </div>
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
