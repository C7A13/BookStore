import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CategoryTreeResponse {
    id: number;
    name: string;
    slug: string;
    level: number;
    children: CategoryTreeResponse[];
}

interface BookListResponse {
    id: number;
    title: string;
    slug: string;
    coverImage: string;
    price: number;
    salePrice?: number;
    discountPercent?: number;
    effectivePrice: number;
    isOnSale: boolean;
    stockQuantity: number;
    avgRating?: number;
    categoryName?: string;
    authorName?: string;
}

const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

const sortOptions = [
    { value: "createdAt,desc", label: "Mới nhất" },
    { value: "price,asc", label: "Giá tăng dần" },
    { value: "price,desc", label: "Giá giảm dần" },
    { value: "title,asc", label: "Tên A → Z" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
function CategorySidebarItem({
    cat,
    depth,
    activeSlug,
    onSelect,
}: {
    cat: CategoryTreeResponse;
    depth: number;
    activeSlug: string | null;
    onSelect: (slug: string) => void;
}) {
    const [expanded, setExpanded] = useState(depth === 0);
    const hasChildren = cat.children && cat.children.length > 0;
    const isActive = cat.slug === activeSlug;

    return (
        <li>
            <div
                className={`flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer transition-all duration-200 group
          ${isActive
                        ? "bg-cyan-50 text-cyan-700 font-semibold border-l-4 border-cyan-500"
                        : "hover:bg-stone-100 text-stone-700 border-l-4 border-transparent"
                    }
          ${depth > 0 ? "ml-4 text-sm" : "text-base font-medium"}
        `}
                onClick={() => {
                    onSelect(cat.slug);
                    if (hasChildren) setExpanded((e) => !e);
                }}
            >
                <span className="truncate">{cat.name}</span>
                {hasChildren && (
                    <svg
                        className={`w-4 h-4 shrink-0 transition-transform duration-200 text-stone-400 group-hover:text-stone-600
              ${expanded ? "rotate-90" : ""}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                )}
            </div>
            {hasChildren && expanded && (
                <ul className="mt-1 space-y-0.5">
                    {cat.children.map((child) => (
                        <CategorySidebarItem
                            key={child.id}
                            cat={child}
                            depth={depth + 1}
                            activeSlug={activeSlug}
                            onSelect={onSelect}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
}

function BookCard({ book, view }: { book: BookListResponse; view: "grid" | "list" }) {
    const navigate = useNavigate();
    const [added, setAdded] = useState(false);

    const handleAdd = (e: React.MouseEvent) => {
        e.stopPropagation();
        setAdded(true);
        toast.success("Đã thêm sản phẩm vào giỏ hàng!");
        setTimeout(() => setAdded(false), 1800);
    };

    const handleCardClick = () => {
        navigate(`/books/${book.slug}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (view === "list") {
        return (
            <div
                onClick={handleCardClick}
                className="flex gap-5 bg-white rounded-2xl border border-stone-200 p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer"
            >
                <div className="relative shrink-0 w-24 h-36 overflow-hidden rounded-xl shadow-md bg-stone-50">
                    <img
                        src={book.coverImage || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200&h=300&fit=crop"}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {book.isOnSale && book.discountPercent && (
                        <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                            -{book.discountPercent}%
                        </span>
                    )}
                </div>
                <div className="flex flex-col justify-between flex-1 min-w-0">
                    <div>
                        <h3 className="text-stone-900 font-semibold text-base leading-snug line-clamp-2 group-hover:text-cyan-700 transition-colors">
                            {book.title}
                        </h3>
                        <p className="text-stone-500 text-sm mt-1">{book.authorName || "Đang cập nhật"}</p>
                        <p className="text-stone-400 text-xs mt-0.5">{book.categoryName}</p>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                        <div className="flex items-baseline gap-2">
                            <span className="text-cyan-600 font-bold text-lg">
                                {formatPrice(book.effectivePrice)}
                            </span>
                            {book.isOnSale && book.price > book.effectivePrice && (
                                <span className="text-stone-400 text-sm line-through">
                                    {formatPrice(book.price)}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={handleAdd}
                            disabled={book.stockQuantity === 0}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                ${added
                                    ? "bg-green-500 text-white scale-95"
                                    : "bg-cyan-500 hover:bg-cyan-600 text-white hover:scale-105 active:scale-95"
                                } disabled:opacity-50`}
                        >
                            {added ? (
                                <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Đã thêm
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6h13" />
                                    </svg>
                                    Thêm vào giỏ
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            onClick={handleCardClick}
            className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col cursor-pointer"
        >
            <div className="relative aspect-[3/4] overflow-hidden bg-stone-100">
                <img
                    src={book.coverImage || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200&h=300&fit=crop"}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {book.isOnSale && book.discountPercent && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow">
                        -{book.discountPercent}%
                    </span>
                )}
                {book.stockQuantity === 0 && (
                    <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-semibold px-2 py-1 rounded-lg">
                        Hết hàng
                    </span>
                )}
                <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <button
                        onClick={handleAdd}
                        disabled={book.stockQuantity === 0}
                        className={`w-full py-3 font-semibold text-sm transition-colors duration-200 disabled:opacity-50
              ${added ? "bg-green-500 text-white" : "bg-cyan-500 hover:bg-cyan-600 text-white"}`}
                    >
                        {added ? "✓ Đã thêm vào giỏ" : "Thêm vào giỏ hàng"}
                    </button>
                </div>
            </div>
            <div className="p-4 flex flex-col flex-1">
                <p className="text-stone-400 text-xs truncate">{book.authorName || "Đang cập nhật"}</p>
                <h3 className="text-stone-900 font-semibold text-sm mt-1 leading-snug line-clamp-2 group-hover:text-cyan-700 transition-colors flex-1">
                    {book.title}
                </h3>
                <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-cyan-600 font-bold text-base">
                        {formatPrice(book.effectivePrice)}
                    </span>
                    {book.isOnSale && book.price > book.effectivePrice && (
                        <span className="text-stone-400 text-xs line-through">
                            {formatPrice(book.price)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CategoryPage() {
    const [categories, setCategories] = useState<CategoryTreeResponse[]>([]);
    const [books, setBooks] = useState<BookListResponse[]>([]);
    const [activeSlug, setActiveSlug] = useState<string | null>(null);
    const [activeCatName, setActiveCatName] = useState<string>("Tất cả sách");
    const [sort, setSort] = useState("createdAt,desc");
    const [view, setView] = useState<"grid" | "list">("grid");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        const element = document.getElementById("books-container");
        if (element) {
            const elementPosition = element.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({
                top: elementPosition - 64,
                behavior: "smooth"
            });
        }
    }, [page, activeSlug, sort]);

    // Fetch categories tree on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get("/categories/public/tree");
                if (res.data?.result) {
                    setCategories(res.data.result);
                }
            } catch (err) {
                console.error("Lỗi khi tải thể loại:", err);
            }
        };
        fetchCategories();
    }, []);

    // Helper function to find a category name by slug
    const updateActiveCategoryName = (slug: string | null, list: CategoryTreeResponse[]) => {
        if (!slug) {
            setActiveCatName("Tất cả sách");
            return;
        }
        const findName = (nodes: CategoryTreeResponse[]): string | null => {
            for (const node of nodes) {
                if (node.slug === slug) return node.name;
                if (node.children && node.children.length > 0) {
                    const found = findName(node.children);
                    if (found) return found;
                }
            }
            return null;
        };
        const name = findName(list);
        setActiveCatName(name || "Thể loại");
    };

    // Trigger name update on activeSlug or category list changes
    useEffect(() => {
        updateActiveCategoryName(activeSlug, categories);
    }, [activeSlug, categories]);

    // Fetch books based on current active category slug, pagination, search keyword and sort
    useEffect(() => {
        const fetchBooks = async () => {
            setLoading(true);
            try {
                const params: Record<string, any> = {
                    page: page - 1, // backend is 0-based
                    size: 8,
                    isActive: true,
                    sort
                };

                if (search.trim()) {
                    params.keyword = search;
                }

                // If a category slug is selected, call the dedicated category-books endpoint
                const url = activeSlug ? `/books/category/${activeSlug}` : "/books";
                const res = await api.get(url, { params });

                if (res.data?.result) {
                    setBooks(res.data.result.data || []);
                    setTotalPages(res.data.result.totalPages || 1);
                    setTotalResults(res.data.result.total || 0);
                } else {
                    setBooks([]);
                    setTotalPages(1);
                    setTotalResults(0);
                }
            } catch (err) {
                console.error("Lỗi khi tải sách:", err);
            } finally {
                setLoading(false);
            }
        };

        // Added delay to search typing to avoid rapid API requests
        const handler = setTimeout(() => {
            fetchBooks();
        }, 300);

        return () => clearTimeout(handler);
    }, [activeSlug, sort, search, page]);

    const handleCategorySelect = (slug: string) => {
        setActiveSlug((prev) => (prev === slug ? null : slug));
        setPage(1);
        setSidebarOpen(false);
    };

    return (
        <div className="min-h-screen bg-stone-50 font-sans pt-20">
            {/* ── Breadcrumb ── */}
            <div className="max-w-7xl mx-auto px-4 py-3">
                <nav className="flex items-center gap-1.5 text-sm text-stone-500">
                    <a href="/" className="hover:text-cyan-600 transition-colors">Trang chủ</a>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-stone-400">Thể loại</span>
                    {activeSlug && (
                        <>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                            <span className="text-cyan-600 font-medium">{activeCatName}</span>
                        </>
                    )}
                </nav>
            </div>

            {/* ── Body ── */}
            <div className="max-w-7xl mx-auto px-4 pb-16">
                <div id="books-container" className="flex gap-6">

                    {/* ── Sidebar (desktop) ── */}
                    <aside className="hidden lg:block w-64 shrink-0">
                        <div className="sticky top-24 bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-stone-900 text-base">Thể loại sách</h2>
                                {activeSlug && (
                                    <button
                                        onClick={() => {
                                            setActiveSlug(null);
                                            setPage(1);
                                        }}
                                        className="text-xs text-cyan-600 hover:underline"
                                    >
                                        Xóa lọc
                                    </button>
                                )}
                            </div>
                            <ul className="space-y-1">
                                {categories.map((cat) => (
                                    <CategorySidebarItem
                                        key={cat.id}
                                        cat={cat}
                                        depth={0}
                                        activeSlug={activeSlug}
                                        onSelect={handleCategorySelect}
                                    />
                                ))}
                            </ul>
                        </div>
                    </aside>

                    {/* ── Mobile sidebar overlay ── */}
                    {sidebarOpen && (
                        <div className="fixed inset-0 z-50 lg:hidden">
                            <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
                            <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl overflow-y-auto">
                                <div className="p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="font-bold text-stone-900 text-base">Thể loại sách</h2>
                                        <button onClick={() => setSidebarOpen(false)} className="text-stone-400 hover:text-stone-700">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                    <ul className="space-y-1">
                                        {categories.map((cat) => (
                                            <CategorySidebarItem
                                                key={cat.id}
                                                cat={cat}
                                                depth={0}
                                                activeSlug={activeSlug}
                                                onSelect={handleCategorySelect}
                                            />
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Main Content ── */}
                    <main className="flex-1 min-w-0">
                        {/* Toolbar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                            <div className="flex items-center gap-3">
                                {/* Mobile menu toggle */}
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-xl border border-stone-200 text-sm text-stone-700 hover:bg-stone-100 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
                                    </svg>
                                    Thể loại
                                </button>

                                <div>
                                    <h1 className="text-lg font-bold text-stone-900">
                                        {activeCatName}
                                    </h1>
                                    <p className="text-stone-400 text-xs">{totalResults} kết quả</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
                                {/* Search input inside toolbar */}
                                <input
                                    type="text"
                                    placeholder="Tìm sách trong thể loại..."
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                    className="text-sm border border-stone-200 rounded-xl px-3 py-2 bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 flex-1 sm:w-44"
                                />

                                {/* Sort */}
                                <select
                                    value={sort}
                                    onChange={(e) => { setSort(e.target.value); setPage(1); }}
                                    className="text-sm border border-stone-200 rounded-xl px-3 py-2 bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer"
                                >
                                    {sortOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>

                                {/* View toggle */}
                                <div className="flex border border-stone-200 rounded-xl overflow-hidden bg-white shrink-0">
                                    <button
                                        onClick={() => setView("grid")}
                                        className={`p-2.5 transition-colors ${view === "grid" ? "bg-cyan-500 text-white" : "text-stone-500 hover:bg-stone-50"}`}
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => setView("list")}
                                        className={`p-2.5 transition-colors ${view === "list" ? "bg-cyan-500 text-white" : "text-stone-500 hover:bg-stone-50"}`}
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Active filter chips */}
                        {(activeSlug || search) && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {activeSlug && (
                                    <span className="flex items-center gap-1.5 bg-cyan-50 border border-cyan-200 text-cyan-700 text-sm px-3 py-1.5 rounded-full">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                        </svg>
                                        {activeCatName}
                                        <button onClick={() => { setActiveSlug(null); setPage(1); }} className="hover:text-cyan-900 ml-0.5">×</button>
                                    </span>
                                )}
                                {search && (
                                    <span className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-sm px-3 py-1.5 rounded-full">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        "{search}"
                                        <button onClick={() => setSearch("")} className="hover:text-blue-900 ml-0.5">×</button>
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Books grid / list */}
                        {loading ? (
                            <div className={`${view === "grid" ? "grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4" : "flex flex-col gap-4"}`}>
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className={`bg-white rounded-2xl border border-stone-200 overflow-hidden animate-pulse
                    ${view === "list" ? "flex gap-5 p-4" : ""}`}>
                                        <div className={`bg-stone-100 ${view === "list" ? "w-24 h-36 rounded-xl shrink-0" : "aspect-[3/4] w-full"}`} />
                                        {view === "list" && (
                                            <div className="flex-1 py-2 space-y-2">
                                                <div className="h-3 bg-stone-100 rounded w-3/4" />
                                                <div className="h-4 bg-stone-100 rounded w-full" />
                                                <div className="h-3 bg-stone-100 rounded w-1/2" />
                                            </div>
                                        )}
                                        {view === "grid" && (
                                            <div className="p-4 space-y-2">
                                                <div className="h-3 bg-stone-100 rounded w-1/2" />
                                                <div className="h-4 bg-stone-100 rounded w-full" />
                                                <div className="h-4 bg-stone-100 rounded w-3/4" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : books.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <div className="w-20 h-20 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
                                    <svg className="w-10 h-10 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <h3 className="text-stone-700 font-semibold text-lg">Không tìm thấy sách</h3>
                                <p className="text-stone-400 text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                                <button
                                    onClick={() => { setSearch(""); setActiveSlug(null); setPage(1); }}
                                    className="mt-4 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-xl text-sm transition-colors"
                                >
                                    Xem tất cả sách
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className={view === "grid"
                                    ? "grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4"
                                    : "flex flex-col gap-4"
                                }>
                                    {books.map((book) => (
                                        <BookCard key={book.id} book={book} view={view} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="mt-10 flex justify-center items-center gap-2">
                                        <button
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        {Array.from({ length: totalPages }).map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setPage(i + 1)}
                                                className={`w-9 h-9 rounded-xl text-sm font-medium transition-all
                           ${page === i + 1
                                                        ? "bg-cyan-500 text-white shadow-sm"
                                                        : "border border-stone-200 text-stone-600 hover:bg-stone-100"
                                                    }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                            className="w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </main>
                </div>
            </div>
            <ToastContainer position="top-center" autoClose={3000} />
        </div>
    );
}