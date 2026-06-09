import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Pencil, Repeat, Trash2 } from "lucide-react";
import api from "../../utils/api";

// ─── TYPES ───────────────────────────────────────────────────────────────────
type UserStatus = "ACTIVE" | "INACTIVE" | "BANNED" | "PENDING";

interface User {
    id: number;
    email: string;
    userName: string;
    fullName: string;
    phone: string;
    dob: string;
    lastLoginAt: string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    status: UserStatus;
    isDeleted: boolean;
    roles: string[];
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
    { bg: "#ede9fe", color: "#7c3aed" }, { bg: "#d1fae5", color: "#059669" },
    { bg: "#fee2e2", color: "#dc2626" }, { bg: "#dbeafe", color: "#2563eb" },
    { bg: "#fef3c7", color: "#d97706" }, { bg: "#fce7f3", color: "#db2777" },
];
function getInitials(name: string) { 
    if (!name) return "?";
    return name.split(" ").slice(-2).map(w => w[0]).join("").toUpperCase(); 
}
function formatDateTime(s: string) {
    if (!s) return "—";
    const d = new Date(s);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
const emptyUser = (): User => ({
    id: 0, email: "", userName: "", fullName: "", phone: "", dob: "",
    lastLoginAt: "", isEmailVerified: false, isPhoneVerified: false,
    status: "ACTIVE", isDeleted: false, roles: ["USER"],
});

// ─── STYLE TOKENS ─────────────────────────────────────────────────────────────
const tdStyle: React.CSSProperties = { padding: "13px 16px", borderBottom: "1px solid #f1f5f9", verticalAlign: "middle" };
const inputStyle: React.CSSProperties = { padding: "8px 11px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 13, color: "#0f172a", background: "#fff", outline: "none", width: "100%" };

// ─── ATOMS ────────────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: ".05em" }}>{label}</label>
            {children}
        </div>
    );
}

type BtnVariant = "primary" | "secondary" | "danger";
const BTN_STYLES: Record<BtnVariant, React.CSSProperties> = {
    primary: { background: "#6366f1", color: "#fff", borderColor: "#6366f1" },
    secondary: { background: "#fff", color: "#475569", borderColor: "#e2e8f0" },
    danger: { background: "#ef4444", color: "#fff", borderColor: "#ef4444" },
};
function Btn({ variant, onClick, children }: { variant: BtnVariant; onClick: () => void; children: React.ReactNode }) {
    return <button onClick={onClick} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid", fontSize: 13, fontWeight: 600, cursor: "pointer", ...BTN_STYLES[variant] }}>{children}</button>;
}
function CloseBtn({ onClick }: { onClick: () => void }) {
    return <button onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#94a3b8", width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>;
}
function ActionBtn({ title, onClick, children, hoverBg = "#f1f5f9", hoverBorder = "#cbd5e1" }: { title: string; onClick: () => void; children: React.ReactNode; hoverBg?: string; hoverBorder?: string }) {
    const [hov, setHov] = useState(false);
    return (
        <button title={title} onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
            style={{ width: 30, height: 30, borderRadius: 6, border: `1px solid ${hov ? hoverBorder : "#e2e8f0"}`, background: hov ? hoverBg : "#fff", cursor: "pointer", fontSize: 14, marginRight: 4, display: "inline-flex", alignItems: "center", justifyContent: "center", transition: "all .15s", transform: hov ? "translateY(-1px)" : "none" }}>
            {children}
        </button>
    );
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
const STATUS_CFG: Record<UserStatus, { bg: string; color: string; label: string }> = {
    ACTIVE: { bg: "#dcfce7", color: "#16a34a", label: "Hoạt động" },
    INACTIVE: { bg: "#ffedd5", color: "#ea580c", label: "Tạm dừng" },
    BANNED: { bg: "#fee2e2", color: "#dc2626", label: "Cấm" },
    PENDING: { bg: "#dbeafe", color: "#2563eb", label: "Chờ duyệt" },
};
function StatusBadge({ status }: { status: UserStatus }) {
    const c = STATUS_CFG[status];
    return <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: c?.bg || "#f1f5f9", color: c?.color || "#475569" }}>{c?.label || status}</span>;
}
function VerifyDot({ verified }: { verified: boolean }) {
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: verified ? "#16a34a" : "#94a3b8" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: verified ? "#22c55e" : "#cbd5e1", display: "inline-block" }} />
            {verified ? "Đã xác thực" : "Chưa"}
        </span>
    );
}

