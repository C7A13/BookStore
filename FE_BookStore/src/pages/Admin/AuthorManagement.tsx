import React, { useState, useMemo, useEffect } from "react";
import api from "../../utils/api";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Author {
    id: number;
    fullName: string;
    slug: string;
    bio: string;
    nationality: string;
    birthYear: number | null;
    deleted: boolean;
    createdAt: string;
}
interface AuthorRequest {
    fullName: string;
    slug: string;
    bio: string;
    nationality: string;
    birthYear: number | null;
}
interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}



function generateSlug(name: string) {
    return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

const NATIONALITIES = ["Việt Nam", "Anh", "Mỹ", "Pháp", "Nhật Bản", "Trung Quốc", "Hàn Quốc", "Brazil", "Nga", "Đức", "Khác"];
const PAGE_SIZE = 5;

// ─── Icons ─────────────────────────────────────────────────────────────────────
const IcSearch = () => <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4" /><path d="M10.5 10.5l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>;
const IcClose = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M11 3L3 11M3 3l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
const IcEdit = () => <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 11L4.5 9.5 9.5 4.5 8.5 3.5 3.5 8.5 2 11z" fill="currentColor" /><path d="M8.5 3.5l1.5-1.5 1 1-1.5 1.5-1-1z" fill="currentColor" /></svg>;
const IcTrash = () => <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 3.5h9M5 3.5V2.5h3v1M5.5 6v4M7.5 6v4M3 3.5l.5 7h6l.5-7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const IcRestore = () => <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2.5 6.5A4 4 0 116.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /><path d="M2.5 3.5v3h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const IcPlus = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
const IcChevL = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const IcChevR = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const IcGlobe = () => <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.3" /><path d="M6.5 1.5c0 0-2.5 2-2.5 5s2.5 5 2.5 5M6.5 1.5c0 0 2.5 2 2.5 5s-2.5 5-2.5 5M1.5 6.5h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>;
const IcCalendar = () => <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1.5" y="2.5" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" /><path d="M4.5 1.5v2M8.5 1.5v2M1.5 6h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>;
const IcEye = () => <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1 6.5S3.5 2.5 6.5 2.5 12 6.5 12 6.5s-2.5 4-5.5 4S1 6.5 1 6.5z" stroke="currentColor" strokeWidth="1.3" /><circle cx="6.5" cy="6.5" r="1.5" stroke="currentColor" strokeWidth="1.3" /></svg>;

// ─── Avatar color palette ──────────────────────────────────────────────────────
const AVATAR_COLORS = [
    "bg-indigo-100 text-indigo-600", "bg-violet-100 text-violet-600",
    "bg-sky-100 text-sky-600", "bg-teal-100 text-teal-600",
    "bg-rose-100 text-rose-600", "bg-amber-100 text-amber-600",
];

// ─── UI Atoms ──────────────────────────────────────────────────────────────────
const Toast = ({ msg, type }: { msg: string; type: "success" | "error" }) => (
    <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-medium text-white ${type === "success" ? "bg-emerald-500" : "bg-red-500"}`}>
        {type === "success"
            ? <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2.5 7.5l3.5 3.5 6.5-7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            : <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 4v5M7.5 11v.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" /></svg>}
        {msg}
    </div>
);

const Modal = ({ open, title, wide, onClose, children }: { open: boolean; title: string; wide?: boolean; onClose: () => void; children: React.ReactNode }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? "max-w-2xl" : "max-w-md"} overflow-hidden max-h-[90vh] flex flex-col`}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
                    <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"><IcClose /></button>
                </div>
                <div className="px-6 py-5 overflow-y-auto">{children}</div>
            </div>
        </div>
    );
};

