import type { Rule } from "antd/es/form";

export interface TCustomInputProps {
  label?: string;
  name?: string | (string | number)[];
  rules?: Rule[];
  type?: string;
  placeholder?: string;
  className?: string;
  size?: "small" | "middle" | "large";
  prefix?: React.ReactNode;
  disabled?: boolean;
}

export type TCustomNumberInputProps = {
  label: string;
  name: string;
  rules?: Rule[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  className?: string;
  size?: "small" | "middle" | "large";
  disabled?: boolean;
};

export interface TFileUploadProps {
  label?: string;
  name: string;
  rules?: Rule[];
  action?: string;
  multiple?: boolean;
}

export interface TCustomSelectProps {
  label?: string;
  name: string;
  placeholder?: string;
  rules?: Rule[];
  options: { label: string; value: string | number; icon?: React.ReactNode }[];
  mode?: "multiple" | "tags" | "single";
  allowClear?: boolean;
  disabled?: boolean;
  defaultValue?: (string | number)[];
  onChange?: (value: string | number) => void;
  className?: string;
  size?: "small" | "middle" | "large";
  useCustomOptionRender?: boolean;
  prefix?: React.ReactNode;
}

export interface TCustomSelectBoxProps {
  label?: string;
  name: string;
  options: { label: string; value: string | number }[];
  rules?: Rule[];
  defaultValue?: string | number;
  onChange?: (value: string | number) => void;
}

export interface TCustomCheckboxProps {
  name: string;
  rules?: Rule[];
  label?: string;
  className?: string;
}

export interface TCustomDateProps {
  label?: string;
  name: string;
  rules?: Rule[];
  placeholder?: string;
  className?: string;
  size?: "small" | "middle" | "large";
  prefix?: React.ReactNode;
}

export interface TCustomDateRangeProps {
  label?: string;
  name: string;
  rules?: Rule[];
  placeholder?: [string, string];
  className?: string;
  size?: "small" | "middle" | "large";
  prefix?: React.ReactNode;
}

export interface TCustomTextAreaProps {
  label?: string;
  name: string;
  rules?: Rule[];
  placeholder?: string;
  className?: string;
  size?: "small" | "middle" | "large";
  rows?: number;
}
