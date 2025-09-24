import {
  FiHome,
  FiEdit,
  FiUsers,
  FiUserCheck,
  FiFileText,
  FiShoppingCart,
  FiBarChart2,
  FiBox,
  FiTruck,
  FiClipboard,
  FiRotateCcw,
  FiActivity,
} from "react-icons/fi";
import { FaDolly } from "react-icons/fa";
import {
  MdLineAxis,
  MdOutlineDirectionsOff,
  MdOutlineLaptopChromebook,
} from "react-icons/md";
import { AiOutlineProduct } from "react-icons/ai";
import type { TMenuBlock } from "@/interface/menu-and-common";
import type { TPOSOrderPayload, TNotifications } from "@/interface/common";
import { IoIosInformationCircleOutline } from "react-icons/io";

export const adminMenuItems: TMenuBlock[] = [
  {
    title: "Main",
    menu: [
      {
        label: "Dashboard",
        icon: FiHome,
        href: "/admin/dashboard",
      },
      {
        label: "User Managment",
        icon: FiUsers,
        href: "/admin/user/all",
      },
      {
        label: "Roles",
        icon: FiUserCheck,
        href: "/admin/access/roles",
      },
    ],
  },
  // {
  //   title: "security",
  //   menu: [
  //     {
  //       label: "Access",
  //       icon: FiBox,
  //       submenu: [
  //         {
  //           label: "Roles",
  //           icon: FiUserCheck,
  //           href: "/admin/access/roles",
  //         },
  //         {
  //           label: "Roles & Permissions",
  //           icon: FiUserCheck,
  //           href: "/admin/access/roles-and-permissions",
  //         },
  //       ],
  //     },
  //     {
  //       label: "Stock",
  //       icon: FiActivity,
  //       submenu: [
  //         {
  //           label: "Low Stock",
  //           icon: FiUsers,
  //           href: "/admin/low-stock",
  //         },
  //         {
  //           label: "Out of Stock",
  //           icon: MdOutlineDirectionsOff,
  //           href: "/admin/out-of-stock",
  //         },
  //       ],
  //     },
  //   ],
  // },
  {
    title: "Inventory",
    menu: [
      {
        label: "Category",
        icon: FiBarChart2,
        href: "/admin/category/all",
      },
      {
        label: "Supplier",
        icon: FiTruck,
        submenu: [
          {
            label: "All Supplier",
            icon: FiUsers,
            href: "/admin/supplier/all",
          },
          {
            label: "Create Supplier",
            icon: FiEdit,
            href: "/admin/supplier/create",
          },
        ],
      },
      {
        label: "Product",
        icon: FiBox,
        submenu: [
          {
            label: "All Products",
            icon: FiFileText,
            href: "/admin/product/all",
          },
          {
            label: "Add Product",
            icon: FiEdit,
            href: "/admin/product/create",
          },
        ],
      },
      {
        label: "Stock",
        icon: FiActivity,
        submenu: [
          {
            label: "Low Stock",
            icon: FiUsers,
            href: "/admin/activity-products/low-stock",
          },
          {
            label: "Out of Stock",
            icon: MdOutlineDirectionsOff,
            href: "/admin/activity-products/out-of-stock",
          },
        ],
      },
      {
        label: "Expired Products",
        icon: IoIosInformationCircleOutline,
        href: "/admin/activity-products/expired-products",
      },
      {
        label: "Sellable Products",
        icon: AiOutlineProduct,
        href: "/admin/activity-products/sellable-products",
      },
    ],
  },
  {
    title: "Purchase",
    menu: [
      {
        label: "purchase",
        icon: FiShoppingCart,
        href: "/admin/purchase/all",
      },
      {
        label: "Purchase Order",
        icon: FiClipboard,
        href: "/admin/purchase-order",
      },
      {
        label: "Purchase Return",
        icon: FiRotateCcw,
        href: "/admin/purchase-return",
      },
    ],
  },
  {
    title: "Sales",
    menu: [
      {
        label: "Sales Records",
        icon: FaDolly,
        href: "/admin/sales/all",
      },
      {
        label: "POS (Point of Sale)",
        icon: MdOutlineLaptopChromebook,
        href: "/admin/pos/create",
      },
    ],
  },
  {
    title: "User & Access",
    menu: [
      {
        label: "Customers",
        icon: FiUsers,
        href: "/admin/customer/all",
      },
      {
        label: "Invoice",
        icon: MdLineAxis,
        href: "/admin/invoice/all",
      },
    ],
  },
];

