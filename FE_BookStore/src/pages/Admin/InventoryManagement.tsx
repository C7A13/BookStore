import React, { useState, useEffect, useCallback } from "react";
import { Search, PackagePlus, RefreshCw, AlertTriangle, ClipboardList, TrendingUp, Package } from "lucide-react";
import api from "../../utils/api";

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface InventoryLog {
    id: number;
    bookId: number;
    bookTitle: string;
    changeQty: number;
    type: string;
    referenceId: number | null;
    note: string | null;
    createdById: number | null;
    createdByName: string | null;
    createdAt: string;
}

interface LowStockBook {
    bookId: number;
    title: string;
    stockQuantity: number;
    reorderPoint: number;
}

type Tab = "logs" | "lowstock" | "adjust";

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const LOG_TYPE_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
    PURCHASE:   { label: "Nhập hàng",    bg: "#dcfce7", color: "#16a34a" },
    SALE:       { label: "Bán hàng",     bg: "#dbeafe", color: "#2563eb" },
    RETURN:     { label: "Hoàn trả",     bg: "#fef3c7", color: "#d97706" },
    ADJUSTMENT: { label: "Điều chỉnh",   bg: "#ede9fe", color: "#7c3aed" },
    DAMAGE:     { label: "Hàng hỏng",    bg: "#fee2e2", color: "#dc2626" },
};

