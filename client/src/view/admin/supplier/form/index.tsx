import { Form, message, Button, Card } from "antd";
import { FaSave } from "react-icons/fa";
import {
  useCreateSupplier,
  useUpdateSupplier,
  useSupplier,
} from "@/hooks/admin/supplier";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { TSupplierPayload } from "@/interface/common";
import { CustomInput, CustomSelect, CustomTextArea } from "@/components/form";

export default function SupplierForm() {
  const [form] = Form.useForm();
  const { id } = useParams();
  const navigate = useNavigate();
  const isUpdate = Boolean(id);
  const [loading, setLoading] = useState(false);

  const { createSupplier } = useCreateSupplier();
  const { updateSupplier } = useUpdateSupplier();
  const { supplier } = useSupplier(id);

  // console.log("supplier data: ", supplier);

  // Populate form when updating
  useEffect(() => {
    if (isUpdate && supplier) {
      setLoading(true);
      try {
        form.setFieldsValue({
          ...supplier,
        });
      } catch (err) {
        console.error(err);
        message.error("Failed to set supplier data.");
      } finally {
        setLoading(false);
      }
    }
  }, [supplier, isUpdate, form]);

  const handleFinish = async (values: TSupplierPayload) => {
    setLoading(true);
    try {
      let payload: TSupplierPayload;

      if (isUpdate) {
        // Exclude supplierCode during update
        const { supplierCode, ...rest } = values;
        payload = rest as TSupplierPayload;
        console.log("update for value:", supplierCode);
        await updateSupplier(id, payload);
        message.success("Supplier updated successfully!");
        navigate("/admin/supplier/all");
      } else {
        // Include supplierCode during create
        payload = values;
        await createSupplier(payload);
        message.success("Supplier added successfully!");
        form.resetFields();
        navigate("/admin/supplier/all");
      }
    } catch (error: any) {
      console.error(error);
      message.error(
        error?.response?.data?.message ||
          `Failed to ${isUpdate ? "update" : "add"} supplier. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-semibold !mb-6">
        {isUpdate ? "Update Supplier" : "Add Supplier"}
      </h2>
      <Form
        layout="vertical"
        form={form}
        onFinish={handleFinish}
        initialValues={(isUpdate ? supplier : {}) as any}
        preserve={true}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <CustomInput
            label="Supplier Code"
            name="supplierCode"
            placeholder="Enter supplier code"
            rules={[{ required: true, message: "Supplier Code is required" }]}
            disabled={isUpdate}
          />
          <CustomInput
            label="Company Name"
            name="companyName"
            placeholder="Enter company name"
            rules={[{ required: true, message: "Company Name is required" }]}
          />
          <CustomInput
            label="Contact Person Name"
            name="contactPersonName"
            placeholder="Enter contact person name"
            rules={[
              { required: true, message: "Contact Person Name is required" },
            ]}
          />
          <CustomInput
            label="Email"
            name="email"
            type="email"
            placeholder="Enter email"
            rules={[{ required: true, message: "Email is required" }]}
          />
          <CustomInput
            label="Phone"
            name="phone"
            placeholder="Enter phone number"
            rules={[{ required: true, message: "Phone number is required" }]}
          />
          <CustomInput
            label="Website"
            name="website"
            type="url"
            placeholder="Enter website URL"
            rules={[{ required: true, message: "Website is required" }]}
          />
          <CustomInput
            label="Address"
            name="address"
            placeholder="Enter address"
            rules={[{ required: true, message: "Address is required" }]}
          />
          <CustomInput
            label="City"
            name="city"
            placeholder="Enter city"
            rules={[{ required: true, message: "City is required" }]}
          />
          <CustomInput
            label="State"
            name="state"
            placeholder="Enter state"
            rules={[{ required: true, message: "State is required" }]}
          />
          <CustomInput
            label="Postal Code"
            name="postalCode"
            placeholder="Enter postal code"
            rules={[{ required: true, message: "State is required" }]}
          />
          <CustomInput
            label="Country"
            name="country"
            placeholder="Enter country"
            rules={[{ required: true, message: "Country is required" }]}
          />
          <CustomInput
            label="Tax ID"
            name="taxId"
            placeholder="Enter tax ID"
            rules={[{ required: true, message: "Tax ID is required" }]}
          />
          <CustomSelect
            label="Status"
            name="status"
            mode="single"
            options={[
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ]}
            rules={[{ required: true, message: "Status is required" }]}
          />
          <CustomInput
            label="Payment Terms"
            name="paymentTerms"
            placeholder="Enter payment terms"
            rules={[{ required: true, message: "Payment Terms is required" }]}
          />
          <CustomTextArea
            label="Bank Details"
            name="bankDetails"
            placeholder="Enter bank details"
            rows={2}
            rules={[{ required: true, message: "Tax ID is required" }]}
          />
          <CustomTextArea
            label="Notes"
            name="notes"
            placeholder="Enter notes"
            rows={2}
            rules={[{ required: true, message: "Notes is required" }]}
          />
        </div>

        <Button
          icon={<FaSave />}
          loading={loading}
          htmlType="submit"
          className="btn hover:!text-[#69feb0] !mt-5 !px-6"
        >
          {isUpdate ? "Update Supplier" : "Add Supplier"}
        </Button>
      </Form>
    </Card>
  );
}
