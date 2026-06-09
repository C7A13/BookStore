import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Search, Plus, Pencil, Trash2, X, Calendar, Ticket, Percent, DollarSign, Truck } from "lucide-react";
import api from "../../utils/api";

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface Promotion {
    id: number;
    code: string;
    name: string;
    type: "PERCENT" | "FIXED_AMOUNT" | "FREE_SHIPPING";
    value: number;
    maxDiscount: number | null;
    minOrderValue: number;
    usageLimit: number | null;
    usagePerCustomer: number;
    usedCount: number;
    isActive: boolean;
    validFrom: string | null;
    validTo: string | null;
}

interface PromotionStats {
    total: number;
    active: number;
    totalUsed: number;
    freeShipping: number;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const vnd = (n: number | null) => {
    if (n === null || n === undefined) return "—";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
};

function formatDateTime(s: string | null) {
    if (!s) return "Không giới hạn";
    const d = new Date(s);
    if (isNaN(d.getTime())) return "Không giới hạn";
    return d.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

// Convert ISO string from backend to datetime-local value (YYYY-MM-DDTHH:mm)
function toDatetimeLocal(s: string | null) {
    if (!s) return "";
    const d = new Date(s);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ─── STYLE TOKENS ─────────────────────────────────────────────────────────────
const tdStyle: React.CSSProperties = { padding: "14px 16px", borderBottom: "1px solid #f1f5f9", verticalAlign: "middle" };
const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 5, display: "block" };
const inputStyle: React.CSSProperties = { width: "100%", height: 38, padding: "0 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, background: "#fff", outline: "none", boxSizing: "border-box" };

const initialForm = {
    code: "",
    name: "",
    type: "PERCENT" as "PERCENT" | "FIXED_AMOUNT" | "FREE_SHIPPING",
    value: 0,
    maxDiscount: "" as any,
    minOrderValue: 0,
    usageLimit: "" as any,
    usagePerCustomer: 1,
    validFrom: "",
    validTo: "",
};

export default function PromotionManagement() {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(false);
    
    // Stats
    const [stats, setStats] = useState<PromotionStats>({ total: 0, active: 0, totalUsed: 0, freeShipping: 0 });
    
    // Toast & Dialog States
    const [toast, setToast] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState(initialForm);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    function showToast(msg: string) {
        setToast(msg);
        setTimeout(() => setToast(null), 2800);
    }

    // Load statistics based on all promotions
    const fetchStats = useCallback(() => {
        api.get("/admin/promotions", {
            params: { page: 0, size: 10 }
        })
        .then(res => {
            const data: Promotion[] = res.data.result.data || [];
            const now = new Date();
            setStats({
                total: data.length,
                active: data.filter(p => p.isActive && (!p.validTo || new Date(p.validTo) > now)).length,
                totalUsed: data.reduce((sum, p) => sum + (p.usedCount || 0), 0),
                freeShipping: data.filter(p => p.type === "FREE_SHIPPING").length
            });
        })
        .catch(err => {
            console.error("Error loading promo stats:", err);
        });
    }, []);

    // Load paginated list of promotions
    const fetchPromotions = useCallback(() => {
        setLoading(true);
        api.get("/admin/promotions", {
            params: {
                page: page - 1,
                size: 10
            }
        })
        .then(res => {
            const result = res.data.result;
            setPromotions(result.data || []);
            setTotalPages(result.totalPages || 1);
            setTotalElements(result.total || 0);
        })
        .catch(err => {
            console.error("Error loading promotions:", err);
            showToast("Không thể tải danh sách khuyến mãi");
        })
        .finally(() => {
            setLoading(false);
        });
    }, [page]);

    useEffect(() => {
        fetchPromotions();
    }, [fetchPromotions]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // Handle Quick Toggle Status
    const handleToggleStatus = (promo: Promotion) => {
        api.patch(`/admin/promotions/${promo.id}/toggle-status`)
        .then(() => {
            setPromotions(prev =>
                prev.map(p => p.id === promo.id ? { ...p, isActive: !p.isActive } : p)
            );
            fetchStats();
            showToast(`Đã ${promo.isActive ? "vô hiệu hóa" : "kích hoạt"} mã ${promo.code}`);
        })
        .catch(err => {
            console.error("Error toggling promo status:", err);
            alert("Đổi trạng thái khuyến mãi thất bại!");
        });
    };

    // Handle Delete
    const handleDelete = (promo: Promotion) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa mã khuyến mãi "${promo.code}"?`)) return;
        
        api.delete(`/admin/promotions/${promo.id}`)
        .then(() => {
            showToast(`Đã xóa mã khuyến mãi ${promo.code}`);
            fetchPromotions();
            fetchStats();
        })
        .catch(err => {
            console.error("Error deleting promo:", err);
            alert("Xóa mã khuyến mãi thất bại!");
        });
    };

    // Open Modal for Add
    const handleOpenAdd = () => {
        setEditingId(null);
        setFormData(initialForm);
        setFormErrors({});
        setIsFormOpen(true);
    };

    // Open Modal for Edit
    const handleOpenEdit = (promo: Promotion) => {
        setEditingId(promo.id);
        setFormData({
            code: promo.code,
            name: promo.name,
            type: promo.type,
            value: promo.value,
            maxDiscount: promo.maxDiscount !== null ? promo.maxDiscount : "",
            minOrderValue: promo.minOrderValue,
            usageLimit: promo.usageLimit !== null ? promo.usageLimit : "",
            usagePerCustomer: promo.usagePerCustomer,
            validFrom: toDatetimeLocal(promo.validFrom),
            validTo: toDatetimeLocal(promo.validTo),
        });
        setFormErrors({});
        setIsFormOpen(true);
    };

    // Validate Form Fields
    const validateForm = () => {
        const errors: Record<string, string> = {};
        if (!formData.code.trim()) errors.code = "Mã khuyến mãi không được trống";
        if (!formData.name.trim()) errors.name = "Tên chương trình không được trống";
        if (formData.value === undefined || formData.value < 0) errors.value = "Giá trị không hợp lệ";
        if (formData.type === "PERCENT" && formData.value > 100) errors.value = "Tỷ lệ giảm giá không vượt quá 100%";
        if (formData.minOrderValue < 0) errors.minOrderValue = "Giá trị đơn hàng tối thiểu không hợp lệ";
        if (formData.usagePerCustomer < 1) errors.usagePerCustomer = "Số lượt dùng tối thiểu trên mỗi khách là 1";

        if (formData.validFrom && formData.validTo) {
            if (new Date(formData.validFrom) >= new Date(formData.validTo)) {
                errors.validTo = "Thời gian kết thúc phải sau thời gian bắt đầu";
            }
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle Form Submit
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        const payload = {
            code: formData.code.trim().toUpperCase(),
            name: formData.name.trim(),
            type: formData.type,
            value: Number(formData.value),
            maxDiscount: formData.maxDiscount !== "" ? Number(formData.maxDiscount) : null,
            minOrderValue: Number(formData.minOrderValue),
            usageLimit: formData.usageLimit !== "" ? Number(formData.usageLimit) : null,
            usagePerCustomer: Number(formData.usagePerCustomer),
            validFrom: formData.validFrom ? new Date(formData.validFrom).toISOString() : null,
            validTo: formData.validTo ? new Date(formData.validTo).toISOString() : null,
        };

        const apiCall = editingId
            ? api.put(`/admin/promotions/${editingId}`, payload)
            : api.post("/admin/promotions", payload);

        apiCall
        .then(() => {
            showToast(editingId ? "Cập nhật mã khuyến mãi thành công!" : "Tạo mới mã khuyến mãi thành công!");
            setIsFormOpen(false);
            fetchPromotions();
            fetchStats();
        })
        .catch(err => {
            console.error("Error saving promo:", err);
            const msg = err.response?.data?.message || "Lưu thông tin thất bại!";
            alert(msg);
        });
    };

    // Client-side filtering of list for search & type selection
    const filtered = useMemo(() => {
        return promotions.filter(p => {
            const q = search.toLowerCase();
            const matchSearch = !q || p.code.toLowerCase().includes(q) || p.name.toLowerCase().includes(q);
            const matchType = typeFilter === "all" || p.type === typeFilter;
            
            const now = new Date();
            let matchStatus = true;
            if (statusFilter === "active") {
                matchStatus = p.isActive && (!p.validTo || new Date(p.validTo) > now);
            } else if (statusFilter === "inactive") {
                matchStatus = !p.isActive;
            } else if (statusFilter === "expired") {
                matchStatus = !!p.validTo && new Date(p.validTo) <= now;
            }
            
            return matchSearch && matchType && matchStatus;
        });
    }, [promotions, search, typeFilter, statusFilter]);

    return (
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 24px 48px", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", background: "#f4f5f7", minHeight: "100vh" }}>
            
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>Quản lý mã giảm giá</h1>
                    <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>Thiết lập và quản lý các chương trình ưu đãi, mã coupon hệ thống</p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        height: 38,
                        padding: "0 16px",
                        background: "#6366f1",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)",
                        transition: "all .15s"
                    }}
                >
                    <Plus style={{ width: 16, height: 16 }} />
                    Thêm mã giảm giá
                </button>
            </div>

            {/* Stats Bar */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
                {[
                    { label: "Tổng số chương trình", value: stats.total, color: "#6366f1", icon: <Ticket /> },
                    { label: "Đang hoạt động", value: stats.active, color: "#22c55e", icon: <Calendar /> },
                    { label: "Lượt đã sử dụng", value: stats.totalUsed, color: "#f59e0b", icon: <Percent /> },
                    { label: "Miễn phí vận chuyển", value: stats.freeShipping, color: "#06b6d4", icon: <Truck /> }
                ].map(({ label, value, color, icon }) => (
                    <div key={label} style={{ background: "#fff", borderRadius: 10, padding: "14px 16px", border: "1px solid #e8eaf0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                            <div style={{ fontSize: 26, fontWeight: 700, color: "#0f172a" }}>{value}</div>
                            <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, marginTop: 2 }}>{label}</div>
                        </div>
                        <div style={{ width: 42, height: 42, borderRadius: 8, background: `${color}10`, color: color, display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center" }}>
                            {React.cloneElement(icon, { style: { width: 20, height: 20 } })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
                <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
                    <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", width: 16, height: 16, pointerEvents: "none" }} />
                    <input
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Tìm kiếm theo mã, tên ưu đãi..."
                        style={{ ...inputStyle, paddingLeft: 38 }}
                    />
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                    <select
                        value={typeFilter}
                        onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
                        style={{ height: 38, padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, background: "#fff", color: "#475569", outline: "none", cursor: "pointer" }}
                    >
                        <option value="all">Tất cả loại ưu đãi</option>
                        <option value="PERCENT">Giảm giá theo %</option>
                        <option value="FIXED_AMOUNT">Giảm giá theo số tiền</option>
                        <option value="FREE_SHIPPING">Miễn phí vận chuyển</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                        style={{ height: 38, padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, background: "#fff", color: "#475569", outline: "none", cursor: "pointer" }}
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="active">Đang hiệu lực</option>
                        <option value="inactive">Đã tắt</option>
                        <option value="expired">Đã hết hạn</option>
                    </select>
                </div>
            </div>

            {/* Grid/Table */}
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8eaf0", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            {["Mã", "Tên ưu đãi", "Loại", "Giá trị", "Hạn mức tối thiểu", "Sử dụng / Giới hạn", "Thời gian hiệu lực", "Trạng thái", "Thao tác"].map(h => (
                                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: ".05em", background: "#f8fafc", borderBottom: "1px solid #e8eaf0" }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={9} style={{ textAlign: "center", color: "#6366f1", padding: 40, fontSize: 14, fontWeight: 600 }}>
                                    Đang tải danh sách mã giảm giá...
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={9} style={{ textAlign: "center", color: "#94a3b8", padding: 40, fontSize: 14 }}>
                                    Không tìm thấy mã giảm giá nào phù hợp
                                </td>
                            </tr>
                        ) : (
                            filtered.map((promo) => {
                                const isExpired = promo.validTo && new Date(promo.validTo) <= new Date();
                                const isPromoActive = promo.isActive && !isExpired;
                                
                                return (
                                    <tr key={promo.id} style={{ transition: "background-color .15s" }}>
                                        <td style={{ ...tdStyle, fontWeight: 700, color: "#0f172a" }}>
                                            <span style={{ background: "#e0e7ff", color: "#4f46e5", padding: "4px 8px", borderRadius: 6, fontSize: 12, fontFamily: "monospace", textTransform: "uppercase" }}>
                                                {promo.code}
                                            </span>
                                        </td>
                                        <td style={{ ...tdStyle, fontSize: 13, color: "#334155", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {promo.name}
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{
                                                fontSize: 11,
                                                fontWeight: 600,
                                                padding: "3px 8px",
                                                borderRadius: 12,
                                                background: promo.type === "PERCENT" ? "#ecfdf5" : promo.type === "FIXED_AMOUNT" ? "#eff6ff" : "#f0fdfa",
                                                color: promo.type === "PERCENT" ? "#059669" : promo.type === "FIXED_AMOUNT" ? "#2563eb" : "#0d9488",
                                            }}>
                                                {promo.type === "PERCENT" ? "% Phần trăm" : promo.type === "FIXED_AMOUNT" ? "Số tiền" : "Freeship"}
                                            </span>
                                        </td>
                                        <td style={{ ...tdStyle, fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                                            {promo.type === "PERCENT" ? `${promo.value}%` : vnd(promo.value)}
                                            {promo.type === "PERCENT" && promo.maxDiscount && (
                                                <div style={{ fontSize: 11, fontWeight: 400, color: "#94a3b8", marginTop: 2 }}>Tối đa: {vnd(promo.maxDiscount)}</div>
                                            )}
                                        </td>
                                        <td style={{ ...tdStyle, fontSize: 13, color: "#475569" }}>
                                            {promo.minOrderValue > 0 ? vnd(promo.minOrderValue) : "Không yêu cầu"}
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ fontSize: 13, color: "#0f172a" }}>
                                                <strong>{promo.usedCount || 0}</strong>
                                                <span style={{ color: "#94a3b8" }}> / {promo.usageLimit !== null ? promo.usageLimit : "∞"}</span>
                                            </div>
                                            <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>Khách giới hạn: {promo.usagePerCustomer}</div>
                                        </td>
                                        <td style={{ ...tdStyle, fontSize: 12, color: "#475569" }}>
                                            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                                <div><span style={{ color: "#94a3b8" }}>Từ:</span> {formatDateTime(promo.validFrom)}</div>
                                                <div><span style={{ color: "#94a3b8" }}>Đến:</span> {formatDateTime(promo.validTo)}</div>
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <button
                                                onClick={() => handleToggleStatus(promo)}
                                                style={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: 5,
                                                    padding: "3px 9px",
                                                    borderRadius: 20,
                                                    fontSize: 11,
                                                    fontWeight: 600,
                                                    background: isPromoActive ? "#dcfce7" : "#fee2e2",
                                                    color: isPromoActive ? "#16a34a" : "#dc2626",
                                                    border: "none",
                                                    cursor: "pointer",
                                                    outline: "none"
                                                }}
                                            >
                                                <span style={{ width: 5, height: 5, borderRadius: "50%", background: isPromoActive ? "#22c55e" : "#ef4444" }} />
                                                {isPromoActive ? "Hoạt động" : isExpired ? "Hết hạn" : "Tắt"}
                                            </button>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ display: "flex", gap: 8 }}>
                                                <button
                                                    title="Chỉnh sửa"
                                                    onClick={() => handleOpenEdit(promo)}
                                                    style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}
                                                >
                                                    <Pencil style={{ width: 14, height: 14, color: "#4f46e5" }} />
                                                </button>
                                                <button
                                                    title="Xóa"
                                                    onClick={() => handleDelete(promo)}
                                                    style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #fee2e2", background: "#fff", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}
                                                >
                                                    <Trash2 style={{ width: 14, height: 14, color: "#dc2626" }} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderTop: "1px solid #f1f5f9", background: "#fafbfc" }}>
                        <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                            Trang {page} / {totalPages} · {totalElements} mã giảm giá
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #e2e8f0", background: page === 1 ? "#fafbfc" : "#fff", color: "#64748b", cursor: page === 1 ? "not-allowed" : "pointer" }}
                            >
                                ❮
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: 6,
                                        border: "1px solid",
                                        borderColor: page === p ? "#6366f1" : "#e2e8f0",
                                        background: page === p ? "#6366f1" : "#fff",
                                        color: page === p ? "#fff" : "#475569",
                                        fontSize: 12,
                                        fontWeight: 600,
                                        cursor: "pointer"
                                    }}
                                >
                                    {p}
                                </button>
                            ))}
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #e2e8f0", background: page === totalPages ? "#fafbfc" : "#fff", color: "#64748b", cursor: page === totalPages ? "not-allowed" : "pointer" }}
                            >
                                ❯
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Drawer Form Modal */}
            {isFormOpen && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "flex-end", zIndex: 1000 }}>
                    <div style={{ width: "100%", maxWidth: 480, background: "#fff", height: "100%", boxShadow: "-4px 0 30px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", animation: "slideLeft 0.2s ease-out" }}>
                        
                        {/* Drawer Header */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid #e2e8f0" }}>
                            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                                {editingId ? `Sửa mã giảm giá #${editingId}` : "Thêm mã giảm giá mới"}
                            </h2>
                            <button
                                onClick={() => setIsFormOpen(false)}
                                style={{ border: "none", background: "none", cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center" }}
                            >
                                <X style={{ width: 20, height: 20 }} />
                            </button>
                        </div>

                        {/* Drawer Body */}
                        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                            
                            <div>
                                <label style={labelStyle}>Mã khuyến mãi <span style={{ color: "#dc2626" }}>*</span></label>
                                <input
                                    value={formData.code}
                                    onChange={e => setFormData(f => ({ ...f, code: e.target.value }))}
                                    placeholder="Ví dụ: SUMMERSALE"
                                    style={{ ...inputStyle, textTransform: "uppercase" }}
                                />
                                {formErrors.code && <span style={{ fontSize: 11, color: "#dc2626", marginTop: 4, display: "block" }}>{formErrors.code}</span>}
                            </div>

                            <div>
                                <label style={labelStyle}>Tên chương trình ưu đãi <span style={{ color: "#dc2626" }}>*</span></label>
                                <input
                                    value={formData.name}
                                    onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                                    placeholder="Ví dụ: Giảm giá hè rực rỡ"
                                    style={inputStyle}
                                />
                                {formErrors.name && <span style={{ fontSize: 11, color: "#dc2626", marginTop: 4, display: "block" }}>{formErrors.name}</span>}
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <div>
                                    <label style={labelStyle}>Loại ưu đãi</label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData(f => ({ ...f, type: e.target.value as any, maxDiscount: e.target.value === "FREE_SHIPPING" ? "" : f.maxDiscount }))}
                                        style={{ ...inputStyle, cursor: "pointer" }}
                                    >
                                        <option value="PERCENT">Giảm theo %</option>
                                        <option value="FIXED_AMOUNT">Giảm số tiền</option>
                                        <option value="FREE_SHIPPING">Free Ship</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>
                                        {formData.type === "PERCENT" ? "Phần trăm giảm" : formData.type === "FIXED_AMOUNT" ? "Số tiền giảm" : "Phí ship hỗ trợ tối đa"}
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.value}
                                        onChange={e => setFormData(f => ({ ...f, value: Number(e.target.value) }))}
                                        style={inputStyle}
                                    />
                                    {formErrors.value && <span style={{ fontSize: 11, color: "#dc2626", marginTop: 4, display: "block" }}>{formErrors.value}</span>}
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <div>
                                    <label style={labelStyle}>Mức giảm tối đa (đ)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        disabled={formData.type === "FIXED_AMOUNT"}
                                        value={formData.maxDiscount}
                                        onChange={e => setFormData(f => ({ ...f, maxDiscount: e.target.value }))}
                                        placeholder={formData.type === "FIXED_AMOUNT" ? "Bằng số tiền giảm" : "Không giới hạn"}
                                        style={{ ...inputStyle, background: formData.type === "FIXED_AMOUNT" ? "#f1f5f9" : "#fff" }}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Đơn tối thiểu (đ)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.minOrderValue}
                                        onChange={e => setFormData(f => ({ ...f, minOrderValue: Number(e.target.value) }))}
                                        style={inputStyle}
                                    />
                                    {formErrors.minOrderValue && <span style={{ fontSize: 11, color: "#dc2626", marginTop: 4, display: "block" }}>{formErrors.minOrderValue}</span>}
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <div>
                                    <label style={labelStyle}>Tổng lượt dùng</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.usageLimit}
                                        onChange={e => setFormData(f => ({ ...f, usageLimit: e.target.value }))}
                                        placeholder="Không giới hạn"
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Mỗi khách dùng tối đa</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.usagePerCustomer}
                                        onChange={e => setFormData(f => ({ ...f, usagePerCustomer: Number(e.target.value) }))}
                                        style={inputStyle}
                                    />
                                    {formErrors.usagePerCustomer && <span style={{ fontSize: 11, color: "#dc2626", marginTop: 4, display: "block" }}>{formErrors.usagePerCustomer}</span>}
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <div>
                                    <label style={labelStyle}>Thời gian bắt đầu</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.validFrom}
                                        onChange={e => setFormData(f => ({ ...f, validFrom: e.target.value }))}
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Thời gian kết thúc</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.validTo}
                                        onChange={e => setFormData(f => ({ ...f, validTo: e.target.value }))}
                                        style={inputStyle}
                                    />
                                    {formErrors.validTo && <span style={{ fontSize: 11, color: "#dc2626", marginTop: 4, display: "block" }}>{formErrors.validTo}</span>}
                                </div>
                            </div>

                            {/* Drawer Footer Actions */}
                            <div style={{ display: "flex", gap: 12, marginTop: "auto", paddingTop: 16, borderTop: "1px solid #e2e8f0" }}>
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    style={{ flex: 1, height: 40, border: "1px solid #e2e8f0", background: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer" }}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    style={{ flex: 1, height: 40, border: "none", background: "#6366f1", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer", boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)" }}
                                >
                                    Lưu lại
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Toast alert */}
            {toast && (
                <div style={{ position: "fixed", bottom: 24, right: 24, background: "#0f172a", color: "#fff", padding: "12px 18px", borderRadius: 10, fontSize: 13, fontWeight: 500, boxShadow: "0 8px 30px rgba(0,0,0,.2)", display: "flex", alignItems: "center", gap: 8, zIndex: 1100 }}>
                    <span style={{ color: "#22c55e" }}>✓</span> {toast}
                </div>
            )}
        </div>
    );
}
