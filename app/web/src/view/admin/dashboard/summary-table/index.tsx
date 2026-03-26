import { Avatar, Card, Select, Space, Tag } from "antd";
import { ArrowUpOutlined } from "@ant-design/icons";
import { HiMiniSquare3Stack3D } from "react-icons/hi2";
import { IoWarningOutline } from "react-icons/io5";
import { FaLightbulb } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useProducts } from "@/hooks/admin/products";

export default function SummaryTable() {
    const { products } = useProducts();
    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 mt-6">
            <Card
                bodyStyle={{ padding: "14px" }}
                title={
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-lg font-semibold flex items-center !m-0">
                            <Tag className="!py-1 !border-none" color="blue">
                                <HiMiniSquare3Stack3D size={20} />
                            </Tag>
                            Top Selling
                        </h2>
                        <div className="">
                            <Select
                                defaultValue="Today"
                                style={{ width: 120 }}
                                options={[
                                    { label: "Today", value: "today" },
                                    { label: "Weekly", value: "weekly" },
                                    { label: "Monthly", value: "monthly" },
                                ]}
                            />
                        </div>
                    </div>
                }
            >
                {products?.length > 0 &&
                    products?.slice(0, 5)?.map((product, index, arr) => (
                        <div key={index}>
                            <div
                                className={`flex items-center justify-between gap-3 ${
                                    index !== arr.length - 1 ? "border-b border-b-gray-200" : ""
                                }`}
                            >
                                <Space>
                                    <Avatar
                                        shape="square"
                                        src={
                                            "https://png.pngtree.com/png-vector/20210602/ourmid/pngtree-3d-beauty-cosmetics-product-design-png-image_3350326.jpg"
                                        }
                                        size={60}
                                    />
                                    <div className="min-w-0">
                                        <div className="font-medium truncate max-w-[150px] md:max-w-[120px] xl:max-w-[160px]">{product?.name}</div>
                                        <div className="text-gray-500 text-sm flex items-center gap-2">
                                            <p> $256 </p>
                                            <div className=" flex items-center gap-1">
                                                <p className="w-1.5 h-1.5 rounded-full bg-amber-600"></p>
                                                <p> 247+ Sales</p>
                                            </div>
                                        </div>
                                    </div>
                                </Space>
                                <div>
                                    <Tag color="success">
                                        <ArrowUpOutlined /> 25%
                                    </Tag>
                                </div>
                            </div>
                        </div>
                    ))}
            </Card>
            <Card
                bodyStyle={{ padding: "14px" }}
                title={
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold flex items-center !m-0">
                            <Tag className="!py-1 !border-none" color="warning">
                                <IoWarningOutline size={20} />
                            </Tag>
                            Low Stock
                        </h2>
                        <Link
                            to=""
                            className="border-b !text-gray-700 hover:!text-[#005555] [transition:0.5s] 2xl:!text-sm !text-xs !m-0"
                        >
                            View All
                        </Link>
                    </div>
                }
            >
                {products?.length > 0 &&
                    products?.slice(0, 5)?.map((product, index, arr) => (
                        <div key={product?.id}>
                            <div
                                className={`flex items-center justify-between gap-3 ${
                                    index !== arr.length - 1 ? "border-b border-b-gray-200" : ""
                                }`}
                            >
                                <Space>
                                    <Avatar
                                        shape="square"
                                        src={
                                            "https://png.pngtree.com/png-clipart/20250501/original/pngtree-colorful-mechanical-keyboards-perfect-for-gamers-and-tech-enthusiasts-png-image_20926209.png"
                                        }
                                        size={60}
                                    />
                                    <div className="min-w-0">
                                        <div className="font-medium truncate max-w-[150px] md:max-w-[120px] xl:max-w-[160px]">{product?.name}</div>
                                        <p> ID : #665814 </p>
                                    </div>
                                </Space>
                                <div className="text-end">
                                    <p className="!m-0">Instock</p>
                                    <p className="text-amber-700 text-base font-medium">
                                        {product?.stockQuantity}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
            </Card>
            <Card
                bodyStyle={{ padding: "14px" }}
                className="block md:hidden xl:block"
                title={
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-lg font-semibold flex items-center !m-0">
                            <Tag className="!py-1 !border-none" color="error">
                                <FaLightbulb size={20} />
                            </Tag>
                            Recent Sales
                        </h2>
                        <Select
                            defaultValue="today"
                            style={{ width: 120 }}
                            options={[
                                { label: "Today", value: "today" },
                                { label: "Weekly", value: "weekly" },
                                { label: "Monthly", value: "monthly" },
                            ]}
                        />
                    </div>
                }
            >
                {products?.length > 0 &&
                    products?.slice(0, 5)?.map((product, index, arr) => (
                        <div key={product?.id}>
                            <div
                                className={`flex items-center justify-between gap-3 ${
                                    index !== arr.length - 1 ? "border-b border-b-gray-200" : ""
                                }`}
                            >
                                <Space>
                                    <Avatar
                                        shape="square"
                                        src={"https://www.madrigal.co/wp-content/uploads/f1779.jpg"}
                                        size={60}
                                    />
                                    <div className="min-w-0">
                                        <div className="font-medium truncate max-w-[150px] md:max-w-[120px] xl:max-w-[160px]">{product?.name}</div>
                                        <div className="text-gray-500 text-sm flex items-center gap-2">
                                            <p> Electronics </p>
                                            <div className=" flex items-center gap-1">
                                                <p className="w-1.5 h-1.5 rounded-full bg-amber-600"></p>
                                                <p> $615</p>
                                            </div>
                                        </div>
                                    </div>
                                </Space>
                                <div className="text-end">
                                    <p className="!m-0">Today</p>
                                    <Tag className="!m-0" color="success">
                                        {product?.status}
                                    </Tag>
                                </div>
                                {/* <div>
                  <Tag color="success">
                    <ArrowUpOutlined /> 25%
                  </Tag>
                </div> */}
                            </div>
                        </div>
                    ))}
            </Card>
        </div>
    );
}
