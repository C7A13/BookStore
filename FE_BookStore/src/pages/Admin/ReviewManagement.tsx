import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Star, Eye, EyeOff, Search } from "lucide-react";
import api from "../../utils/api";

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface Review {
    id: number;
    bookId: number;
    bookTitle: string;
    bookCover?: string;
    userId: number;
    userName: string;
    fullName: string;
    orderId: number;
    rating: number;
    title: string;
    body: string;
    isVerified: boolean;
    isVisible: boolean;
    createdAt: string;
}

interface ReviewStats {
    total: number;
    avgRating: number;
    star5: number;
    hidden: number;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
    { bg: "#ede9fe", color: "#7c3aed" },
    { bg: "#d1fae5", color: "#059669" },
    { bg: "#fee2e2", color: "#dc2626" },
    { bg: "#dbeafe", color: "#2563eb" },
    { bg: "#fef3c7", color: "#d97706" },
    { bg: "#fce7f3", color: "#db2777" },
];

function getInitials(name: string) {
    if (!name) return "?";
    return name.trim().split(" ").slice(-2).map(w => w[0]).join("").toUpperCase();
}

function formatDateTime(s: string) {
    if (!s) return "—";
    const d = new Date(s);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

// ─── STYLE TOKENS ─────────────────────────────────────────────────────────────
const tdStyle: React.CSSProperties = { padding: "14px 16px", borderBottom: "1px solid #f1f5f9", verticalAlign: "top" };

// ─── ATOMS ────────────────────────────────────────────────────────────────────
function ActionBtn({ title, onClick, children, hoverBg = "#f1f5f9", hoverBorder = "#cbd5e1" }: { title: string; onClick: () => void; children: React.ReactNode; hoverBg?: string; hoverBorder?: string }) {
    const [hov, setHov] = useState(false);
    return (
        <button
            title={title}
            onClick={onClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: `1px solid ${hov ? hoverBorder : "#e2e8f0"}`,
                background: hov ? hoverBg : "#fff",
                cursor: "pointer",
                fontSize: 14,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all .15s",
                transform: hov ? "translateY(-1px)" : "none"
            }}
        >
            {children}
        </button>
    );
}

// ─── STATS BAR ────────────────────────────────────────────────────────────────
function StatsBar({ stats }: { stats: ReviewStats }) {
    const items = [
        { label: "Tổng đánh giá", value: stats.total, accent: "#6366f1", suffix: "" },
        { label: "Điểm trung bình", value: stats.avgRating.toFixed(1), accent: "#f59e0b", suffix: " / 5★" },
        { label: "Đánh giá 5★", value: stats.star5, accent: "#22c55e", suffix: "" },
        { label: "Đã ẩn hiển thị", value: stats.hidden, accent: "#ef4444", suffix: "" },
    ];
    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
            {items.map(({ label, value, accent, suffix }) => (
                <div key={label} style={{ background: "#fff", borderRadius: 10, padding: "14px 16px", border: "1px solid #e8eaf0", borderLeft: `3px solid ${accent}` }}>
                    <div style={{ fontSize: 26, fontWeight: 700, color: "#0f172a" }}>
                        {value}
                        <span style={{ fontSize: 13, fontWeight: 500, color: "#64748b" }}>{suffix}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, marginTop: 2 }}>{label}</div>
                </div>
            ))}
        </div>
    );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
type RatingFilter = "all" | "5" | "4" | "3" | "2" | "1";
type VisibilityFilter = "all" | "visible" | "hidden";

const PAGE_SIZE = 8;

