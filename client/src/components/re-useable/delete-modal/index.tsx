
import { Modal } from "antd";
import {TConfirmDeleteProps} from "@/interface/menu-and-common";

export const showConfirmDelete = ({
  title,
  content,
  onConfirm,
}: TConfirmDeleteProps) => {
  Modal.confirm({
    title,
    content,
    okText: "Delete",
    okType: "danger",
    cancelText: "Cancel",
    async onOk() {
      try {
        const result = await onConfirm();
        return result;
      } catch (error: any) {
        console.error(
          "Confirmation error:",
          error?.response?.data?.message || error
        );
      }
    },
  });
};