function formatDateTime(s: string) {
    if (!s) return "—";
    const d = new Date(s);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const tdStyle: React.CSSProperties = { padding: "13px 16px", borderBottom: "1px solid #f1f5f9", verticalAlign: "middle" };
const thStyle: React.CSSProperties = { padding: "11px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: ".05em", background: "#f8fafc", borderBottom: "1px solid #e8eaf0" } as React.CSSProperties;

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function InventoryManagement() {
    const [tab, setTab] = useState<Tab>("logs");
    const [logs, setLogs] = useState<InventoryLog[]>([]);
    const [lowStock, setLowStock] = useState<LowStockBook[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [loadingLow, setLoadingLow] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

    // Adjust form
    const [adjBookId, setAdjBookId] = useState("");
    const [adjQty, setAdjQty] = useState("");
    const [adjType, setAdjType] = useState("ADJUSTMENT");
    const [adjNote, setAdjNote] = useState("");
    const [adjLoading, setAdjLoading] = useState(false);

    function showToast(msg: string, type: "ok" | "err" = "ok") {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    }

    const fetchLogs = useCallback(() => {
        setLoadingLogs(true);
        api.get("/admin/inventory/logs", { params: { page: page - 1, size: 10 } })
            .then(res => {
                const r = res.data.result;
                setLogs(r.data || r.content || []);
                setTotalPages(r.totalPages || 1);
                setTotalElements(r.total || r.totalElements || 0);
            })
            .catch(() => showToast("Không thể tải lịch sử kho hàng", "err"))
            .finally(() => setLoadingLogs(false));
    }, [page]);

    const fetchLowStock = useCallback(() => {
        setLoadingLow(true);
        api.get("/admin/inventory/low-stock", { params: { page: 0, size: 50 } })
            .then(res => {
                const r = res.data.result;
                setLowStock(r.data || r.content || []);
            })
            .catch(() => showToast("Không thể tải danh sách sắp hết hàng", "err"))
            .finally(() => setLoadingLow(false));
    }, []);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);
    useEffect(() => { fetchLowStock(); }, [fetchLowStock]);

    const handleAdjust = () => {
        if (!adjBookId || !adjQty) return showToast("Vui lòng nhập đầy đủ thông tin", "err");
        setAdjLoading(true);
        api.post("/admin/inventory/adjustments", {
            bookId: Number(adjBookId),
            changeQty: Number(adjQty),
            type: adjType,
            note: adjNote || null,
        })
            .then(() => {
                showToast("Điều chỉnh kho thành công!");
                setAdjBookId(""); setAdjQty(""); setAdjNote(""); setAdjType("ADJUSTMENT");
                fetchLogs(); fetchLowStock();
            })
            .catch(() => showToast("Điều chỉnh thất bại", "err"))
            .finally(() => setAdjLoading(false));
    };

    const filteredLogs = logs.filter(l =>
        !search || l.bookTitle?.toLowerCase().includes(search.toLowerCase()) ||
        l.createdByName?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 24px 48px", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", background: "#f4f5f7", minHeight: "100vh" }}>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>Quản lý Kho hàng</h1>
                    <p style={{ fontSize: 13, color: "#64748b", marginTop: 4, marginBottom: 0 }}>
                        Theo dõi tồn kho, lịch sử nhập/xuất và điều chỉnh số lượng sách
                    </p>
                </div>
                <button onClick={() => { fetchLogs(); fetchLowStock(); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", color: "#475569", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>
                    <RefreshCw size={14} /> Làm mới
                </button>
            </div>

            {/* Stats Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 22 }}>
                {[
                    { label: "Tổng lịch sử giao dịch", value: totalElements, icon: <ClipboardList size={20} />, accent: "#6366f1", bg: "from-indigo-500 to-indigo-600" },
                    { label: "Sách sắp hết hàng", value: lowStock.length, icon: <AlertTriangle size={20} />, accent: "#f59e0b", bg: "from-amber-500 to-orange-500" },
                    { label: "Mức tồn thấp nhất", value: lowStock.length > 0 ? Math.min(...lowStock.map(b => b.stockQuantity)) : "—", icon: <Package size={20} />, accent: "#ef4444", bg: "from-red-500 to-red-600" },
                ].map((c, i) => (
                    <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", border: "1px solid #e8eaf0", borderLeft: `4px solid ${c.accent}`, display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: `${c.accent}18`, color: c.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {c.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: 26, fontWeight: 700, color: "#0f172a", lineHeight: 1 }}>{c.value}</div>
                            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{c.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, background: "#fff", border: "1px solid #e8eaf0", borderRadius: 10, padding: 4, marginBottom: 20, width: "fit-content" }}>
                {([
                    { key: "logs", label: "📋 Lịch sử giao dịch" },
                    { key: "lowstock", label: "⚠️ Sắp hết hàng" },
                    { key: "adjust", label: "✏️ Điều chỉnh kho" },
                ] as { key: Tab; label: string }[]).map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)} style={{
                        padding: "8px 18px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all .15s",
                        background: tab === t.key ? "#6366f1" : "transparent",
                        color: tab === t.key ? "#fff" : "#64748b",
                    }}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ── TAB: LOGS ── */}
            {tab === "logs" && (
                <>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                        <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
                            <Search style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", width: 15, height: 15 }} />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo tên sách, nhân viên..."
                                style={{ width: "100%", height: 38, padding: "0 12px 0 36px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, background: "#fff", outline: "none", boxSizing: "border-box" }} />
                        </div>
                    </div>
                    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8eaf0", overflow: "hidden" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr>
                                    {["#", "Sách", "Loại giao dịch", "Thay đổi SL", "Ghi chú", "Người thực hiện", "Thời gian"].map(h => (
                                        <th key={h} style={thStyle}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loadingLogs ? (
                                    <tr><td colSpan={7} style={{ textAlign: "center", padding: 40, color: "#6366f1", fontWeight: 600 }}>Đang tải...</td></tr>
                                ) : filteredLogs.length === 0 ? (
                                    <tr><td colSpan={7} style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>Không có dữ liệu</td></tr>
                                ) : filteredLogs.map((log, idx) => {
                                    const cfg = LOG_TYPE_CONFIG[log.type] || { label: log.type, bg: "#f1f5f9", color: "#475569" };
                                    return (
                                        <tr key={log.id}>
                                            <td style={tdStyle}><span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace" }}>#{(page - 1) * 10 + idx + 1}</span></td>
                                            <td style={tdStyle}>
                                                <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 13 }}>{log.bookTitle || `Sách #${log.bookId}`}</div>
                                                <div style={{ fontSize: 11, color: "#94a3b8" }}>ID: {log.bookId}</div>
                                            </td>
                                            <td style={tdStyle}>
                                                <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: cfg.bg, color: cfg.color }}>
                                                    {cfg.label}
                                                </span>
                                            </td>
                                            <td style={tdStyle}>
                                                <span style={{ fontWeight: 700, fontSize: 15, color: log.changeQty > 0 ? "#16a34a" : "#dc2626" }}>
                                                    {log.changeQty > 0 ? `+${log.changeQty}` : log.changeQty}
                                                </span>
                                            </td>
                                            <td style={{ ...tdStyle, fontSize: 13, color: "#475569", maxWidth: 200 }}>{log.note || "—"}</td>
                                            <td style={{ ...tdStyle, fontSize: 13, color: "#334155" }}>{log.createdByName || "Hệ thống"}</td>
                                            <td style={{ ...tdStyle, fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>{formatDateTime(log.createdAt)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {!loadingLogs && totalPages > 1 && (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderTop: "1px solid #f1f5f9", background: "#fafbfc" }}>
                                <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>Trang {page} / {totalPages} · {totalElements} giao dịch</p>
                                <div style={{ display: "flex", gap: 5 }}>
                                    <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.5 : 1 }}>❮</button>
                                    <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.5 : 1 }}>❯</button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* ── TAB: LOW STOCK ── */}
            {tab === "lowstock" && (
                <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8eaf0", overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr>
                                {["#", "Tên sách", "Tồn kho hiện tại", "Mức đặt hàng lại", "Trạng thái"].map(h => (
                                    <th key={h} style={thStyle}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loadingLow ? (
                                <tr><td colSpan={5} style={{ textAlign: "center", padding: 40, color: "#6366f1", fontWeight: 600 }}>Đang tải...</td></tr>
                            ) : lowStock.length === 0 ? (
                                <tr><td colSpan={5} style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>🎉 Không có sách nào sắp hết hàng</td></tr>
                            ) : lowStock.map((b, idx) => {
                                const critical = b.stockQuantity <= Math.floor(b.reorderPoint / 2);
                                return (
                                    <tr key={b.bookId}>
                                        <td style={tdStyle}><span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace" }}>#{idx + 1}</span></td>
                                        <td style={tdStyle}>
                                            <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 13 }}>{b.title}</div>
                                            <div style={{ fontSize: 11, color: "#94a3b8" }}>ID: {b.bookId}</div>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{ fontWeight: 700, fontSize: 16, color: critical ? "#dc2626" : "#d97706" }}>{b.stockQuantity}</span>
                                            <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: 4 }}>cuốn</span>
                                        </td>
                                        <td style={{ ...tdStyle, fontSize: 13, color: "#475569" }}>{b.reorderPoint} cuốn</td>
                                        <td style={tdStyle}>
                                            <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: critical ? "#fee2e2" : "#fef3c7", color: critical ? "#dc2626" : "#d97706" }}>
                                                {critical ? "🔴 Cực thấp" : "🟡 Sắp hết"}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── TAB: ADJUST ── */}
            {tab === "adjust" && (
                <div style={{ maxWidth: 560 }}>
                    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8eaf0", padding: 28 }}>
                        <h2 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", marginTop: 0, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                            <PackagePlus size={18} style={{ color: "#6366f1" }} /> Điều chỉnh tồn kho
                        </h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>ID Sách <span style={{ color: "#ef4444" }}>*</span></label>
                                <input value={adjBookId} onChange={e => setAdjBookId(e.target.value)} type="number" placeholder="Nhập ID sách..."
                                    style={{ width: "100%", height: 40, padding: "0 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                            </div>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Loại giao dịch <span style={{ color: "#ef4444" }}>*</span></label>
                                <select value={adjType} onChange={e => setAdjType(e.target.value)}
                                    style={{ width: "100%", height: 40, padding: "0 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, outline: "none", background: "#fff", cursor: "pointer" }}>
                                    <option value="ADJUSTMENT">Điều chỉnh</option>
                                    <option value="PURCHASE">Nhập hàng</option>
                                    <option value="RETURN">Hoàn trả</option>
                                    <option value="DAMAGE">Hàng hỏng</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                                    Thay đổi số lượng <span style={{ color: "#ef4444" }}>*</span>
                                    <span style={{ fontSize: 11, fontWeight: 400, color: "#94a3b8", marginLeft: 6 }}>Nhập số âm để giảm</span>
                                </label>
                                <input value={adjQty} onChange={e => setAdjQty(e.target.value)} type="number" placeholder="VD: 50 hoặc -10"
                                    style={{ width: "100%", height: 40, padding: "0 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                            </div>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Ghi chú</label>
                                <textarea value={adjNote} onChange={e => setAdjNote(e.target.value)} placeholder="Lý do điều chỉnh..."
                                    rows={3} style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }} />
                            </div>
                            <button onClick={handleAdjust} disabled={adjLoading}
                                style={{ height: 44, borderRadius: 10, border: "none", background: adjLoading ? "#a5b4fc" : "#6366f1", color: "#fff", fontWeight: 700, fontSize: 14, cursor: adjLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background .2s" }}>
                                {adjLoading ? "Đang xử lý..." : <><TrendingUp size={16} /> Xác nhận điều chỉnh</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div style={{ position: "fixed", bottom: 24, right: 24, background: toast.type === "ok" ? "#0f172a" : "#dc2626", color: "#fff", padding: "12px 18px", borderRadius: 10, fontSize: 13, fontWeight: 500, boxShadow: "0 8px 30px rgba(0,0,0,.2)", display: "flex", alignItems: "center", gap: 8, zIndex: 100 }}>
                    <span>{toast.type === "ok" ? "✓" : "✗"}</span> {toast.msg}
                </div>
            )}
        </div>
    );
}
