import { Card, Tag } from "antd";
import { DonutChart, GraphChart } from "@/components/charts";
import {
  MdProductionQuantityLimits,
  MdCategory,
  MdInventory,
  MdShoppingCart,
  MdAssignmentReturned,
  MdPointOfSale,
  MdAssignmentReturn,
  MdShoppingBag,
} from "react-icons/md";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import SummaryTable from "@/view/admin/dashboard/summary-table";

export default function Dashboard() {
  const allSummary = [
    {
      id: 1,
      title: "Total Sales",
      value: "48,988,078",
      percentage: "+35%",
      icon: MdPointOfSale,
    },
    {
      id: 2,
      title: "Total Sales Return",
      value: "16,478,145",
      percentage: "-22%",
      icon: MdAssignmentReturn,
    },
    {
      id: 3,
      title: "Total Purchase",
      value: "24,145,789",
      percentage: "+8%",
      icon: MdShoppingBag,
    },
    {
      id: 4,
      title: "Total Purchase Return",
      value: "18,458,747",
      percentage: "+5%",
      icon: MdAssignmentReturned,
    },
  ];
  const statsData = [
    {
      id: 1,
      title: "Suppliers",
      value: 124,
      percentage: "+35%",
      icon: MdProductionQuantityLimits,
    },
    {
      id: 2,
      title: "Categories",
      value: 78,
      percentage: "+12%",
      icon: MdCategory,
    },
    {
      id: 3,
      title: "Products",
      value: 452,
      percentage: "+8%",
      icon: MdInventory,
    },
    {
      id: 4,
      title: "Purchases",
      value: 32,
      percentage: "+5%",
      icon: MdShoppingCart,
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {allSummary.map((item, index) => {
          const Icon = item.icon;
          return (
            <Card
              bodyStyle={{ padding: "15px" }}
              key={item.id}
              className={`!text-white ${
                index === 0
                  ? "!bg-[#005555] "
                  : index === 1
                  ? "!bg-blue-900"
                  : index === 2
                  ? "!bg-green-900"
                  : index === 3
                  ? "!bg-yellow-900"
                  : "!bg-primary"
              }`}
            >
              <div className="flex items-center gap-4 ">
                <div
                  className={`text-3xl ${
                    index === 0
                      ? "text-[#005555] "
                      : index === 1
                      ? "text-blue-900"
                      : index === 2
                      ? "text-green-900"
                      : index === 3
                      ? "text-yellow-900"
                      : "text-primary"
                  } w-12 h-12 rounded flex items-center justify-center bg-white`}
                >
                  <Icon />
                </div>
                <div>
                  <p className="text-sm text-white !m-0">{item.title}</p>
                  <h3 className="text-xl font-semibold flex items-center gap-2 !m-0">
                    ${item.value}
                    <Tag
                      color={
                        item.percentage.startsWith("+") ? "success" : "error"
                      }
                      className="text-sm flex items-center gap-1"
                    >
                      {item.percentage.startsWith("+") ? (
                        <ArrowUpOutlined />
                      ) : (
                        <ArrowDownOutlined />
                      )}
                      {item.percentage}
                    </Tag>
                  </h3>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-6">
        {statsData.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <Card
              bodyStyle={{ padding: "15px" }}
              headStyle={{ padding: "15px" }}
              title={
                <div className="flex items-center justify-between gap-1">
                  <div>
                    <div
                      className={`text-3xl font-bold ${
                        index === 0
                          ? "text-indigo-800 "
                          : index === 1
                          ? "text-pink-800"
                          : index === 2
                          ? "text-teal-800"
                          : index === 3
                          ? "text-orange-800"
                          : "text-gray-800"
                      }`}
                    >
                      {item?.value}
                    </div>
                    <div className="text-gray-500">{item?.title}</div>
                  </div>
                  <div
                    className={` w-10 h-10 rounded flex items-center justify-center ${
                      index === 0
                        ? "text-indigo-800 bg-indigo-100"
                        : index === 1
                        ? "text-pink-800 bg-pink-100"
                        : index === 2
                        ? "text-teal-800 bg-teal-100"
                        : index === 3
                        ? "text-orange-800 bg-orange-100"
                        : "text-gray-800 bg-gray-100"
                    }`}
                  >
                    <IconComponent size={22} />
                  </div>
                </div>
              }
            >
              <div className="flex items-center justify-between">
                <p className="!m-0">
                  <span className="text-purple-500 pr-1">
                    {item?.percentage}
                  </span>
                  vs Last Month
                </p>
                <p className="text-blue-500 hover:underline cursor-pointer !m-0">
                  View All
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <GraphChart />
        <DonutChart />
      </div>
      <SummaryTable />
    </div>
  );
}
