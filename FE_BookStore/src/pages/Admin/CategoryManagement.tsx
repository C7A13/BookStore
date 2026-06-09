import React, { useState, useMemo, useEffect } from "react";
import api from "../../utils/api";


// ─── Types ───────────────────────────────────────────────────────────────────
interface Category {
    id: number;
    name: string;
    slug: string;
    path: string;
    parent: Category | null;
    isActive: boolean;
    deleted: boolean;
    createdAt: string;
    children?: Category[];
}

interface CategoryRequest {
    name: string;
    slug: string;
    parentId?: number | null;
    isActive: boolean;
}



// ─── Helpers ──────────────────────────────────────────────────────────────────
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
}

// ─── Badge component ──────────────────────────────────────────────────────────
const Badge = ({ active, deleted }: { active: boolean; deleted?: boolean }) => {
    if (deleted) return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
            Đã xóa
        </span>
    );
    if (active) return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            Hoạt động
        </span>
    );
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
            Tắt
        </span>
    );
};

// ─── Modal ────────────────────────────────────────────────────────────────────
const Modal = ({
    open, title, onClose, children,
}: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h2 className="text-base font-semibold text-slate-800">{title}</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                    </button>
                </div>
                <div className="px-6 py-5">{children}</div>
            </div>
        </div>
    );
};

// ─── Category Form ─────────────────────────────────────────────────────────────
const CategoryForm = ({
    initial, categories, onSubmit, onCancel,
}: {
    initial?: Partial<CategoryRequest>;
    categories: Category[];
    onSubmit: (data: CategoryRequest) => void;
    onCancel: () => void;
}) => {
    const [form, setForm] = useState<CategoryRequest>({
        name: initial?.name ?? "",
        slug: initial?.slug ?? "",
        parentId: initial?.parentId ?? null,
        isActive: initial?.isActive ?? true,
    });
    const [autoSlug, setAutoSlug] = useState(!initial?.slug);

    const handleName = (v: string) => {
        setForm(f => ({ ...f, name: v, slug: autoSlug ? generateSlug(v) : f.slug }));
    };
    const handleSlug = (v: string) => {
        setAutoSlug(false);
        setForm(f => ({ ...f, slug: v }));
    };

    const roots = categories.filter(c => !c.parent && !c.deleted);

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Tên thể loại <span className="text-red-500">*</span></label>
                <input
                    type="text"
                    value={form.name}
                    onChange={e => handleName(e.target.value)}
                    placeholder="Nhập tên thể loại..."
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 placeholder:text-slate-400 transition"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Slug <span className="text-slate-400 font-normal text-xs">(tự động tạo)</span></label>
                <div className="flex items-center rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 overflow-hidden transition">
                    <span className="px-3 py-2.5 text-sm text-slate-400 bg-slate-50 border-r border-slate-200 select-none">/</span>
                    <input
                        type="text"
                        value={form.slug}
                        onChange={e => handleSlug(e.target.value)}
                        placeholder="ten-danh-muc"
                        className="flex-1 px-3 py-2.5 text-sm text-slate-800 focus:outline-none bg-white placeholder:text-slate-400"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Thể loại cha</label>
                <select
                    value={form.parentId ?? ""}
                    onChange={e => setForm(f => ({ ...f, parentId: e.target.value ? Number(e.target.value) : null }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white transition"
                >
                    <option value="">— Không có (gốc) —</option>
                    {roots.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                    <p className="text-sm font-medium text-slate-700">Kích hoạt</p>
                    <p className="text-xs text-slate-400 mt-0.5">Hiển thị thể loại trên website</p>
                </div>
                <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${form.isActive ? "bg-indigo-500" : "bg-slate-300"}`}
                >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${form.isActive ? "translate-x-5" : "translate-x-0"}`} />
                </button>
            </div>

            <div className="flex gap-2 pt-1">
                <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">Huỷ</button>
                <button
                    onClick={() => form.name && form.slug && onSubmit(form)}
                    disabled={!form.name || !form.slug}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                    Lưu thể loại
                </button>
            </div>
        </div>
    );
};

// ─── Confirm Dialog ────────────────────────────────────────────────────────────
const ConfirmDialog = ({ open, message, onConfirm, onCancel }: { open: boolean; message: string; onConfirm: () => void; onCancel: () => void }) => (
    <Modal open={open} title="Xác nhận" onClose={onCancel}>
        <p className="text-sm text-slate-600 mb-5">{message}</p>
        <div className="flex gap-2">
            <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">Huỷ</button>
            <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-500 text-sm font-medium text-white hover:bg-red-600 transition">Xác nhận</button>
        </div>
    </Modal>
);

// ─── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ msg, type }: { msg: string; type: "success" | "error" }) => (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium text-white transition-all ${type === "success" ? "bg-emerald-500" : "bg-red-500"}`}>
        {type === "success"
            ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            : <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 5v4M8 11v1" stroke="white" strokeWidth="1.8" strokeLinecap="round" /></svg>
        }
        {msg}
    </div>
);

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
const mapBackendToFrontend = (list: any[]): Category[] => {
    const temp: Category[] = list.map(item => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        path: "",
        parent: null,
        isActive: item.isActive,
        deleted: item.isDeleted || !!item.deletedAt,
        createdAt: item.createdAt ? item.createdAt.split("T")[0] : "",
    }));

    list.forEach((item, idx) => {
        if (item.parentId) {
            const parent = temp.find(p => p.id === item.parentId);
            temp[idx].parent = parent || null;
        }
    });

    temp.forEach((cat) => {
        cat.path = cat.parent ? `${cat.parent.path}/${cat.slug}` : `/${cat.slug}`;
    });

    return temp;
};

