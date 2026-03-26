import { useEffect, useState } from "react";
import { Form, Card, Button, message } from "antd";
import { FaSave } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import {
  useCreateProduct,
  useProduct,
  useUpdateProduct,
} from "@/hooks/admin/products";
import { useCategories } from "@/hooks/common";
import {
  CustomInput,
  CustomSelect,
  CustomTextArea,
  CustomNumberInput,
  FileUpload,
} from "@/components/form";
import { formatTagsForInput, normalizeTags } from "@/utils/tag-utils";
import { useBasePath } from "@/hooks/common/use-base-path";

export default function ProductForm() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const basePath = useBasePath();
  const isUpdate = Boolean(id);
  const { product } = useProduct(id);

  console.log("product ", product);

  const { createProduct } = useCreateProduct();
  const { updateProduct } = useUpdateProduct();
  const [loading, setLoading] = useState<boolean>(false);
  const { data: categoriesOption } = useCategories();

  useEffect(() => {
    if (product) {
      form.setFieldsValue({
        ...product,
        isTrackStock: product.isTrackStock ? "true" : "false",
        tags: formatTagsForInput(product.tags),
      });
    } else {
      form.resetFields();
    }
  }, [form, product]);

  const handleFinish = async (values: any) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        tags: normalizeTags(values.tags),
      };
      if (isUpdate && product?.id !== undefined) {
        await updateProduct(product?.id.toString(), payload);
        message.success("Product updated successfully!");
      } else {
        await createProduct(payload);
        message.success("Product created successfully!");
        form.resetFields();
      }

      navigate(`${basePath}/product/all`);
    } catch (error: any) {
      console.error(error);
      message.error(
        error?.response?.data?.message ||
          `Failed to ${isUpdate ? "update" : "create"} product.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-semibold !mb-6">
        {isUpdate ? "Update Product" : "Add Product"}
      </h2>
      <Form
        layout="vertical"
        form={form}
        onFinish={handleFinish}
        initialValues={{
          isTrackStock: "true",
          ...product,
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <CustomInput
            label="Product Name"
            name="name"
            placeholder="Enter product name"
            rules={[{ required: true, message: "Product name is required" }]}
          />
          <CustomSelect
            label="Category"
            name="categoryId"
            placeholder="Select category"
            rules={[{ required: true, message: "Category is required" }]}
            mode="single"
            options={categoriesOption}
          />
          {/*<FileUpload*/}
          {/*  label="Upload Product "*/}
          {/*  name="imageUrl2"*/}
          {/*  rules={[{ required: true, message: "File Upload is required" }]}*/}
          {/*/>*/}

            <CustomInput
                label="Upload Product "
                name="imageUrl2"
                placeholder="Enter image URL"
                rules={[{ required: true, message: "Image URL is required" }]}
            />


          <CustomInput
            label="SKU"
            name="sku"
            placeholder="Enter SKU"
            rules={[{ required: true, message: "SKU is required" }]}
          />

          <CustomInput
            label="Barcode"
            name="barcode"
            placeholder="Enter barcode"
          />

          <CustomInput
            label="Stock Quantity"
            name="stockQuantity"
            type="number"
            placeholder="Enter stock quantity"
            rules={[{ required: true, message: "Stock quantity is required" }]}
          />

          <CustomInput
            label="Reorder Level"
            name="reorderLevel"
            type="number"
            placeholder="Enter reorder level"
            rules={[{ required: true, message: "Reorder Level is required" }]}
          />

          <CustomNumberInput
            label="Selling Price"
            name="price"
            step={0.01}
            min={0}
            placeholder="Enter selling price"
            rules={[
              { required: true, message: "Selling price is required" },
              { pattern: /^[0-9]*\.?[0-9]*$/, message: "Invalid price format" },
              { type: 'number', min: 0, message: "Price cannot be negative" }
            ]}
          />

          <CustomSelect
            label="Track Stock"
            name="isTrackStock"
            placeholder="Select stock tracking"
            rules={[{ required: true, message: "Track Stock is Required" }]}
            mode="single"
            options={[
              { label: "Yes", value: "true" },
              { label: "No", value: "false" },
            ]}
          />
          <CustomSelect
            label="Status"
            name="status"
            placeholder="Select status"
            rules={[{ required: true, message: "Status is required" }]}
            mode="single"
            options={[
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ]}
          />

          <CustomInput
            label="Tags"
            name="tags"
            placeholder="Enter tags separated by comma"
            rules={[{ required: true, message: "Tags is required" }]}
          />
            <CustomTextArea
                label="Description"
                name="description"
                placeholder="Enter product description"
                rows={4}
                rules={[{ required: true, message: "Description is required" }]}
            />
        </div>

        <Button
          icon={<FaSave />}
          loading={loading}
          htmlType="submit"
          className="btn hover:!text-[#69feb0] !mt-5 !px-6"
        >
          {isUpdate ? "Update Product" : "Add Product"}
        </Button>
      </Form>
    </Card>
  );
}