export const demoPOSOrders: TPOSOrderPayload[] = [
  {
    id: 1,
    billerName: "Main POS",
    customerName: "Test Customer 1",
    customerPhone: "01700000001",
    items: [
      {
        productId: 101,
        quantity: 2,
        unitPrice: 500,
        discountAmount: 0,
        taxPercent: 5,
      },
      {
        productId: 102,
        quantity: 1,
        unitPrice: 1200,
        discountAmount: 100,
        taxPercent: 0,
      },
    ],
    discountType: "none",
    orderTaxPercent: 0,
    shippingCharge: 0,
    payments: [{ amount: 1500, method: "cash" }],
    notes: "POS sale",
    createdAt: "2025-08-24T08:00:00Z",
    updatedAt: "2025-08-24T08:00:00Z",
  },
  {
    id: 2,
    billerName: "Main POS",
    customerName: "Test Customer 2",
    customerPhone: "01700000002",
    items: [
      {
        productId: 103,
        quantity: 1,
        unitPrice: 800,
        discountAmount: 50,
        taxPercent: 5,
      },
      {
        productId: 104,
        quantity: 3,
        unitPrice: 300,
        discountAmount: 0,
        taxPercent: 0,
      },
    ],
    discountType: "percent",
    orderTaxPercent: 5,
    shippingCharge: 20,
    payments: [{ amount: 1500, method: "card" }],
    notes: "POS sale",
    createdAt: "2025-08-24T09:00:00Z",
    updatedAt: "2025-08-24T09:00:00Z",
  },
  {
    id: 3,
    billerName: "Secondary POS",
    customerName: "Test Customer 3",
    customerPhone: "01700000003",
    items: [
      {
        productId: 105,
        quantity: 2,
        unitPrice: 400,
        discountAmount: 20,
        taxPercent: 10,
      },
    ],
    discountType: "fixed",
    orderTaxPercent: 10,
    shippingCharge: 10,
    payments: [{ amount: 800, method: "cash" }],
    notes: "POS sale",
    createdAt: "2025-08-24T10:00:00Z",
    updatedAt: "2025-08-24T10:00:00Z",
  },
  {
    id: 4,
    billerName: "Main POS",
    customerName: "Test Customer 4",
    customerPhone: "01700000004",
    items: [
      {
        productId: 106,
        quantity: 5,
        unitPrice: 200,
        discountAmount: 0,
        taxPercent: 5,
      },
    ],
    discountType: "none",
    orderTaxPercent: 0,
    shippingCharge: 5,
    payments: [{ amount: 1000, method: "cash" }],
    notes: "POS sale",
    createdAt: "2025-08-24T11:00:00Z",
    updatedAt: "2025-08-24T11:00:00Z",
  },
  {
    id: 5,
    billerName: "Secondary POS",
    customerName: "Test Customer 5",
    customerPhone: "01700000005",
    items: [
      {
        productId: 107,
        quantity: 1,
        unitPrice: 1500,
        discountAmount: 200,
        taxPercent: 0,
      },
    ],
    discountType: "percent",
    orderTaxPercent: 0,
    shippingCharge: 0,
    payments: [{ amount: 1300, method: "card" }],
    notes: "POS sale",
    createdAt: "2025-08-24T12:00:00Z",
    updatedAt: "2025-08-24T12:00:00Z",
  },
  {
    id: 6,
    billerName: "Main POS",
    customerName: "Test Customer 6",
    customerPhone: "01700000006",
    items: [
      {
        productId: 108,
        quantity: 2,
        unitPrice: 750,
        discountAmount: 50,
        taxPercent: 5,
      },
    ],
    discountType: "fixed",
    orderTaxPercent: 5,
    shippingCharge: 15,
    payments: [{ amount: 1450, method: "cash" }],
    notes: "POS sale",
    createdAt: "2025-08-24T13:00:00Z",
    updatedAt: "2025-08-24T13:00:00Z",
  },
  {
    id: 7,
    billerName: "Secondary POS",
    customerName: "Test Customer 7",
    customerPhone: "01700000007",
    items: [
      {
        productId: 109,
        quantity: 3,
        unitPrice: 600,
        discountAmount: 0,
        taxPercent: 5,
      },
    ],
    discountType: "none",
    orderTaxPercent: 5,
    shippingCharge: 10,
    payments: [{ amount: 1800, method: "card" }],
    notes: "POS sale",
    createdAt: "2025-08-24T14:00:00Z",
    updatedAt: "2025-08-24T14:00:00Z",
  },
  {
    id: 8,
    billerName: "Main POS",
    customerName: "Test Customer 8",
    customerPhone: "01700000008",
    items: [
      {
        productId: 110,
        quantity: 1,
        unitPrice: 1200,
        discountAmount: 100,
        taxPercent: 0,
      },
    ],
    discountType: "percent",
    orderTaxPercent: 0,
    shippingCharge: 5,
    payments: [{ amount: 1100, method: "cash" }],
    notes: "POS sale",
    createdAt: "2025-08-24T15:00:00Z",
    updatedAt: "2025-08-24T15:00:00Z",
  },
  {
    id: 9,
    billerName: "Secondary POS",
    customerName: "Test Customer 9",
    customerPhone: "01700000009",
    items: [
      {
        productId: 111,
        quantity: 4,
        unitPrice: 300,
        discountAmount: 0,
        taxPercent: 5,
      },
    ],
    discountType: "none",
    orderTaxPercent: 5,
    shippingCharge: 0,
    payments: [{ amount: 1200, method: "card" }],
    notes: "POS sale",
    createdAt: "2025-08-24T16:00:00Z",
    updatedAt: "2025-08-24T16:00:00Z",
  },
  {
    id: 10,
    billerName: "Main POS",
    customerName: "Test Customer 10",
    customerPhone: "01700000010",
    items: [
      {
        productId: 112,
        quantity: 2,
        unitPrice: 900,
        discountAmount: 50,
        taxPercent: 5,
      },
    ],
    discountType: "fixed",
    orderTaxPercent: 5,
    shippingCharge: 10,
    payments: [{ amount: 1750, method: "cash" }],
    notes: "POS sale",
    createdAt: "2025-08-24T17:00:00Z",
    updatedAt: "2025-08-24T17:00:00Z",
  },
];

