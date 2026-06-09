import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MapPin, CreditCard, Truck, Banknote, Building2, ChevronDown, Check, Plus } from "lucide-react";
import api from "../../utils/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface BuyNowItem {
    bookId: number;
    quantity: number;
    bookTitle?: string;
    bookImage?: string;
    unitPrice?: number;
}

interface CartItem {
    id: number;
    bookId: number;
    bookTitle: string;
    bookSlug: string;
    bookImage: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
}

interface Address {
    id: number;
    recipientName: string;
    recipientPhone: string;
    province: string;
    ward: string;
    detailAddress: string;
    isDefault: boolean;
}

interface Voucher {
    id: number;
    code: string;
    description: string;
    discount: number;
    type: 'percent' | 'fixed' | 'freeShipping';
    category: 'discount' | 'shipping';
    minOrder: number;
}

type PaymentMethod = "cod" | "vnpay";
type AddressMode = "select" | "new" | "edit";

const SHIPPING_FEE = 30000;

const PROVINCES = ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Thanh Hóa", "Hải Phòng", "Cần Thơ"];

const DISTRICTS: Record<string, string[]> = {
    "TP. Hồ Chí Minh": ["Quận 1", "Quận 3", "Quận Bình Thạnh", "Quận Gò Vấp"],
    "Hà Nội": ["Hoàn Kiếm", "Đống Đa", "Cầu Giấy", "Tây Hồ"],
    "Thanh Hóa": ["TP. Thanh Hóa", "Tĩnh Gia", "Hoằng Hóa"],
    default: ["Quận/Huyện 1", "Quận/Huyện 2"],
};

