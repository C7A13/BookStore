import React, { useState, useEffect, useCallback } from "react";
import { Search, Truck, RefreshCw, PackageCheck, Eye, X } from "lucide-react";
import api from "../../utils/api";

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface Shipment {
    id: number;
    orderId: number;
    orderCode: string;
    carrierName: string | null;
    trackingCode: string | null;
    status: string;
    shippingFee: number;
    codAmount: number;
    shippedAt: string | null;
    deliveredAt: string | null;
    createdAt: string;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; dot: string }> = {
    READY_TO_PICK: { label: "Chờ lấy hàng", bg: "#fef9c3", color: "#ca8a04", dot: "#eab308" },
    PICKING:       { label: "Đang lấy hàng", bg: "#dbeafe", color: "#2563eb", dot: "#3b82f6" },
    DELIVERING:    { label: "Đang giao",      bg: "#ede9fe", color: "#7c3aed", dot: "#8b5cf6" },
    DELIVERED:     { label: "Đã giao",        bg: "#dcfce7", color: "#16a34a", dot: "#22c55e" },
    FAILED:        { label: "Thất bại",       bg: "#fee2e2", color: "#dc2626", dot: "#ef4444" },
    RETURNED:      { label: "Hoàn trả",       bg: "#f3f4f6", color: "#6b7280", dot: "#9ca3af" },
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
function DetailModal({ shipment, onClose }: { shipment: Shipment; onClose: () => void }) {
    const cfg = STATUS_CONFIG[shipment.status] || { label: shipment.status, bg: "#f1f5f9", color: "#475569", dot: "#94a3b8" };
    return (
        <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 28, width: 500, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,.15)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>Chi tiết vận chuyển #{shipment.id}</h3>
                    <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", color: "#94a3b8" }}><X size={20} /></button>
                </div>
                {[
                    { label: "Mã đơn hàng", value: shipment.orderCode || `#${shipment.orderId}` },
                    { label: "Đơn vị vận chuyển", value: shipment.carrierName || "—" },
                    { label: "Mã tracking", value: shipment.trackingCode || "—" },
                    { label: "Phí vận chuyển", value: vnd(shipment.shippingFee) },
                    { label: "Tiền thu hộ (COD)", value: vnd(shipment.codAmount) },
                    { label: "Ngày gửi", value: formatDateTime(shipment.shippedAt) },
                    { label: "Ngày giao", value: formatDateTime(shipment.deliveredAt) },
                    { label: "Tạo lúc", value: formatDateTime(shipment.createdAt) },
                ].map(row => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ fontSize: 13, color: "#64748b" }}>{row.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{row.value}</span>
                    </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0" }}>
                    <span style={{ fontSize: 13, color: "#64748b" }}>Trạng thái</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: cfg.bg, color: cfg.color }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot }} />{cfg.label}
                    </span>
                </div>
            </div>
        </div>
    );
}