// ─── Author Form ───────────────────────────────────────────────────────────────
const AuthorForm = ({ initial, onSubmit, onCancel }: { initial?: Partial<AuthorRequest>; onSubmit: (d: AuthorRequest) => void; onCancel: () => void }) => {
    const [form, setForm] = useState<AuthorRequest>({
        fullName: initial?.fullName ?? "",
        slug: initial?.slug ?? "",
        bio: initial?.bio ?? "",
        nationality: initial?.nationality ?? "",
        birthYear: initial?.birthYear ?? null,
    });
    const [autoSlug, setAutoSlug] = useState(!initial?.slug);

    const set = (k: keyof AuthorRequest, v: string | number | null) => setForm(f => ({ ...f, [k]: v }));
    const handleName = (v: string) => { set("fullName", v); if (autoSlug) set("slug", generateSlug(v)); };
    const handleSlug = (v: string) => { setAutoSlug(false); set("slug", v); };

    const valid = form.fullName.trim() && form.slug.trim();

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Họ tên <span className="text-red-400 font-normal normal-case">*</span></label>
                    <input type="text" value={form.fullName} onChange={e => handleName(e.target.value)} placeholder="Nguyễn Văn A" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 placeholder:text-slate-300 text-slate-800 transition" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Slug <span className="text-slate-400 font-normal normal-case">(tự động)</span></label>
                    <div className="flex items-center rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 overflow-hidden transition">
                        <span className="px-2.5 py-2.5 text-xs text-slate-400 bg-slate-50 border-r border-slate-200 select-none font-mono">/</span>
                        <input type="text" value={form.slug} onChange={e => handleSlug(e.target.value)} placeholder="nguyen-van-a" className="flex-1 px-2.5 py-2.5 text-xs font-mono focus:outline-none placeholder:text-slate-300 text-slate-700 min-w-0" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Quốc tịch</label>
                    <select value={form.nationality} onChange={e => set("nationality", e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white transition text-slate-700">
                        <option value="">— Chọn quốc tịch —</option>
                        {NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Năm sinh</label>
                    <input type="number" value={form.birthYear ?? ""} onChange={e => set("birthYear", e.target.value ? Number(e.target.value) : null)} placeholder="1955" min="1000" max="2025" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 placeholder:text-slate-300 text-slate-800 transition" />
                </div>
            </div>

            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Tiểu sử</label>
                <textarea value={form.bio} onChange={e => set("bio", e.target.value)} placeholder="Nhập tiểu sử tác giả..." rows={3} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 placeholder:text-slate-300 text-slate-700 resize-none transition leading-relaxed" />
                <p className="text-xs text-slate-400 mt-1 text-right">{form.bio.length} ký tự</p>
            </div>

            <div className="flex gap-2 pt-1">
                <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">Huỷ</button>
                <button onClick={() => valid && onSubmit(form)} disabled={!valid} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition">Lưu tác giả</button>
            </div>
        </div>
    );
};

// ─── Detail Modal ──────────────────────────────────────────────────────────────
const AuthorDetail = ({ author, onClose, onEdit }: { author: Author; onClose: () => void; onEdit: () => void }) => (
    <Modal open title="Chi tiết tác giả" wide onClose={onClose}>
        <div className="space-y-5">
            <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-xl font-bold text-indigo-600 flex-shrink-0">
                    {author.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-slate-800">{author.fullName}</h3>
                    <code className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded-md mt-1 inline-block">{author.slug}</code>
                    <div className="flex items-center gap-3 mt-2">
                        {author.nationality && <span className="flex items-center gap-1.5 text-xs text-slate-500"><IcGlobe /> {author.nationality}</span>}
                        {author.birthYear && <span className="flex items-center gap-1.5 text-xs text-slate-500"><IcCalendar /> {author.birthYear}</span>}
                    </div>
                </div>
                <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${author.deleted ? "bg-red-50 text-red-600 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full inline-block ${author.deleted ? "bg-red-500" : "bg-emerald-500"}`} />
                    {author.deleted ? "Đã xóa" : "Hoạt động"}
                </span>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Tiểu sử</p>
                {author.bio
                    ? <p className="text-sm text-slate-600 leading-relaxed">{author.bio}</p>
                    : <p className="text-sm text-slate-400 text-center">Chưa có tiểu sử</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-xs text-slate-400 mb-0.5">Ngày tạo</p>
                    <p className="text-sm font-medium text-slate-700">{author.createdAt}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-xs text-slate-400 mb-0.5">ID</p>
                    <p className="text-sm font-medium text-slate-700">#{author.id}</p>
                </div>
            </div>

            {!author.deleted && (
                <button onClick={onEdit} className="w-full py-2.5 rounded-xl bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 transition flex items-center justify-center gap-2">
                    <IcEdit /> Chỉnh sửa tác giả
                </button>
            )}
        </div>
    </Modal>
);

const ConfirmDialog = ({ open, message, onConfirm, onCancel }: { open: boolean; message: string; onConfirm: () => void; onCancel: () => void }) => (
    <Modal open={open} title="Xác nhận thao tác" onClose={onCancel}>
        <p className="text-sm text-slate-600 mb-5 leading-relaxed">{message}</p>
        <div className="flex gap-2">
            <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">Huỷ</button>
            <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-500 text-sm font-medium text-white hover:bg-red-600 transition">Xác nhận xóa</button>
        </div>
    </Modal>
);

// ─── Author Page ───────────────────────────────────────────────────────────────
export default function AuthorPage() {
    const [authors, setAuthors] = useState<Author[]>([]);
    const [search, setSearch] = useState("");
    const [filterDeleted, setFilterDeleted] = useState<"all" | "active" | "deleted">("active");
    const [page, setPage] = useState(0);
    const [modalMode, setModalMode] = useState<"create" | "edit" | "detail" | null>(null);
    const [selected, setSelected] = useState<Author | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<Author | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 2500);
    };

    const fetchAuthors = () => {
        api.get("/admin/authors", { params: { size: 10000 } })
            .then(res => {
                const raw = res.data.result?.data || [];
                const mapped: Author[] = raw.map((item: any) => ({
                    id: item.id,
                    fullName: item.fullName,
                    slug: item.slug,
                    bio: item.bio || "",
                    nationality: item.nationality || "",
                    birthYear: item.birthYear,
                    deleted: item.isDeleted || !!item.deletedAt,
                    createdAt: item.createdAt ? item.createdAt.split("T")[0] : "",
                }));
                setAuthors(mapped);
            })
            .catch(err => {
                console.error("Error loading authors:", err);
                showToast("Không thể tải danh sách tác giả", "error");
            });
    };

    useEffect(() => {
        fetchAuthors();
    }, []);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return authors.filter(a =>
            (a.fullName.toLowerCase().includes(q) || a.slug.includes(q) || a.nationality.toLowerCase().includes(q)) &&
            (filterDeleted === "all" ? true : filterDeleted === "deleted" ? a.deleted : !a.deleted)
        );
    }, [authors, search, filterDeleted]);

    const pageData: PageResponse<Author> = useMemo(() => {
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
        const safePage = Math.min(page, totalPages - 1);
        return { content: filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE), totalElements: total, totalPages, number: safePage, size: PAGE_SIZE };
    }, [filtered, page]);

    const stats = useMemo(() => ({
        total: authors.length,
        active: authors.filter(a => !a.deleted).length,
        deleted: authors.filter(a => a.deleted).length,
        nationalities: new Set(authors.filter(a => !a.deleted && a.nationality).map(a => a.nationality)).size,
    }), [authors]);

    // CRUD
    const handleCreate = (data: AuthorRequest) => {
        api.post("/admin/authors", {
            fullName: data.fullName,
            bio: data.bio || "",
            nationality: data.nationality || "",
            birthYear: data.birthYear
        })
        .then(() => {
            fetchAuthors();
            setModalMode(null);
            showToast("Tạo tác giả thành công");
        })
        .catch(err => {
            console.error("Error creating author:", err);
            showToast(err.response?.data?.message || "Tạo tác giả thất bại", "error");
        });
    };

    const handleEdit = (data: AuthorRequest) => {
        if (!selected) return;
        api.put(`/admin/authors/${selected.id}`, {
            fullName: data.fullName,
            bio: data.bio || "",
            nationality: data.nationality || "",
            birthYear: data.birthYear
        })
        .then(() => {
            fetchAuthors();
            setModalMode(null);
            setSelected(null);
            showToast("Cập nhật thành công");
        })
        .catch(err => {
            console.error("Error updating author:", err);
            showToast(err.response?.data?.message || "Cập nhật thất bại", "error");
        });
    };

    const handleDelete = (a: Author) => {
        api.delete(`/admin/authors/${a.id}`)
        .then(() => {
            fetchAuthors();
            setConfirmDelete(null);
            showToast("Đã xóa tác giả");
        })
        .catch(err => {
            console.error("Error deleting author:", err);
            showToast(err.response?.data?.message || "Xóa tác giả thất bại", "error");
        });
    };

    const handleRestore = (a: Author) => {
        api.put(`/admin/authors/${a.id}/restore`)
        .then(() => {
            fetchAuthors();
            showToast("Khôi phục thành công");
        })
        .catch(err => {
            console.error("Error restoring author:", err);
            showToast(err.response?.data?.message || "Khôi phục thất bại", "error");
        });
    };

    const openDetail = (a: Author) => { setSelected(a); setModalMode("detail"); };
    const openEdit = (a: Author) => { setSelected(a); setModalMode("edit"); };

    return (
        <div className="min-h-screen bg-slate-50">
            {toast && <Toast {...toast} />}

            {/* Page header */}
            <div className="px-8 py-5 bg-white border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                <div>
                    <h1 className="text-lg font-semibold text-slate-800">Quản lý Tác giả</h1>
                    <p className="text-xs text-slate-400 mt-0.5">Quản lý danh sách tác giả sách</p>
                </div>
                <button
                    onClick={() => { setSelected(null); setModalMode("create"); }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
                >
                    <IcPlus /> Thêm tác giả
                </button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-4">

                {/* Stats */}
                <div className="grid grid-cols-4 gap-3">
                    {[
                        { label: "Tổng tác giả", value: stats.total, color: "text-slate-700", bg: "bg-white border-slate-100" },
                        { label: "Đang hoạt động", value: stats.active, color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-100" },
                        { label: "Quốc tịch", value: stats.nationalities, color: "text-teal-600", bg: "bg-teal-50 border-teal-100" },
                        { label: "Đã xóa", value: stats.deleted, color: "text-red-500", bg: "bg-red-50 border-red-100" },
                    ].map(s => (
                        <div key={s.label} className={`${s.bg} rounded-2xl border p-4`}>
                            <p className="text-xs text-slate-500 font-medium mb-1.5">{s.label}</p>
                            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* Toolbar */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3 flex-wrap">
                    <div className="relative flex-1 min-w-[200px]">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><IcSearch /></span>
                        <input
                            type="text"
                            placeholder="Tìm theo tên, slug, quốc tịch..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(0); }}
                            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 placeholder:text-slate-300 transition"
                        />
                    </div>
                    <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                        {(["active", "all", "deleted"] as const).map(v => (
                            <button key={v} onClick={() => { setFilterDeleted(v); setPage(0); }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterDeleted === v ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                                {v === "active" ? "Hoạt động" : v === "all" ? "Tất cả" : "Đã xóa"}
                            </button>
                        ))}
                    </div>
                    <span className="text-xs text-slate-400">{filtered.length} tác giả</span>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/80">
                                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider w-10">#</th>
                                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tác giả</th>
                                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Quốc tịch</th>
                                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Năm sinh</th>
                                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Slug</th>
                                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Trạng thái</th>
                                <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {pageData.content.length === 0 && (
                                <tr><td colSpan={7} className="text-center py-16 text-slate-400 text-sm">Không tìm thấy tác giả nào</td></tr>
                            )}
                            {pageData.content.map((a, i) => {
                                const colorClass = AVATAR_COLORS[a.id % AVATAR_COLORS.length];
                                return (
                                    <tr key={a.id} className={`hover:bg-slate-50/60 transition-colors ${a.deleted ? "opacity-55" : ""}`}>
                                        <td className="px-5 py-3.5 text-slate-400 text-xs tabular-nums">{pageData.number * PAGE_SIZE + i + 1}</td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${a.deleted ? "bg-slate-100 text-slate-400" : colorClass}`}>
                                                    {a.fullName.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-slate-800 leading-snug truncate max-w-[160px]">{a.fullName}</p>
                                                    {a.bio && <p className="text-xs text-slate-400 truncate max-w-[160px] mt-0.5">{a.bio.slice(0, 50)}{a.bio.length > 50 ? "…" : ""}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            {a.nationality
                                                ? <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"><IcGlobe />{a.nationality}</span>
                                                : <span className="text-slate-300 text-xs">—</span>}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            {a.birthYear
                                                ? <span className="inline-flex items-center gap-1.5 text-xs text-slate-600"><IcCalendar />{a.birthYear}</span>
                                                : <span className="text-slate-300 text-xs">—</span>}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <code className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-mono">{a.slug}</code>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${a.deleted ? "bg-red-50 text-red-700 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full inline-block ${a.deleted ? "bg-red-500" : "bg-emerald-500"}`} />
                                                {a.deleted ? "Đã xóa" : "Hoạt động"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => openDetail(a)} title="Xem chi tiết" className="p-1.5 rounded-lg bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 transition"><IcEye /></button>
                                                {a.deleted ? (
                                                    <button onClick={() => handleRestore(a)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition">
                                                        <IcRestore /> Khôi phục
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition"><IcEdit /></button>
                                                        <button onClick={() => setConfirmDelete(a)} className="p-1.5 rounded-lg bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 transition"><IcTrash /></button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {pageData.totalPages > 1 && (
                        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/50">
                            <p className="text-xs text-slate-400">
                                Trang {pageData.number + 1} / {pageData.totalPages} &nbsp;·&nbsp; {pageData.totalElements} tác giả
                            </p>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={pageData.number === 0} className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition"><IcChevL /></button>
                                {Array.from({ length: pageData.totalPages }, (_, i) => (
                                    <button key={i} onClick={() => setPage(i)}
                                        className={`w-7 h-7 rounded-lg text-xs font-medium transition ${i === pageData.number ? "bg-indigo-600 text-white" : "border border-slate-200 text-slate-500 hover:bg-white"}`}>
                                        {i + 1}
                                    </button>
                                ))}
                                <button onClick={() => setPage(p => Math.min(pageData.totalPages - 1, p + 1))} disabled={pageData.number >= pageData.totalPages - 1} className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition"><IcChevR /></button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <Modal open={modalMode === "create"} title="Thêm tác giả mới" wide onClose={() => setModalMode(null)}>
                <AuthorForm onSubmit={handleCreate} onCancel={() => setModalMode(null)} />
            </Modal>

            <Modal open={modalMode === "edit" && !!selected} title="Chỉnh sửa tác giả" wide onClose={() => { setModalMode(null); setSelected(null); }}>
                {selected && (
                    <AuthorForm
                        initial={{ fullName: selected.fullName, slug: selected.slug, bio: selected.bio, nationality: selected.nationality, birthYear: selected.birthYear }}
                        onSubmit={handleEdit}
                        onCancel={() => { setModalMode(null); setSelected(null); }}
                    />
                )}
            </Modal>

            {modalMode === "detail" && selected && (
                <AuthorDetail
                    author={selected}
                    onClose={() => { setModalMode(null); setSelected(null); }}
                    onEdit={() => setModalMode("edit")}
                />
            )}

            <ConfirmDialog
                open={!!confirmDelete}
                message={`Bạn có chắc muốn xóa tác giả "${confirmDelete?.fullName}"? Thao tác này có thể khôi phục sau.`}
                onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
                onCancel={() => setConfirmDelete(null)}
            />
        </div>
    );
}