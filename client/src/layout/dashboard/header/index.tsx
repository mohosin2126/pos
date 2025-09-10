import { Dropdown, Input, message, Space, type MenuProps } from "antd";
import { useState } from "react";
import usa from "../../../assets/flag/usa.png";
import { BsLayoutSidebar } from "react-icons/bs";
import { MdOutlineNotifications, MdSearch } from "react-icons/md";
import { CiMenuFries } from "react-icons/ci";
import { DownOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { TLang, TSidebarProps } from "@/interface/menu-and-common";
import { dropDownItems, languageItems, notificationItems } from "@/components/common/header";
import { demoNotifications } from "@/data";
import Cookies from "js-cookie";
import useApi from "@/hooks/use-api";
import { useUser } from "@/context-api";

export default function Header({ setNavOpened, navOpened, setIsCollapsed }: TSidebarProps) {
    const navigate = useNavigate();
    const { user, setUser } = useUser();

    const handleMenuClick: MenuProps["onClick"] = async ({ key }) => {
        if (key === "logout") {
            const token = Cookies.get("token");
            try {
                await useApi.post(
                    "/v1/auth/logout",
                    {},
                    token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
                );
                message.success("Logged out");
            } catch {
                message.info("Ending session");
            } finally {
                Cookies.remove("token");
                Cookies.remove("user");
                try {
                    localStorage.clear();
                } catch {}
                try {
                    sessionStorage.clear();
                } catch {}
                setUser(null);
                navigate("/auth", { replace: true });
            }
        }
    };

    const [selectedLang, setSelectedLang] = useState<TLang>({
        key: "en",
        label: "English",
        flag: usa,
    });

    const displayName =
        (user && ((user as any).firstName || (user as any).name || (user as any).email)) || "Account";

    return (
        <header className="!sticky inset-y-0 left-0 z-30 w-full  bg-white [transition:0.5s] bg-opacity-75 backdrop-blur-md">
            <div className="flex items-center justify-between pl-4 lg:pl-2 pr-6 py-3">
                <div className="flex items-center gap-3 w-full">
                    <button
                        onClick={() => setNavOpened?.(!navOpened)}
                        className=" hidden lg:flex items-center justify-center cursor-pointer text-[#005555] hover:bg-[#005555] hover:!text-[#69fec1] [transition:0.3s] bg-[#005555]/10 p-2 w-10 h-10 rounded-full text-center"
                    >
                        <BsLayoutSidebar size={18} />
                    </button>
                    <CiMenuFries
                        className="lg:!hidden block cursor-pointer text-xl text-gray-800 rotate-180"
                        onClick={() => setIsCollapsed?.((prev) => !prev)}
                    />
                    <div className="relative hidden md:block">
                        <Input type="text" prefix={<MdSearch size={18} color="gray" />} placeholder="Search" className="max-w-md" />
                    </div>
                </div>

                <div className="flex items-center gap-x-3">
                    <Dropdown menu={{ items: languageItems(setSelectedLang) }} trigger={["click"]}>
                        <a onClick={(e) => e.preventDefault()}>
                            <Space>
                                <button className="action-btn group bg-[#005555]/10 hover:bg-[#005555]/15">
                                    <img
                                        src={selectedLang?.flag}
                                        alt="flag"
                                        style={{
                                            width: 18,
                                            height: 18,
                                            objectFit: "cover",
                                            borderRadius: "9px",
                                        }}
                                    />
                                </button>
                            </Space>
                        </a>
                    </Dropdown>

                    <Dropdown
                        menu={{
                            items: notificationItems(demoNotifications),
                            onClick: ({ key }) => {
                                if (key === "viewAll") {
                                    navigate("/admin/roles-and-permissions");
                                }
                            },
                        }}
                        className="!rounded-b-none"
                        trigger={["click"]}
                    >
                        <a className="!relative" onClick={(e) => e.preventDefault()}>
                            <button className="action-btn group bg-[#005555]/10 hover:bg-[#005555]/15">
                                <MdOutlineNotifications size={21} className="action-text" />
                            </button>
                        </a>
                    </Dropdown>

                    <Dropdown
                        menu={{
                            items: dropDownItems(user as any),
                            onClick: handleMenuClick,
                        }}
                    >
                        <a className="text-sm cursor-pointer" onClick={(e) => e.preventDefault()}>
                            <Space>
                                <div className="relative z-10 block w-8 h-8 overflow-hidden rounded-full shadow focus:outline-none">
                                    <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="user-profile" />
                                </div>
                                <div className="hidden md:flex items-center text-center gap-2">
                                    <p className="!m-0 w-max">{displayName}</p>
                                    <DownOutlined />
                                </div>
                            </Space>
                        </a>
                    </Dropdown>
                </div>
            </div>
        </header>
    );
}
