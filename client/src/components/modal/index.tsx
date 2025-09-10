import { Modal } from "antd";
import {TCustomModalProps} from "@/interface/menu-and-common";
import {DashboardTitle} from "@/components/re-useable/dashboard-titile";

export default function CustomModal({
  isOpen,
  setIsOpen,
  title = "",
  description = "",
  children,
  width = 900,
}: TCustomModalProps) {
  return (
    <Modal
      open={isOpen}
      onCancel={() => setIsOpen(false)}
      footer={null}
      width={width}
      centered
      title={<DashboardTitle title={title} description={description} />}
      styles={{
        body: { maxHeight: "80vh", overflow: "auto" },
      }}
    >
      {children}
    </Modal>
  );
}
