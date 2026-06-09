import React, { useState, useEffect, useCallback } from "react";
import { Search, RefreshCw, CreditCard, Eye, X, RotateCcw, DollarSign, CheckCircle, Clock } from "lucide-react";
import api from "../../utils/api";

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface Payment {
    id: number;
    orderId: number;
    orderCode: string;
    method: string;
    amount: number;
    status: string;
    transactionRef: string | null;
    paidAt: string | null;
    createdAt: string;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const PAYMENT_STATUS: Record<string, { label: string; bg: string; color: string; dot: string }> = {
    PENDING:  { label: "Chờ thanh toán", bg: "#fef9c3", color: "#ca8a04", dot: "#eab308" },
    SUCCESS:  { label: "Thành công",     bg: "#dcfce7", color: "#16a34a", dot: "#22c55e" },
    FAILED:   { label: "Thất bại",       bg: "#fee2e2", color: "#dc2626", dot: "#ef4444" },
    EXPIRED:  { label: "Hết hạn",        bg: "#f3f4f6", color: "#6b7280", dot: "#9ca3af" },
    REFUNDED: { label: "Hoàn tiền",      bg: "#ede9fe", color: "#7c3aed", dot: "#8b5cf6" },
};

const METHOD_CONFIG: Record<string, { label: string; icon: string }> = {
    COD:           { label: "Tiền mặt (COD)", icon: "💵" },
    VNPAY:         { label: "VNPay",           icon: "🏦" },
    MOMO:          { label: "Momo",            icon: "📱" },
    ZALOPAY:       { label: "ZaloPay",         icon: "💙" },
    BANK_TRANSFER: { label: "Chuyển khoản",    icon: "🏧" },
};

function formatDateTime(s: string | null) {
    if (!s) return "—";
    const d = new Date(s);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function vnd(n: number) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n ?? 0);
}

