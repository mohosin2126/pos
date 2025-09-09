import type { BadgeProps } from "antd";

export const getStatus = (status: string): BadgeProps["status"] => {
  switch (status.toLowerCase()) {
    case "active":
      return "success";
    case "nactive":
    case "inactive":
      return "warning";
    case "failed":
      return "error";
    case "sent":
      return "success";
    case "pending":
      return "warning";
    default:
      return "default";
  }
};