// ─── STATS BAR ────────────────────────────────────────────────────────────────
interface UserStats {
    total: number;
    active: number;
    banned: number;
    pending: number;
    deleted: number;
}
function StatsBar({ stats }: { stats: UserStats }) {
    const items = [
        { label: "Tổng người dùng", value: stats.total, accent: "#6366f1" },
        { label: "Đang hoạt động", value: stats.active, accent: "#22c55e" },
        { label: "Bị cấm", value: stats.banned, accent: "#ef4444" },
        { label: "Chờ duyệt", value: stats.pending, accent: "#3b82f6" },
        { label: "Đã xóa", value: stats.deleted, accent: "#94a3b8" },
    ];
    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 20 }}>
            {items.map(({ label, value, accent }) => (
                <div key={label} style={{ background: "#fff", borderRadius: 10, padding: "14px 16px", border: "1px solid #e8eaf0", borderLeft: `3px solid ${accent}` }}>
                    <div style={{ fontSize: 26, fontWeight: 700, color: "#0f172a" }}>{value}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, marginTop: 2 }}>{label}</div>
                </div>
            ))}
        </div>
    );
}

// ─── CONFIRM MODAL ────────────────────────────────────────────────────────────
function ConfirmModal({ message, danger, onConfirm, onClose }: { message: string; danger?: boolean; onConfirm: () => void; onClose: () => void }) {
    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }} onClick={onClose}>
            <div style={{ background: "#fff", borderRadius: 14, width: 440, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,.2)", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: "1px solid #f1f5f9" }}>
                    <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Xác nhận thao tác</h2><CloseBtn onClick={onClose} />
                </div>
                <div style={{ padding: 20 }}><p style={{ color: "#475569", lineHeight: 1.7 }}>{message}</p></div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "16px 20px", borderTop: "1px solid #f1f5f9", background: "#fafbfc" }}>
                    <Btn variant="secondary" onClick={onClose}>Hủy</Btn>
                    <Btn variant={danger ? "danger" : "primary"} onClick={() => { onConfirm(); onClose(); }}>Xác nhận</Btn>
                </div>
            </div>
        </div>
    );
}

// ─── CHANGE STATUS MODAL ──────────────────────────────────────────────────────
function ChangeStatusModal({ user, onClose, onSave }: { user: User; onClose: () => void; onSave: (s: UserStatus) => void }) {
    const [status, setStatus] = useState<UserStatus>(user.status);
    const all: UserStatus[] = ["ACTIVE", "INACTIVE", "BANNED", "PENDING"];
    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }} onClick={onClose}>
            <div style={{ background: "#fff", borderRadius: 14, width: 420, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,.2)", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: "1px solid #f1f5f9" }}>
                    <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Đổi trạng thái — {user.userName}</h2><CloseBtn onClick={onClose} />
                </div>
                <div style={{ padding: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {all.map(s => {
                        const c = STATUS_CFG[s]; const active = status === s;
                        return (
                            <button key={s} onClick={() => setStatus(s)}
                                style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", borderRadius: 10, cursor: "pointer", transition: "all .15s", border: active ? "2px solid #6366f1" : "1px solid #e2e8f0", background: active ? "#eef2ff" : "#fff" }}>
                                <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: c.bg, color: c.color }}>{c.label}</span>
                            </button>
                        );
                    })}
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "16px 20px", borderTop: "1px solid #f1f5f9", background: "#fafbfc" }}>
                    <Btn variant="secondary" onClick={onClose}>Hủy</Btn>
                    <Btn variant="primary" onClick={() => { onSave(status); onClose(); }}>Áp dụng</Btn>
                </div>
            </div>
        </div>
    );
}