export const demoNotifications: TNotifications[] = [
  {
    id: 5,
    subject: "New Message from John",
    createdAt: "2025-09-03T14:30:00Z",
  },
  {
    id: 6,
    subject: "Server Maintenance Alert",
    createdAt: "2025-09-03T14:25:00Z",
  },
  {
    id: 7,
    subject: "Weekly Report Ready",
    createdAt: "2025-09-03T14:20:00Z",
  },
  {
    id: 8,
    subject: "Password Change Confirmation",
    createdAt: "2025-09-03T14:15:00Z",
  },
  {
    id: 9,
    subject: "New Comment on Your Post",
    createdAt: "2025-09-03T14:10:00Z",
  },
  {
    id: 10,
    subject: "Subscription Renewal Reminder",
    createdAt: "2025-09-03T14:05:00Z",
  },
  {
    id: 11,
    subject: "Meeting Scheduled with Team",
    createdAt: "2025-09-03T14:00:00Z",
  },
  {
    id: 12,
    subject: "New Friend Request",
    createdAt: "2025-09-03T13:55:00Z",
  },
  {
    id: 13,
    subject: "System Update Available",
    createdAt: "2025-09-03T13:50:00Z",
  },
  {
    id: 14,
    subject: "Invoice Paid Successfully",
    createdAt: "2025-09-03T13:45:00Z",
  },
];
