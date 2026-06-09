import React, { useState, useEffect, useCallback } from "react";
import { Search, Plus, Pencil, Trash2, RotateCcw, ToggleLeft, ToggleRight, X, BookOpen, Building2 } from "lucide-react";
import api from "../../utils/api";

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface Publisher {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string | null;
    deletedAt: string | null;
}

interface PublisherFormData {
    name: string;
    email: string;
    phone: string;
    address: string;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function formatDateTime(s: string | null) {
    if (!s) return "—";
    const d = new Date(s);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const tdStyle: React.CSSProperties = { padding: "13px 16px", borderBottom: "1px solid #f1f5f9", verticalAlign: "middle" };
const thStyle: React.CSSProperties = { padding: "11px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: ".05em", background: "#f8fafc", borderBottom: "1px solid #e8eaf0" } as React.CSSProperties;

// ─── FORM MODAL ───────────────────────────────────────────────────────────────
function PublisherModal({ publisher, onClose, onSuccess }: { publisher: Publisher | null; onClose: () => void; onSuccess: () => void }) {
    const isEdit = publisher !== null;
    const [form, setForm] = useState<PublisherFormData>({
        name: publisher?.name || "",
        email: publisher?.email || "",
        phone: publisher?.phone || "",
        address: publisher?.address || "",
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Partial<PublisherFormData>>({});

    const validate = () => {
        const e: Partial<PublisherFormData> = {};
        if (!form.name.trim()) e.name = "Tên nhà xuất bản là bắt buộc";
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email không hợp lệ";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        setLoading(true);
        const req = isEdit
            ? api.put(`/admin/publishers/${publisher!.id}`, form)
            : api.post("/admin/publishers", form);
        req.then(() => { onSuccess(); onClose(); })
            .catch(() => alert(isEdit ? "Cập nhật thất bại!" : "Tạo mới thất bại!"))
            .finally(() => setLoading(false));
    };

    const inputStyle = (hasErr: boolean): React.CSSProperties => ({
        width: "100%", height: 40, padding: "0 12px", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box",
        border: `1px solid ${hasErr ? "#ef4444" : "#e2e8f0"}`, background: hasErr ? "#fff5f5" : "#fff",
    });

    return (
        <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 28, width: 520, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,.15)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
                        {isEdit ? "✏️ Cập nhật nhà xuất bản" : "➕ Thêm nhà xuất bản mới"}
                    </h3>
                    <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", color: "#94a3b8" }}><X size={20} /></button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                        <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Tên NXB <span style={{ color: "#ef4444" }}>*</span></label>
                        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="VD: NXB Trẻ" style={inputStyle(!!errors.name)} />
                        {errors.name && <p style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>{errors.name}</p>}
                    </div>
                    <div>
                        <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Email liên hệ</label>
                        <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="contact@publisher.com" style={inputStyle(!!errors.email)} />
                        {errors.email && <p style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>{errors.email}</p>}
                    </div>
                    <div>
                        <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Số điện thoại</label>
                        <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="028 xxxx xxxx" style={inputStyle(false)} />
                    </div>
                    <div>
                        <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Địa chỉ</label>
                        <textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Địa chỉ văn phòng..."
                            rows={2} style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }} />
                    </div>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                    <button onClick={onClose} style={{ flex: 1, height: 42, borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", color: "#475569", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Hủy</button>
                    <button onClick={handleSubmit} disabled={loading}
                        style={{ flex: 2, height: 42, borderRadius: 10, border: "none", background: loading ? "#a5b4fc" : "#6366f1", color: "#fff", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontSize: 14 }}>
                        {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo mới"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
type FilterType = "active" | "inactive" | "deleted";

export default function PublisherManagement() {
    const [publishers, setPublishers] = useState<Publisher[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<FilterType>("active");
    const [modal, setModal] = useState<Publisher | null | "new">(null);
    const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

    function showToast(msg: string, type: "ok" | "err" = "ok") { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); }

    const fetchPublishers = useCallback(() => {
        setLoading(true);
        const deleted = filter === "deleted" ? true : false;
        api.get("/admin/publishers", { params: deleted ? { deleted: true } : {} })
            .then(res => {
                const data: Publisher[] = res.data.result || [];
                setPublishers(data);
            })
            .catch(() => showToast("Không thể tải danh sách nhà xuất bản", "err"))
            .finally(() => setLoading(false));
    }, [filter]);

    useEffect(() => { fetchPublishers(); }, [fetchPublishers]);

    const handleDelete = (p: Publisher) => {
        if (!confirm(`Xóa nhà xuất bản "${p.name}"? (Có thể khôi phục sau)`)) return;
        api.delete(`/admin/publishers/${p.id}`)
            .then(() => { showToast(`Đã xóa "${p.name}"`); fetchPublishers(); })
            .catch(() => showToast("Xóa thất bại", "err"));
    };

    const handleRestore = (p: Publisher) => {
        api.put(`/admin/publishers/${p.id}/restore`)
            .then(() => { showToast(`Đã khôi phục "${p.name}"`); fetchPublishers(); })
            .catch(() => showToast("Khôi phục thất bại", "err"));
    };

    const handleToggle = (p: Publisher) => {
        api.put(`/admin/publishers/${p.id}/toggle-active`)
            .then(() => { showToast(`${p.isActive ? "Vô hiệu hóa" : "Kích hoạt"} thành công`); fetchPublishers(); })
            .catch(() => showToast("Thao tác thất bại", "err"));
    };

    const filtered = publishers.filter(p => {
        const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.email?.toLowerCase().includes(search.toLowerCase());
        if (filter === "deleted") return matchSearch && p.isDeleted;
        if (filter === "inactive") return matchSearch && !p.isActive && !p.isDeleted;
        return matchSearch && p.isActive && !p.isDeleted;
    });

    // Stats
    const activeCount = publishers.filter(p => p.isActive && !p.isDeleted).length;
    const inactiveCount = publishers.filter(p => !p.isActive && !p.isDeleted).length;
    const deletedCount = publishers.filter(p => p.isDeleted).length;

    return (
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 24px 48px", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", background: "#f4f5f7", minHeight: "100vh" }}>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>Quản lý Nhà xuất bản</h1>
                    <p style={{ fontSize: 13, color: "#64748b", marginTop: 4, marginBottom: 0 }}>{publishers.filter(p => !p.isDeleted).length} nhà xuất bản đang hoạt động</p>
                </div>
                <button onClick={() => setModal("new")} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", border: "none", borderRadius: 10, background: "#6366f1", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 12px rgba(99,102,241,.3)" }}>
                    <Plus size={16} /> Thêm NXB mới
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 22 }}>
                {[
                    { label: "Đang hoạt động", value: activeCount, accent: "#22c55e", icon: <Building2 size={20} /> },
                    { label: "Vô hiệu hóa", value: inactiveCount, accent: "#f59e0b", icon: <BookOpen size={20} /> },
                    { label: "Đã xóa", value: deletedCount, accent: "#ef4444", icon: <Trash2 size={20} /> },
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

            {/* Toolbar */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
                    <Search style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", width: 15, height: 15 }} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm tên, email nhà xuất bản..."
                        style={{ width: "100%", height: 38, padding: "0 12px 0 36px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, background: "#fff", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div style={{ display: "flex", gap: 4, background: "#fff", border: "1px solid #e8eaf0", borderRadius: 10, padding: 4 }}>
                    {([
                        { key: "active", label: "Hoạt động" },
                        { key: "inactive", label: "Vô hiệu" },
                        { key: "deleted", label: "Đã xóa" },
                    ] as { key: FilterType; label: string }[]).map(f => (
                        <button key={f.key} onClick={() => setFilter(f.key)} style={{
                            padding: "6px 14px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all .15s",
                            background: filter === f.key ? "#6366f1" : "transparent",
                            color: filter === f.key ? "#fff" : "#64748b",
                        }}>
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8eaf0", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            {["#", "Tên NXB", "Email", "Điện thoại", "Địa chỉ", "Trạng thái", "Ngày tạo", "Thao tác"].map(h => (
                                <th key={h} style={thStyle}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: "#6366f1", fontWeight: 600 }}>Đang tải...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>Không tìm thấy nhà xuất bản nào</td></tr>
                        ) : filtered.map((pub, idx) => (
                            <tr key={pub.id} style={{ opacity: pub.isDeleted ? 0.6 : 1 }}>
                                <td style={tdStyle}><span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace" }}>#{idx + 1}</span></td>
                                <td style={tdStyle}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <div style={{ width: 36, height: 36, borderRadius: 8, background: "#ede9fe", color: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>
                                            {pub.name[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 13 }}>{pub.name}</div>
                                            <div style={{ fontSize: 11, color: "#94a3b8" }}>ID: {pub.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ ...tdStyle, fontSize: 13, color: "#475569" }}>{pub.email || "—"}</td>
                                <td style={{ ...tdStyle, fontSize: 13, color: "#475569" }}>{pub.phone || "—"}</td>
                                <td style={{ ...tdStyle, fontSize: 12, color: "#64748b", maxWidth: 180 }}>
                                    <div style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                        {pub.address || "—"}
                                    </div>
                                </td>
                                <td style={tdStyle}>
                                    {pub.isDeleted ? (
                                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "#fee2e2", color: "#dc2626" }}>
                                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444" }} />Đã xóa
                                        </span>
                                    ) : (
                                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: pub.isActive ? "#dcfce7" : "#fef3c7", color: pub.isActive ? "#16a34a" : "#d97706" }}>
                                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: pub.isActive ? "#22c55e" : "#eab308" }} />
                                            {pub.isActive ? "Hoạt động" : "Vô hiệu"}
                                        </span>
                                    )}
                                </td>
                                <td style={{ ...tdStyle, fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>{formatDateTime(pub.createdAt)}</td>
                                <td style={tdStyle}>
                                    <div style={{ display: "flex", gap: 5 }}>
                                        {pub.isDeleted ? (
                                            <button title="Khôi phục" onClick={() => handleRestore(pub)}
                                                style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                <RotateCcw size={14} style={{ color: "#22c55e" }} />
                                            </button>
                                        ) : (
                                            <>
                                                <button title="Chỉnh sửa" onClick={() => setModal(pub)}
                                                    style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                    <Pencil size={13} style={{ color: "#6366f1" }} />
                                                </button>
                                                <button title={pub.isActive ? "Vô hiệu hóa" : "Kích hoạt"} onClick={() => handleToggle(pub)}
                                                    style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                    {pub.isActive
                                                        ? <ToggleRight size={16} style={{ color: "#22c55e" }} />
                                                        : <ToggleLeft size={16} style={{ color: "#94a3b8" }} />}
                                                </button>
                                                <button title="Xóa" onClick={() => handleDelete(pub)}
                                                    style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                    <Trash2 size={13} style={{ color: "#ef4444" }} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            {modal !== null && (
                <PublisherModal
                    publisher={modal === "new" ? null : modal as Publisher}
                    onClose={() => setModal(null)}
                    onSuccess={() => { fetchPublishers(); showToast(modal === "new" ? "Tạo nhà xuất bản thành công!" : "Cập nhật thành công!"); }}
                />
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
