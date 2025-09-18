import { Link, useNavigate } from "react-router-dom";
import { DashboardTitle } from "@/components/re-useable/dashboard-titile";
import ToolbarButton from "@/components/re-useable/toolbar-button";
import { Button, Card, Divider, Form, Input, message, Modal } from "antd";
import { MdAddCircleOutline, MdStore } from "react-icons/md";
import { useEffect, useRef, useState } from "react";
import type { TPOSOrderPayload } from "@/interface/common";
import { demoPOSOrders } from "@/data";
import { useCategories } from "@/hooks/admin/categories";
import {
  FaBarcode,
  FaCalculator,
  FaCreditCard,
  FaMinus,
  FaMoneyBillWave,
  FaPhone,
  FaPlus,
  FaPrint,
  FaQrcode,
  FaReceipt,
  FaShoppingCart,
  FaTrash,
  FaUser,
} from "react-icons/fa";
import { useProducts } from "@/hooks/admin/products";
import { useCreateSale, useSales } from "@/hooks/admin/sales";
import CustomModal from "@/components/modal";
import POSForm from "../create";
import { CustomInput } from "@/components/form";
import { generateReferenceNo } from "@/utils/generate-ref";

const { Search } = Input;

// Mock product data for demonstration
const mockProducts = [
  {
    id: 101,
    name: "Coca Cola 500ml",
    price: 25,
    barcode: "1234567890123",
    category: "Beverages",
    stock: 100,
  },
  {
    id: 102,
    name: "Lays Chips 50g",
    price: 30,
    barcode: "1234567890124",
    category: "Snacks",
    stock: 50,
  },
  {
    id: 103,
    name: "Bread Loaf",
    price: 40,
    barcode: "1234567890125",
    category: "Bakery",
    stock: 25,
  },
  {
    id: 104,
    name: "Milk 1L",
    price: 60,
    barcode: "1234567890126",
    category: "Dairy",
    stock: 30,
  },
  {
    id: 105,
    name: "Rice 1kg",
    price: 80,
    barcode: "1234567890127",
    category: "Grains",
    stock: 40,
  },
  {
    id: 106,
    name: "Chicken 1kg",
    price: 200,
    barcode: "1234567890128",
    category: "Meat",
    stock: 15,
  },
  {
    id: 107,
    name: "Apple 1kg",
    price: 120,
    barcode: "1234567890129",
    category: "Fruits",
    stock: 20,
  },
  {
    id: 108,
    name: "Onion 1kg",
    price: 35,
    barcode: "1234567890130",
    category: "Vegetables",
    stock: 35,
  },
];

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

export type PayloadItem = {
  productId: number;
  quantity: number;
  unitPrice: number;
  discountType: "none" | "percentage" | "fixed";
  discountAmount: number;
  taxPercent: number;
};

