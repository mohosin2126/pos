import { Typography } from "antd";
import {TDashboardProps} from "@/interface/menu-and-common";
const { Text, Title } = Typography;

export const DashboardTitle = ({
  title = "",
  level = 4,
  description = "",
}: TDashboardProps) => {
  return (
    <div>
      <Title level={level} className="!mb-1 !text-gray-900 ">
        {title}
      </Title>
      <Text className="text-gray-600 text-base font-normal">{description}</Text>
    </div>
  );
};
