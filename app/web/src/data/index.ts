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
    FiGrid
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
import { PERMISSIONS } from "@/data/permissions";

const P = PERMISSIONS;

export const getMenuItems = (basePath: string): TMenuBlock[] => [
    {
        title: "Main",
        menu: [
            {
                label: "Home",
                icon: FiHome,
                href: "/",
            },
            {
                label: "Dashboard",
                icon: FiGrid,
                href: `${basePath}/dashboard`,
                permission: P.VIEW_DASHBOARD,
            },
            {
                label: "User Managment",
                icon: FiUsers,
                href: `${basePath}/user/all`,
                permission: P.VIEW_USERS,
            },
            {
                label: "Roles",
                icon: FiUserCheck,
                href: `${basePath}/access/roles`,
                permission: P.VIEW_ROLES,
            },
        ],
    },
    {
        title: "Reports",
        menu: [
            {
                label: "Product Revenue",
                icon: FiBarChart2,
                href: `${basePath}/reports/product-revenue`,
                permission: P.VIEW_REPORTS,
            },
        ],
    },
    {
        title: "Inventory",
        menu: [
            {
                label: "Category",
                icon: FiBarChart2,
                href: `${basePath}/category/all`,
                permission: P.VIEW_CATEGORIES,
            },
            {
                label: "Supplier",
                icon: FiTruck,
                permission: P.VIEW_SUPPLIERS,
                submenu: [
                    {
                        label: "All Supplier",
                        icon: FiUsers,
                        href: `${basePath}/supplier/all`,
                        permission: P.VIEW_SUPPLIERS,
                    },
                    {
                        label: "Create Supplier",
                        icon: FiEdit,
                        href: `${basePath}/supplier/create`,
                        permission: P.CREATE_SUPPLIERS,
                    },
                ],
            },
            {
                label: "Product",
                icon: FiBox,
                permission: P.VIEW_PRODUCTS,
                submenu: [
                    {
                        label: "All Products",
                        icon: FiFileText,
                        href: `${basePath}/product/all`,
                        permission: P.VIEW_PRODUCTS,
                    },
                    {
                        label: "Add Product",
                        icon: FiEdit,
                        href: `${basePath}/product/create`,
                        permission: P.CREATE_PRODUCTS,
                    },
                ],
            },
            {
                label: "Stock",
                icon: FiActivity,
                permission: P.VIEW_STOCK,
                submenu: [
                    {
                        label: "Low Stock",
                        icon: FiUsers,
                        href: `${basePath}/activity-products/low-stock`,
                        permission: P.VIEW_STOCK,
                    },
                    {
                        label: "Out of Stock",
                        icon: MdOutlineDirectionsOff,
                        href: `${basePath}/activity-products/out-of-stock`,
                        permission: P.VIEW_STOCK,
                    },
                ],
            },
            {
                label: "Expired Products",
                icon: IoIosInformationCircleOutline,
                href: `${basePath}/activity-products/expired-products`,
                permission: P.VIEW_STOCK,
            },
            {
                label: "Sellable Products",
                icon: AiOutlineProduct,
                href: `${basePath}/activity-products/sellable-products`,
                permission: P.VIEW_STOCK,
            },
        ],
    },
    {
        title: "Purchase",
        menu: [
            {
                label: "purchase",
                icon: FiShoppingCart,
                href: `${basePath}/purchase/all`,
                permission: P.VIEW_PURCHASES,
            },
            {
                label: "Purchase Order",
                icon: FiClipboard,
                href: `${basePath}/purchase-order`,
                permission: P.VIEW_PURCHASES,
            },
            {
                label: "Purchase Return",
                icon: FiRotateCcw,
                href: `${basePath}/purchase-return`,
                permission: P.VIEW_PURCHASE_RETURNS,
            },
        ],
    },
    {
        title: "Sales",
        menu: [
            {
                label: "Sales Records",
                icon: FaDolly,
                href: `${basePath}/sales/all`,
                permission: P.VIEW_SALES,
            },
            {
                label: "POS (Point of Sale)",
                icon: MdOutlineLaptopChromebook,
                href: `${basePath}/pos/create`,
                permission: P.CREATE_POS,
            },
        ],
    },
    {
        title: "User & Access",
        menu: [
            {
                label: "Customers",
                icon: FiUsers,
                href: `${basePath}/customer/all`,
                permission: P.VIEW_CUSTOMERS,
            },
            {
                label: "Invoice",
                icon: MdLineAxis,
                href: `${basePath}/invoice/all`,
                permission: P.VIEW_INVOICES,
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
