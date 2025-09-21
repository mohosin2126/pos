import { SpinProps } from "antd";

// for common hooks
export interface TOption {
  label: string;
  value: string | number;
}

export interface TUseOptionResult<T extends TOption> {
  data: T[];
  loading: boolean;
  refetch: () => Promise<void>;
}

// for user management

// Payload for creating/updating a user
export interface TUserPayload {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  allowLogin: boolean;
  username: string;
  password?: string;
  role: string;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  bloodGroup?: string;
  mobileNumber?: string;
  permanentAddress?: string;
  currentAddress?: string;
  accountHolderName?: string;
  accountNumber?: string;
  bankName?: string;
  bankIdentifierCode?: string;
  branch?: string;
  taxPayerId?: string;
  alternateContactNumber?: string;
  familyContactNumber?: string;
  socialMedia1?: string;
  guardianName?: string;
  profilePic?: string;
}

// for supplier
export interface TSupplierPayload {
  id?: number;
  supplierCode?: string;
  companyName: string;
  contactPersonName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  website: string;
  taxId: string;
  bankDetails: string;
  paymentTerms: string;
  notes?: string;
  status: "active" | "inactive";
}

// for categories
export interface TCategoryPayload {
  id?: number;
  name?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// for product
export interface Category {
  name: string;
  description: string;
}
export interface TProductPayload {
  id?: number;
  name?: string;
  description?: string;
  categoryId?: number;
  category?: Category;
  sku?: string;
  barcode?: string;
  stockQuantity?: number;
  reorderLevel?: number;
  isTrackStock?: boolean;
  imageUrl?: string;
  status?: "active" | "inactive";
  tags?: string;
  createdBy?: number;
  updatedBy?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

// for purchase

export interface TAdditionalExpense {
  name: string;
  amount: number;
}

export interface TPurchasePayload {
  supplierId: number;
  supplierAddress: string;
  referenceNo: string;
  purchaseDate: string; // ISO string
  status: "ordered" | "received" | "pending" | "cancelled";
  productId: number;
  payTermValue: number;
  payTermUnit: "days" | "weeks" | "months";
  discountType: "percent" | "fixed";
  discountAmount: number;
  orderTaxPercent: number;
  orderTaxAmount: number;
  shippingCharge: number;
  additionalExpenses: TAdditionalExpense[];
  totalItems: number;
  netTotalAmount: number;
  totalAmount: number;
  amountPaid: number;
  notes?: string;
  warrantyValue?: number;
  warrantyUnit?: string;
  expiryDate?: string;
  shippingDetails?: string;
}

export interface TPOSItem {
  productId: number;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  taxPercent: number;
}

export interface TPOSPayment {
  amount: number;
  method: string;
}

export interface TPOSOrderPayload {
  id: number;
  billerName: string;
  customerName: string;
  customerPhone: string;
  items: TPOSItem[];
  discountType: "none" | "percent" | "fixed";
  orderTaxPercent: number;
  shippingCharge: number;
  payments: TPOSPayment[];
  notes?: string;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}

export type TInvoiceStatus = "issued" | "paid" | "void";

export interface TInvoice {
  id: number;
  saleId: number;
  customerId: number;
  invoiceNo?: string;
  invoiceDate?: string;
  dueDate: string | null;
  subTotal: string;
  discountAmount: string;
  orderTaxAmount: string;
  shippingCharge: string;
  totalAmount: string;
  amountPaid: string;
  balanceDue: string;
  status: "issued" | "paid" | "overdue" | string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TCustomer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  status: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}

export interface TAllocation {
  qty: number;
  expiryDate: string;
}
export interface TSaleItem {
  id: number;
  saleId: number;
  productId: number;
  quantity: string;
  unitPrice: string;
  discountType: string;
  discountAmount: string;
  taxPercent: string;
  taxAmount: string;
  lineTotal: string;
  allocations: TAllocation[];
  createdAt: string;
  updatedAt: string;
  product: TProductPayload;
}

export interface TMetaInfo {
  cashier: string;
  channel: string;
}

export interface TSaleProps {
  id: number;
  referenceNo: string;
  saleDate: string;
  status: string;
  discountType: string;
  discountAmount: string;
  orderTaxPercent: string;
  orderTaxAmount: string;
  shippingCharge: string;
  totalItems: string;
  netTotalAmount: string;
  totalAmount: string;
  amountPaid: string;
  notes: string;
  meta: TMetaInfo;
  customerId: number;
  createdAt: string;
  updatedAt: string;
  items?: TSaleItem[];
  customer?: TCustomer;
  invoice?: TInvoice;
}

export interface TActivityProduct {
  product: TProductPayload;
  unexpiredQty: string;
}

export interface TNotifications {
  id: number;
  subject: string;
  createdAt: string;
}

export interface TUseUsersResult {
  users?: TUserPayload[];
  refetch?: () => Promise<void>;
  loading?: boolean;
}

export interface TPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasPrev: boolean;
  hasNext: boolean;
}
// customer

export interface TCustomer {
  id: number;
  name: string;
  phone: string;
  email: string;
  address?: string;
  status: "active" | "inactive";
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}
// api response

export interface TUsersApiResponse {
  success?: boolean;
  message?: string;
  data?: TUserPayload[];
  pagination?: TPagination;
}

export interface TSuppliersApiResponse {
  success: boolean;
  message: string;
  data: TSupplierPayload[];
  pagination: TPagination;
}

export interface TCustomerResponse {
  success: boolean;
  message: string;
  data: TCustomer[];
  pagination: TPagination;
}

export interface TInvoiceResponse {
  success: boolean;
  message: string;
  data: TInvoice[];
  pagination: TPagination;
}

export type LoaderProps = {
  loading: boolean | SpinProps;
};

export type CartItem = {
  barcode: string;
  category?: string;
  discount: number;
  id: number;
  name: string;
  price: number;
  productId: number;
  quantity: number;
  tax: number;
};