// ─── USER DRAWER ──────────────────────────────────────────────────────────────
function UserDrawer({ user, allRoles, onClose, onSave }: { user: User; allRoles: { id: number; name: string; description: string }[]; onClose: () => void; onSave: (u: User, passwordVal?: string) => void }) {
    const isNew = user.id === 0;
    const [form, setForm] = useState<User>({ ...user });
    const [password, setPassword] = useState("");
    const setStr = (field: keyof User) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(prev => ({ ...prev, [field]: e.target.value }));
    const handleSave = () => {
        if (!form.fullName.trim() || !form.email.trim() || !form.userName.trim()) { alert("Vui lòng nhập đầy đủ thông tin bắt buộc!"); return; }
        if (isNew && !password.trim()) { alert("Vui lòng nhập mật khẩu!"); return; }
        onSave(form, password);
    };
    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.3)", zIndex: 100, display: "flex", justifyContent: "flex-end" }} onClick={onClose}>
            <div style={{ width: 500, maxWidth: "95vw", background: "#fff", height: "100vh", display: "flex", flexDirection: "column", boxShadow: "-8px 0 40px rgba(0,0,0,.15)" }} onClick={e => e.stopPropagation()}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #f1f5f9", flexShrink: 0 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{isNew ? "Thêm người dùng" : "Chỉnh sửa người dùng"}</h2>
                    <CloseBtn onClick={onClose} />
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        <div style={{ gridColumn: "span 2" }}>
                            <Field label="Họ và tên *"><input value={form.fullName} onChange={setStr("fullName")} placeholder="Nguyễn Văn An" style={inputStyle} /></Field>
                        </div>
                        <Field label="Tên đăng nhập *"><input value={form.userName} onChange={setStr("userName")} placeholder="nguyenvanan" style={inputStyle} /></Field>
                        <Field label="Email *"><input type="email" value={form.email} onChange={setStr("email")} placeholder="user@email.com" style={inputStyle} /></Field>
                        <Field label="Số điện thoại"><input value={form.phone} onChange={setStr("phone")} placeholder="0912345678" style={inputStyle} /></Field>
                        <Field label="Ngày sinh"><input type="date" value={form.dob} onChange={setStr("dob")} style={inputStyle} /></Field>
                        {isNew && (
                            <div style={{ gridColumn: "span 2" }}>
                                <Field label="Mật khẩu *"><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} /></Field>
                            </div>
                        )}
                        <div style={{ gridColumn: "span 2" }}>
                            <Field label="Vai trò">
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                    {allRoles.map(role => {
                                        const active = form.roles.some(rName => rName.toUpperCase() === role.name.toUpperCase());
                                        return (
                                            <button key={role.id} type="button"
                                                onClick={() => setForm(prev => {
                                                    const alreadyHas = prev.roles.some(rName => rName.toUpperCase() === role.name.toUpperCase());
                                                    const updatedRoles = alreadyHas 
                                                        ? prev.roles.filter(rName => rName.toUpperCase() !== role.name.toUpperCase()) 
                                                        : [...prev.roles, role.name];
                                                    return { ...prev, roles: updatedRoles };
                                                })}
                                                style={{ padding: "5px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", border: active ? "1px solid #6366f1" : "1px solid #e2e8f0", background: active ? "#eef2ff" : "#fff", color: active ? "#6366f1" : "#475569" }}>
                                                {role.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </Field>
                        </div>
                    </div>
                </div>
                <div style={{ padding: "16px 24px", borderTop: "1px solid #f1f5f9", background: "#fafbfc", display: "flex", justifyContent: "flex-end", gap: 10, flexShrink: 0 }}>
                    <Btn variant="secondary" onClick={onClose}>Hủy</Btn>
                    <Btn variant="primary" onClick={handleSave}>{isNew ? "Tạo người dùng" : "Lưu thay đổi"}</Btn>
                </div>
            </div>
        </div>
    );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
type StatusFilter = "all" | "active" | "inactive" | "banned" | "pending" | "deleted";
type ModalState =
    | { type: "confirm"; message: string; danger?: boolean; action: () => void }
    | { type: "changeStatus"; user: User }
    | null;

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "Tất cả" }, { value: "active", label: "Hoạt động" },
    { value: "inactive", label: "Tạm dừng" }, { value: "banned", label: "Bị cấm" },
    { value: "pending", label: "Chờ duyệt" }, { value: "deleted", label: "Đã xóa" },
];
const PAGE_SIZE = 10;

export default function AdminUserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [stats, setStats] = useState<UserStats>({ total: 0, active: 0, banned: 0, pending: 0, deleted: 0 });
    const [drawer, setDrawer] = useState<User | null>(null);
    const [modal, setModal] = useState<ModalState>(null);
    const [toast, setToast] = useState<string | null>(null);
    const [allRoles, setAllRoles] = useState<{ id: number; name: string; description: string }[]>([]);

    function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 2800); }

    // Fetch roles on mount
    useEffect(() => {
        api.get("/roles")
            .then(res => {
                const data = res.data.result || [];
                setAllRoles(data.map((r: any) => ({
                    id: r.id,
                    name: r.name,
                    description: r.description || "",
                })));
            })
            .catch(err => console.error("Error loading roles:", err));
    }, []);

    // Fetch stats
    const fetchStats = useCallback(() => {
        api.get("/admin/users", {
            params: {
                page: 1,
                size: 10000
            }
        })
            .then(res => {
                const result = res.data.result;
                const data = result.data || [];
                setStats({
                    total: result.total || data.length,
                    active: data.filter((u: any) => u.status === "ACTIVE" && !u.isDeleted).length,
                    banned: data.filter((u: any) => u.status === "BANNED" && !u.isDeleted).length,
                    pending: data.filter((u: any) => u.status === "PENDING" && !u.isDeleted).length,
                    deleted: data.filter((u: any) => u.isDeleted).length,
                });
            })
            .catch(err => {
                console.error("Error loading stats:", err);
            });
    }, []);

    // Fetch users list for table
    const fetchUsers = useCallback(() => {
        api.get("/admin/users", {
            params: {
                page: page,
                size: PAGE_SIZE
            }
        })
            .then(res => {
                const result = res.data.result;
                const mapped = (result.data || []).map((u: any) => ({
                    id: u.id,
                    userName: u.userName,
                    fullName: u.fullName || "",
                    email: u.email,
                    phone: u.phone || "",
                    dob: u.dob || "",
                    lastLoginAt: u.lastLoginAt || "",
                    isEmailVerified: u.isEmailVerified || u.emailVerified || false,
                    isPhoneVerified: u.isPhoneVerified || u.phoneVerified || false,
                    status: u.status || "ACTIVE",
                    isDeleted: u.isDeleted || false,
                    roles: u.roles || [],
                }));
                setUsers(mapped);
                setTotalPages(result.totalPages || 1);
                setTotalElements(result.total || 0);
            })
            .catch(err => {
                console.error("Error loading users:", err);
                showToast("Không thể tải danh sách người dùng");
            });
    }, [page]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const filtered = useMemo(() => users.filter(u => {
        const q = search.toLowerCase();
        if (q && !u.fullName.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q) && !u.userName.toLowerCase().includes(q)) return false;
        if (statusFilter === "deleted") return u.isDeleted;
        if (statusFilter === "active") return u.status === "ACTIVE" && !u.isDeleted;
        if (statusFilter === "inactive") return u.status === "INACTIVE" && !u.isDeleted;
        if (statusFilter === "banned") return u.status === "BANNED" && !u.isDeleted;
        if (statusFilter === "pending") return u.status === "PENDING" && !u.isDeleted;
        return true;
    }), [users, search, statusFilter]);

    const paged = filtered;

    const saveUser = useCallback((form: User, passwordVal?: string) => {
        const selectedRoleIds = form.roles
            .map(roleName => {
                const found = allRoles.find(r => r.name.toUpperCase() === roleName.toUpperCase());
                return found ? found.id : null;
            })
            .filter((id): id is number => id !== null);

        if (form.id === 0) {
            // Create
            const payload = {
                userName: form.userName,
                fullName: form.fullName,
                email: form.email,
                password: passwordVal || "",
                phone: form.phone || undefined,
                dob: form.dob || undefined,
                avatarUrl: "",
                roles: selectedRoleIds,
            };
            api.post("/admin/users", payload)
                .then(() => {
                    fetchUsers();
                    fetchStats();
                    setDrawer(null);
                    showToast("Tạo người dùng thành công");
                })
                .catch(err => {
                    console.error("Error creating user:", err);
                    alert(err.response?.data?.message || "Tạo người dùng thất bại!");
                });
        } else {
            // Update
            const payload = {
                userName: form.userName,
                fullName: form.fullName,
                email: form.email,
                phone: form.phone || undefined,
                dob: form.dob || undefined,
                avatarUrl: "",
                roles: selectedRoleIds,
            };
            api.put(`/admin/users/${form.id}`, payload)
                .then(() => {
                    fetchUsers();
                    fetchStats();
                    setDrawer(null);
                    showToast("Cập nhật thành công");
                })
                .catch(err => {
                    console.error("Error updating user:", err);
                    alert(err.response?.data?.message || "Cập nhật thất bại!");
                });
        }
    }, [allRoles, fetchUsers, fetchStats]);

    const handleDelete = (u: User) => setModal({
        type: "confirm", danger: true,
        message: `Xóa người dùng "${u.fullName}" (@${u.userName})? Thao tác này không thể hoàn tác.`,
        action: () => {
            api.delete(`/admin/users/${u.id}`)
                .then(() => {
                    fetchUsers();
                    fetchStats();
                    showToast("Đã xóa người dùng");
                })
                .catch(err => {
                    console.error("Error deleting user:", err);
                    alert(err.response?.data?.message || "Xóa người dùng thất bại!");
                });
        },
    });

    const handleRestore = (u: User) => setModal({
        type: "confirm",
        message: `Khôi phục tài khoản "${u.fullName}"?`,
        action: () => {
            api.put(`/admin/users/${u.id}/restore`)
                .then(() => {
                    fetchUsers();
                    fetchStats();
                    showToast("Đã khôi phục người dùng");
                })
                .catch(err => {
                    console.error("Error restoring user:", err);
                    alert(err.response?.data?.message || "Khôi phục thất bại!");
                });
        },
    });

    const handleChangeStatus = (u: User, newStatus: UserStatus) => {
        api.put(`/admin/users/${u.id}/change-status`, { status: newStatus })
            .then(() => {
                fetchUsers();
                fetchStats();
                showToast("Đã cập nhật trạng thái");
            })
            .catch(err => {
                console.error("Error changing status:", err);
                alert(err.response?.data?.message || "Đổi trạng thái thất bại!");
            });
    };

    return (
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 24px 48px", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", background: "#f4f5f7", minHeight: "100vh" }}>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a" }}> Quản lý người dùng</h1>
                    <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>BookStore Admin — {totalElements} tài khoản</p>
                </div>
                <button onClick={() => setDrawer(emptyUser())}
                    style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "#6366f1", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                    + Thêm người dùng
                </button>
            </div>

            {/* Stats */}
            <StatsBar stats={stats} />

            {/* Toolbar */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
                <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                    <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 16, pointerEvents: "none" }}>⌕</span>
                    <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Tìm theo tên, email, username..."
                        style={{ width: "100%", height: 38, padding: "0 12px 0 34px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, background: "#fff", outline: "none" }} />
                </div>
                <div style={{ display: "flex", gap: 4, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 3 }}>
                    {STATUS_TABS.map(t => (
                        <button key={t.value} onClick={() => { setStatusFilter(t.value); setPage(1); }}
                            style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: statusFilter === t.value ? "#6366f1" : "transparent", color: statusFilter === t.value ? "#fff" : "#475569", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                             {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8eaf0", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            {["#", "Người dùng", "Liên hệ", "Xác thực", "Vai trò", "Trạng thái", "Đăng nhập cuối", "Thao tác"].map(h => (
                                <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: ".05em", background: "#f8fafc", borderBottom: "1px solid #e8eaf0" }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paged.length === 0 ? (
                            <tr><td colSpan={8} style={{ textAlign: "center", color: "#94a3b8", padding: 40, fontSize: 14 }}>Không tìm thấy người dùng nào</td></tr>
                        ) : paged.map((user, idx) => {
                            const ac = AVATAR_COLORS[user.id % AVATAR_COLORS.length];
                            return (
                                <tr key={user.id} style={{ opacity: user.isDeleted ? 0.55 : 1 }}>
                                    <td style={tdStyle}><span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace" }}>{(page - 1) * PAGE_SIZE + idx + 1}</span></td>
                                    <td style={tdStyle}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <div style={{ width: 36, height: 36, borderRadius: 9, background: ac.bg, color: ac.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{getInitials(user.fullName)}</div>
                                            <div>
                                                <p style={{ fontWeight: 600, color: "#0f172a", fontSize: 13.5, marginBottom: 1, textDecoration: user.isDeleted ? "line-through" : "none" }}>{user.fullName}</p>
                                                <p style={{ fontSize: 12, color: "#94a3b8" }}>@{user.userName}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        <p style={{ fontSize: 13, color: "#475569" }}>{user.email}</p>
                                        <p style={{ fontSize: 12, color: "#94a3b8" }}>{user.phone || "—"}</p>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                            <VerifyDot verified={user.isEmailVerified} />
                                            <VerifyDot verified={user.isPhoneVerified} />
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                            {user.roles.map(r => (
                                                <span key={r} style={{ padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: r.toUpperCase() === "ADMIN" ? "#ede9fe" : "#f1f5f9", color: r.toUpperCase() === "ADMIN" ? "#7c3aed" : "#475569" }}>{r}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        <StatusBadge status={user.status} />
                                        {user.isDeleted && <span style={{ display: "block", marginTop: 4, fontSize: 11, color: "#ef4444", fontWeight: 500 }}>Đã xóa</span>}
                                    </td>
                                    <td style={{ ...tdStyle, fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>{formatDateTime(user.lastLoginAt)}</td>
                                    <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                                        {!user.isDeleted && (
                                            <>
                                                <ActionBtn
                                                    title="Chỉnh sửa"
                                                    onClick={() => setDrawer({ ...user })}
                                                    hoverBg="#eef2ff"
                                                    hoverBorder="#6366f1"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </ActionBtn>

                                                <ActionBtn
                                                    title="Đổi trạng thái"
                                                    onClick={() => setModal({ type: "changeStatus", user })}
                                                    hoverBg="#fef9ee"
                                                    hoverBorder="#f59e0b"
                                                >
                                                    <Repeat className="w-4 h-4" />
                                                </ActionBtn>

                                                <ActionBtn
                                                    title="Xóa"
                                                    onClick={() => handleDelete(user)}
                                                    hoverBg="#fef2f2"
                                                    hoverBorder="#ef4444"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </ActionBtn>
                                            </>
                                        )}
                                        {user.isDeleted && <ActionBtn title="Khôi phục" onClick={() => handleRestore(user)} hoverBg="#f0fdf4" hoverBorder="#22c55e">↺</ActionBtn>}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderTop: "1px solid #f1f5f9", background: "#fafbfc" }}>
                        <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                            Trang {page} / {totalPages} · {totalElements} người dùng
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
                                        width: 28, height: 28, borderRadius: 6, border: "1px solid",
                                        borderColor: page === p ? "#6366f1" : "#e2e8f0",
                                        background: page === p ? "#6366f1" : "#fff",
                                        color: page === p ? "#fff" : "#475569",
                                        fontSize: 12, fontWeight: 600, cursor: "pointer"
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

            {/* Portals */}
            {drawer && <UserDrawer user={drawer} allRoles={allRoles} onClose={() => setDrawer(null)} onSave={saveUser} />}
            {modal?.type === "changeStatus" && (
                <ChangeStatusModal user={modal.user} onClose={() => setModal(null)}
                    onSave={s => handleChangeStatus(modal.user, s)} />
            )}
            {modal?.type === "confirm" && (
                <ConfirmModal message={modal.message} danger={modal.danger} onConfirm={modal.action} onClose={() => setModal(null)} />
            )}
            {toast && (
                <div style={{ position: "fixed", bottom: 24, right: 24, background: "#0f172a", color: "#fff", padding: "12px 18px", borderRadius: 10, fontSize: 13, fontWeight: 500, boxShadow: "0 8px 30px rgba(0,0,0,.2)", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#22c55e" }}>✓</span> {toast}
                </div>
            )}
        </div>
    );
}