const tdStyle: React.CSSProperties = { padding: "13px 16px", borderBottom: "1px solid #f1f5f9", verticalAlign: "middle" };
const thStyle: React.CSSProperties = { padding: "11px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: ".05em", background: "#f8fafc", borderBottom: "1px solid #e8eaf0" } as React.CSSProperties;

// ─── DETAIL MODAL ─────────────────────────────────────────────────────────────
function DetailModal({ payment, onClose, onRefund }: { payment: Payment; onClose: () => void; onRefund: () => void }) {
    const cfg = PAYMENT_STATUS[payment.status] || { label: payment.status, bg: "#f1f5f9", color: "#475569", dot: "#94a3b8" };
    const methodCfg = METHOD_CONFIG[payment.method] || { label: payment.method, icon: "💳" };
    const [refundNote, setRefundNote] = useState("");
    const [refundLoading, setRefundLoading] = useState(false);
    const canRefund = payment.status === "SUCCESS";

    const handleRefund = () => {
        if (!confirm("Xác nhận hoàn tiền cho giao dịch này?")) return;
        setRefundLoading(true);
        api.patch(`/admin/payments/${payment.id}/refund`, null, { params: { note: refundNote || undefined } })
            .then(() => { onRefund(); onClose(); })
            .catch(() => alert("Hoàn tiền thất bại!"))
            .finally(() => setRefundLoading(false));
    };

    return (
        <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 28, width: 520, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,.15)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>Chi tiết giao dịch #{payment.id}</h3>
                    <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", color: "#94a3b8" }}><X size={20} /></button>
                </div>
                {[
                    { label: "Mã đơn hàng", value: payment.orderCode || `#${payment.orderId}` },
                    { label: "Phương thức", value: `${methodCfg.icon} ${methodCfg.label}` },
                    { label: "Số tiền", value: <span style={{ fontWeight: 700, color: "#16a34a", fontSize: 15 }}>{vnd(payment.amount)}</span> },
                    { label: "Mã giao dịch", value: payment.transactionRef || "—" },
                    { label: "Thanh toán lúc", value: formatDateTime(payment.paidAt) },
                    { label: "Tạo lúc", value: formatDateTime(payment.createdAt) },
                ].map(row => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ fontSize: 13, color: "#64748b" }}>{row.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{row.value}</span>
                    </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
                    <span style={{ fontSize: 13, color: "#64748b" }}>Trạng thái</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: cfg.bg, color: cfg.color }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot }} />{cfg.label}
                    </span>
                </div>
                {canRefund && (
                    <div style={{ marginTop: 18 }}>
                        <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Ghi chú hoàn tiền (tuỳ chọn)</label>
                        <input value={refundNote} onChange={e => setRefundNote(e.target.value)} placeholder="Lý do hoàn tiền..."
                            style={{ width: "100%", height: 40, padding: "0 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", marginBottom: 12 }} />
                        <button onClick={handleRefund} disabled={refundLoading}
                            style={{ width: "100%", height: 42, borderRadius: 10, border: "none", background: refundLoading ? "#c4b5fd" : "#7c3aed", color: "#fff", fontWeight: 700, cursor: refundLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 14 }}>
                            <RotateCcw size={15} /> {refundLoading ? "Đang xử lý..." : "Hoàn tiền giao dịch này"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function PaymentManagement() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [methodFilter, setMethodFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [detailModal, setDetailModal] = useState<Payment | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000); }

    const fetchPayments = useCallback(() => {
        setLoading(true);
        api.get("/admin/payments")
            .then(res => {
                const data = res.data.result || [];
                setPayments(Array.isArray(data) ? data : data.data || []);
                setTotalElements(Array.isArray(data) ? data.length : data.total || 0);
                setTotalPages(1);
            })
            .catch(() => showToast("Không thể tải dữ liệu thanh toán"))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchPayments(); }, [fetchPayments]);

    const filtered = payments.filter(p => {
        const q = search.toLowerCase();
        const matchSearch = !q || p.orderCode?.toLowerCase().includes(q) || p.transactionRef?.toLowerCase().includes(q);
        const matchStatus = statusFilter === "all" || p.status === statusFilter;
        const matchMethod = methodFilter === "all" || p.method === methodFilter;
        return matchSearch && matchStatus && matchMethod;
    });

    // Pagination client-side
    const PAGE_SIZE = 10;
    const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

    // Stats
    const totalRevenue = payments.filter(p => p.status === "SUCCESS").reduce((sum, p) => sum + (p.amount || 0), 0);
    const refundCount = payments.filter(p => p.status === "REFUNDED").length;
    const pendingCount = payments.filter(p => p.status === "PENDING").length;

    return (
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 24px 48px", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", background: "#f4f5f7", minHeight: "100vh" }}>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>Quản lý Thanh toán</h1>
                    <p style={{ fontSize: 13, color: "#64748b", marginTop: 4, marginBottom: 0 }}>Theo dõi giao dịch và xử lý hoàn tiền</p>
                </div>
                <button onClick={fetchPayments} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", color: "#475569", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>
                    <RefreshCw size={14} /> Làm mới
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
                {[
                    { label: "Tổng giao dịch", value: totalElements, icon: <CreditCard size={20} />, accent: "#6366f1" },
                    { label: "Tổng doanh thu", value: vnd(totalRevenue), icon: <DollarSign size={20} />, accent: "#22c55e" },
                    { label: "Chờ thanh toán", value: pendingCount, icon: <Clock size={20} />, accent: "#f59e0b" },
                    { label: "Đã hoàn tiền", value: refundCount, icon: <RotateCcw size={20} />, accent: "#8b5cf6" },
                ].map((c, i) => (
                    <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", border: "1px solid #e8eaf0", borderLeft: `4px solid ${c.accent}`, display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: `${c.accent}18`, color: c.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {c.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: typeof c.value === "string" ? 14 : 26, fontWeight: 700, color: "#0f172a", lineHeight: 1 }}>{c.value}</div>
                            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{c.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
                <div style={{ position: "relative", flex: 1, minWidth: 260 }}>
                    <Search style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", width: 15, height: 15 }} />
                    <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Tìm mã đơn, mã giao dịch..."
                        style={{ width: "100%", height: 38, padding: "0 12px 0 36px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, background: "#fff", outline: "none", boxSizing: "border-box" }} />
                </div>
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                    style={{ height: 38, padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, background: "#fff", color: "#475569", outline: "none", cursor: "pointer" }}>
                    <option value="all">Tất cả trạng thái</option>
                    {Object.entries(PAYMENT_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <select value={methodFilter} onChange={e => { setMethodFilter(e.target.value); setPage(1); }}
                    style={{ height: 38, padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, background: "#fff", color: "#475569", outline: "none", cursor: "pointer" }}>
                    <option value="all">Tất cả phương thức</option>
                    {Object.entries(METHOD_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                </select>
            </div>

            {/* Table */}
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8eaf0", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            {["#", "Mã đơn hàng", "Phương thức", "Số tiền", "Trạng thái", "Mã giao dịch", "Thanh toán lúc", "Thao tác"].map(h => (
                                <th key={h} style={thStyle}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: "#6366f1", fontWeight: 600 }}>Đang tải...</td></tr>
                        ) : paged.length === 0 ? (
                            <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>Không tìm thấy giao dịch nào</td></tr>
                        ) : paged.map((p, idx) => {
                            const cfg = PAYMENT_STATUS[p.status] || { label: p.status, bg: "#f1f5f9", color: "#475569", dot: "#94a3b8" };
                            const methodCfg = METHOD_CONFIG[p.method] || { label: p.method, icon: "💳" };
                            return (
                                <tr key={p.id}>
                                    <td style={tdStyle}><span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace" }}>#{(page - 1) * PAGE_SIZE + idx + 1}</span></td>
                                    <td style={tdStyle}><span style={{ fontWeight: 700, color: "#6366f1", fontSize: 13 }}>{p.orderCode || `#${p.orderId}`}</span></td>
                                    <td style={{ ...tdStyle, fontSize: 13 }}>
                                        <span>{methodCfg.icon} {methodCfg.label}</span>
                                    </td>
                                    <td style={tdStyle}><span style={{ fontWeight: 700, color: "#16a34a", fontSize: 14 }}>{vnd(p.amount)}</span></td>
                                    <td style={tdStyle}>
                                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: cfg.bg, color: cfg.color }}>
                                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot }} />{cfg.label}
                                        </span>
                                    </td>
                                    <td style={{ ...tdStyle, fontSize: 11, color: "#6366f1", fontFamily: "monospace" }}>{p.transactionRef || "—"}</td>
                                    <td style={{ ...tdStyle, fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>{formatDateTime(p.paidAt)}</td>
                                    <td style={tdStyle}>
                                        <button title="Xem chi tiết & hoàn tiền" onClick={() => setDetailModal(p)}
                                            style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            {p.status === "SUCCESS" ? <RotateCcw size={14} style={{ color: "#7c3aed" }} /> : <Eye size={14} style={{ color: "#6366f1" }} />}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {!loading && pages > 1 && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderTop: "1px solid #f1f5f9", background: "#fafbfc" }}>
                        <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>Trang {page} / {pages} · {filtered.length} giao dịch</p>
                        <div style={{ display: "flex", gap: 5 }}>
                            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.5 : 1 }}>❮</button>
                            <button disabled={page === pages} onClick={() => setPage(p => p + 1)} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", cursor: page === pages ? "not-allowed" : "pointer", opacity: page === pages ? 0.5 : 1 }}>❯</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {detailModal && (
                <DetailModal payment={detailModal} onClose={() => setDetailModal(null)} onRefund={() => { fetchPayments(); showToast("Hoàn tiền thành công!"); }} />
            )}

            {/* Toast */}
            {toast && (
                <div style={{ position: "fixed", bottom: 24, right: 24, background: "#0f172a", color: "#fff", padding: "12px 18px", borderRadius: 10, fontSize: 13, fontWeight: 500, boxShadow: "0 8px 30px rgba(0,0,0,.2)", display: "flex", alignItems: "center", gap: 8, zIndex: 100 }}>
                    <span style={{ color: "#22c55e" }}>✓</span> {toast}
                </div>
            )}
        </div>
    );
}
