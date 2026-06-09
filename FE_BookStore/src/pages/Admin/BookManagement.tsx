import React, { useState, useCallback, useRef, useEffect } from "react";
import {
    Pencil,
    Trash2,
    Percent,
    Pause,
    Play,
    X,
    Upload,
    Link
} from "lucide-react";
import api from "../../utils/api";

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface Category { id: number; name: string; }
interface Publisher { id: number; name: string; }
interface Author { id: number; fullName: string; }
interface BookAuthor { authorId: number; authorName: string; role: string; }
interface Book {
    id: number; isbn: string; title: string; slug: string; description: string;
    coverImage: string; price: number; costPrice: number; salePrice: number | null;
    saleFrom: string | null; saleTo: string | null; stockQuantity: number;
    reorderPoint: number; weightGram: number; pageCount: number; language: string;
    yearPublished: number; isActive: boolean; category: Category | null;
    publisher: Publisher | null; bookAuthors: BookAuthor[];
    onSale?: boolean; isOnSale?: boolean; effectivePrice?: number;
    categoryName?: string | null;
    authorName?: string | null;
}
interface SalePriceRequest { salePrice: number; saleFrom: string; saleTo: string; }

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const vnd = (n: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const emptyBook = (): Book => ({
    id: 0, isbn: "", title: "", slug: "", description: "", coverImage: "",
    price: 0, costPrice: 0, salePrice: null, saleFrom: null, saleTo: null,
    stockQuantity: 0, reorderPoint: 5, weightGram: 0, pageCount: 0,
    language: "vi", yearPublished: new Date().getFullYear(),
    isActive: true, category: null, publisher: null, bookAuthors: [],
    onSale: false, isOnSale: false, effectivePrice: 0,
});

type StatusFilter = "all" | "active" | "inactive" | "onSale" | "lowStock";

// ─── SHARED STYLE TOKENS ─────────────────────────────────────────────────────
const tdStyle: React.CSSProperties = {
    padding: "13px 16px", borderBottom: "1px solid #f1f5f9", verticalAlign: "middle",
};
const inputStyle: React.CSSProperties = {
    padding: "8px 11px", border: "1px solid #e2e8f0", borderRadius: 7,
    fontSize: 13, color: "#0f172a", background: "#fff", outline: "none", width: "100%",
};

// ─── ATOMS ────────────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: ".05em" }}>
                {label}
            </label>
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
    return (
        <button onClick={onClick} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid", fontSize: 13, fontWeight: 600, cursor: "pointer", ...BTN_STYLES[variant] }}>
            {children}
        </button>
    );
}

function CloseBtn({ onClick }: { onClick: () => void }) {
    return (
        <button onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#94a3b8", width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            ✕
        </button>
    );
}

function ActionBtn({ title, onClick, children, hoverBg = "#f1f5f9", hoverBorder = "#cbd5e1" }: {
    title: string; onClick: () => void; children: React.ReactNode;
    hoverBg?: string; hoverBorder?: string;
}) {
    const [hovered, setHovered] = useState(false);
    return (
        <button title={title} onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                width: 30, height: 30, borderRadius: 6,
                border: `1px solid ${hovered ? hoverBorder : "#e2e8f0"}`,
                background: hovered ? hoverBg : "#fff",
                cursor: "pointer", fontSize: 14, marginRight: 4,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                transition: "all .15s", transform: hovered ? "translateY(-1px)" : "none",
            }}>
            {children}
        </button>
    );
}

function StatusBadge({ book }: { book: Book }) {
    const configs = {
        inactive: { bg: "#f1f5f9", color: "#64748b", label: "Ngừng bán" },
        out: { bg: "#fee2e2", color: "#dc2626", label: "Hết hàng" },
        low: { bg: "#ffedd5", color: "#ea580c", label: "Sắp hết" },
        sale: { bg: "#fef3c7", color: "#d97706", label: "Đang sale" },
        active: { bg: "#dcfce7", color: "#16a34a", label: "Đang bán" },
    };
    const cfg = !book.isActive ? configs.inactive
        : book.stockQuantity === 0 ? configs.out
            : book.stockQuantity <= book.reorderPoint ? configs.low
                : (book.isOnSale || book.onSale) ? configs.sale
                    : configs.active;
    return (
        <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: cfg.bg, color: cfg.color }}>
            {cfg.label}
        </span>
    );
}