export default function CategoryManagement() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [filterDeleted, setFilterDeleted] = useState<"all" | "active" | "deleted">("active");
    const [search, setSearch] = useState("");
    const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
    const [editTarget, setEditTarget] = useState<Category | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<Category | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 2800);
    };

    const fetchCategories = () => {
        api.get("/admin/categories")
            .then(res => {
                const raw = res.data.result || [];
                setCategories(mapBackendToFrontend(raw));
            })
            .catch(err => {
                console.error("Error fetching categories:", err);
                showToast("Không thể tải danh sách thể loại", "error");
            });
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const filtered = useMemo(() => {
        return categories.filter(c => {
            const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.slug.includes(search.toLowerCase());
            const matchDel = filterDeleted === "all" ? true : filterDeleted === "deleted" ? c.deleted : !c.deleted;
            return matchSearch && matchDel;
        });
    }, [categories, filterDeleted, search]);

    const stats = useMemo(() => ({
        total: categories.length,
        active: categories.filter(c => c.isActive && !c.deleted).length,
        inactive: categories.filter(c => !c.isActive && !c.deleted).length,
        deleted: categories.filter(c => c.deleted).length,
    }), [categories]);

    // CRUD handlers
    const handleCreate = (data: CategoryRequest) => {
        api.post("/admin/categories", {
            name: data.name,
            parentId: data.parentId
        })
        .then(() => {
            fetchCategories();
            setModalMode(null);
            showToast("Tạo thể loại thành công");
        })
        .catch(err => {
            console.error("Error creating category:", err);
            showToast(err.response?.data?.message || "Tạo thể loại thất bại", "error");
        });
    };

    const handleEdit = (data: CategoryRequest) => {
        if (!editTarget) return;
        api.put(`/admin/categories/${editTarget.id}`, {
            name: data.name,
            parentId: data.parentId
        })
        .then(() => {
            fetchCategories();
            setModalMode(null);
            setEditTarget(null);
            showToast("Cập nhật thể loại thành công");
        })
        .catch(err => {
            console.error("Error updating category:", err);
            showToast(err.response?.data?.message || "Cập nhật thể loại thất bại", "error");
        });
    };

    const handleDelete = (cat: Category) => {
        api.delete(`/admin/categories/${cat.id}`)
        .then(() => {
            fetchCategories();
            setConfirmDelete(null);
            showToast("Đã xóa thể loại");
        })
        .catch(err => {
            console.error("Error deleting category:", err);
            showToast(err.response?.data?.message || "Xóa thể loại thất bại", "error");
        });
    };

    const handleRestore = (cat: Category) => {
        api.put(`/admin/categories/${cat.id}/restore`)
        .then(() => {
            fetchCategories();
            showToast("Khôi phục thành công");
        })
        .catch(err => {
            console.error("Error restoring category:", err);
            showToast(err.response?.data?.message || "Khôi phục thất bại", "error");
        });
    };

    const handleToggleActive = (cat: Category) => {
        api.put(`/admin/categories/${cat.id}/toggle-active`)
        .then(() => {
            fetchCategories();
            showToast(cat.isActive ? "Đã tắt thể loại" : "Đã kích hoạt thể loại");
        })
        .catch(err => {
            console.error("Error toggling category status:", err);
            showToast(err.response?.data?.message || "Cập nhật trạng thái thất bại", "error");
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {toast && <Toast {...toast} />}

            {/* Header */}
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div>
                            <h1 className="text-base font-semibold text-slate-800">Quản lý thể loại</h1>
                            <p className="text-xs text-slate-400">BookStore Admin</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { setEditTarget(null); setModalMode("create"); }}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
                        Thêm thể loại
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-6 space-y-5">

                {/* Stats */}
                <div className="grid grid-cols-4 gap-3">
                    {[
                        { label: "Tổng cộng", value: stats.total, color: "text-slate-700", bg: "bg-white" },
                        { label: "Hoạt động", value: stats.active, color: "text-emerald-700", bg: "bg-emerald-50" },
                        { label: "Tắt", value: stats.inactive, color: "text-amber-700", bg: "bg-amber-50" },
                        { label: "Đã xóa", value: stats.deleted, color: "text-red-700", bg: "bg-red-50" },
                    ].map(s => (
                        <div key={s.label} className={`${s.bg} rounded-2xl border border-slate-100 p-4`}>
                            <p className="text-xs text-slate-500 font-medium mb-1">{s.label}</p>
                            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* Filters + Search */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3 flex-wrap">
                    <div className="relative flex-1 min-w-[180px]">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="15" height="15" viewBox="0 0 15 15" fill="none">
                            <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4" />
                            <path d="M10.5 10.5l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Tìm theo tên hoặc slug..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 placeholder:text-slate-400 transition"
                        />
                    </div>
                    <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                        {(["active", "all", "deleted"] as const).map(v => (
                            <button
                                key={v}
                                onClick={() => setFilterDeleted(v)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterDeleted === v ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                            >
                                {v === "active" ? "Đang dùng" : v === "all" ? "Tất cả" : "Đã xóa"}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-slate-400 ml-auto">{filtered.length} kết quả</p>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/60">
                                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide w-10">#</th>
                                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tên thể loại</th>
                                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Slug</th>
                                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cha</th>
                                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Trạng thái</th>
                                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Ngày tạo</th>
                                <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.length === 0 && (
                                <tr><td colSpan={7} className="text-center py-14 text-slate-400 text-sm">Không tìm thấy thể loại nào</td></tr>
                            )}
                            {filtered.map((cat, i) => (
                                <tr key={cat.id} className={`hover:bg-slate-50/60 transition-colors ${cat.deleted ? "opacity-60" : ""}`}>
                                    <td className="px-5 py-3.5 text-slate-400 text-xs">{i + 1}</td>
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${cat.deleted ? "bg-slate-100 text-slate-400" : "bg-indigo-50 text-indigo-600"}`}>
                                                {cat.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-slate-800">{cat.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <code className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">{cat.slug}</code>
                                    </td>
                                    <td className="px-4 py-3.5 text-slate-500 text-xs">
                                        {cat.parent ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-violet-100 text-xs">
                                                {cat.parent.name}
                                            </span>
                                        ) : (
                                            <span className="text-slate-300">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <Badge active={cat.isActive} deleted={cat.deleted} />
                                    </td>
                                    <td className="px-4 py-3.5 text-slate-400 text-xs">{cat.createdAt}</td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center justify-end gap-1">
                                            {cat.deleted ? (
                                                <button
                                                    onClick={() => handleRestore(cat)}
                                                    title="Khôi phục"
                                                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition border border-emerald-200"
                                                >
                                                    Khôi phục
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleToggleActive(cat)}
                                                        title={cat.isActive ? "Tắt" : "Bật"}
                                                        className={`p-1.5 rounded-lg transition border ${cat.isActive ? "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100" : "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"}`}
                                                    >
                                                        {cat.isActive
                                                            ? <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" transform="rotate(45 6.5 6.5)" /></svg>
                                                            : <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5" /><path d="M4.5 6.5l1.5 1.5 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                        }
                                                    </button>
                                                    <button
                                                        onClick={() => { setEditTarget(cat); setModalMode("edit"); }}
                                                        title="Sửa"
                                                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition"
                                                    >
                                                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 11L4.5 9.5 9.5 4.5 8.5 3.5 3.5 8.5 2 11z" fill="currentColor" /><path d="M8.5 3.5l1.5-1.5 1 1-1.5 1.5-1-1z" fill="currentColor" /></svg>
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmDelete(cat)}
                                                        title="Xóa"
                                                        className="p-1.5 rounded-lg bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 transition"
                                                    >
                                                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 3.5h9M5 3.5V2.5h3v1M5.5 6v4M7.5 6v4M3 3.5l.5 7h6l.5-7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
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
            </div>

            {/* Create Modal */}
            <Modal open={modalMode === "create"} title="Thêm thể loại mới" onClose={() => setModalMode(null)}>
                <CategoryForm
                    categories={categories}
                    onSubmit={handleCreate}
                    onCancel={() => setModalMode(null)}
                />
            </Modal>

            {/* Edit Modal */}
            <Modal open={modalMode === "edit" && !!editTarget} title="Chỉnh sửa thể loại" onClose={() => { setModalMode(null); setEditTarget(null); }}>
                {editTarget && (
                    <CategoryForm
                        initial={{ name: editTarget.name, slug: editTarget.slug, parentId: editTarget.parent?.id, isActive: editTarget.isActive }}
                        categories={categories.filter(c => c.id !== editTarget.id)}
                        onSubmit={handleEdit}
                        onCancel={() => { setModalMode(null); setEditTarget(null); }}
                    />
                )}
            </Modal>

            {/* Confirm Delete */}
            <ConfirmDialog
                open={!!confirmDelete}
                message={`Bạn có chắc muốn xóa thể loại "${confirmDelete?.name}"? Thao tác này có thể khôi phục.`}
                onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
                onCancel={() => setConfirmDelete(null)}
            />
        </div>
    );
}