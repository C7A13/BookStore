import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, X } from "lucide-react";
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../../utils/api";

// ─── Types ─────────────────────────────────────────
interface OrderItem {
    id: number;
    bookId: number;
    bookTitle: string;
    bookImage: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
}

interface Order {
    id: number;
    code: string;
    orderedAt: string;
    status: string;
    totalAmount: number;
    subtotal: number;
    shippingFee: number;
    discountAmount: number;
    address: string;
    note?: string;
    items: OrderItem[];
    paymentMethod?: string;
    paymentStatus?: string;
}

// ─── Helper ────────────────────────────────────────
const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString("vi-VN") + " " + d.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' });
    } catch {
        return dateStr;
    }
};

const getStatusText = (status: string) => {
    switch (status) {
        case "PENDING": return "Chờ xác nhận";
        case "CONFIRMED": return "Đã xác nhận";
        case "PACKING": return "Đang đóng gói";
        case "SHIPPED": return "Đang giao";
        case "DELIVERED": return "Đã giao";
        case "CANCELLED": return "Đã huỷ";
        case "REFUNDED": return "Đã hoàn tiền";
        default: return status;
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case "DELIVERED": return "text-green-600";
        case "SHIPPED":
        case "PACKING":
        case "CONFIRMED": return "text-yellow-600 font-semibold";
        case "PENDING": return "text-blue-500 font-semibold";
        case "CANCELLED":
        case "REFUNDED": return "text-red-500";
        default: return "text-gray-500";
    }
};

