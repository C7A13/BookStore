import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Minus, Plus, ArrowRight, Ticket } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import api from "../../../../../utils/api";
import "react-toastify/dist/ReactToastify.css";

interface CartItemResponse {
    id: number;
    bookId: number;
    bookTitle: string;
    bookSlug: string;
    bookImage: string;
    unitPrice: number;
    originalPrice: number;
    quantity: number;
    subtotal: number;
}

interface Voucher {
    id: number;
    code: string;
    description: string;
    discount: number;
    type: "percent" | "fixed" | "freeShipping";
    category: "discount" | "shipping";
    minOrder: number;
}

const SHIPPING_FEE = 30000;

interface CartProps {
    isInModal?: boolean;
    onClose?: () => void;
}

export default function Cart({ isInModal = false, onClose }: CartProps) {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState<CartItemResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [voucherCodeInput, setVoucherCodeInput] = useState("");
    const [selectedDiscountVoucher, setSelectedDiscountVoucher] = useState<Voucher | null>(null);
    const [selectedShippingVoucher, setSelectedShippingVoucher] = useState<Voucher | null>(null);
    const [showVoucherModal, setShowVoucherModal] = useState(false);

    const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

    // 1. Fetch real cart data from API
    const fetchCart = async () => {
        try {
            const res = await api.get("/cart");
            if (res.data && res.data.result) {
                setCartItems(res.data.result.items || []);
            } else {
                setCartItems([]);
            }
        } catch (error) {
            console.error("Failed to fetch cart:", error);
        } finally {
            setLoading(false);
        }
    };

    // 2. Fetch active promotions (vouchers) from API
    const fetchVouchers = async () => {
        try {
            const res = await api.get("/promotions/active");
            if (res.data && res.data.result) {
                const mapped: Voucher[] = res.data.result.map((p: any) => ({
                    id: p.id,
                    code: p.code,
                    description: p.name + (p.minOrderValue > 0 ? ` cho đơn hàng từ ${fmt(p.minOrderValue)}` : ""),
                    discount: Number(p.value),
                    type: p.type === "PERCENT" ? "percent" : p.type === "FREE_SHIPPING" ? "freeShipping" : "fixed",
                    category: p.type === "FREE_SHIPPING" ? "shipping" : "discount",
                    minOrder: Number(p.minOrderValue)
                }));
                setVouchers(mapped);

                // Auto select from sessionStorage
                const storedDiscount = sessionStorage.getItem("selected_discount_voucher");
                const storedShipping = sessionStorage.getItem("selected_shipping_voucher");

                if (storedDiscount) {
                    const found = mapped.find(v => v.code === storedDiscount);
                    if (found) setSelectedDiscountVoucher(found);
                }
                if (storedShipping) {
                    const found = mapped.find(v => v.code === storedShipping);
                    if (found) setSelectedShippingVoucher(found);
                }
            }
        } catch (err) {
            console.error("Lỗi khi tải mã giảm giá:", err);
        }
    };

    useEffect(() => {
        fetchCart();
        fetchVouchers();

        const handleCartUpdate = () => {
            fetchCart();
        };

        window.addEventListener("cart_updated", handleCartUpdate);
        return () => window.removeEventListener("cart_updated", handleCartUpdate);
    }, []);

    const subtotal = cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    const orderDiscount = selectedDiscountVoucher
        ? selectedDiscountVoucher.type === "percent"
            ? Math.floor(subtotal * selectedDiscountVoucher.discount / 100)
            : selectedDiscountVoucher.discount
        : 0;

    const shippingDiscount = selectedShippingVoucher ? Math.min(SHIPPING_FEE, selectedShippingVoucher.discount) : 0;
    const shippingTotal = SHIPPING_FEE - shippingDiscount;
    const total = subtotal + shippingTotal - orderDiscount;

    // 3. Update Item Quantity via API
    const updateQuantity = async (itemId: number, newQty: number) => {
        if (newQty < 1) return;
        try {
            await api.put(`/cart/items/${itemId}?quantity=${newQty}`);
            fetchCart();
            window.dispatchEvent(new Event("cart_updated"));
        } catch (error) {
            toast.error("Không thể cập nhật số lượng!");
            console.error(error);
        }
    };

    // 4. Remove Item from Cart via API
    const removeItem = async (itemId: number) => {
        try {
            await api.delete(`/cart/items/${itemId}`);
            fetchCart();
            window.dispatchEvent(new Event("cart_updated"));
            toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
        } catch (error) {
            toast.error("Không thể xóa sản phẩm!");
            console.error(error);
        }
    };

    const applyVoucher = (voucher: Voucher, closeModal = false) => {
        if (subtotal < voucher.minOrder) {
            toast.warning(`Đơn hàng tối thiểu ${fmt(voucher.minOrder)} mới áp dụng được`);
            return;
        }

        if (voucher.category === "discount") {
            setSelectedDiscountVoucher(voucher);
            sessionStorage.setItem("selected_discount_voucher", voucher.code);
        } else {
            setSelectedShippingVoucher(voucher);
            sessionStorage.setItem("selected_shipping_voucher", voucher.code);
        }

        setVoucherCodeInput("");
        if (closeModal) setShowVoucherModal(false);
        toast.success(`Áp dụng voucher ${voucher.code} thành công!`);
    };

    const applyVoucherByCode = () => {
        if (!voucherCodeInput.trim()) return;
        const found = vouchers.find((voucher) => voucher.code.toUpperCase() === voucherCodeInput.trim().toUpperCase());

        if (found) {
            applyVoucher(found);
        } else {
            toast.error("Mã voucher không tồn tại hoặc đã hết hạn");
        }
    };

    const removeVoucher = (category: Voucher["category"]) => {
        if (category === "discount") {
            setSelectedDiscountVoucher(null);
            sessionStorage.removeItem("selected_discount_voucher");
        } else {
            setSelectedShippingVoucher(null);
            sessionStorage.removeItem("selected_shipping_voucher");
        }
        toast.info("Đã bỏ voucher");
    };

    const getVoucherValue = (voucher: Voucher) => {
        if (voucher.type === "percent") return `-${voucher.discount}%`;
        if (voucher.type === "freeShipping") return "Freeship";
        return `-${fmt(voucher.discount)}`;
    };

    const renderSelectedVoucher = (voucher: Voucher, amount: number) => (
        <div className="border border-green-200 bg-green-50 rounded-2xl p-3.5 flex justify-between items-center gap-3">
            <div className="text-sm min-w-0">
                <p className="font-semibold text-green-700">{voucher.code}</p>
                <p className="text-green-600 text-xs">{voucher.description}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <p className="font-bold text-green-600 text-sm">-{fmt(amount)}</p>
                <button onClick={() => removeVoucher(voucher.category)} className="text-red-500 text-xs font-medium">Bỏ</button>
            </div>
        </div>
    );

    const renderVoucherOption = (voucher: Voucher) => {
        const selectedVoucher = voucher.category === "discount" ? selectedDiscountVoucher : selectedShippingVoucher;
        const isSelected = selectedVoucher?.id === voucher.id;

        return (
            <button
                key={voucher.id}
                onClick={() => applyVoucher(voucher, true)}
                className={`w-full text-left border rounded-2xl p-4 cursor-pointer transition-all ${isSelected ? "border-cyan-500 bg-cyan-50" : "border-gray-200 hover:border-cyan-400 bg-white"}`}
            >
                <div className="flex justify-between items-start gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-bold">{voucher.code}</p>
                            {isSelected && (
                                <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[11px] font-semibold text-cyan-700">
                                    Đang chọn
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-600">{voucher.description}</p>
                    </div>
                    <p className="font-bold text-red-500 whitespace-nowrap">{getVoucherValue(voucher)}</p>
                </div>
            </button>
        );
    };

    const DISCOUNT_VOUCHERS = vouchers.filter((voucher) => voucher.category === "discount");
    const SHIPPING_VOUCHERS = vouchers.filter((voucher) => voucher.category === "shipping");

    if (loading && cartItems.length === 0) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className={`bg-white ${isInModal ? "h-full" : "min-h-screen pt-20 pb-10"}`}>
            <div className={`max-w-4xl mx-auto px-4 ${isInModal ? "h-full flex flex-col" : ""}`}>
                {!isInModal && (
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Giỏ hàng của bạn</h1>
                )}

                {cartItems.length === 0 ? (
                    <div className="text-center py-16 flex-1 flex flex-col justify-center items-center">
                        <div className="text-6xl mb-4">🛍️</div>
                        <h3 className="text-xl font-semibold text-gray-700">Giỏ hàng trống</h3>
                    </div>
                ) : (
                    <div className={`${isInModal ? "flex-1 overflow-auto" : ""} space-y-5 pb-6`}>
                        <div className="space-y-4">
                            {cartItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="border border-gray-200 rounded-2xl p-4 flex gap-4 hover:border-cyan-200 transition-colors"
                                >
                                    <img
                                        src={item.bookImage || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200&h=300&fit=crop"}
                                        alt={item.bookTitle}
                                        className="w-20 h-28 object-cover rounded-xl border border-gray-100 flex-shrink-0"
                                    />

                                    <div className="flex-1 min-w-0 flex flex-col">
                                        <h3 
                                            onClick={() => {
                                                navigate(`/books/${item.bookSlug}`);
                                                onClose?.();
                                            }}
                                            className="font-medium text-gray-800 text-[15px] leading-tight line-clamp-2 cursor-pointer hover:text-cyan-600"
                                        >
                                            {item.bookTitle}
                                        </h3>

                                        <div className="mt-2 flex items-baseline gap-2">
                                            <span className="text-lg font-semibold text-cyan-600">
                                                {fmt(item.unitPrice)}
                                            </span>
                                            {item.originalPrice > item.unitPrice && (
                                                <span className="text-sm text-gray-400 line-through">
                                                    {fmt(item.originalPrice)}
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-auto pt-4 flex items-center justify-between">
                                            <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden text-sm bg-white">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-9 h-8 flex items-center justify-center hover:bg-gray-100"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="w-10 text-center font-semibold text-gray-700">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-9 h-8 flex items-center justify-center hover:bg-gray-100"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-xs text-gray-500">Thành tiền</p>
                                                <p className="font-bold text-base text-gray-900">
                                                    {fmt(item.unitPrice * item.quantity)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="text-gray-400 hover:text-red-500 self-start mt-1"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="border border-gray-200 rounded-3xl p-5 bg-gray-50">
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tạm tính</span>
                                    <span>{fmt(subtotal)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600">Phí vận chuyển</span>
                                    <span>{shippingTotal === 0 ? "Miễn phí" : fmt(shippingTotal)}</span>
                                </div>

                                {selectedDiscountVoucher && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Giảm giá đơn hàng</span>
                                        <span>-{fmt(orderDiscount)}</span>
                                    </div>
                                )}

                                {selectedShippingVoucher && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Voucher freeship</span>
                                        <span>-{fmt(shippingDiscount)}</span>
                                    </div>
                                )}

                                <div className="border-t border-gray-300 pt-3 flex justify-between text-lg font-bold">
                                    <span>Tổng cộng</span>
                                    <span className="text-cyan-600">{fmt(total)}</span>
                                </div>
                            </div>

                            <div className="mt-5 space-y-4">
                                <div className="font-medium text-gray-700 text-sm">Voucher / Mã giảm giá</div>

                                <div className="space-y-2">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Giảm giá đơn hàng</p>
                                    {selectedDiscountVoucher ? (
                                        renderSelectedVoucher(selectedDiscountVoucher, orderDiscount)
                                    ) : (
                                        <div className="rounded-2xl border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 bg-white">
                                            Chưa chọn voucher giảm giá
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Freeship</p>
                                    {selectedShippingVoucher ? (
                                        renderSelectedVoucher(selectedShippingVoucher, shippingDiscount)
                                    ) : (
                                        <div className="rounded-2xl border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 bg-white">
                                            Chưa chọn voucher freeship
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={voucherCodeInput}
                                        onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase())}
                                        placeholder="Nhập mã voucher"
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-cyan-400 text-sm bg-white"
                                        onKeyDown={(e) => e.key === "Enter" && applyVoucherByCode()}
                                    />
                                    <button
                                        onClick={applyVoucherByCode}
                                        disabled={!voucherCodeInput.trim()}
                                        className="px-6 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-300 text-white font-medium rounded-2xl transition text-sm cursor-pointer"
                                    >
                                        Áp dụng
                                    </button>
                                </div>

                                <button
                                    onClick={() => setShowVoucherModal(true)}
                                    className="w-full border-2 border-dashed border-gray-300 hover:border-cyan-400 rounded-2xl py-3 text-cyan-600 font-medium flex items-center justify-center gap-2 text-sm bg-white cursor-pointer"
                                >
                                    <Ticket size={16} />
                                    Chọn voucher có sẵn
                                </button>
                            </div>

                            <button
                                onClick={() => {
                                    navigate("/checkout");
                                    onClose?.();
                                }}
                                className="w-full mt-6 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3.5 rounded-2xl text-base flex items-center justify-center gap-2 transition cursor-pointer"
                            >
                                Tiến hành thanh toán
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showVoucherModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div className="bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden shadow-2xl">
                        <div className="p-4 border-b">
                            <h3 className="font-bold text-lg">Chọn voucher</h3>
                        </div>
                        <div className="p-4 space-y-5 max-h-[60vh] overflow-y-auto">
                            <section className="space-y-3">
                                <h4 className="text-sm font-semibold text-gray-700">Voucher giảm giá tiền</h4>
                                {DISCOUNT_VOUCHERS.map(renderVoucherOption)}
                                {DISCOUNT_VOUCHERS.length === 0 && (
                                    <p className="text-xs text-gray-400 italic">Không có mã giảm giá nào khả dụng.</p>
                                )}
                            </section>

                            <section className="space-y-3">
                                <h4 className="text-sm font-semibold text-gray-700">Voucher freeship</h4>
                                {SHIPPING_VOUCHERS.map(renderVoucherOption)}
                                {SHIPPING_VOUCHERS.length === 0 && (
                                    <p className="text-xs text-gray-400 italic">Không có mã freeship nào khả dụng.</p>
                                )}
                            </section>
                        </div>
                        <div className="p-4 border-t">
                            <button
                                onClick={() => setShowVoucherModal(false)}
                                className="w-full py-3 text-gray-600 font-medium border border-gray-300 rounded-2xl text-sm cursor-pointer"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer position="top-center" autoClose={3000} />
        </div>
    );
}