// ─── UPDATE STATUS MODAL ──────────────────────────────────────────────────────
function UpdateStatusModal({ shipment, onClose, onSuccess }: { shipment: Shipment; onClose: () => void; onSuccess: () => void }) {
    const [status, setStatus] = useState(shipment.status);
    const [loading, setLoading] = useState(false);

    const handleUpdate = () => {
        setLoading(true);
        api.patch(`/admin/shipments/${shipment.id}/status`, { status })
            .then(() => { onSuccess(); onClose(); })
            .catch(() => alert("Cập nhật thất bại!"))
            .finally(() => setLoading(false));
    };

    return (
        <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 28, width: 400, boxShadow: "0 20px 60px rgba(0,0,0,.15)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>Cập nhật trạng thái</h3>
                    <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", color: "#94a3b8" }}><X size={20} /></button>
                </div>
                <p style={{ fontSize: 13, color: "#64748b", marginTop: 0 }}>Đơn vận chuyển #{shipment.id} — {shipment.orderCode}</p>
                <select value={status} onChange={e => setStatus(e.target.value)}
                    style={{ width: "100%", height: 42, padding: "0 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, outline: "none", background: "#fff", marginBottom: 20, cursor: "pointer" }}>
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                    ))}
                </select>
                <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={onClose} style={{ flex: 1, height: 40, borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", color: "#475569", fontWeight: 600, cursor: "pointer" }}>Hủy</button>
                    <button onClick={handleUpdate} disabled={loading} style={{ flex: 2, height: 40, borderRadius: 8, border: "none", background: "#6366f1", color: "#fff", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
                        {loading ? "Đang cập nhật..." : "Xác nhận"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function ShipmentManagement() {
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [detailModal, setDetailModal] = useState<Shipment | null>(null);
    const [updateModal, setUpdateModal] = useState<Shipment | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000); }

    const fetchShipments = useCallback(() => {
        setLoading(true);
        api.get("/admin/shipments", { params: { page, size: 10, status: statusFilter === "all" ? undefined : statusFilter } })
            .then(res => {
                const r = res.data.result;
                setShipments(r.data || r.content || []);
                setTotalPages(r.totalPages || 1);
                setTotalElements(r.total || r.totalElements || 0);
            })
            .catch(() => showToast("Không thể tải dữ liệu"))
            .finally(() => setLoading(false));
    }, [page, statusFilter]);

    useEffect(() => { fetchShipments(); }, [fetchShipments]);

    const filteredShipments = shipments.filter(s =>
        !search ||
        s.orderCode?.toLowerCase().includes(search.toLowerCase()) ||
        s.trackingCode?.toLowerCase().includes(search.toLowerCase()) ||
        s.carrierName?.toLowerCase().includes(search.toLowerCase())
    );

    // Stats
    const stats = Object.entries(STATUS_CONFIG).map(([key, cfg]) => ({
        key, label: cfg.label, count: shipments.filter(s => s.status === key).length, color: cfg.dot
    })).filter(s => s.count > 0);

    return (
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 24px 48px", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", background: "#f4f5f7", minHeight: "100vh" }}>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>Quản lý Vận chuyển</h1>
                    <p style={{ fontSize: 13, color: "#64748b", marginTop: 4, marginBottom: 0 }}>{totalElements} đơn vận chuyển trong hệ thống</p>
                </div>
                <button onClick={fetchShipments} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", color: "#475569", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>
                    <RefreshCw size={14} /> Làm mới
                </button>
            </div>

            {/* Stats */}
            {stats.length > 0 && (
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
                    {stats.map(s => (
                        <div key={s.key} style={{ background: "#fff", borderRadius: 10, padding: "12px 18px", border: "1px solid #e8eaf0", display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ width: 10, height: 10, borderRadius: "50%", background: s.color, display: "inline-block" }} />
                            <span style={{ fontSize: 13, color: "#475569" }}>{s.label}</span>
                            <span style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{s.count}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Toolbar */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ position: "relative", flex: 1, maxWidth: 380 }}>
                    <Search style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", width: 15, height: 15 }} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm mã đơn, mã tracking, đơn vị..."
                        style={{ width: "100%", height: 38, padding: "0 12px 0 36px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, background: "#fff", outline: "none", boxSizing: "border-box" }} />
                </div>
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                    style={{ height: 38, padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, background: "#fff", color: "#475569", outline: "none", cursor: "pointer" }}>
                    <option value="all">Tất cả trạng thái</option>
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
            </div>

            {/* Table */}
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8eaf0", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            {["#", "Mã đơn hàng", "Đơn vị VC", "Mã tracking", "Trạng thái", "Phí ship", "Ngày giao", "Thao tác"].map(h => (
                                <th key={h} style={thStyle}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: "#6366f1", fontWeight: 600 }}>Đang tải...</td></tr>
                        ) : filteredShipments.length === 0 ? (
                            <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>Không tìm thấy đơn vận chuyển nào</td></tr>
                        ) : filteredShipments.map((s, idx) => {
                            const cfg = STATUS_CONFIG[s.status] || { label: s.status, bg: "#f1f5f9", color: "#475569", dot: "#94a3b8" };
                            return (
                                <tr key={s.id} style={{ transition: "background .1s" }}>
                                    <td style={tdStyle}><span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace" }}>#{(page - 1) * 10 + idx + 1}</span></td>
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: 700, color: "#6366f1", fontSize: 13 }}>{s.orderCode || `#${s.orderId}`}</div>
                                    </td>
                                    <td style={{ ...tdStyle, fontSize: 13, color: "#334155" }}>
                                        {s.carrierName ? (
                                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                <Truck size={14} style={{ color: "#94a3b8" }} />
                                                {s.carrierName}
                                            </div>
                                        ) : "—"}
                                    </td>
                                    <td style={{ ...tdStyle, fontSize: 12, color: "#6366f1", fontFamily: "monospace" }}>{s.trackingCode || "—"}</td>
                                    <td style={tdStyle}>
                                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: cfg.bg, color: cfg.color }}>
                                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot }} />{cfg.label}
                                        </span>
                                    </td>
                                    <td style={{ ...tdStyle, fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{vnd(s.shippingFee)}</td>
                                    <td style={{ ...tdStyle, fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>{formatDateTime(s.deliveredAt)}</td>
                                    <td style={tdStyle}>
                                        <div style={{ display: "flex", gap: 6 }}>
                                            <button title="Xem chi tiết" onClick={() => setDetailModal(s)}
                                                style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                <Eye size={14} style={{ color: "#6366f1" }} />
                                            </button>
                                            <button title="Cập nhật trạng thái" onClick={() => setUpdateModal(s)}
                                                style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                <PackageCheck size={14} style={{ color: "#22c55e" }} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {!loading && totalPages > 1 && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderTop: "1px solid #f1f5f9", background: "#fafbfc" }}>
                        <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>Trang {page} / {totalPages} · {totalElements} đơn</p>
                        <div style={{ display: "flex", gap: 5 }}>
                            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.5 : 1 }}>❮</button>
                            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.5 : 1 }}>❯</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {detailModal && <DetailModal shipment={detailModal} onClose={() => setDetailModal(null)} />}
            {updateModal && <UpdateStatusModal shipment={updateModal} onClose={() => setUpdateModal(null)} onSuccess={() => { fetchShipments(); showToast("Cập nhật trạng thái thành công!"); }} />}

            {/* Toast */}
            {toast && (
                <div style={{ position: "fixed", bottom: 24, right: 24, background: "#0f172a", color: "#fff", padding: "12px 18px", borderRadius: 10, fontSize: 13, fontWeight: 500, boxShadow: "0 8px 30px rgba(0,0,0,.2)", display: "flex", alignItems: "center", gap: 8, zIndex: 100 }}>
                    <span style={{ color: "#22c55e" }}>✓</span> {toast}
                </div>
            )}
        </div>
    );
}
