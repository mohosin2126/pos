import { Form, Row, Col, message, Button, Card } from "antd";
import { FaSave } from "react-icons/fa";
import dayjs from "dayjs";

import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCreateUser, useUpdateUser, useUser } from "@/hooks/admin/user";
import {
  CustomCheckbox,
  CustomDate,
  CustomInput,
  CustomSelect,
  CustomTextArea,
} from "@/components/form";

export default function UserForm() {
  const [form] = Form.useForm();

  const { id } = useParams();
  const navigate = useNavigate();
  const isUpdate = Boolean(id);

  const { createUser } = useCreateUser();
  const { updateUser } = useUpdateUser();
  const { user } = useUser(id);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isUpdate && user) {
      try {
        form.setFieldsValue({
          ...user,
          dateOfBirth: user?.dateOfBirth ? dayjs(user?.dateOfBirth) : null,
        });
      } catch (err) {
        console.error(err);
        message.error("Failed to set user data.");
      }
    }
  }, [user, isUpdate, form]);

  const handleFinish = async (values: any) => {
    setLoading(true);
    const formattedValues = {
      ...values,
      dateOfBirth: values.dateOfBirth
        ? dayjs(values.dateOfBirth).format("YYYY-MM-DD")
        : null,
    };

    try {
      if (isUpdate) {
        await updateUser(id, formattedValues);
        message.success("User updated successfully!");
        navigate("/admin/user/all");
      } else {
        await createUser(formattedValues);
        message.success("User added successfully!");
        form.resetFields();
        navigate("/admin/user/all");
      }
    } catch (error: any) {
      setLoading(false);
      message.error(
        error?.response?.data?.message ||
          `Failed to ${isUpdate ? "update" : "add"} user. Please try again.`
      );
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-semibold !mb-6">
        {isUpdate ? "Update User" : "Add User"}
      </h2>
      <Form
        layout="vertical"
        form={form}
        onFinish={handleFinish}
        initialValues={
          isUpdate
            ? {
                // ...defaultUserData,
                ...user,
                dateOfBirth: user?.dateOfBirth ? dayjs(user.dateOfBirth) : null,
              }
            : {} // create mode -> empty
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <CustomInput
            label="First Name"
            name="firstName"
            placeholder="Enter first name"
            rules={[{ required: true, message: "First Name is required" }]}
          />
          <CustomInput
            label="Last Name"
            name="lastName"
            placeholder="Enter last name"
            rules={[{ required: true, message: "Last Name is required" }]}
          />
          <CustomInput
            type="email"
            label="Email"
            name="email"
            placeholder="Enter email address"
            rules={[{ required: true, message: "Email is required" }]}
          />
          <CustomInput
            label="Username"
            name="username"
            placeholder="Choose a unique username"
            rules={[{ required: true, message: "Username is required" }]}
          />
          <CustomInput
            type="password"
            label="Password"
            name="password"
            placeholder="Enter password"
            rules={[{ required: true, message: "Password is required" }]}
          />
          <CustomDate
            label="Date of Birth"
            name="dateOfBirth"
            placeholder="Select date of birth"
            rules={[{ required: true, message: "Date of Birth is required" }]}
          />
          <CustomSelect
            label="Gender"
            name="gender"
            mode="single"
            options={[
              { label: "Male", value: "male" },
              { label: "Female", value: "female" },
              { label: "Other", value: "other" },
            ]}
            rules={[{ required: true, message: "Gender is required" }]}
          />
          <CustomSelect
            label="Marital Status"
            name="maritalStatus"
            mode="single"
            options={[
              { label: "Single", value: "single" },
              { label: "Married", value: "married" },
              { label: "Divorced", value: "divorced" },
            ]}
            rules={[{ required: true, message: "Marital Status is required" }]}
          />
          <CustomSelect
            label="Blood Group"
            name="bloodGroup"
            mode="single"
            placeholder="Select blood group"
            options={[
              { label: "A+", value: "A+" },
              { label: "A-", value: "A-" },
              { label: "B+", value: "B+" },
              { label: "B-", value: "B-" },
              { label: "O+", value: "O+" },
              { label: "O-", value: "O-" },
              { label: "AB+", value: "AB+" },
              { label: "AB-", value: "AB-" },
            ]}
            rules={[{ required: true, message: "Blood Group is required" }]}
          />
          <CustomInput
            label="Mobile Number"
            name="mobileNumber"
            placeholder="Enter mobile number"
            rules={[{ required: true, message: "Number is required" }]}
          />
          <CustomSelect
            label="Role"
            name="role"
            mode="single"
            placeholder="Select Role"
            options={[
              { label: "Admin", value: "admin" },
              { label: "User", value: "user" },
              { label: "Supplier", value: "supplier" },
            ]}
            rules={[{ required: true, message: "Role is required" }]}
          />
          <CustomSelect
            label="Account Status"
            name="status"
            mode="single"
            options={[
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
              { label: "Suspended", value: "suspended" },
              { label: "Pending", value: "pending" },
            ]}
          />
          <CustomTextArea
            label="Permanent Address"
            name="permanentAddress"
            placeholder="Enter permanent address"
            rows={3}
            rules={[{ required: true, message: "Address is required" }]}
          />
          <CustomTextArea
            label="Current Address"
            name="currentAddress"
            placeholder="Enter current address"
            rows={3}
            rules={[{ required: true, message: "Address is required" }]}
          />
          <CustomInput
            label="Account Holder Name"
            name="accountHolderName"
            placeholder="Enter account holder's full name"
            rules={[{ required: true, message: "Account Holder is required" }]}
          />
          <CustomInput
            label="Account Number"
            name="accountNumber"
            placeholder="Enter account number"
            rules={[{ required: true, message: "Account is required" }]}
          />
          <CustomInput
            label="Bank Name"
            name="bankName"
            placeholder="Enter bank name"
            rules={[{ required: true, message: "Bank is required" }]}
          />
          <CustomInput
            label="Bank Identifier Code"
            name="bankIdentifierCode"
            placeholder="Enter BIC / IFSC code"
            rules={[{ required: true, message: "Role is required" }]}
          />
          <CustomInput
            label="Branch"
            name="branch"
            placeholder="Enter branch name"
            rules={[{ required: true, message: "Branch is required" }]}
          />
          <CustomInput
            label="Tax Payer ID"
            name="taxPayerId"
            placeholder="Enter tax payer ID"
            rules={[{ required: true, message: "Tax ID is required" }]}
          />
          <CustomInput
            label="Alternate Contact Number"
            name="alternateContactNumber"
            placeholder="Enter alternate contact number"
            rules={[
              { required: true, message: "Alternate Contact is required" },
            ]}
          />
          <CustomInput
            label="Family Contact Number"
            name="familyContactNumber"
            placeholder="Enter family contact number"
            rules={[{ required: true, message: "Family Contact is required" }]}
          />
          <CustomInput
            label="Social Media Link"
            name="socialMedia1"
            type="url"
            placeholder="Enter social media profile URL"
            rules={[
              { required: true, message: "Social Media Link is required" },
            ]}
          />
          <CustomInput
            label="Guardian Name"
            name="guardianName"
            placeholder="Enter guardian's name"
            rules={[{ required: true, message: "Guardian Name is required" }]}
          />
        </div>

        {/* File Upload */}

        <Row gutter={[24, 16]}>
          <Col xs={24} sm={24} md={12} lg={12}>
            <h3>Indicates if the user is allowed to login</h3>
            <CustomCheckbox
              name="allowLogin"
              label="Allow Login"
              rules={[{ required: true, message: "This field is required" }]}
            />
          </Col>
          <Col xs={24} sm={24} md={12} lg={12}>
            <h3>Indicates if the account is active</h3>
            <CustomCheckbox
              name="isActive"
              label="Active"
              rules={[{ required: true, message: "This field is required" }]}
            />
          </Col>
        </Row>

        {/* Submit */}
        <Button
          icon={<FaSave />}
          loading={loading}
          htmlType="submit"
          className="btn hover:!text-[#69feb0] !mt-5 !px-6"
        >
          {isUpdate ? "Update User" : "Add User"}
        </Button>
      </Form>
    </Card>
  );
}
