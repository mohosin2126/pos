import { Link } from "react-router-dom";
import { DashboardTitle } from "@/components/re-useable/dashboard-titile";
import { Button, Card, Divider, Input, message, Modal } from "antd";
import { useEffect, useRef, useState, useMemo } from "react";
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
import { useCreateSale } from "@/hooks/admin/sales";
import CustomModal from "@/components/modal";
import POSForm from "../create";
import { generateReferenceNo } from "@/utils/generate-ref";
import { CartItem } from "@/interface/common";
import {useSellableProducts} from "@/hooks/admin/sellable";
import { calculatePOSTotals, POSSettings } from "@/utils/pos-calculations";

const { Search } = Input;

export default function AllPos() {
    const [loading, setLoading] = useState<boolean>(false);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [customerName, setCustomerName] = useState<string>("");
    const [customerPhone, setCustomerPhone] = useState<string>("");
    const [paymentMethod, setPaymentMethod] = useState<string>("cash");
    const [barcodeInput, setBarcodeInput] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [showInvoice, setShowInvoice] = useState<boolean>(false);
    const [orderNumber] = useState<string>(`ORD-${Date.now()}`);
    const { createSale } = useCreateSale();

    const barcodeInputRef = useRef<any>(null);

    const [posAddress, setPosAddress] = useState<any | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const {
        products: sellableProducts,
        loading: productsLoading,
        error: productsError,
        refetch,
    } = useSellableProducts();

    useEffect(() => {
        if (barcodeInputRef.current) {
            barcodeInputRef.current.focus();
        }
    }, []);


    const normalizeProduct = (p: any) => p?.product ?? p;

    const productUnitPrice = (p: any) =>
        Number(p?.unitPrice ?? p?.price ?? 0);

    const productStock = (p: any) =>
        Number(p?.stockQuantity ?? p?.stock ?? 0);

    const productAvailableQty = (p: any) =>
        Number(p?.unexpiredQty ?? productStock(normalizeProduct(p)));

    const productCategoryName = (p: any) =>
        p?.category?.name ?? p?.category ?? "";


    const toCartItem = (p: any): CartItem => {
        const baseProduct = normalizeProduct(p);

        return {
            id: baseProduct?.id,
            productId: baseProduct?.id,
            name: baseProduct?.name,
            price: productUnitPrice(baseProduct),
            quantity: 1,
            barcode: baseProduct?.barcode ?? "",
            category: productCategoryName(baseProduct),
            discount: Number(baseProduct?.discountAmount ?? 0),
            tax: Number(baseProduct?.taxPercent ?? 0),
        };
    };


    const addProductToCart = (product: any) => {
        const baseProduct = normalizeProduct(product);
        if (!baseProduct) return;

        const existingItem = cartItems.find(
            (c) => c.productId === baseProduct.id
        );
        const stock = productAvailableQty(product);

        if (existingItem) {
        
            if (existingItem.quantity + 1 > stock && stock > 0) {
                message.warning("Not enough stock for this item");
                return;
            }
            setCartItems((prev) =>
                prev.map((c) =>
                    c.productId === baseProduct.id
                        ? { ...c, quantity: c.quantity + 1 }
                        : c
                )
            );
        } else {
            if (stock <= 0) {
                message.warning("This product is out of stock");
                return;
            }
            setCartItems((prev) => [...prev, toCartItem(baseProduct)]);
        }
    };
    const handleBarcodeScan = (barcode: string) => {
        const product = sellableProducts.find(
            (p: any) => normalizeProduct(p)?.barcode === barcode
        );
        if (product) {
            const baseProduct = normalizeProduct(product);
            addProductToCart(product);
            setBarcodeInput("");
            message.success(`${baseProduct?.name} added to cart`);
        } else {
            message.error("Product not found");
        }
    };
    const updateQuantity = (id: number, quantity: number) => {
        if (quantity <= 0) {
            setCartItems((prev) => prev.filter((item) => item.id !== id));
        } else {
            setCartItems((prev) =>
                prev.map((item) => (item.id === id ? { ...item, quantity } : item))
            );
        }
    };

    const removeFromCart = (id: number) => {
        setCartItems((prev) => prev.filter((item) => item.id !== id));
    };

    const calculateTotals = () => {
        if (!posAddress) {
            const defaultSettings: POSSettings = {
                discountType: "none",
                discountAmount: 0,
                orderTaxPercent: 0,
                shippingCharge: 0,
            };
            return calculatePOSTotals(cartItems, defaultSettings);
        }

        const settings: POSSettings = {
            discountType: posAddress.discountType || "none",
            discountAmount: posAddress.discountAmount || 0,
            orderTaxPercent: posAddress.orderTaxPercent || 0,
            shippingCharge: posAddress.shippingCharge || 0,
        };

        return calculatePOSTotals(cartItems, settings);
    };


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
                orderTaxAmount: 0,
                shippingCharge: posAddress?.shippingCharge || 0,
                amountPaid: totals.total,
                notes: posAddress?.notes || "Walk-in customer",
                customer: {
                    name: customerName,
                    phone: customerPhone || "N/A",
                    email: posAddress?.email || "N/A",
                    address: posAddress?.address || "N/A",
                    status: "active",
                    notes: "POS customer",
                },
                items: cartItems.map((item: CartItem) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.price,
                    discountType: "none",
                    discountAmount: item.discount || 0,
                    taxPercent: item.tax || 0,
                })),
            };

            const result = await createSale(orderData);
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

    const handlePrintInvoice = () => {
        window.print();
    };

    const filteredProducts = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return sellableProducts ?? [];
        return (sellableProducts ?? []).filter((p: any) => {
            const baseProduct = normalizeProduct(p);
            const name = baseProduct?.name?.toLowerCase() ?? "";
            const barcode = baseProduct?.barcode ?? "";
            return name.includes(term) || barcode.includes(term);
        });
    }, [sellableProducts, searchTerm]);

    const totals = calculateTotals();

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
                                loading={productsLoading}
                            />
                        </div>

                        <div className="p-4 border-b border-gray-200">
                            <Search
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full"
                                loading={productsLoading}
                                allowClear
                            />
                            {productsError && (
                                <p className="text-red-500 text-xs mt-2">
                                    {productsError}. <button onClick={refetch} className="underline">Retry</button>
                                </p>
                            )}
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto">
                            <div className="space-y-2">
                                {(filteredProducts ?? []).map((product: any) => {
                                    const baseProduct = normalizeProduct(product);
                                    const availableQty = productAvailableQty(product);

                                    return (
                                    <Card
                                        key={baseProduct?.id}
                                        size="small"
                                        className="cursor-pointer hover:shadow-md transition-shadow !mb-3"
                                        onClick={() => addProductToCart(product)}
                                    >
                                        <div className="flex products-center justify-between">
                                            <div>
                                                <Link
                                                    className="!w-max"
                                                    to={`/admin/product/view/${baseProduct?.id}`}
                                                >
                                                    <div className="font-medium text-sm !w-max">
                                                        {baseProduct?.name}
                                                    </div>
                                                </Link>

                                                <div className="text-xs text-gray-500">
                                                    {productCategoryName(baseProduct)}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    Stock: {availableQty}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-green-600">
                                                    ৳{productUnitPrice(baseProduct)}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {baseProduct?.barcode}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                    );
                                })}
                                {!productsLoading && filteredProducts?.length === 0 && (
                                    <div className="text-center text-gray-500 text-sm py-6">
                                        No sellable products found.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Middle Column: Cart */}
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

                    {/* Right Column: Customer + Summary */}
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

                            <div className="space-y-2 mb-4 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal:</span>
                                    <span className="font-medium">৳{totals.subtotal.toFixed(2)}</span>
                                </div>
                                
                                {totals.itemDiscounts > 0 && (
                                    <div className="flex justify-between text-red-600">
                                        <span>Item Discounts:</span>
                                        <span>-৳{totals.itemDiscounts.toFixed(2)}</span>
                                    </div>
                                )}
                                
                                {totals.orderDiscount > 0 && (
                                    <div className="flex justify-between text-red-600">
                                        <span>Order Discount ({posAddress?.discountType === "percent" ? "%":"৳"}):</span>
                                        <span>-৳{totals.orderDiscount.toFixed(2)}</span>
                                    </div>
                                )}
                                
                                {totals.itemTaxes > 0 && (
                                    <div className="flex justify-between text-blue-600">
                                        <span>Item Taxes:</span>
                                        <span>+৳{totals.itemTaxes.toFixed(2)}</span>
                                    </div>
                                )}
                                
                                {totals.orderTax > 0 && (
                                    <div className="flex justify-between text-blue-600">
                                        <span>Order Tax ({posAddress?.orderTaxPercent || 0}%):</span>
                                        <span>+৳{totals.orderTax.toFixed(2)}</span>
                                    </div>
                                )}
                                
                                {totals.shipping > 0 && (
                                    <div className="flex justify-between text-orange-600">
                                        <span>Shipping Charge:</span>
                                        <span>+৳{totals.shipping.toFixed(2)}</span>
                                    </div>
                                )}
                                
                                <Divider className="my-2" />
                                <div className="flex justify-between font-bold text-lg text-green-700 bg-green-50 p-2 rounded">
                                    <span>Total Amount:</span>
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
                            {totals.itemDiscounts > 0 && (
                                <div className="flex justify-between">
                                    <span>Item Discounts:</span>
                                    <span>-৳{totals.itemDiscounts.toFixed(2)}</span>
                                </div>
                            )}
                            {totals.orderDiscount > 0 && (
                                <div className="flex justify-between">
                                    <span>Order Discount:</span>
                                    <span>-৳{totals.orderDiscount.toFixed(2)}</span>
                                </div>
                            )}
                            {totals.itemTaxes > 0 && (
                                <div className="flex justify-between">
                                    <span>Item Taxes:</span>
                                    <span>+৳{totals.itemTaxes.toFixed(2)}</span>
                                </div>
                            )}
                            {totals.orderTax > 0 && (
                                <div className="flex justify-between">
                                    <span>Order Tax:</span>
                                    <span>+৳{totals.orderTax.toFixed(2)}</span>
                                </div>
                            )}
                            {totals.shipping > 0 && (
                                <div className="flex justify-between">
                                    <span>Shipping:</span>
                                    <span>+৳{totals.shipping.toFixed(2)}</span>
                                </div>
                            )}
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