// ─── Component ─────────────────────────────────────
export default function OrderHistoryPage() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>("ALL");

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/orders?t=${Date.now()}`);
            if (res.data?.result) {
                // Backend returns sorted by date usually, if not we sort newest first
                const data = res.data.result;
                data.sort((a: Order, b: Order) => new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime());
                setOrders(data);
            }
        } catch (error) {
            console.error("Lỗi lấy lịch sử đơn hàng:", error);
            toast.error("Vui lòng đăng nhập để xem đơn hàng!");
            setTimeout(() => navigate("/login"), 1500);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();

        const handleVisibilityAndPageShow = (event: Event) => {
            if (event.type === "pageshow" || document.visibilityState === "visible") {
                fetchOrders();
            }
        };

        window.addEventListener("pageshow", handleVisibilityAndPageShow);
        document.addEventListener("visibilitychange", handleVisibilityAndPageShow);

        const params = new URLSearchParams(window.location.search);
        const paymentStatus = params.get("paymentStatus");
        if (paymentStatus === "success") {
            toast.success("🎉 Thanh toán đơn hàng thành công!");
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (paymentStatus === "failed") {
            toast.error("❌ Thanh toán thất bại hoặc đã bị huỷ!");
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        return () => {
            window.removeEventListener("pageshow", handleVisibilityAndPageShow);
            document.removeEventListener("visibilitychange", handleVisibilityAndPageShow);
        };
    }, []);

    const handleRepay = async (orderId: number) => {
        try {
            const res = await api.post("/payments", { orderId });
            if (res.data?.result?.paymentUrl) {
                window.location.href = res.data.result.paymentUrl;
            } else {
                toast.error("Không tạo được liên kết thanh toán mới!");
            }
        } catch (error) {
            console.error("Lỗi thanh toán lại:", error);
            toast.error("Có lỗi xảy ra khi thực hiện thanh toán lại!");
        }
    };

    const handleCancelOrder = (orderId: number, code: string) => {
        Swal.fire({
            title: "Xác nhận huỷ đơn?",
            html: `Bạn có chắc muốn huỷ đơn hàng <strong>${code}</strong>?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Có, huỷ đơn",
            cancelButtonText: "Không, quay lại",
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.post(`/orders/${orderId}/cancel`);
                    toast.success(`Đơn hàng ${code} đã được huỷ thành công!`);
                    fetchOrders();
                    if (selectedOrder && selectedOrder.id === orderId) {
                        setSelectedOrder(null);
                    }
                } catch (err: any) {
                    console.error("Lỗi huỷ đơn hàng:", err);
                    const errMsg = err.response?.data?.message || "Không thể huỷ đơn hàng!";
                    toast.error(errMsg);
                }
            }
        });
    };

    const handleViewDetail = async (orderId: number) => {
        try {
            const res = await api.get(`/orders/${orderId}`);
            if (res.data?.result) {
                setSelectedOrder(res.data.result);
            }
        } catch (error) {
            console.error("Lỗi lấy chi tiết đơn hàng:", error);
            toast.error("Không thể tải chi tiết đơn hàng!");
        }
    };

    const handleReorder = async (order: Order) => {
        try {
            // Add all items from the order back into the cart
            for (const item of order.items) {
                await api.post("/cart/items", {
                    bookId: item.bookId,
                    quantity: item.quantity
                });
            }
            window.dispatchEvent(new Event("cart_updated"));
            toast.success("Đã thêm các sản phẩm trong đơn hàng vào giỏ!");
        } catch (error) {
            console.error("Lỗi mua lại:", error);
            toast.error("Không thể thêm lại sản phẩm vào giỏ!");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 pt-20">
                <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500 text-sm font-medium">Đang tải lịch sử đơn hàng...</p>
            </div>
        );
    }

    const filteredOrders = orders.filter(order => {
        if (activeTab === "ALL") return true;
        if (activeTab === "PENDING") return order.status === "PENDING";
        if (activeTab === "PROCESSING") return ["CONFIRMED", "PACKING", "SHIPPED"].includes(order.status);
        if (activeTab === "DELIVERED") return order.status === "DELIVERED";
        if (activeTab === "CANCELLED") return ["CANCELLED", "REFUNDED"].includes(order.status);
        return true;
    });

    return (
        <div className="min-h-screen bg-gray-50 pt-24 px-4 pb-12">
            <div className="max-w-5xl mx-auto">

                <h1 className="text-2xl font-bold mb-6 text-gray-800">
                    Danh sách đơn hàng
                </h1>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-xl border p-12 text-center text-gray-500 shadow-sm">
                        <div className="text-5xl mb-4">📦</div>
                        <p className="font-medium text-lg">Bạn chưa có đơn hàng nào</p>
                        <button
                            onClick={() => navigate("/books")}
                            className="mt-4 px-6 py-2.5 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition"
                        >
                            Khám phá sách ngay
                        </button>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {/* Tabs Filter */}
                        <div className="flex border bg-white rounded-xl shadow-sm overflow-x-auto">
                            {[
                                { id: "ALL", label: "Tất cả" },
                                { id: "PENDING", label: "Chờ xác nhận" },
                                { id: "PROCESSING", label: "Đang xử lý" },
                                { id: "DELIVERED", label: "Đã giao" },
                                { id: "CANCELLED", label: "Đã huỷ" }
                            ].map(tab => {
                                const count = orders.filter(order => {
                                    if (tab.id === "ALL") return true;
                                    if (tab.id === "PENDING") return order.status === "PENDING";
                                    if (tab.id === "PROCESSING") return ["CONFIRMED", "PACKING", "SHIPPED"].includes(order.status);
                                    if (tab.id === "DELIVERED") return order.status === "DELIVERED";
                                    if (tab.id === "CANCELLED") return ["CANCELLED", "REFUNDED"].includes(order.status);
                                    return false;
                                }).length;

                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex-1 py-3 px-4 text-sm font-semibold border-b-2 text-center transition whitespace-nowrap cursor-pointer border-t-0 border-x-0 bg-transparent ${
                                            activeTab === tab.id
                                                ? "border-cyan-600 text-cyan-600 bg-cyan-50/20"
                                                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50/50"
                                        }`}
                                    >
                                        {tab.label} ({count})
                                    </button>
                                );
                            })}
                        </div>

                        {filteredOrders.length === 0 ? (
                            <div className="bg-white rounded-xl border p-12 text-center text-gray-500 shadow-sm">
                                <div className="text-5xl mb-4">🔍</div>
                                <p className="font-medium text-lg">Không có đơn hàng nào ở trạng thái này</p>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {filteredOrders.map(order => (
                                    <div key={order.id} className="bg-white rounded-xl border shadow-sm overflow-hidden">
                                        {/* Header */}
                                        <div className="flex justify-between items-center px-4 py-3 border-b bg-gray-50">
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="font-semibold text-gray-700">
                                                    Mã: {order.code}
                                                </span>
                                                <span className="text-gray-400">|</span>
                                                <span className="text-gray-500">{formatDate(order.orderedAt)}</span>
                                            </div>

                                            <span className={`text-sm ${getStatusColor(order.status)}`}>
                                                {getStatusText(order.status)}
                                            </span>
                                        </div>

                                        {/* Body */}
                                        <div className="p-4 divide-y divide-gray-100">
                                            {order.items.map(item => (
                                                <div key={item.id} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                                                    <img
                                                        src={item.bookImage || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200&h=300&fit=crop"}
                                                        className="w-12 h-16 object-cover rounded border bg-white shrink-0"
                                                        alt={item.bookTitle}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-gray-800 line-clamp-1 text-sm">
                                                            {item.bookTitle}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Số lượng: x{item.quantity} | Đơn giá: {fmt(item.unitPrice)}
                                                        </p>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <p className="text-sm font-semibold text-gray-800">
                                                            {fmt(item.subtotal)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Footer */}
                                        <div className="flex justify-between items-center px-4 py-3 border-t bg-gray-50 flex-wrap gap-3">
                                            {/* Left side: Price & Payment Info */}
                                            <div className="text-left flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-gray-500">Tổng thanh toán:</span>
                                                    <span className="text-lg font-bold text-red-500">
                                                        {fmt(order.totalAmount)}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-500 flex items-center flex-wrap gap-x-2 gap-y-1">
                                                    <span>Phương thức: <span className="font-semibold text-gray-700">{order.paymentMethod === "VNPAY" ? "Cổng VNPay" : "COD"}</span></span>
                                                    {order.paymentMethod === "VNPAY" && (
                                                        <>
                                                            <span className="text-gray-300">|</span>
                                                            <span>Trạng thái: <span className={`font-semibold ${order.paymentStatus === "SUCCESS" ? "text-green-600" :
                                                                    order.paymentStatus === "FAILED" ? "text-red-500" :
                                                                        order.paymentStatus === "EXPIRED" ? "text-orange-500" :
                                                                            "text-blue-500"
                                                                }`}>{
                                                                    order.paymentStatus === "SUCCESS" ? "Đã thanh toán" :
                                                                        order.paymentStatus === "FAILED" ? "Thanh toán thất bại" :
                                                                            order.paymentStatus === "EXPIRED" ? "Liên kết hết hạn" :
                                                                                "Chờ thanh toán"
                                                                }</span></span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Right side: Action Buttons */}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleViewDetail(order.id)}
                                                    className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100 flex items-center gap-1 cursor-pointer bg-white"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    Xem chi tiết
                                                </button>

                                                {["DELIVERED"].includes(order.status) && (
                                                    <button
                                                        onClick={() => handleReorder(order)}
                                                        className="px-4 py-2 text-sm bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 cursor-pointer border-0"
                                                    >
                                                        Mua lại
                                                    </button>
                                                )}

                                                {order.status === "PENDING" && order.paymentMethod === "VNPAY" && (!order.paymentStatus || order.paymentStatus !== "SUCCESS") && (
                                                    <button
                                                        onClick={() => handleRepay(order.id)}
                                                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer border-0"
                                                    >
                                                        Thanh toán lại
                                                    </button>
                                                )}

                                                {["PENDING", "CONFIRMED"].includes(order.status) && (
                                                    <button
                                                        onClick={() => handleCancelOrder(order.id, order.code)}
                                                        className="px-4 py-2 text-sm border text-red-500 border-red-400 rounded-lg hover:bg-red-50 cursor-pointer bg-white"
                                                    >
                                                        Huỷ đơn
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* MODAL CHI TIẾT */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-lg rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">

                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b">
                            <h2 className="font-bold text-lg">Chi tiết đơn hàng {selectedOrder.code}</h2>
                            <button onClick={() => setSelectedOrder(null)} className="cursor-pointer border-0 bg-transparent">
                                <X className="w-6 h-6 text-gray-600" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-4 overflow-y-auto flex-1">

                            {/* Info */}
                            <div className="text-sm space-y-1">
                                <p><b>Mã đơn:</b> {selectedOrder.code}</p>
                                <p><b>Ngày đặt:</b> {formatDate(selectedOrder.orderedAt)}</p>
                                <p><b>Trạng thái đơn hàng:</b> <span className={getStatusColor(selectedOrder.status)}>{getStatusText(selectedOrder.status)}</span></p>
                                <p><b>Phương thức thanh toán:</b> <span className="font-semibold text-gray-700">{selectedOrder.paymentMethod === "VNPAY" ? "Cổng VNPay" : "Thanh toán khi nhận hàng (COD)"}</span></p>
                                {selectedOrder.paymentMethod === "VNPAY" && (
                                    <p><b>Trạng thái thanh toán:</b> <span className={`font-semibold ${selectedOrder.paymentStatus === "SUCCESS" ? "text-green-600" :
                                            selectedOrder.paymentStatus === "FAILED" ? "text-red-500" :
                                                selectedOrder.paymentStatus === "EXPIRED" ? "text-orange-500" :
                                                    "text-blue-500"
                                        }`}>{
                                            selectedOrder.paymentStatus === "SUCCESS" ? "Đã thanh toán thành công" :
                                                selectedOrder.paymentStatus === "FAILED" ? "Thanh toán thất bại / Huỷ" :
                                                    selectedOrder.paymentStatus === "EXPIRED" ? "Liên kết hết hạn" :
                                                        "Chờ thanh toán"
                                        }</span></p>
                                )}
                                {selectedOrder.note && <p><b>Ghi chú:</b> {selectedOrder.note}</p>}
                            </div>

                            {/* Address */}
                            <div className="border rounded-lg p-3 bg-gray-50 text-sm">
                                <p className="font-semibold mb-1">Địa chỉ nhận hàng</p>
                                <p className="text-gray-700">{selectedOrder.address}</p>
                            </div>

                            {/* Items */}
                            <div className="space-y-3">
                                <p className="font-semibold text-sm">Sản phẩm</p>
                                {selectedOrder.items.map(item => (
                                    <div key={item.id} className="flex gap-3">
                                        <img
                                            src={item.bookImage || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200&h=300&fit=crop"}
                                            className="w-12 h-16 object-cover rounded border bg-white shrink-0"
                                            alt={item.bookTitle}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">{item.bookTitle}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Đơn giá: {fmt(item.unitPrice)} | Số lượng: {item.quantity}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-semibold text-gray-800">
                                                {fmt(item.subtotal)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Total Calculation breakdown */}
                            <div className="space-y-2 border-t pt-3 text-sm">
                                <div className="flex justify-between text-gray-500">
                                    <span>Tạm tính</span>
                                    <span>{fmt(selectedOrder.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>Phí vận chuyển</span>
                                    <span>{selectedOrder.shippingFee === 0 ? "Miễn phí" : fmt(selectedOrder.shippingFee)}</span>
                                </div>
                                {selectedOrder.discountAmount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Giảm giá</span>
                                        <span>-{fmt(selectedOrder.discountAmount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold border-t pt-2 mt-2 text-base">
                                    <span>Tổng cộng</span>
                                    <span className="text-red-500">
                                        {fmt(selectedOrder.totalAmount)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
                            {selectedOrder.status === "PENDING" && selectedOrder.paymentMethod === "VNPAY" && (!selectedOrder.paymentStatus || selectedOrder.paymentStatus !== "SUCCESS") && (
                                <button
                                    onClick={() => handleRepay(selectedOrder.id)}
                                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer border-0"
                                >
                                    Thanh toán lại
                                </button>
                            )}
                            {["PENDING", "CONFIRMED"].includes(selectedOrder.status) && (
                                <button
                                    onClick={() => handleCancelOrder(selectedOrder.id, selectedOrder.code)}
                                    className="px-4 py-2 text-sm border text-red-500 border-red-400 rounded-lg hover:bg-red-50 cursor-pointer bg-white"
                                >
                                    Huỷ đơn
                                </button>
                            )}
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 cursor-pointer bg-white"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
}