export default function ReviewManagement() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [search, setSearch] = useState("");
    const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all");
    const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>("all");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<ReviewStats>({ total: 0, avgRating: 0, star5: 0, hidden: 0 });
    const [toast, setToast] = useState<string | null>(null);

    function showToast(msg: string) {
        setToast(msg);
        setTimeout(() => setToast(null), 2800);
    }

    // Fetch stats globally (fetches all reviews to compute accurate overall statistics)
    const fetchStats = useCallback(() => {
        api.get("/admin/reviews", {
            params: {
                page: 1,
                size: 10000
            }
        })
            .then(res => {
                const result = res.data.result;
                const data = result.data || [];
                const total = result.total || data.length;
                const totalRatingSum = data.reduce((sum: number, r: any) => sum + (r.rating || 0), 0);
                const avg = total > 0 ? totalRatingSum / total : 0;
                setStats({
                    total: total,
                    avgRating: avg,
                    star5: data.filter((r: any) => r.rating === 5).length,
                    hidden: data.filter((r: any) => !r.isVisible).length,
                });
            })
            .catch(err => {
                console.error("Error loading review stats:", err);
            });
    }, []);

    // Fetch reviews list for table
    const fetchReviews = useCallback(() => {
        setLoading(true);
        api.get("/admin/reviews", {
            params: {
                page: page,
                size: PAGE_SIZE
            }
        })
            .then(res => {
                const result = res.data.result;
                const mapped = (result.data || []).map((r: any) => ({
                    id: r.id,
                    bookId: r.bookId,
                    bookTitle: r.bookTitle || "Sách không xác định",
                    bookCover: r.bookCover || "",
                    userId: r.userId,
                    userName: r.userName || `User #${r.userId}`,
                    fullName: r.fullName || "Ẩn danh",
                    orderId: r.orderId,
                    rating: r.rating || 5,
                    title: r.title || "",
                    body: r.body || "",
                    isVerified: r.isVerified || false,
                    isVisible: r.isVisible !== false,
                    createdAt: r.createdAt || "",
                }));
                setReviews(mapped);
                setTotalPages(result.totalPages || 1);
                setTotalElements(result.total || 0);
            })
            .catch(err => {
                console.error("Error loading reviews:", err);
                showToast("Không thể tải danh sách đánh giá");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [page]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // Handle visibility toggle
    const handleToggleVisibility = (review: Review) => {
        api.patch(`/admin/reviews/${review.id}/visibility`)
            .then(() => {
                // Update local review state to reflect changes instantly
                setReviews(prev =>
                    prev.map(r => r.id === review.id ? { ...r, isVisible: !r.isVisible } : r)
                );
                // Refresh stats
                fetchStats();
                showToast(`Đã ${review.isVisible ? "ẩn" : "hiển thị"} đánh giá #${review.id}`);
            })
            .catch(err => {
                console.error("Error toggling review visibility:", err);
                alert("Thay đổi trạng thái hiển thị thất bại!");
            });
    };

    // Client-side filtering on the fetched page (or we can search globally)
    const filtered = useMemo(() => {
        return reviews.filter(r => {
            const q = search.toLowerCase();
            const matchSearch = !q ||
                r.fullName.toLowerCase().includes(q) ||
                r.userName.toLowerCase().includes(q) ||
                r.bookTitle.toLowerCase().includes(q) ||
                r.title.toLowerCase().includes(q) ||
                r.body.toLowerCase().includes(q);

            const matchRating = ratingFilter === "all" || r.rating.toString() === ratingFilter;
            const matchVisibility = visibilityFilter === "all" ||
                (visibilityFilter === "visible" && r.isVisible) ||
                (visibilityFilter === "hidden" && !r.isVisible);

            return matchSearch && matchRating && matchVisibility;
        });
    }, [reviews, search, ratingFilter, visibilityFilter]);

    return (
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 24px 48px", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", background: "#f4f5f7", minHeight: "100vh" }}>
            
            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a" }}>Quản lý đánh giá</h1>
                    <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>BookStore Admin — {totalElements} đánh giá từ độc giả</p>
                </div>
            </div>

            {/* Stats */}
            <StatsBar stats={stats} />

            {/* Toolbar */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
                <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
                    <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", width: 16, height: 16, pointerEvents: "none" }} />
                    <input
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Tìm theo sách, người dùng, nội dung..."
                        style={{ width: "100%", height: 38, padding: "0 12px 0 38px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, background: "#fff", outline: "none", boxSizing: "border-box" }}
                    />
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                    <select
                        value={ratingFilter}
                        onChange={e => { setRatingFilter(e.target.value as RatingFilter); setPage(1); }}
                        style={{ height: 38, padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, background: "#fff", color: "#475569", outline: "none", cursor: "pointer" }}
                    >
                        <option value="all">Tất cả số sao</option>
                        <option value="5">5 ★★★★★</option>
                        <option value="4">4 ★★★★</option>
                        <option value="3">3 ★★★</option>
                        <option value="2">2 ★★</option>
                        <option value="1">1 ★</option>
                    </select>

                    <select
                        value={visibilityFilter}
                        onChange={e => { setVisibilityFilter(e.target.value as VisibilityFilter); setPage(1); }}
                        style={{ height: 38, padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, background: "#fff", color: "#475569", outline: "none", cursor: "pointer" }}
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="visible">Đang hiển thị</option>
                        <option value="hidden">Đã ẩn</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8eaf0", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            {["#", "Sách", "Người dùng", "Đánh giá", "Nội dung", "Trạng thái", "Ngày tạo", "Thao tác"].map(h => (
                                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: ".05em", background: "#f8fafc", borderBottom: "1px solid #e8eaf0" }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={8} style={{ textAlign: "center", color: "#6366f1", padding: 40, fontSize: 14, fontWeight: 600 }}>
                                    Đang tải danh sách đánh giá...
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={8} style={{ textAlign: "center", color: "#94a3b8", padding: 40, fontSize: 14 }}>
                                    Không tìm thấy đánh giá nào
                                </td>
                            </tr>
                        ) : (
                            filtered.map((review, idx) => {
                                const ac = AVATAR_COLORS[review.userId % AVATAR_COLORS.length];
                                return (
                                    <tr key={review.id} style={{ transition: "background-color .15s", hover: { background: "#fafbfc" } } as any}>
                                        <td style={tdStyle}>
                                            <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace" }}>
                                                #{(page - 1) * PAGE_SIZE + idx + 1}
                                            </span>
                                        </td>
                                        <td style={{ ...tdStyle, width: "220px" }}>
                                            <div style={{ display: "flex", gap: 10 }}>
                                                {review.bookCover ? (
                                                    <img
                                                        src={review.bookCover}
                                                        alt={review.bookTitle}
                                                        style={{ width: 38, height: 48, objectFit: "cover", borderRadius: 4, border: "1px solid #e2e8f0" }}
                                                    />
                                                ) : (
                                                    <div style={{ width: 38, height: 48, borderRadius: 4, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e2e8f0", fontSize: 10, color: "#94a3b8" }}>Cover</div>
                                                )}
                                                <div>
                                                    <p style={{ fontWeight: 600, color: "#0f172a", fontSize: 13, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: "1.4" }} title={review.bookTitle}>
                                                        {review.bookTitle}
                                                    </p>
                                                    <span style={{ fontSize: 11, color: "#94a3b8" }}>ID: #{review.bookId}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ ...tdStyle, width: "160px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <div style={{ width: 30, height: 30, borderRadius: "50%", background: ac.bg, color: ac.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>
                                                    {getInitials(review.fullName)}
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: 600, color: "#334155", fontSize: 13, margin: 0 }}>{review.fullName}</p>
                                                    <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>@{review.userName}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ ...tdStyle, width: "100px" }}>
                                            <div style={{ display: "flex", gap: 1 }}>
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        style={{
                                                            width: 14,
                                                            height: 14,
                                                            fill: i < review.rating ? "#f59e0b" : "none",
                                                            color: i < review.rating ? "#f59e0b" : "#cbd5e1"
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </td>
                                        <td style={{ ...tdStyle, minWidth: "240px" }}>
                                            {review.title && (
                                                <p style={{ fontWeight: 700, color: "#1e293b", fontSize: 13, margin: "0 0 4px 0" }}>{review.title}</p>
                                            )}
                                            <p style={{ fontSize: 12.5, color: "#475569", margin: 0, lineHeight: "1.6", whiteSpace: "pre-line" }}>{review.body}</p>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 5,
                                                padding: "3px 9px",
                                                borderRadius: 20,
                                                fontSize: 11,
                                                fontWeight: 600,
                                                background: review.isVisible ? "#dcfce7" : "#fee2e2",
                                                color: review.isVisible ? "#16a34a" : "#dc2626"
                                            }}>
                                                <span style={{ width: 5, height: 5, borderRadius: "50%", background: review.isVisible ? "#22c55e" : "#ef4444" }} />
                                                {review.isVisible ? "Hiển thị" : "Đang ẩn"}
                                            </span>
                                        </td>
                                        <td style={{ ...tdStyle, fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>
                                            {formatDateTime(review.createdAt)}
                                        </td>
                                        <td style={tdStyle}>
                                            <ActionBtn
                                                title={review.isVisible ? "Ẩn đánh giá" : "Hiển thị đánh giá"}
                                                onClick={() => handleToggleVisibility(review)}
                                                hoverBg={review.isVisible ? "#fef2f2" : "#f0fdf4"}
                                                hoverBorder={review.isVisible ? "#ef4444" : "#22c55e"}
                                            >
                                                {review.isVisible ? (
                                                    <EyeOff className="w-4 h-4 text-red-500" />
                                                ) : (
                                                    <Eye className="w-4 h-4 text-emerald-500" />
                                                )}
                                            </ActionBtn>
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
                            Trang {page} / {totalPages} · {totalElements} đánh giá
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

            {/* Toast feedback */}
            {toast && (
                <div style={{ position: "fixed", bottom: 24, right: 24, background: "#0f172a", color: "#fff", padding: "12px 18px", borderRadius: 10, fontSize: 13, fontWeight: 500, boxShadow: "0 8px 30px rgba(0,0,0,.2)", display: "flex", alignItems: "center", gap: 8, zIndex: 100 }}>
                    <span style={{ color: "#22c55e" }}>✓</span> {toast}
                </div>
            )}
        </div>
    );
}
