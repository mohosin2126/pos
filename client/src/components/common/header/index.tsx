import { Link } from "react-router-dom";
import bangladesh from "@/assets/flag/bangladesh.webp";
import usa from "@/assets/flag/usa.png";
import china from "@/assets/flag/china.png";
import saudi from "@/assets/flag/saudi.png";
import dayjs from "dayjs";
import type { MenuProps } from "antd";
import { TNotifications } from "@/interface/common";
import { TDemoUser, TLang } from "@/interface/menu-and-common";

export const notificationItems = (
  emails?: TNotifications[]
): MenuProps["items"] => {
  const items: MenuProps["items"] =
    emails?.slice(0, 6).map((item, idx) => ({
      key: item.id || idx,
      label: (
        <div className="flex items-center gap-2 space-y-2">
          <div className="relative w-8 h-8 overflow-hidden rounded-full shadow">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              alt="avatar"
              className="w-full h-full"
            />
          </div>
          <div>
            <p className="text-sm font-medium !m-0">
              {item.subject || "Unknown"}
            </p>
            <p className="text-xs opacity-55 !m-0">
              {item.createdAt
                ? dayjs(item.createdAt).format("MMM D, YYYY h:mm A")
                : "Unknown date"}
            </p>
          </div>
        </div>
      ),
    })) || [];

  items.push({
    key: "viewAll",
    label: (
      <div className="text-center text-[#005555] border-t border-t-[#f0f0f0] pt-1">
        View All
      </div>
    ),
  });

  return items;
};

export const dropDownItems = (user?: TDemoUser): MenuProps["items"] => [
  {
    label: (
      <>
        <div className="capitalize">
          {user?.firstName + " " + user?.lastName}
        </div>
        <div>{user?.email}</div>
      </>
    ),
    key: "custom",
    disabled: true,
  },
  {
    type: "divider" as const,
  },
  {
    label: <Link to="/admin/settings/view-profile">Profile</Link>,
    key: "0",
  },
  {
    label: <Link to="/">Home</Link>,
    key: "1",
  },
  {
    label: <Link to="#">Settings</Link>,
    key: "2",
  },
  {
    label: "Logout",
    key: "logout",
    danger: true,
  },
];

export const languageItems = (
  setSelectedLang: (lang: TLang) => void
): MenuProps["items"] => [
  {
    label: (
      <div className="flex items-center gap-2 !m-0">
        <img
          src={usa}
          alt="flag"
          className="w-5 h-5 rounded-full object-cover"
        />
        <p className="!m-0">English</p>
      </div>
    ),
    key: "en",
    onClick: () =>
      setSelectedLang({
        key: "en",
        label: "English",
        flag: usa,
      }),
  },
  {
    label: (
      <div className="flex items-center gap-2">
        <img
          src={bangladesh}
          alt="flag"
          className="w-5 h-5 rounded-full object-cover"
        />
        <p className="!m-0">Bangla</p>
      </div>
    ),
    key: "bn",
    onClick: () =>
      setSelectedLang({
        key: "bn",
        label: "Bangla",
        flag: bangladesh,
      }),
  },

  {
    label: (
      <div className="flex items-center gap-2">
        <img
          src={china}
          alt="flag"
          className="w-5 h-5 rounded-full object-cover"
        />
        <p className="!m-0">China</p>
      </div>
    ),
    key: "cn",
    onClick: () =>
      setSelectedLang({
        key: "cn",
        label: "China",
        flag: china,
      }),
  },
  {
    label: (
      <div className="flex items-center gap-2">
        <img
          src={saudi}
          alt="flag"
          className="w-5 h-5 rounded-full object-cover"
        />
        <p className="!m-0"> Saudi Arab</p>
      </div>
    ),
    key: "sa",
    onClick: () =>
      setSelectedLang({
        key: "sa",
        label: "Saudi Arab",
        flag: saudi,
      }),
  },
];