const WARDS: Record<string, string[]> = {
    "Quận 1": ["Phường Bến Nghé", "Phường Bến Thành", "Phường Cầu Kho"],
    "Quận 3": ["Phường 1", "Phường 6", "Phường Võ Thị Sáu"],
    "Hoàn Kiếm": ["Phường Tràng Tiền", "Phường Hàng Bạc"],
    "TP. Thanh Hóa": ["Phường Lam Sơn", "Phường Điện Biên", "Phường Ba Đình"],
    default: ["Phường/Xã 1", "Phường/Xã 2"],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

function getDistricts(province: string) {
    return DISTRICTS[province] ?? DISTRICTS["default"];
}

function getWards(district: string) {
    return WARDS[district] ?? WARDS["default"];
}

// ─── Address Form ─────────────────────────────────────────────────────────────
interface AddressFormData {
    recipientName: string;
    recipientPhone: string;
    province: string;
    district: string;
    ward: string;
    detailAddress: string;
    isDefault: boolean;
}

const emptyForm = (): AddressFormData => ({
    recipientName: "",
    recipientPhone: "",
    province: "",
    district: "",
    ward: "",
    detailAddress: "",
    isDefault: false,
});

function AddressForm({
    initial,
    onSave,
    onCancel,
    submitLabel = "Lưu địa chỉ",
    showCancel = true,
}: {
    initial?: AddressFormData;
    onSave: (data: AddressFormData) => void;
    onCancel: () => void;
    submitLabel?: string;
    showCancel?: boolean;
}) {
    const [form, setForm] = useState<AddressFormData>(initial ?? emptyForm());

    const set = (k: keyof AddressFormData, v: string | boolean) =>
        setForm((prev) => ({ ...prev, [k]: v }));

    const districts = form.province ? getDistricts(form.province) : [];
    const wards = form.district ? getWards(form.district) : [];

    const SelectField = ({
        label,
        value,
        options,
        onChange,
        disabled,
        placeholder,
    }: {
        label: string;
        value: string;
        options: string[];
        onChange: (v: string) => void;
        disabled?: boolean;
        placeholder: string;
    }) => (
        <div className="relative">
            <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none appearance-none transition-colors
            ${disabled ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed" : "bg-white border-gray-300 text-gray-700 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 cursor-pointer"}`}
                >
                    <option value="">{placeholder}</option>
                    {options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Họ và tên *</label>
                    <input
                        type="text"
                        placeholder="Người nhận"
                        value={form.recipientName}
                        onChange={(e) => set("recipientName", e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 bg-white"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Số điện thoại *</label>
                    <div className="flex border border-gray-300 rounded-lg overflow-hidden bg-white focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100">
                        <span className="flex items-center gap-1 px-2.5 border-r border-gray-200 text-sm bg-gray-50 text-gray-500 shrink-0">
                            🇻🇳 +84
                        </span>
                        <input
                            type="tel"
                            placeholder="09xxxxxxxx"
                            value={form.recipientPhone}
                            onChange={(e) => set("recipientPhone", e.target.value)}
                            className="flex-1 px-3 py-2.5 text-sm outline-none bg-white"
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Địa chỉ cụ thể *</label>
                <input
                    type="text"
                    placeholder="Số nhà, tên đường..."
                    value={form.detailAddress}
                    onChange={(e) => set("detailAddress", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 bg-white"
                />
            </div>

            <div className="grid grid-cols-3 gap-3">
                <SelectField
                    label="Tỉnh / Thành phố *"
                    value={form.province}
                    options={PROVINCES}
                    placeholder="Chọn tỉnh/TP"
                    onChange={(v) => setForm((p) => ({ ...p, province: v, district: "", ward: "" }))}
                />
                <SelectField
                    label="Quận / Huyện"
                    value={form.district}
                    options={districts}
                    placeholder="Chọn quận/huyện"
                    disabled={!form.province}
                    onChange={(v) => setForm((p) => ({ ...p, district: v, ward: "" }))}
                />
                <SelectField
                    label="Phường / Xã"
                    value={form.ward}
                    options={wards}
                    placeholder="Chọn phường/xã"
                    disabled={!form.district}
                    onChange={(v) => set("ward", v)}
                />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
                <div
                    onClick={() => set("isDefault", !form.isDefault)}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors shrink-0
            ${form.isDefault ? "bg-blue-500 border-blue-500" : "border-gray-300 bg-white"}`}
                >
                    {form.isDefault && (
                        <Check className="w-3 h-3 text-white" />
                    )}
                </div>
                <span className="text-sm text-gray-600">Đặt làm địa chỉ mặc định</span>
            </label>

            <div className="flex gap-2 pt-1">
                {showCancel && (
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        Huỷ
                    </button>
                )}
                <button
                    onClick={() => onSave(form)}
                    className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
                >
                    {submitLabel}
                </button>
            </div>
        </div>
    );
}

// ─── Address Modal ────────────────────────────────────────────────────────────
function AddressModal({
    addresses,
    selectedId,
    onSelect,
    onClose,
    onAdd,
    onEdit,
    onDelete,
    onSetDefault,
    isRequired = false,
}: {
    addresses: Address[];
    selectedId: number | null;
    onSelect: (a: Address) => void;
    onClose: () => void;
    onAdd: (data: AddressFormData) => void;
    onEdit: (id: number, data: AddressFormData) => void;
    onDelete: (id: number) => void;
    onSetDefault: (id: number) => void;
    isRequired?: boolean;
}) {
    const [mode, setMode] = useState<AddressMode>(addresses.length === 0 ? "new" : "select");
    const [editTarget, setEditTarget] = useState<Address | null>(null);

    // Sync mode if addresses become empty
    useEffect(() => {
        if (addresses.length === 0) {
            setMode("new");
        }
    }, [addresses.length]);

    const handleEdit = (a: Address) => {
        setEditTarget(a);
        setMode("edit");
    };

    const handleBackdropClick = () => {
        if (!isRequired) onClose();
    };

    const handleCloseClick = () => {
        if (!isRequired) onClose();
    };

    const handleCancelForm = () => {
        if (isRequired && addresses.length === 0) {
            return;
        }
        setMode("select");
    };

    const showCancelButton = !(isRequired && addresses.length === 0);

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleBackdropClick} />
            <div className="relative bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        {mode !== "select" && showCancelButton && (
                            <button onClick={() => setMode("select")} className="text-gray-400 hover:text-gray-600 mr-1">
                                <MapPin className="w-4 h-4" />
                            </button>
                        )}
                        <h3 className="font-bold text-gray-800 text-base">
                            {mode === "select" ? "Chọn địa chỉ nhận hàng" : mode === "new" ? "Thêm địa chỉ mới" : "Chỉnh sửa địa chỉ"}
                        </h3>
                    </div>
                    {!isRequired && (
                        <button onClick={handleCloseClick} className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-sm transition-colors">✕</button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4">
                    {mode === "select" && (
                        <div className="space-y-3">
                            {addresses.map((addr) => (
                                <div
                                    key={addr.id}
                                    onClick={() => onSelect(addr)}
                                    className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all
                    ${selectedId === addr.id ? "border-blue-500 bg-blue-50/50" : "border-gray-200 hover:border-gray-300 bg-white"}`}
                                >
                                    <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center
                    ${selectedId === addr.id ? "border-blue-500" : "border-gray-300"}`}>
                                        {selectedId === addr.id && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                                    </div>

                                    <div className="pr-8">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-sm text-gray-800">{addr.recipientName}</span>
                                            <span className="text-gray-300">·</span>
                                            <span className="text-sm text-gray-500">{addr.recipientPhone}</span>
                                            {addr.isDefault && (
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded-full border border-blue-200">
                                                    Mặc định
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 leading-relaxed">
                                            {addr.detailAddress}, {addr.ward}, {addr.province}
                                        </p>
                                    </div>

                                    <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleEdit(addr); }}
                                            className="text-xs text-blue-500 font-medium hover:underline"
                                        >
                                            Chỉnh sửa
                                        </button>
                                        {!addr.isDefault && (
                                            <>
                                                <span className="text-gray-200">|</span>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onSetDefault(addr.id); }}
                                                    className="text-xs text-gray-500 font-medium hover:text-blue-500 hover:underline"
                                                >
                                                    Đặt mặc định
                                                </button>
                                                <span className="text-gray-200">|</span>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onDelete(addr.id); }}
                                                    className="text-xs text-red-400 font-medium hover:underline"
                                                >
                                                    Xoá
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={() => setMode("new")}
                                className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3.5 text-sm font-medium text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Thêm địa chỉ mới
                            </button>
                        </div>
                    )}

                    {mode === "new" && (
                        <AddressForm
                            onSave={(data) => { onAdd(data); if (!isRequired) setMode("select"); }}
                            onCancel={handleCancelForm}
                            submitLabel="Thêm địa chỉ"
                            showCancel={showCancelButton}
                        />
                    )}

                    {mode === "edit" && editTarget && (
                        <AddressForm
                            initial={{
                                recipientName: editTarget.recipientName,
                                recipientPhone: editTarget.recipientPhone,
                                province: editTarget.province,
                                district: editTarget.ward.split(", ")[0] || "",
                                ward: editTarget.ward.split(", ")[1] || editTarget.ward,
                                detailAddress: editTarget.detailAddress,
                                isDefault: editTarget.isDefault,
                            }}
                            onSave={(data) => { onEdit(editTarget.id, data); setMode("select"); }}
                            onCancel={() => setMode("select")}
                            submitLabel="Lưu thay đổi"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function OrderPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const buyNowState = (location.state as { buyNow?: BuyNowItem } | null)?.buyNow ?? null;
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [payment, setPayment] = useState<PaymentMethod>("cod");
    const [note, setNote] = useState("");
    const [selectedDiscountVoucher, setSelectedDiscountVoucher] = useState<Voucher | null>(null);
    const [selectedShippingVoucher, setSelectedShippingVoucher] = useState<Voucher | null>(null);
    const [showVoucherModal, setShowVoucherModal] = useState(false);
    const [isOrdering, setIsOrdering] = useState(false);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [buyNowDisplayItem, setBuyNowDisplayItem] = useState<CartItem | null>(null);
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [loading, setLoading] = useState(true);

    // Preview pricing states
    const [subtotal, setSubtotal] = useState(0);
    const [shippingFee, setShippingFee] = useState(SHIPPING_FEE);
    const [shippingDiscount, setShippingDiscount] = useState(0);
    const [orderDiscount, setOrderDiscount] = useState(0);
    const [total, setTotal] = useState(0);
    const [promotionEligibilityMap, setPromotionEligibilityMap] = useState<Record<string, { isEligible: boolean; reason?: string }>>({});

    const selectedAddress = addresses.find((a) => a.id === selectedAddressId) ?? null;
    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const shipping = shippingFee - shippingDiscount;

    const fetchPreview = async (
        addrId: number | null,
        discVoucher: Voucher | null,
        shipVoucher: Voucher | null,
        itemsList: CartItem[]
    ) => {
        // In cart mode, require items; in buy now mode, bypass this check
        if (!buyNowState && itemsList.length === 0) return;

        if (!addrId) {
            // Client-side quick calculation before address selection
            const sub = buyNowState
                ? (buyNowState.unitPrice ?? 0) * buyNowState.quantity
                : itemsList.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
            
            let discVal = 0;
            if (discVoucher) {
                discVal = discVoucher.type === "percent"
                    ? Math.floor(sub * discVoucher.discount / 100)
                    : discVoucher.discount;
            }
            
            let shipDiscVal = 0;
            if (shipVoucher) {
                shipDiscVal = Math.min(SHIPPING_FEE, shipVoucher.discount);
            }

            setSubtotal(sub);
            setShippingFee(SHIPPING_FEE);
            setShippingDiscount(shipDiscVal);
            setOrderDiscount(discVal);
            setTotal(sub + (SHIPPING_FEE - shipDiscVal) - discVal);
            return;
        }

        try {
            const promoCodes = [discVoucher?.code, shipVoucher?.code].filter(Boolean) as string[];

            const res = await api.post("/checkout/preview", {
                ...(buyNowState
                    ? { buyNowItem: { bookId: buyNowState.bookId, quantity: buyNowState.quantity } }
                    : { cartItemIds: itemsList.map((item) => item.id) }
                ),
                addressId: addrId,
                promotionCodes: promoCodes,
                paymentMethod: payment === "vnpay" ? "VNPAY" : "COD",
            });

            if (res.data?.result) {
                const calc = res.data.result.calculation;
                setSubtotal(Number(calc.subtotal));
                setShippingFee(Number(calc.shippingFee));
                setShippingDiscount(Number(calc.shippingDiscount));
                setOrderDiscount(Number(calc.orderDiscount));
                setTotal(Number(calc.totalAmount));

                const eligibilityMap: Record<string, { isEligible: boolean; reason?: string }> = {};
                if (res.data.result.availablePromotions) {
                    res.data.result.availablePromotions.forEach((p: any) => {
                        eligibilityMap[p.code] = { isEligible: p.isEligible, reason: p.reason };
                    });
                }
                setPromotionEligibilityMap(eligibilityMap);
            }
        } catch (error: any) {
            console.error("Lỗi khi tải preview hóa đơn:", error);
            const errorMsg = error.response?.data?.message || "Mã giảm giá không khả dụng hoặc chưa đủ điều kiện!";
            
            // If it failed because of promo codes, clean them up and retry without them
            if (discVoucher || shipVoucher) {
                toast.warning(`Không thể áp dụng voucher: ${errorMsg}`);
                
                // Clear state & sessionStorage
                setSelectedDiscountVoucher(null);
                setSelectedShippingVoucher(null);
                sessionStorage.removeItem("selected_discount_voucher");
                sessionStorage.removeItem("selected_shipping_voucher");
                
                // Retry preview without promotions
                fetchPreview(addrId, null, null, itemsList);
            } else {
                toast.error("Không thể tải thông tin thanh toán từ hệ thống!");
            }
        }
    };

    const fetchCartAndAddresses = async () => {
        setLoading(true);
        try {
            // ── BUY NOW MODE ──
            if (buyNowState) {
                // Dùng thông tin sách từ state của router (truyền từ BookDetails)
                const displayItem: CartItem = {
                    id: 0,
                    bookId: buyNowState.bookId,
                    bookTitle: buyNowState.bookTitle ?? "Sản phẩm",
                    bookSlug: "",
                    bookImage: buyNowState.bookImage ?? "",
                    unitPrice: buyNowState.unitPrice ?? 0,
                    quantity: buyNowState.quantity,
                    subtotal: (buyNowState.unitPrice ?? 0) * buyNowState.quantity,
                };
                setBuyNowDisplayItem(displayItem);
                setCartItems([displayItem]);

                const voucherRes = await api.get("/promotions/active");
                if (voucherRes.data?.result) {
                    const mapped: Voucher[] = voucherRes.data.result.map((p: any) => ({
                        id: p.id,
                        code: p.code,
                        description: p.name + (p.minOrderValue > 0 ? ` cho đơn hàng từ ${fmt(p.minOrderValue)}` : ""),
                        discount: Number(p.value),
                        type: p.type === "PERCENT" ? "percent" : p.type === "FREE_SHIPPING" ? "freeShipping" : "fixed",
                        category: p.type === "FREE_SHIPPING" ? "shipping" : "discount",
                        minOrder: Number(p.minOrderValue)
                    }));
                    setVouchers(mapped);
                }

                const addrRes = await api.get("/addresses/my");
                const addrList = addrRes.data?.result || [];
                setAddresses(addrList);
                const initialAddrId = addrList.find((a: any) => a.isDefault)?.id || addrList[0]?.id || null;
                setSelectedAddressId(initialAddrId);
                if (addrList.length === 0) setShowModal(true);

                await fetchPreview(initialAddrId, null, null, []);
                return;
            }

            // ── CART MODE (mặc định) ──
            const cartRes = await api.get("/cart");
            const items = cartRes.data?.result?.items || [];
            if (items.length === 0) {
                toast.warning("Giỏ hàng của bạn đang trống!");
                setTimeout(() => navigate("/books"), 1500);
                return;
            }
            setCartItems(items);

            const voucherRes = await api.get("/promotions/active");
            let nextDiscount = null;
            let nextShipping = null;
            if (voucherRes.data?.result) {
                const mapped: Voucher[] = voucherRes.data.result.map((p: any) => ({
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
                    if (found) {
                        setSelectedDiscountVoucher(found);
                        nextDiscount = found;
                    }
                }
                if (storedShipping) {
                    const found = mapped.find(v => v.code === storedShipping);
                    if (found) {
                        setSelectedShippingVoucher(found);
                        nextShipping = found;
                    }
                }
            }

            const addrRes = await api.get("/addresses/my");
            const addrList = addrRes.data?.result || [];
            setAddresses(addrList);

            const initialAddrId = addrList.find((a: any) => a.isDefault)?.id || addrList[0]?.id || null;
            setSelectedAddressId(initialAddrId);

            if (addrList.length === 0) {
                setShowModal(true);
            }

            await fetchPreview(initialAddrId, nextDiscount, nextShipping, items);
        } catch (error) {
            console.error("Lỗi tải thông tin đơn hàng:", error);
            toast.error("Vui lòng đăng nhập để thanh toán!");
            setTimeout(() => navigate("/login"), 1500);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Reset mọi state khi chuyển đổi giữa các mode (buy now ↔ cart)
        setCartItems([]);
        setBuyNowDisplayItem(null);
        setSelectedDiscountVoucher(null);
        setSelectedShippingVoucher(null);
        setSubtotal(0);
        setShippingFee(SHIPPING_FEE);
        setShippingDiscount(0);
        setOrderDiscount(0);
        setTotal(0);
        setPromotionEligibilityMap({});
        fetchCartAndAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.key]);

    useEffect(() => {
        if (!loading && selectedAddressId) {
            fetchPreview(selectedAddressId, selectedDiscountVoucher, selectedShippingVoucher, cartItems);
        }
    }, [payment]);

    const handleSelect = (addr: Address) => {
        setSelectedAddressId(addr.id);
        setShowModal(false);
        fetchPreview(addr.id, selectedDiscountVoucher, selectedShippingVoucher, cartItems);
    };

    const handleAdd = async (data: AddressFormData) => {
        try {
            const payload = {
                recipientName: data.recipientName,
                recipientPhone: data.recipientPhone,
                province: data.province,
                ward: data.district ? `${data.district}, ${data.ward}` : data.ward,
                detailAddress: data.detailAddress
            };
            const res = await api.post("/addresses", payload);
            const newAddr = res.data?.result;
            if (newAddr) {
                toast.success("Thêm địa chỉ mới thành công!");
                const addrRes = await api.get("/addresses/my");
                const addrList = addrRes.data?.result || [];
                setAddresses(addrList);

                if (data.isDefault) {
                    await api.put(`/addresses/${newAddr.id}/default`);
                    const reloaded = await api.get("/addresses/my");
                    setAddresses(reloaded.data?.result || []);
                }

                setSelectedAddressId(newAddr.id);
                fetchPreview(newAddr.id, selectedDiscountVoucher, selectedShippingVoucher, cartItems);

                if (addresses.length === 0) {
                    setShowModal(false);
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("Không thể thêm địa chỉ!");
        }
    };

    const handleEdit = async (id: number, data: AddressFormData) => {
        try {
            const payload = {
                recipientName: data.recipientName,
                recipientPhone: data.recipientPhone,
                province: data.province,
                ward: data.district ? `${data.district}, ${data.ward}` : data.ward,
                detailAddress: data.detailAddress
            };
            await api.put(`/addresses/${id}`, payload);

            if (data.isDefault) {
                await api.put(`/addresses/${id}/default`);
            }

            toast.success("Cập nhật địa chỉ thành công!");

            const addrRes = await api.get("/addresses/my");
            const addrList = addrRes.data?.result || [];
            setAddresses(addrList);

            if (selectedAddressId === id) {
                fetchPreview(id, selectedDiscountVoucher, selectedShippingVoucher, cartItems);
            }
        } catch (error) {
            console.error(error);
            toast.error("Không thể cập nhật địa chỉ!");
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/addresses/${id}`);
            toast.success("Đã xóa địa chỉ thành công!");

            const addrRes = await api.get("/addresses/my");
            const addrList = addrRes.data?.result || [];
            setAddresses(addrList);

            if (selectedAddressId === id) {
                const nextId = addrList.find((a: any) => a.isDefault)?.id || addrList[0]?.id || null;
                setSelectedAddressId(nextId);
                fetchPreview(nextId, selectedDiscountVoucher, selectedShippingVoucher, cartItems);
            }
        } catch (error) {
            console.error(error);
            toast.error("Không thể xóa địa chỉ!");
        }
    };

    const handleSetDefault = async (id: number) => {
        try {
            await api.put(`/addresses/${id}/default`);
            toast.success("Đã cài đặt địa chỉ mặc định!");

            const addrRes = await api.get("/addresses/my");
            setAddresses(addrRes.data?.result || []);
        } catch (error) {
            console.error(error);
            toast.error("Không thể thay đổi mặc định!");
        }
    };

    const applyVoucher = (voucher: Voucher) => {
        const eligibility = promotionEligibilityMap[voucher.code];
        if (eligibility && !eligibility.isEligible) {
            toast.warning(eligibility.reason || "Bạn không đủ điều kiện sử dụng voucher này!");
            return;
        }

        let nextDiscount = selectedDiscountVoucher;
        let nextShipping = selectedShippingVoucher;

        if (voucher.category === 'discount') {
            nextDiscount = voucher;
            setSelectedDiscountVoucher(voucher);
            sessionStorage.setItem("selected_discount_voucher", voucher.code);
        } else {
            nextShipping = voucher;
            setSelectedShippingVoucher(voucher);
            sessionStorage.setItem("selected_shipping_voucher", voucher.code);
        }

        setShowVoucherModal(false);
        toast.success(`Áp dụng voucher ${voucher.code} thành công!`);
        fetchPreview(selectedAddressId, nextDiscount, nextShipping, cartItems);
    };

    const removeVoucher = (category: Voucher['category']) => {
        let nextDiscount = selectedDiscountVoucher;
        let nextShipping = selectedShippingVoucher;

        if (category === 'discount') {
            nextDiscount = null;
            setSelectedDiscountVoucher(null);
            sessionStorage.removeItem("selected_discount_voucher");
        } else {
            nextShipping = null;
            setSelectedShippingVoucher(null);
            sessionStorage.removeItem("selected_shipping_voucher");
        }

        toast.info("Đã bỏ voucher");
        fetchPreview(selectedAddressId, nextDiscount, nextShipping, cartItems);
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            toast.error("Vui lòng chọn địa chỉ nhận hàng");
            return;
        }

        setIsOrdering(true);
        try {
            const promoCodes = [selectedDiscountVoucher?.code, selectedShippingVoucher?.code].filter(Boolean) as string[];
            const mappedPaymentMethod = payment === "vnpay" ? "VNPAY" : "COD";

            const checkoutRes = await api.post("/checkout", {
                ...(buyNowState
                    ? { buyNowItem: { bookId: buyNowState.bookId, quantity: buyNowState.quantity } }
                    : { cartItemIds: cartItems.map((item) => item.id) }
                ),
                addressId: selectedAddressId,
                promotionCodes: promoCodes,
                note,
                paymentMethod: mappedPaymentMethod,
            });

            const order = checkoutRes.data?.result;
            if (order && order.id) {
                // Clear sessionStorage vouchers
                sessionStorage.removeItem("selected_discount_voucher");
                sessionStorage.removeItem("selected_shipping_voucher");

                // Call /payments api
                const paymentRes = await api.post("/payments", {
                    orderId: order.id,
                    note,
                });

                const paymentResult = paymentRes.data?.result;

                // Fire cart updated event to clear badge
                window.dispatchEvent(new Event("cart_updated"));

                if (mappedPaymentMethod === "VNPAY" && paymentResult?.paymentUrl) {
                    window.location.href = paymentResult.paymentUrl;
                } else {
                    toast.success("🎉 Đặt hàng thành công! Đang chuyển hướng...", {
                        position: "top-center",
                        autoClose: 3000,
                    });
                    setTimeout(() => {
                        navigate("/my-orders");
                    }, 2000);
                }
            }
        } catch (error: any) {
            console.error("Lỗi đặt hàng:", error);
            const errMsg = error.response?.data?.message || "Có lỗi xảy ra khi đặt hàng!";
            toast.error(errMsg);
        } finally {
            setIsOrdering(false);
        }
    };

    const DISCOUNT_VOUCHERS = vouchers.filter((voucher) => voucher.category === 'discount');
    const SHIPPING_VOUCHERS = vouchers.filter((voucher) => voucher.category === 'shipping');

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 pt-20">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500 text-sm font-medium">Đang tải thông tin thanh toán...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans pt-24">
            <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left + Middle Column */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Shipping Address Section */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-800">Địa chỉ nhận hàng</h2>
                            <button
                                onClick={() => setShowModal(true)}
                                className="flex items-center gap-1 text-blue-500 text-sm font-medium hover:underline cursor-pointer bg-transparent border-0"
                            >
                                <MapPin className="w-4 h-4" />
                                Thay đổi
                            </button>
                        </div>

                        {selectedAddress ? (
                            <div
                                onClick={() => setShowModal(true)}
                                className="border-2 border-blue-200 bg-blue-50/40 rounded-xl p-4 cursor-pointer hover:border-blue-300 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-sm text-gray-800">{selectedAddress.recipientName}</span>
                                            <span className="text-gray-300">·</span>
                                            <span className="text-sm text-gray-500">{selectedAddress.recipientPhone}</span>
                                            {selectedAddress.isDefault && (
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded-full border border-blue-200">
                                                    Mặc định
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {selectedAddress.detailAddress}, {selectedAddress.ward}, {selectedAddress.province}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowModal(true)}
                                className="w-full border-2 border-dashed border-gray-200 rounded-xl py-5 text-sm text-gray-400 font-medium hover:border-blue-300 hover:text-blue-500 transition-colors flex items-center justify-center gap-2 bg-white cursor-pointer"
                            >
                                Thêm địa chỉ nhận hàng
                            </button>
                        )}
                    </section>

                    {/* Shipping Delivery Method */}
                    <section>
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Vận chuyển</h2>

                        <div
                            className={`border rounded-xl px-4 py-3 text-sm transition-colors
        ${selectedAddress
                                    ? "bg-white border-gray-200 text-gray-700"
                                    : "bg-blue-50 border-blue-200 text-blue-600"
                                }`}
                        >
                            {selectedAddress ? (
                                <div className="flex items-center gap-2">
                                    <Truck className="w-4 h-4 text-green-500" />
                                    <span>Giao hàng tiêu chuẩn — {shipping === 0 ? "Miễn phí" : fmt(shippingFee)} (2–4 ngày)</span>
                                </div>
                            ) : (
                                <span>Vui lòng chọn địa chỉ nhận hàng để tính phí vận chuyển</span>
                            )}
                        </div>
                    </section>

                    {/* Notes Section */}
                    <section>
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Ghi chú</h2>
                        <textarea
                            placeholder="Ghi chú cho người bán hoặc shipper (tùy chọn)"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={3}
                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 bg-white resize-none"
                        />
                    </section>

                    {/* Payment Methods */}
                    <section>
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Phương thức thanh toán</h2>
                        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">

                            {/* COD Payment */}
                            <label className="flex items-center justify-between px-4 py-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100"
                                onClick={() => setPayment("cod")}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${payment === "cod" ? "border-blue-500" : "border-gray-300"}`}>
                                        {payment === "cod" && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Banknote className="w-5 h-5 text-gray-600" />
                                            <p className="font-medium">Thu hộ khi nhận hàng (COD)</p>
                                        </div>
                                        <p className="text-sm text-gray-500">Thanh toán bằng tiền mặt khi giao hàng</p>
                                    </div>
                                </div>
                            </label>

                            {/* VNPAY Online Payment */}
                            <div className="px-4 py-4">
                                <label className="flex items-center gap-3 cursor-pointer mb-3"
                                    onClick={() => setPayment("vnpay")}>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${payment === "vnpay" ? "border-blue-500" : "border-gray-300"}`}>
                                        {payment === "vnpay" && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-blue-500" />
                                        <p className="font-medium">Thanh toán online (VNPay)</p>
                                    </div>
                                </label>

                                {payment === "vnpay" && (
                                    <div className="ml-8 grid grid-cols-2 gap-3 mt-2 max-w-sm">
                                        <button
                                            onClick={() => setPayment("vnpay")}
                                            className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all border-blue-500 bg-blue-50`}
                                        >
                                            <Building2 className="w-6 h-6 text-blue-600" />
                                            <span className="text-sm font-medium text-blue-700">VNPay Gateway</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column - Order Pricing & Checkout summary */}
                <aside className="lg:col-span-1">
                    <div className="bg-white border border-gray-200 rounded-xl p-5 sticky top-8">
                        <h2 className="text-base font-bold text-gray-800 mb-4">Đơn hàng ({totalQuantity} sản phẩm)</h2>

                        {/* Products */}
                        {cartItems.map((item) => (
                            <div key={item.id} className="flex items-start gap-3 mb-5">
                                <div className="relative shrink-0">
                                    <div className="w-14 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                        <img
                                            src={item.bookImage || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200&h=300&fit=crop"}
                                            alt={item.bookTitle}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    {item.quantity > 0 && (
                                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">
                                            {item.quantity}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-700 leading-snug truncate">{item.bookTitle}</p>
                                    <p className="text-xs text-gray-400 mt-1">Đơn giá: {fmt(item.unitPrice)}</p>
                                </div>
                                <span className="text-sm font-medium text-gray-800 whitespace-nowrap">{fmt(item.unitPrice * item.quantity)}</span>
                            </div>
                        ))}

                        {/* Voucher Display */}
                        <div className="mb-5 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-700">Voucher / Mã giảm giá</span>
                                <button
                                    onClick={() => setShowVoucherModal(true)}
                                    className="text-blue-500 text-sm hover:underline cursor-pointer bg-transparent border-0"
                                >
                                    Chọn voucher
                                </button>
                            </div>

                            {selectedDiscountVoucher ? (
                                <div className="border border-green-200 bg-green-50 rounded-xl p-3 flex justify-between items-center gap-3">
                                    <div>
                                        <p className="font-semibold text-green-700 text-sm">{selectedDiscountVoucher.code}</p>
                                        <p className="text-xs text-green-600">{selectedDiscountVoucher.description}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-bold text-green-600 text-sm">-{fmt(orderDiscount)}</p>
                                        <button onClick={() => removeVoucher('discount')} className="text-red-500 text-xs hover:underline bg-transparent border-0 cursor-pointer">
                                            Bỏ
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-xl border border-dashed border-gray-300 px-3 py-2.5 text-sm text-gray-400 bg-white">
                                    Chưa chọn voucher giảm giá
                                </div>
                            )}

                            {selectedShippingVoucher ? (
                                <div className="border border-green-200 bg-green-50 rounded-xl p-3 flex justify-between items-center gap-3">
                                    <div>
                                        <p className="font-semibold text-green-700 text-sm">{selectedShippingVoucher.code}</p>
                                        <p className="text-xs text-green-600">{selectedShippingVoucher.description}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-bold text-green-600 text-sm">-{fmt(shippingDiscount)}</p>
                                        <button onClick={() => removeVoucher('shipping')} className="text-red-500 text-xs hover:underline bg-transparent border-0 cursor-pointer">
                                            Bỏ
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-xl border border-dashed border-gray-300 px-3 py-2.5 text-sm text-gray-400 bg-white">
                                    Chưa chọn voucher freeship
                                </div>
                            )}
                        </div>

                        {/* Price Breakdown */}
                        <div className="space-y-2 border-t border-gray-100 pt-4 mb-4">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Tạm tính</span><span>{fmt(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Phí vận chuyển</span><span className={shipping === 0 ? "text-emerald-500" : ""}>{shipping === 0 ? "Miễn phí" : fmt(shippingFee)}</span>
                            </div>
                            {selectedDiscountVoucher && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>Giảm giá đơn hàng</span><span>-{fmt(orderDiscount)}</span>
                                </div>
                            )}
                            {selectedShippingVoucher && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>Voucher freeship</span><span>-{fmt(shippingDiscount)}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center border-t border-gray-200 pt-4 mb-5">
                            <span className="font-semibold text-gray-800">Tổng cộng</span>
                            <span className="text-2xl font-bold text-blue-600">{fmt(total)}</span>
                        </div>

                        <button
                            disabled={!selectedAddressId || isOrdering}
                            onClick={handlePlaceOrder}
                            className={`w-full font-bold py-3.5 rounded-xl transition-all text-base uppercase tracking-wider cursor-pointer border-0
                                ${selectedAddressId && !isOrdering ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                        >
                            {isOrdering ? "Đang xử lý..." : "HOÀN TẤT ĐẶT HÀNG"}
                        </button>
                    </div>
                </aside>
            </div>

            {/* Address Modal */}
            {showModal && (
                <AddressModal
                    addresses={addresses}
                    selectedId={selectedAddressId}
                    onSelect={handleSelect}
                    onClose={() => setShowModal(false)}
                    onAdd={handleAdd}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onSetDefault={handleSetDefault}
                    isRequired={addresses.length === 0}
                />
            )}

            {/* Voucher Modal */}
            {showVoucherModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div className="bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden">
                        <div className="p-5 border-b">
                            <h3 className="font-bold text-xl">Chọn voucher</h3>
                        </div>
                        <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto">
                            <section className="space-y-3">
                                <h4 className="text-sm font-semibold text-gray-700">Voucher giảm giá tiền</h4>
                                {DISCOUNT_VOUCHERS.map(v => {
                                    const eligibility = promotionEligibilityMap[v.code] || { isEligible: true };
                                    const isSelected = selectedDiscountVoucher?.id === v.id;
                                    return (
                                        <div
                                            key={v.id}
                                            onClick={() => eligibility.isEligible && applyVoucher(v)}
                                            className={`border rounded-xl p-4 cursor-pointer transition-all ${
                                                isSelected
                                                    ? "border-blue-500 bg-blue-50"
                                                    : eligibility.isEligible
                                                    ? "border-gray-200 hover:border-blue-400 bg-white"
                                                    : "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
                                            }`}
                                        >
                                            <div className="flex justify-between gap-3">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-lg">{v.code}</p>
                                                        {isSelected && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-600">Đang chọn</span>}
                                                        {!eligibility.isEligible && (
                                                            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-600">
                                                                Không đủ ĐK
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600">{v.description}</p>
                                                    {!eligibility.isEligible && eligibility.reason && (
                                                        <p className="text-xs text-red-500 mt-1 font-medium italic">{eligibility.reason}</p>
                                                    )}
                                                </div>
                                                <div className="text-right shrink-0">
                                                    {v.type === 'percent' ? (
                                                        <p className="text-xl font-bold text-red-500">-{v.discount}%</p>
                                                    ) : (
                                                        <p className="text-xl font-bold text-red-500">-{fmt(v.discount)}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {DISCOUNT_VOUCHERS.length === 0 && (
                                    <p className="text-xs text-gray-400 italic">Không có mã giảm giá nào khả dụng.</p>
                                )}
                            </section>

                            <section className="space-y-3">
                                <h4 className="text-sm font-semibold text-gray-700">Voucher freeship</h4>
                                {SHIPPING_VOUCHERS.map(v => {
                                    const eligibility = promotionEligibilityMap[v.code] || { isEligible: true };
                                    const isSelected = selectedShippingVoucher?.id === v.id;
                                    return (
                                        <div
                                            key={v.id}
                                            onClick={() => eligibility.isEligible && applyVoucher(v)}
                                            className={`border rounded-xl p-4 cursor-pointer transition-all ${
                                                isSelected
                                                    ? "border-blue-500 bg-blue-50"
                                                    : eligibility.isEligible
                                                    ? "border-gray-200 hover:border-blue-400 bg-white"
                                                    : "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
                                            }`}
                                        >
                                            <div className="flex justify-between gap-3">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-lg">{v.code}</p>
                                                        {isSelected && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-600">Đang chọn</span>}
                                                        {!eligibility.isEligible && (
                                                            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-600">
                                                                Không đủ ĐK
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600">{v.description}</p>
                                                    {!eligibility.isEligible && eligibility.reason && (
                                                        <p className="text-xs text-red-500 mt-1 font-medium italic">{eligibility.reason}</p>
                                                    )}
                                                </div>
                                                <p className="text-xl font-bold text-red-500 shrink-0">Freeship</p>
                                            </div>
                                        </div>
                                    );
                                })}
                                {SHIPPING_VOUCHERS.length === 0 && (
                                    <p className="text-xs text-gray-400 italic">Không có mã freeship nào khả dụng.</p>
                                )}
                            </section>
                        </div>
                        <div className="p-4 border-t">
                            <button
                                onClick={() => setShowVoucherModal(false)}
                                className="w-full py-3 text-gray-600 font-medium border border-gray-300 rounded-xl cursor-pointer bg-white"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer position="top-center" autoClose={4000} hideProgressBar={false} />
        </div>
    );
}
