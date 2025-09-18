import {
  Checkbox,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Space,
  Upload,
  message,
} from "antd";
import { MdOutlineCloudUpload } from "react-icons/md";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import type { UploadProps } from "antd";
import React from "react";
import {
  TCustomCheckboxProps,
  TCustomDateProps,
  TCustomDateRangeProps,
  TCustomInputProps,
  TCustomNumberInputProps,
  TCustomSelectBoxProps,
  TCustomSelectProps,
  TCustomTextAreaProps,
  TFileUploadProps,
} from "@/interface/form";

const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Option } = Select;
const { Dragger } = Upload;

/* Input field*/
export const CustomInput: React.FC<TCustomInputProps> = ({
  label,
  name,
  rules = [],
  type = "text",
  placeholder = "",
  className = "m-0 p-0",
  size = "large",
  prefix = "",
  disabled = false,
}) => {
  const inputField =
    type === "password" ? (
      <Input.Password
        size={size}
        placeholder={placeholder}
        iconRender={(visible) =>
          visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
        }
        disabled={disabled}
      />
    ) : (
      <Input
        type={type}
        size={size}
        placeholder={placeholder}
        prefix={prefix}
        disabled={disabled}
      />
    );

  return (
    <Form.Item
      label={label}
      name={name}
      rules={rules}
      colon={false}
      className={className}
    >
      {inputField}
    </Form.Item>
  );
};

// number input field
export const CustomNumberInput: React.FC<TCustomNumberInputProps> = ({
  label,
  name,
  rules = [],
  min = 0,
  max,
  step = 1,
  placeholder = "",
  className = "m-0 p-0",
  size = "large",
  disabled = false,
}) => {
  return (
    <Form.Item
      label={label}
      name={name}
      rules={rules}
      colon={false}
      className={className}
    >
      <InputNumber
        min={min}
        max={max}
        step={step}
        size={size}
        placeholder={placeholder}
        disabled={disabled}
        className="!w-full"
      />
    </Form.Item>
  );
};
/* File upload*/
export const FileUpload: React.FC<TFileUploadProps> = ({
  label,
  name,
  rules = [],
  action = "https://httpbin.org/post",
  multiple = false,
}) => {
  const uploadProps: UploadProps = {
    name: "file",
    multiple,
    action,
    accept: "image/*",
    onChange(info) {
      const { status } = info.file;
      if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

  return (
    <Form.Item
      label={label}
      name={name}
      rules={rules}
      valuePropName="fileList"
      getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
    >
      <Dragger {...uploadProps}>
        <p className="ant-upload-drag-icon flex items-center justify-center">
          <MdOutlineCloudUpload size={32} />
        </p>
        <p className="ant-upload-hint">
          Only image files are allowed. PNG, JPG, JPEG, WEBP supported.
        </p>
      </Dragger>
    </Form.Item>
  );
};

/* Select field*/
export const CustomSelect: React.FC<TCustomSelectProps> = ({
  label,
  name,
  placeholder = "Please select",
  rules = [],
  options = [],
  mode = "multiple",
  allowClear = true,
  disabled = false,
  defaultValue = [],
  onChange,
  className = "m-0 p-0",
  size = "large",
  useCustomOptionRender = false,
  prefix = null,
}) => {
  return (
    <Form.Item
      label={label}
      name={name}
      rules={rules}
      initialValue={defaultValue}
      className={className}
    >
      <Select
        mode={mode === "single" ? undefined : mode}
        size={size}
        prefix={prefix}
        allowClear={allowClear}
        disabled={disabled}
        style={{ width: "100%" }}
        placeholder={placeholder}
        onChange={onChange}
      >
        {options.map((option) => (
          <Option key={option.value} value={option.value}>
            {useCustomOptionRender ? (
              <Space>
                {option.icon}
                {option.label}
              </Space>
            ) : (
              option.label
            )}
          </Option>
        ))}
      </Select>
    </Form.Item>
  );
};

/* Select Box like Radio Select*/
export const CustomSelectBox: React.FC<TCustomSelectBoxProps> = ({
  label,
  name,
  options = [],
  rules = [],
  defaultValue,
  onChange,
}) => {
  return (
    <Form.Item
      label={label}
      name={name}
      rules={rules}
      initialValue={defaultValue}
      className="w-full"
    >
      <Radio.Group
        options={options}
        optionType="button"
        buttonStyle="outline"
        className="grid grid-cols-4 gap-6"
        onChange={(e) => {
          if (onChange) onChange(e.target.value);
        }}
      />
    </Form.Item>
  );
};

/* Checkbox field */
export const CustomCheckbox: React.FC<TCustomCheckboxProps> = ({
  name,
  rules = [],
  label,
  className = "",
}) => {
  return (
    <Form.Item
      name={name}
      valuePropName="checked"
      rules={rules}
      className={className}
    >
      <Checkbox>{label}</Checkbox>
    </Form.Item>
  );
};

/* Date field */
export const CustomDate: React.FC<TCustomDateProps> = ({
  label,
  name,
  rules = [],
  placeholder = "Select date",
  className = "m-0 p-0",
  size = "large",
  prefix = "",
}) => {
  return (
    <Form.Item
      label={label}
      name={name}
      rules={rules}
      colon={false}
      className={className}
    >
      <DatePicker
        prefix={prefix}
        size={size}
        placeholder={placeholder}
        style={{ width: "100%" }}
      />
    </Form.Item>
  );
};

/* Date Range field */
export const CustomDateRange: React.FC<TCustomDateRangeProps> = ({
  label,
  name,
  rules = [],
  placeholder = ["Start date", "End date"],
  className = "m-0 p-0",
  size = "large",
  prefix = "",
}) => {
  return (
    <Form.Item
      label={label}
      name={name}
      rules={rules}
      colon={false}
      className={className}
    >
      <RangePicker
        prefix={prefix}
        size={size}
        placeholder={placeholder}
        style={{ width: "100%" }}
      />
    </Form.Item>
  );
};

/* TextArea field */
export const CustomTextArea: React.FC<TCustomTextAreaProps> = ({
  label,
  name,
  rules = [],
  placeholder = "",
  className = "m-0 p-0",
  size = "large",
  rows = 4,
}) => {
  return (
    <Form.Item
      label={label}
      name={name}
      rules={rules}
      colon={false}
      className={className}
    >
      <TextArea
        size={size}
        placeholder={placeholder}
        rows={rows}
        style={{ resize: "vertical" }}
      />
    </Form.Item>
  );
};