// ─── CLOUDINARY CONFIG ───────────────────────────────────────────────────────
const CLOUDINARY_CLOUD_NAME = "debc9ed96";
const CLOUDINARY_UPLOAD_PRESET = "bookstore_unsigned"; // Tạo unsigned preset trên dashboard Cloudinary

async function uploadToCloudinary(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", "books/covers");

    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
    );
    if (!res.ok) throw new Error("Upload ảnh thất bại");
    const data = await res.json();
    return data.secure_url as string;
}

// ─── IMAGE UPLOADER ───────────────────────────────────────────────────────────
function ImageUploader({
    value,
    onChange,
}: {
    value: string;
    onChange: (url: string) => void;
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);
    const [urlInput, setUrlInput] = useState("");
    const [tab, setTab] = useState<"upload" | "url">("upload");
    const [uploading, setUploading] = useState(false);

    const handleFile = async (file: File) => {
        if (!file.type.startsWith("image/")) return;
        setUploading(true);
        try {
            const url = await uploadToCloudinary(file);
            onChange(url);
        } catch {
            alert("Upload ảnh thất bại! Hãy kiểm tra Upload Preset trên Cloudinary.");
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleUrlApply = () => {
        if (urlInput.trim()) {
            onChange(urlInput.trim());
            setUrlInput("");
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Preview */}
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{
                    width: 80, height: 112, borderRadius: 8, border: "1px solid #e2e8f0",
                    overflow: "hidden", background: "#f8fafc", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    {value ? (
                        <img src={value} alt="cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                        <span style={{ fontSize: 28, opacity: 0.3 }}>📖</span>
                    )}
                </div>

                <div style={{ flex: 1 }}>
                    {/* Tab switcher */}
                    <div style={{ display: "flex", gap: 0, marginBottom: 10, borderRadius: 7, overflow: "hidden", border: "1px solid #e2e8f0", width: "fit-content" }}>
                        {(["upload", "url"] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                style={{
                                    padding: "6px 14px",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: 12,
                                    fontWeight: 600,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    background: tab === t ? "#6366f1" : "#fff",
                                    color: tab === t ? "#fff" : "#64748b",
                                    transition: "all .15s",
                                }}
                            >{t === "upload" ? (
                                <>
                                    <Upload size={14} />
                                    Tải lên
                                </>
                            ) : (
                                <>
                                    <Link size={14} />
                                    URL
                                </>
                            )}
                            </button>
                        ))}
                    </div>

                    {tab === "upload" ? (
                        <>
                            {/* Drop zone */}
                            <div
                                onClick={() => !uploading && fileInputRef.current?.click()}
                                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={handleDrop}
                                style={{
                                    border: `2px dashed ${dragging ? "#6366f1" : "#cbd5e1"}`,
                                    borderRadius: 8,
                                    padding: "14px 12px",
                                    textAlign: "center",
                                    cursor: uploading ? "wait" : "pointer",
                                    background: dragging ? "#eef2ff" : "#fafbfc",
                                    transition: "all .2s",
                                }}
                            >
                                {uploading ? (
                                    <>
                                        <div style={{ width: 22, height: 22, border: "3px solid #6366f1", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 6px" }} />
                                        <p style={{ fontSize: 12, color: "#6366f1", fontWeight: 600, margin: 0 }}>Đang upload lên Cloudinary...</p>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={22} style={{ marginBottom: 4, opacity: 0.7 }} />
                                        <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                                            Kéo thả ảnh vào đây hoặc{" "}
                                            <span style={{ color: "#6366f1", fontWeight: 600 }}>chọn file</span>
                                        </p>
                                        <p style={{ fontSize: 11, color: "#94a3b8", margin: "4px 0 0" }}>
                                            PNG, JPG, WEBP — tối đa 5MB · Upload thẳng lên Cloudinary
                                        </p>
                                    </>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={handleFileChange}
                            />
                        </>
                    ) : (
                        <div style={{ display: "flex", gap: 6 }}>
                            <input
                                value={urlInput}
                                onChange={e => setUrlInput(e.target.value)}
                                placeholder="https://res.cloudinary.com/..."
                                style={{ ...inputStyle, flex: 1 }}
                                onKeyDown={e => e.key === "Enter" && handleUrlApply()}
                            />
                            <button onClick={handleUrlApply} style={{
                                padding: "8px 12px", borderRadius: 7, border: "none",
                                background: "#6366f1", color: "#fff", fontSize: 12,
                                fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                            }}>
                                Áp dụng
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Remove button */}
            {value && (
                <button onClick={() => onChange("")} style={{
                    alignSelf: "flex-start", padding: "4px 10px", borderRadius: 6,
                    border: "1px solid #fecaca", background: "#fef2f2", color: "#ef4444",
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}>
                    <X size={16} /> Xóa ảnh
                </button>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

// ─── STATS BAR ────────────────────────────────────────────────────────────────
interface BookStats {
    total: number;
    active: number;
    onSale: number;
    low: number;
    out: number;
}
function StatsBar({ stats }: { stats: BookStats }) {
    const items = [
        { label: "Tổng sách", value: stats.total, accent: "#6366f1" },
        { label: "Đang bán", value: stats.active, accent: "#22c55e" },
        { label: "Đang sale", value: stats.onSale, accent: "#f59e0b" },
        { label: "Sắp hết", value: stats.low, accent: "#f97316" },
        { label: "Hết hàng", value: stats.out, accent: "#ef4444" },
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
function ConfirmModal({ message, danger, onConfirm, onClose }: {
    message: string; danger?: boolean; onConfirm: () => void; onClose: () => void;
}) {
    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }} onClick={onClose}>
            <div style={{ background: "#fff", borderRadius: 14, width: 440, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,.2)", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: "1px solid #f1f5f9" }}>
                    <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Xác nhận thao tác</h2>
                    <CloseBtn onClick={onClose} />
                </div>
                <div style={{ padding: 20 }}>
                    <p style={{ color: "#475569", lineHeight: 1.7 }}>{message}</p>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "16px 20px", borderTop: "1px solid #f1f5f9", background: "#fafbfc" }}>
                    <Btn variant="secondary" onClick={onClose}>Hủy</Btn>
                    <Btn variant={danger ? "danger" : "primary"} onClick={() => { onConfirm(); onClose(); }}>Xác nhận</Btn>
                </div>
            </div>
        </div>
    );
}

// ─── SALE MODAL ───────────────────────────────────────────────────────────────
function SaleModal({ book, onClose, onSave }: {
    book: Book; onClose: () => void; onSave: (req: SalePriceRequest) => void;
}) {
    const now = new Date().toISOString().slice(0, 16);
    const later = new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 16);

    const [salePrice, setSalePrice] = useState(book.salePrice ?? Math.round(book.price * 0.8));
    const [saleFrom, setSaleFrom] = useState(book.saleFrom?.slice(0, 16) ?? now);
    const [saleTo, setSaleTo] = useState(book.saleTo?.slice(0, 16) ?? later);

    const discount = book.price > 0 ? Math.round((1 - salePrice / book.price) * 100) : 0;

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }} onClick={onClose}>
            <div style={{ background: "#fff", borderRadius: 14, width: 460, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,.2)", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: "1px solid #f1f5f9" }}>
                    <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", maxWidth: 360, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        Thiết lập sale — {book.title}
                    </h2>
                    <CloseBtn onClick={onClose} />
                </div>
                <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#f8fafc", borderRadius: 8, fontSize: 13, color: "#475569" }}>
                        <span>Giá gốc:</span>
                        <strong style={{ color: "#0f172a" }}>{vnd(book.price)}</strong>
                    </div>
                    <Field label="Giá sale (₫)">
                        <input type="number" value={salePrice} onChange={e => setSalePrice(Number(e.target.value))} style={inputStyle} />
                        {discount > 0 && <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 600, marginTop: 3 }}>Giảm {discount}%</span>}
                    </Field>
                    <Field label="Từ ngày">
                        <input type="datetime-local" value={saleFrom} onChange={e => setSaleFrom(e.target.value)} style={inputStyle} />
                    </Field>
                    <Field label="Đến ngày">
                        <input type="datetime-local" value={saleTo} onChange={e => setSaleTo(e.target.value)} style={inputStyle} />
                    </Field>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "16px 20px", borderTop: "1px solid #f1f5f9", background: "#fafbfc" }}>
                    <Btn variant="secondary" onClick={onClose}>Hủy</Btn>
                    <Btn variant="primary" onClick={() => { onSave({ salePrice, saleFrom, saleTo }); onClose(); }}>Áp dụng sale</Btn>
                </div>
            </div>
        </div>
    );
}

// ─── BOOK DRAWER ──────────────────────────────────────────────────────────────
function BookDrawer({ book, categories, publishers, authors, onClose, onSave }: {
    book: Book; categories: Category[]; publishers: Publisher[]; authors: Author[]; onClose: () => void; onSave: (b: Book) => Promise<void>;
}) {
    const isNew = book.id === 0;
    const [form, setForm] = useState<Book>({ ...book });
    const [saving, setSaving] = useState(false);

    const selectedAuthorId = form.bookAuthors?.[0]?.authorId 
        || authors.find(a => a.fullName?.trim().toLowerCase() === book.authorName?.trim().toLowerCase())?.id 
        || "";

    useEffect(() => {
        if (!isNew && book.authorName && authors.length > 0 && (!form.bookAuthors || form.bookAuthors.length === 0)) {
            const author = authors.find(a => a.fullName?.trim().toLowerCase() === book.authorName?.trim().toLowerCase());
            if (author) {
                setForm(prev => ({
                    ...prev,
                    bookAuthors: [{ authorId: author.id, authorName: author.fullName, role: 'author' }]
                }));
            }
        }
    }, [isNew, book.authorName, authors]);

    const setStr = (field: keyof Book) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm(prev => ({ ...prev, [field]: e.target.value }));
    const setNum = (field: keyof Book) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(prev => ({ ...prev, [field]: Number(e.target.value) }));

    const handleSave = async () => {
        if (!form.title.trim()) { alert("Vui lòng nhập tên sách!"); return; }
        if (!form.category?.id) { alert("Vui lòng chọn thể loại!"); return; }
        if (!form.publisher?.id) { alert("Vui lòng chọn nhà xuất bản!"); return; }
        if (isNew && !form.coverImage) { alert("Vui lòng tải lên ảnh bìa cho sách mới!"); return; }
        setSaving(true);
        try {
            await onSave(form);
            onClose();
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.3)", zIndex: 100, display: "flex", justifyContent: "flex-end" }} onClick={onClose}>
            <div style={{ width: 540, maxWidth: "95vw", background: "#fff", height: "100vh", display: "flex", flexDirection: "column", boxShadow: "-8px 0 40px rgba(0,0,0,.15)" }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #f1f5f9", flexShrink: 0 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{isNew ? "Thêm sách mới" : "Chỉnh sửa sách"}</h2>
                    <CloseBtn onClick={onClose} />
                </div>

                {/* Scrollable body */}
                <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                        {/* ── Ảnh bìa ── */}
                        <div style={{ background: "#f8fafc", borderRadius: 10, padding: 14, border: "1px solid #e2e8f0" }}>
                            <p style={{ fontSize: 12, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 10 }}>
                                Ảnh bìa sách
                            </p>
                            <ImageUploader
                                value={form.coverImage}
                                onChange={(url) => setForm(prev => ({ ...prev, coverImage: url }))}
                            />
                        </div>

                        {/* ── Fields grid ── */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

                            <div style={{ gridColumn: "span 2" }}>
                                <Field label="Tên sách *">
                                    <input value={form.title} onChange={setStr("title")} placeholder="Nhập tên sách..." style={inputStyle} />
                                </Field>
                            </div>

                            <Field label="ISBN">
                                <input value={form.isbn} onChange={setStr("isbn")} placeholder="9786..." style={inputStyle} />
                            </Field>

                            <Field label="Ngôn ngữ">
                                <select value={form.language} onChange={setStr("language")} style={inputStyle}>
                                    <option value="vi">Tiếng Việt</option>
                                    <option value="en">English</option>
                                </select>
                            </Field>

                            <Field label="Giá bán (₫) *">
                                <input type="number" value={form.price} onChange={setNum("price")} style={inputStyle} />
                            </Field>

                            <Field label="Giá vốn (₫)">
                                <input type="number" value={form.costPrice || ""} onChange={setNum("costPrice")} style={inputStyle} />
                            </Field>

                            <Field label="Tồn kho *">
                                <input type="number" value={form.stockQuantity} onChange={setNum("stockQuantity")} style={inputStyle} />
                            </Field>

                            <Field label="Điểm đặt hàng lại">
                                <input type="number" value={form.reorderPoint} onChange={setNum("reorderPoint")} style={inputStyle} />
                            </Field>

                            <Field label="Số trang">
                                <input type="number" value={form.pageCount || ""} onChange={setNum("pageCount")} style={inputStyle} />
                            </Field>

                            <Field label="Năm xuất bản">
                                <input type="number" value={form.yearPublished || ""} onChange={setNum("yearPublished")} style={inputStyle} />
                            </Field>

                            <Field label="Thể loại *">
                                <select value={form.category?.id ?? ""} style={inputStyle}
                                    onChange={e => setForm(prev => ({ ...prev, category: categories.find(c => c.id === Number(e.target.value)) ?? null }))}>
                                    <option value="">-- Chọn thể loại --</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </Field>

                            <Field label="Nhà xuất bản *">
                                <select value={form.publisher?.id ?? ""} style={inputStyle}
                                    onChange={e => setForm(prev => ({ ...prev, publisher: publishers.find(p => p.id === Number(e.target.value)) ?? null }))}>
                                    <option value="">-- Chọn NXB --</option>
                                    {publishers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </Field>

                            <Field label="Tác giả *">
                                <select value={selectedAuthorId} style={inputStyle}
                                    onChange={e => {
                                        const authorId = Number(e.target.value);
                                        const author = authors.find(a => a.id === authorId);
                                        if (author) {
                                            setForm(prev => ({ ...prev, bookAuthors: [{ authorId, authorName: author.fullName, role: 'author' }] }));
                                        } else {
                                            setForm(prev => ({ ...prev, bookAuthors: [] }));
                                        }
                                    }}>
                                    <option value="">-- Chọn tác giả --</option>
                                    {authors.map(a => <option key={a.id} value={a.id}>{a.fullName}</option>)}
                                </select>
                            </Field>

                            <div style={{ gridColumn: "span 2" }}>
                                <Field label="Mô tả">
                                    <textarea rows={4} value={form.description || ""} onChange={setStr("description")}
                                        placeholder="Mô tả ngắn về sách..." style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
                                </Field>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ padding: "16px 24px", borderTop: "1px solid #f1f5f9", background: "#fafbfc", display: "flex", justifyContent: "flex-end", gap: 10, flexShrink: 0 }}>
                    <Btn variant="secondary" onClick={onClose}>Hủy</Btn>
                    <Btn variant="primary" onClick={handleSave}>{saving ? "Đang lưu..." : isNew ? "Tạo sách" : "Lưu thay đổi"}</Btn>
                </div>

            </div>
        </div>
    );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
type ModalState =
    | { type: "confirm"; message: string; danger?: boolean; action: () => void }
    | { type: "sale"; book: Book }
    | null;

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "Tất cả" },
    { value: "active", label: "Đang bán" },
    { value: "inactive", label: "Ngừng bán" },
    { value: "onSale", label: "Sale" },
    { value: "lowStock", label: "Sắp hết" },
];

export default function BookAdmin() {
    const [books, setBooks] = useState<Book[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [publishers, setPublishers] = useState<Publisher[]>([]);
    const [authors, setAuthors] = useState<Author[]>([]);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<StatusFilter>("all");
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [drawer, setDrawer] = useState<Book | null>(null);
    const [modal, setModal] = useState<ModalState>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<BookStats>({ total: 0, active: 0, onSale: 0, low: 0, out: 0 });

    // Fetch static categories and publishers on mount
    useEffect(() => {
        api.get("/admin/categories")
            .then(res => {
                setCategories(res.data.result || []);
            })
            .catch(err => console.error("Error loading categories:", err));

        api.get("/admin/publishers")
            .then(res => {
                setPublishers(res.data.result || []);
            })
            .catch(err => console.error("Error loading publishers:", err));

        api.get("/authors?size=100")
            .then(res => {
                setAuthors(res.data.result?.data || []);
            })
            .catch(err => console.error("Error loading authors:", err));
    }, []);

    // Fetch stats
    const fetchStats = useCallback(() => {
        api.get("/books", {
            params: {
                page: 0,
                size: 10000,
                includeInactive: true
            }
        })
            .then(res => {
                const result = res.data.result;
                const data = result.data || [];
                setStats({
                    total: result.total || data.length,
                    active: data.filter((b: any) => b.isActive).length,
                    onSale: data.filter((b: any) => b.isOnSale || b.onSale).length,
                    low: data.filter((b: any) => b.stockQuantity > 0 && b.stockQuantity <= b.reorderPoint).length,
                    out: data.filter((b: any) => b.stockQuantity === 0).length,
                });
            })
            .catch(err => {
                console.error("Error loading book stats:", err);
            });
    }, []);

    // Fetch books list
    const fetchBooks = useCallback(() => {
        setLoading(true);
        const params: any = {
            page: page - 1,
            size: 10,
            includeInactive: true
        };
        if (categoryId) params.categoryId = categoryId;
        if (search.trim()) params.keyword = search.trim();

        if (status === "active") {
            params.isActive = true;
        } else if (status === "inactive") {
            params.isActive = false;
        } else if (status === "onSale") {
            params.onSaleOnly = true;
        } else if (status === "lowStock") {
            params.lowStockOnly = true;
        }

        api.get("/books", { params })
            .then(res => {
                const result = res.data.result;
                setBooks(result.data || []);
                setTotalPages(result.totalPages || 1);
                setTotalElements(result.total || 0);
            })
            .catch(err => {
                console.error("Error loading books:", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [page, search, status, categoryId]);

    useEffect(() => {
        fetchBooks();
    }, [fetchBooks]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // Reset page to 1 on filter changes
    useEffect(() => {
        setPage(1);
    }, [search, status, categoryId]);

    const handleEditClick = async (book: Book) => {
        try {
            const res = await api.get(`/books/${book.slug}`);
            setDrawer(res.data.result);
        } catch (err) {
            console.error("Failed to fetch book detail", err);
            alert("Không thể tải thông tin chi tiết sách!");
        }
    };

    const saveBook = async (form: Book) => {
        const isNew = form.id === 0;

        const originalAuthor = authors.find(a => a.fullName?.trim().toLowerCase() === form.authorName?.trim().toLowerCase());
        const payloadAuthors = form.bookAuthors?.length 
            ? form.bookAuthors.map(a => ({ authorId: a.authorId, role: a.role }))
            : (originalAuthor ? [{ authorId: originalAuthor.id, role: 'author' }] : []);

        const requestPayload: Record<string, unknown> = {
            title: form.title,
            isbn: form.isbn || undefined,
            description: form.description || "",
            coverImage: form.coverImage || undefined,
            price: form.price,
            costPrice: form.costPrice || 0,
            stockQuantity: form.stockQuantity,
            reorderPoint: form.reorderPoint,
            weightGram: form.weightGram || 0,
            pageCount: form.pageCount || 0,
            language: form.language,
            yearPublished: form.yearPublished,
            categoryId: form.category?.id,
            publisherId: form.publisher?.id,
            authors: payloadAuthors,
        };

        try {
            if (isNew) {
                await api.post("/admin/books", requestPayload);
            } else {
                await api.put(`/admin/books/${form.id}`, requestPayload);
            }
            fetchBooks();
            fetchStats();
        } catch (err: any) {
            console.error("Failed to save book", err);
            alert(err.response?.data?.message || "Không thể lưu sách!");
            throw err;
        }
    };

    const handleDelete = (book: Book) => setModal({
        type: "confirm", danger: true,
        message: `Xóa sách "${book.title}"? Thao tác này không thể hoàn tác.`,
        action: async () => {
            try {
                await api.delete(`/admin/books/${book.id}?deletedBy=1`);
                fetchBooks();
                fetchStats();
            } catch (err: any) {
                console.error(err);
                alert(err.response?.data?.message || "Không thể xóa sách!");
            }
        },
    });

    const handleToggle = (book: Book) => setModal({
        type: "confirm",
        message: book.isActive ? `Ngừng bán "${book.title}"?` : `Kích hoạt lại "${book.title}"?`,
        action: async () => {
            try {
                if (book.isActive) {
                    await api.patch(`/admin/books/${book.id}/deactivate`);
                } else {
                    await api.patch(`/admin/books/${book.id}/activate`);
                }
                fetchBooks();
                fetchStats();
            } catch (err: any) {
                console.error(err);
                alert(err.response?.data?.message || "Không thể cập nhật trạng thái!");
            }
        },
    });

    const handleRemoveSale = (book: Book) => setModal({
        type: "confirm",
        message: `Xóa giá sale của "${book.title}"?`,
        action: async () => {
            try {
                await api.delete(`/admin/books/${book.id}/sale`);
                fetchBooks();
                fetchStats();
            } catch (err: any) {
                console.error(err);
                alert(err.response?.data?.message || "Không thể xóa giá sale!");
            }
        },
    });

    const handleApplySale = async (book: Book, req: SalePriceRequest) => {
        try {
             api.put(`/admin/books/${book.id}/sale`, {
                salePrice: req.salePrice,
                saleFrom: req.saleFrom,
                saleTo: req.saleTo
            });
            fetchBooks();
            fetchStats();
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || "Không thể thiết lập sale!");
        }
    };

    return (
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 24px 48px", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", background: "#f4f5f7", minHeight: "100vh" }}>

            {/* ── Header ── */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a" }}> Quản lý sách</h1>
                    <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>BookStore Admin — {totalElements} đầu sách</p>
                </div>
                <button onClick={() => setDrawer(emptyBook())}
                    style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "#6366f1", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                    + Thêm sách mới
                </button>
            </div>

            {/* ── Stats ── */}
            <StatsBar stats={stats} />

            {/* ── Toolbar ── */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
                <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                    <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 16, pointerEvents: "none" }}>⌕</span>
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo tên, ISBN..."
                        style={{ width: "100%", height: 38, padding: "0 12px 0 34px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, background: "#fff", outline: "none" }} />
                </div>

                <div style={{ display: "flex", gap: 4, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 3 }}>
                    {STATUS_TABS.map(t => (
                        <button key={t.value} onClick={() => setStatus(t.value)}
                            style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: status === t.value ? "#6366f1" : "transparent", color: status === t.value ? "#fff" : "#475569", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                            {t.label}
                        </button>
                    ))}
                </div>

                <select value={categoryId ?? ""} onChange={e => setCategoryId(e.target.value ? Number(e.target.value) : null)}
                    style={{ height: 38, padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, background: "#fff", color: "#475569", outline: "none", cursor: "pointer" }}>
                    <option value="">Tất cả thể loại</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>

            {/* ── Table ── */}
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8eaf0", overflow: "hidden", position: "relative" }}>
                {loading && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(255, 255, 255, 0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
                        <span style={{ fontSize: 14, color: "#6366f1", fontWeight: 600 }}>Đang tải dữ liệu...</span>
                    </div>
                )}
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            {["#", "Sách", "Thể loại", "Giá bán", "Tồn kho", "Trạng thái", "Thao tác"].map(h => (
                                <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: ".05em", background: "#f8fafc", borderBottom: "1px solid #e8eaf0" }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {books.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: "center", color: "#94a3b8", padding: 40, fontSize: 14 }}>
                                    Không tìm thấy sách nào
                                </td>
                            </tr>
                        ) : books.map(book => (
                            <tr key={book.id} style={{ opacity: book.isActive ? 1 : 0.55 }}>

                                <td style={tdStyle}>
                                    <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace" }}>{book.id}</span>
                                </td>

                                <td style={tdStyle}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <img src={book.coverImage} alt={book.title}
                                            style={{ width: 40, height: 56, borderRadius: 4, objectFit: "cover", border: "1px solid #e8eaf0", flexShrink: 0, background: "#f1f5f9" }}
                                            onError={e => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/40x56?text=📖"; }} />
                                        <div>
                                            <p style={{ fontWeight: 600, color: "#0f172a", fontSize: 13.5, marginBottom: 2 }}>{book.title}</p>
                                            {book.isbn && <p style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>ISBN: {book.isbn}</p>}
                                            {book.authorName && <p style={{ fontSize: 12, color: "#64748b", fontStyle: "italic", marginTop: 1 }}>{book.authorName}</p>}
                                        </div>
                                    </div>
                                </td>

                                <td style={tdStyle}>
                                    {book.categoryName
                                        ? <span style={{ background: "#ede9fe", color: "#7c3aed", borderRadius: 6, padding: "2px 8px", fontSize: 12, fontWeight: 500 }}>{book.categoryName}</span>
                                        : <span style={{ color: "#cbd5e1" }}>—</span>}
                                </td>

                                <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                                    {book.isOnSale || book.onSale ? (
                                        <>
                                            <span style={{ fontWeight: 700, color: "#ef4444", display: "block" }}>{vnd(book.effectivePrice!)}</span>
                                            <span style={{ fontSize: 11, color: "#94a3b8", textDecoration: "line-through" }}>{vnd(book.price)}</span>
                                        </>
                                    ) : (
                                        <span style={{ fontWeight: 600, color: "#0f172a" }}>{vnd(book.price)}</span>
                                    )}
                                </td>

                                <td style={tdStyle}>
                                    <span style={{
                                        fontWeight: 700, fontSize: 15,
                                        color: book.stockQuantity === 0 ? "#ef4444" : book.stockQuantity <= book.reorderPoint ? "#f59e0b" : "#22c55e",
                                    }}>
                                        {book.stockQuantity}
                                    </span>
                                </td>

                                <td style={tdStyle}>
                                    <StatusBadge book={book} />
                                </td>

                                <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                                    <ActionBtn title="Sửa" onClick={() => handleEditClick(book)} hoverBg="#eef2ff" hoverBorder="#6366f1">
                                        <Pencil size={16} />
                                    </ActionBtn>

                                    <ActionBtn
                                        title={book.isOnSale || book.onSale ? "Xóa sale" : "Đặt sale"}
                                        hoverBg="#fef9ee"
                                        hoverBorder="#f59e0b"
                                        onClick={() => (book.isOnSale || book.onSale) ? handleRemoveSale(book) : setModal({ type: "sale", book })}
                                    >
                                        {book.isOnSale || book.onSale ? <X size={16} /> : <Percent size={16} />}
                                    </ActionBtn>

                                    <ActionBtn
                                        title={book.isActive ? "Ngừng bán" : "Kích hoạt"}
                                        hoverBg={book.isActive ? "#fff7ed" : "#f0fdf4"}
                                        hoverBorder={book.isActive ? "#f97316" : "#22c55e"}
                                        onClick={() => handleToggle(book)}
                                    >
                                        {book.isActive ? <Pause size={16} /> : <Play size={16} />}
                                    </ActionBtn>

                                    <ActionBtn
                                        title="Xóa"
                                        onClick={() => handleDelete(book)}
                                        hoverBg="#fef2f2"
                                        hoverBorder="#ef4444"
                                    >
                                        <Trash2 size={16} />
                                    </ActionBtn>
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderTop: "1px solid #f1f5f9", background: "#fafbfc" }}>
                        <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                            Trang {page} / {totalPages} · {totalElements} sách
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

            {/* ── Portals ── */}
            {drawer && (
                <BookDrawer book={drawer} categories={categories} publishers={publishers} authors={authors} onClose={() => setDrawer(null)} onSave={saveBook} />
            )}
            {modal?.type === "sale" && (
                <SaleModal book={modal.book} onClose={() => setModal(null)} onSave={req => handleApplySale(modal.book, req)} />
            )}
            {modal?.type === "confirm" && (
                <ConfirmModal message={modal.message} danger={modal.danger} onConfirm={modal.action} onClose={() => setModal(null)} />
            )}
        </div>
    );
}