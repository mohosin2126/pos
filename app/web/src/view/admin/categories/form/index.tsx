import { Button, Form, message } from "antd";
import { CustomInput, CustomTextArea } from "@/components/form";
import { FaSave } from "react-icons/fa";
import { useEffect, useState } from "react";
import type { TCategoryFormProps } from "@/interface/menu-and-common";
import { useCreateCategory, useUpdateCategory } from "@/hooks/admin/categories";

export default function CategoryForm({
  updateValue,
  isOpen,
  onClose,
  refetch,
}: TCategoryFormProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const { createCategory } = useCreateCategory();
  const { updateCategory } = useUpdateCategory();

  const handleFinish = async (values: any) => {
    setLoading(true);
    try {
      if (updateValue) {
        await updateCategory(updateValue.id as string, values);
        refetch();
        message.success("Category updated successfully");
      } else {
        await createCategory(values);
        refetch();
        message.success("Category created successfully");
      }
      form.resetFields();
      onClose();
    } catch (error) {
      console.error(error);
      message.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (updateValue) {
      form.setFieldsValue(updateValue);
    } else {
      form.resetFields();
    }
  }, [updateValue, form, isOpen]);

  return (
    <Form layout="vertical" form={form} onFinish={handleFinish}>
      <CustomInput
        label="Category Name"
        name="name"
        placeholder="Enter Category Name"
        rules={[{ required: true, message: "Category Name is required" }]}
      />
      <CustomTextArea
        label="Short Description"
        name="description"
        rows={3}
        placeholder="Enter Short Description"
        rules={[{ required: true, message: "Description is required" }]}
      />
      <Button
        icon={<FaSave />}
        loading={loading}
        htmlType="submit"
        className="btn hover:!text-[#69feb0] !mt-5 !px-6"
      >
        {updateValue ? "Update Category" : "Add Category"}
      </Button>
    </Form>
  );
}