export default function AllPos() {
  const [data, setData] = useState<TPOSOrderPayload[]>(demoPOSOrders);
  const { categories } = useCategories();
  const [loading, setLoading] = useState<boolean>(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [barcodeInput, setBarcodeInput] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showInvoice, setShowInvoice] = useState<boolean>(false);
  const [orderNumber, setOrderNumber] = useState<string>(`ORD-${Date.now()}`);
  const { createSale } = useCreateSale();

  const barcodeInputRef = useRef<any>(null);
  // const { products } = useProducts();

  const [posAddress, setPosAddress] = useState<any | null>(null);

  const [isOpen, setIsOpen] = useState(false);

  const { sales } = useSales();

  console.log("product data : ", cartItems);

  // Focus barcode input on component mount
  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

  // Handle barcode scanning
  const handleBarcodeScan = (barcode: string) => {
    const product = mockProducts.find((p) => p.barcode === barcode);
    if (product) {
      addToCart(product);
      setBarcodeInput("");
      message.success(`${product.name} added to cart`);
    } else {
      message.error("Product not found");
    }
  };

  // Add product to cart
  const addToCart = (item: any) => {
    const existingItem = cartItems?.find((cart) => cart?.id === item?.id);

    if (existingItem) {
      setCartItems((prev) =>
        prev.map((cart) =>
          cart.id === item?.id
            ? { ...cart, quantity: cart?.quantity + 1 }
            : cart
        )
      );
    } else {
      setCartItems((prev) => [
        ...prev,
        {
          id: item.id,
          productId: item.product.id,
          name: item.product.name,
          price: Number(item.unitPrice),
          quantity: 1,
          barcode: item.product.barcode,
          category: item.product.category,
          discount: Number(item.discountAmount) || 0,
          tax: Number(item.taxPercent) || 0, //
        },
      ]);
    }
  };

  // Update cart item quantity
  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== id));
    } else {
      setCartItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    }
  };

  // Remove item from cart
  const removeFromCart = (id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const totalDiscount = cartItems.reduce(
      (sum, item) => sum + item.discount,
      0
    );
    const totalTax = cartItems.reduce(
      (sum, item) =>
        sum + ((item.price * item.quantity - item.discount) * item.tax) / 100,
      0
    );
    const total = subtotal - totalDiscount + totalTax;

    return { subtotal, totalDiscount, totalTax, total };
  };

  // Place order
  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      message.error("Please add items to cart");
      return;
    }

    if (!customerName.trim()) {
      message.error("Please enter customer name");
      return;
    }
    if (!posAddress) {
      message.error(
        "Please fill the information.\nClick the Add More Information button"
      );
      return;
    }
    setLoading(true);
    try {
      const totals = calculateTotals();
      const orderData = {
        referenceNo: generateReferenceNo(),
        saleDate: new Date().toISOString(),
        status: "completed",
        discountType: posAddress?.discountType || "none",
        discountAmount: posAddress?.discountAmount || 0,
        orderTaxPercent: posAddress?.orderTaxPercent || 0,
        orderTaxAmount: posAddress?.orderTaxAmount || 0,
        shippingCharge: posAddress?.shippingCharge || 0,
        amountPaid: totals?.total || 0,
        notes: posAddress?.notes || "Walk-in customer",
        // orderNumber,
        customer: {
          name: customerName,
          phone: customerPhone || "N/A",
          email: posAddress?.email || "N/A",
          address: posAddress?.address || "N/A",
          status: "active",
          notes: "First time buyer",
        },
        items: cartItems.map((item: CartItem) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.price,
          discountType: "none",
          discountAmount: item.discount,
          taxPercent: item.tax,
        })),
        // paymentMethod,
        // billerName: "Main POS",
      };
      const result = await createSale(orderData);
      // console.log("Order placed:", orderData);
      if (result?.success) {
        message.success("Order placed successfully!");
        setShowInvoice(true);
      }
    } catch (error) {
      console.error(error);
      message.error("Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  // Print invoice
  const handlePrintInvoice = () => {
    window.print();
  };

  // Extract items with product
  const allItems = sales?.flatMap((sale) => sale?.items) || [];

  // Filter items (check product fields)
  const filteredProducts = allItems.filter((item) => {
    const matchesSearch =
      ((item?.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        false) ||
        item?.product?.barcode?.includes(searchTerm)) ??
      false;

    return matchesSearch;
  });

  const totals = calculateTotals();

  // console.log("pos address :", posAddress);

  return (
    <div className="space-y-6">
      <DashboardTitle
        title="POS (Point of Sale) Orders"
        description="Manage and track all POS sales in one place"
      />
      <Card bodyStyle={{ padding: "0px 14px 14px" }}>
        <div className="flex-1 flex overflow-hidden">
          <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FaBarcode />
                Barcode Scanner
              </h3>
              <Search
                ref={barcodeInputRef}
                placeholder="Scan or enter barcode..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onSearch={handleBarcodeScan}
                enterButton={<FaQrcode />}
                className="mb-3"
              />
            </div>

            <div className="p-4 border-b border-gray-200">
              <Search
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-2">
                {filteredProducts.map((product) => (
                  <Card
                    key={product?.id}
                    size="small"
                    className="cursor-pointer hover:shadow-md transition-shadow !mb-3"
                    onClick={() => addToCart(product)}
                  >
                    <div className="flex products-center justify-between">
                      <div>
                        <Link
                          className="!w-max"
                          to={`/admin/sales/view/${product?.product.id}`}
                        >
                          <div className="font-medium text-sm !w-max">
                            {product?.product?.name}
                          </div>
                        </Link>

                        <div className="text-xs text-gray-500">
                          {product?.product?.category?.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          Stock: {product?.product?.stockQuantity}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          ৳{product?.unitPrice}
                        </div>
                        <div className="text-xs text-gray-400">
                          {product?.product.barcode}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <FaShoppingCart />
                Shopping Cart ({cartItems.length} items)
              </h3>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              {cartItems.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FaShoppingCart className="text-4xl mx-auto mb-4" />
                  <p>No items in cart</p>
                  <p className="text-sm">Scan or search products to add them</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <Card key={item.id} size="small" className="!mb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-500">
                            {item.category}
                          </div>
                          <div className="text-xs text-gray-400">
                            ৳{item.price} each
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="small"
                            icon={<FaMinus />}
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                          />
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            size="small"
                            icon={<FaPlus />}
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                          />
                        </div>

                        <div className="text-right ml-4">
                          <div className="font-bold">
                            ৳{(item.price * item.quantity).toFixed(2)}
                          </div>
                          <Button
                            size="small"
                            danger
                            icon={<FaTrash />}
                            onClick={() => removeFromCart(item.id)}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="w-1/3 bg-white flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FaUser />
                Customer Information
              </h3>
              <div className="space-y-3">
                <Input
                  placeholder="Enter customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  prefix={<FaUser className="text-gray-400" />}
                  className="w-full"
                />
                <Input
                  placeholder="Enter phone number (optional)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  prefix={<FaPhone className="text-gray-400" />}
                  className="w-full"
                />
                <Button className="outlet-btn" onClick={() => setIsOpen(true)}>
                  Add More Information
                </Button>
                {!posAddress && (
                  <p className="text-red-500 mt-2 text-sm">
                    you have need to fill up more information, please add
                    information.
                  </p>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FaCreditCard />
                Payment Method
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type={paymentMethod === "cash" ? "primary" : "default"}
                  icon={<FaMoneyBillWave />}
                  onClick={() => setPaymentMethod("cash")}
                  className={`${
                    paymentMethod === "cash"
                      ? "primary"
                      : "!border hover:!border-[#186566] hover:!text-[#186566]"
                  }  h-12 `}
                >
                  Cash
                </Button>
                <Button
                  type={paymentMethod === "card" ? "primary" : "default"}
                  icon={<FaCreditCard />}
                  onClick={() => setPaymentMethod("card")}
                  className={`${
                    paymentMethod === "card"
                      ? "primary"
                      : "!border hover:!border-[#186566] hover:!text-[#186566]"
                  }  h-12 `}
                >
                  Card
                </Button>
                <Button
                  type={paymentMethod === "online" ? "primary" : "default"}
                  icon={<FaQrcode />}
                  onClick={() => setPaymentMethod("online")}
                  className={`${
                    paymentMethod === "online"
                      ? "primary"
                      : "!border hover:!border-[#186566] hover:!text-[#186566]"
                  }  h-12 `}
                >
                  Online Pay
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="flex-1 p-4 flex flex-col">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FaCalculator />
                Order Summary
              </h3>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>৳{totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Discount:</span>
                  <span>-৳{totals.totalDiscount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>৳{totals.totalTax.toFixed(2)}</span>
                </div>
                <Divider className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>৳{totals.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-auto space-y-3">
                <Button
                  type="primary"
                  size="large"
                  icon={<FaReceipt />}
                  onClick={handlePlaceOrder}
                  loading={loading}
                  disabled={cartItems.length === 0}
                  className="w-full h-12"
                >
                  Place Order
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal */}
        <CustomModal
          isOpen={isOpen}
          setIsOpen={() => setIsOpen(false)}
          title="Add Your Information"
          description="Add a new category to organize and manage your items effectively."
          width="560px"
        >
          <POSForm setPosAddress={setPosAddress} setIsOpen={setIsOpen} />
        </CustomModal>

        {/* Invoice Modal */}
        <Modal
          title="Invoice"
          open={showInvoice}
          onCancel={() => setShowInvoice(false)}
          footer={[
            <Button key="print" icon={<FaPrint />} onClick={handlePrintInvoice}>
              Print
            </Button>,
            <Button key="close" onClick={() => setShowInvoice(false)}>
              Close
            </Button>,
          ]}
          width={600}
        >
          <div className="invoice-content">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">SuperShop</h2>
              <p className="text-gray-600">123 Main Street, City, Country</p>
              <p className="text-gray-600">Phone: +1234567890</p>
            </div>

            <Divider />

            <div className="mb-4">
              <div className="flex justify-between">
                <span>Order #: {orderNumber}</span>
                <span>Date: {new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Time: {new Date().toLocaleTimeString()}</span>
                <span>Cashier: Admin</span>
              </div>
            </div>

            <Divider />

            <div className="mb-4">
              <h4 className="font-semibold">Customer:</h4>
              <p>{customerName || "Walk-in Customer"}</p>
              <p>{customerPhone || "N/A"}</p>
            </div>

            <Divider />

            <div className="mb-4">
              <h4 className="font-semibold">Items:</h4>
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.name} x{item.quantity}
                  </span>
                  <span>৳{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <Divider />

            <div className="text-right">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>৳{totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>-৳{totals.totalDiscount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>৳{totals.totalTax.toFixed(2)}</span>
              </div>
              <Divider />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>৳{totals.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="capitalize">{paymentMethod}</span>
              </div>
            </div>

            <Divider />

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Thank you for shopping with us!
              </p>
              <p className="text-sm text-gray-600">Please come again</p>
            </div>
          </div>
        </Modal>
      </Card>
    </div>
  );
}
