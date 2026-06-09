import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import Swal from "sweetalert2";

// ─── Types ────────────────────────────────────────────────────────────────────
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
    isbn?: string;
    categoryName?: string;
    authorName?: string;
}

interface CategoryTreeResponse {
    id: number;
    name: string;
    slug: string;
    level: number;
    children: CategoryTreeResponse[];
}

interface PublisherResponse {
    id: number;
    name: string;
}

interface AuthorResponse {
    id: number;
    fullName: string;
    slug: string;
}

// ─── Filter Constants ────────────────────────────────────────────────────────
const sortOptions = [
    { label: "Mới nhất", value: "createdAt,desc" },
    { label: "Tên A-Z", value: "title,asc" },
    { label: "Tên Z-A", value: "title,desc" },
    { label: "Giá thấp đến cao", value: "price,asc" },
    { label: "Giá cao xuống thấp", value: "price,desc" }
];

const priceRanges = [
    { label: "Dưới 100.000đ", min: null, max: 100000 },
    { label: "Từ 100.000đ - 200.000đ", min: 100000, max: 200000 },
    { label: "Từ 200.000đ - 500.000đ", min: 200000, max: 500000 },
    { label: "Từ 500.000đ - 1 triệu", min: 500000, max: 1000000 },
    { label: "Từ 1 triệu - 2 triệu", min: 1000000, max: 2000000 }
];

const languages = [
    { label: "Tiếng Việt", value: "vi" },
    { label: "Tiếng Anh", value: "en" }
];

const formatPrice = (p: number) => p.toLocaleString("vi-VN") + "đ";

// ─── Icons ────────────────────────────────────────────────────────────────────
const CartIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const PlusIcon = ({ open }: { open?: boolean }) => (
    <svg className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-45" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
);

const SearchIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
    </svg>
);

const SortIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
    </svg>
);

// ─── Sub-Components ───────────────────────────────────────────────────────────
function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="mb-6">
            <h3 className="font-bold text-gray-900 text-sm tracking-wide mb-3">{title}</h3>
            {children}
        </div>
    );
}

function ProductCard({ product }: { product: BookListResponse }) {
    const navigate = useNavigate();
    const [inCart, setInCart] = useState(false);

    const handleCardClick = () => {
        navigate(`/books/${product.slug}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="group relative flex flex-col bg-white border border-gray-100 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all duration-300">
            {/* Image Cover */}
            <div
                onClick={handleCardClick}
                className="relative overflow-hidden rounded-xl bg-gray-50 mb-3 aspect-[3/4] cursor-pointer"
            >
                <img
                    src={product.coverImage || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop"}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.isOnSale && product.discountPercent && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                        -{product.discountPercent}%
                    </div>
                )}
                {product.stockQuantity === 0 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-semibold text-sm">
                        HẾT HÀNG
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col">
                <p className="text-cyan-600 text-xs font-semibold mb-1 truncate">
                    {product.authorName || "Đang cập nhật"}
                </p>
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h3
                        onClick={handleCardClick}
                        className="text-sm text-gray-800 font-medium leading-snug line-clamp-2 flex-1 cursor-pointer hover:text-cyan-600 transition-colors"
                    >
                        {product.title}
                    </h3>
                    <div className="flex flex-col gap-1 flex-shrink-0">
                        {product.avgRating && (
                            <span className="text-xs text-amber-500 font-semibold flex items-center justify-end">
                                ★ {product.avgRating.toFixed(1)}
                            </span>
                        )}
                        <button
                            onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                    await api.post("/cart/items", {
                                        bookId: product.id,
                                        quantity: 1
                                    });
                                    setInCart(true);
                                    window.dispatchEvent(new Event("cart_updated"));
                                    Swal.fire({
                                        icon: "success",
                                        title: "Thành công",
                                        text: `Đã thêm "${product.title}" vào giỏ hàng!`,
                                        showConfirmButton: false,
                                        timer: 1500,
                                        position: "center"
                                    });
                                } catch (err) {
                                    console.error("Lỗi thêm vào giỏ hàng:", err);
                                    Swal.fire({
                                        icon: "error",
                                        title: "Thất bại",
                                        text: "Không thể thêm sản phẩm vào giỏ hàng!",
                                        confirmButtonColor: "#4f46e5"
                                    });
                                }
                            }}
                            disabled={product.stockQuantity === 0}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${inCart ? "bg-cyan-600 text-white" : "bg-cyan-100 hover:bg-cyan-200 text-cyan-600"} disabled:opacity-50`}
                        >
                            <CartIcon />
                        </button>
                    </div>
                </div>

                <div className="flex items-baseline gap-2 mt-auto">
                    <span className="text-cyan-600 font-bold text-base">{formatPrice(product.effectivePrice)}</span>
                    {product.isOnSale && product.price > product.effectivePrice && (
                        <span className="text-gray-400 text-xs line-through">{formatPrice(product.price)}</span>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Skeleton Loader ─────────────────────────────────────────────────────────
function ProductSkeleton() {
    return (
        <div className="border border-gray-100 rounded-2xl p-3 shadow-sm animate-pulse flex flex-col">
            <div className="bg-gray-200 rounded-xl aspect-[3/4] mb-3 w-full" />
            <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mt-auto" />
        </div>
    );
}

// ─── Main Page Component ───────────────────────────────────────────────────────
export default function ProductPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    // Get search keyword from header / URL
    const urlKeyword = searchParams.get("keyword") || "";

    // API loading & data state
    const [books, setBooks] = useState<BookListResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Dynamic Filter lists from API
    const [categories, setCategories] = useState<CategoryTreeResponse[]>([]);
    const [publishers, setPublishers] = useState<PublisherResponse[]>([]);
    const [authors, setAuthors] = useState<AuthorResponse[]>([]);

    // Search query for authors list
    const [authorSearch, setAuthorSearch] = useState("");

    // Active expanded categories list
    const [expandedCategories, setExpandedCategories] = useState<number[]>([]);

    // Active filters
    const urlCategory = searchParams.get("category");
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(urlCategory ? Number(urlCategory) : null);

    useEffect(() => {
        if (urlCategory) {
            setSelectedCategoryId(Number(urlCategory));
        }
    }, [urlCategory]);
    const [selectedPublisherId, setSelectedPublisherId] = useState<number | null>(null);
    const [selectedAuthorId, setSelectedAuthorId] = useState<number | null>(null);
    const [selectedPriceIndex, setSelectedPriceIndex] = useState<number | null>(null);
    const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
    const [onSaleOnly, setOnSaleOnly] = useState(false);
    const [sortBy, setSortBy] = useState("createdAt,desc");

    // Pagination & Pagination Metadata
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
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
    }, [
        page,
        selectedCategoryId,
        selectedPublisherId,
        selectedAuthorId,
        selectedPriceIndex,
        selectedLanguage,
        onSaleOnly,
        sortBy,
        urlKeyword
    ]);

    // Load filter sidebar items once on mount
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const [catRes, pubRes, authRes] = await Promise.all([
                    api.get("/categories/public/tree"),
                    api.get("/publishers/public"),
                    api.get("/authors?size=100")
                ]);

                if (catRes.data?.result) setCategories(catRes.data.result);
                if (pubRes.data?.result) setPublishers(pubRes.data.result);
                if (authRes.data?.result?.data) setAuthors(authRes.data.result.data);
            } catch (err) {
                console.error("Lỗi khi tải bộ lọc:", err);
            }
        };
        fetchFilters();
    }, []);



    // Load books dynamically on parameter change
    useEffect(() => {
        const fetchBooks = async () => {
            setLoading(true);
            setError(null);

            // Construct filters
            const params: Record<string, any> = {
                page: page - 1, // backend is 0-based
                size: 12,
                isActive: true
            };

            // Map UI sorting values to Spring Pageable sort format
            if (sortBy) {
                params.sort = sortBy;
            }

            if (urlKeyword) params.keyword = urlKeyword;
            if (selectedCategoryId) params.categoryId = selectedCategoryId;
            if (selectedPublisherId) params.publisherId = selectedPublisherId;
            if (selectedAuthorId) params.authorId = selectedAuthorId;
            if (onSaleOnly) params.onSaleOnly = true;
            if (selectedLanguage) params.language = selectedLanguage;

            if (selectedPriceIndex !== null) {
                const range = priceRanges[selectedPriceIndex];
                if (range.min !== null) params.minPrice = range.min;
                if (range.max !== null) params.maxPrice = range.max;
            }

            try {
                const res = await api.get("/books", { params });
                if (res.data?.result) {
                    setBooks(res.data.result.data || []);
                    setTotalPages(res.data.result.totalPages || 1);
                } else {
                    setBooks([]);
                    setTotalPages(1);
                }
            } catch (err) {
                console.error("Lỗi khi tải danh sách sách:", err);
                setError("Không thể kết nối tới máy chủ. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, [
        page,
        urlKeyword,
        selectedCategoryId,
        selectedPublisherId,
        selectedAuthorId,
        selectedPriceIndex,
        selectedLanguage,
        onSaleOnly,
        sortBy
    ]);

    // Reset page to 1 on filter changes
    const resetPagination = () => setPage(1);

    const toggleCategoryExpand = (id: number) => {
        setExpandedCategories(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    // Filter author list based on search box input
    const filteredAuthors = authors.filter(author =>
        author.fullName.toLowerCase().includes(authorSearch.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-white font-sans">
            {/* Header Title */}
            <div className="pt-28 pb-16 text-center border-b border-gray-100 bg-gradient-to-b from-cyan-50 to-white">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-500">
                        {urlKeyword ? `Kết quả tìm kiếm: "${urlKeyword}"` : "Tất cả sản phẩm"}
                    </span>
                </h1>
                <p className="text-base text-gray-600 mt-4 max-w-xl mx-auto">
                    {urlKeyword
                        ? `Tìm thấy danh sách sách phù hợp với từ khóa tìm kiếm của bạn`
                        : `Khám phá bộ sưu tập sách mới nhất với nhiều ưu đãi hấp dẫn dành cho bạn`
                    }
                </p>
                <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto mt-6 rounded-full"></div>
            </div>

            <div id="books-container" className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <aside className="w-full md:w-64 flex-shrink-0">
                    {/* Thể loại */}
                    <SidebarSection title="THỂ LOẠI SÁCH">
                        <ul className="space-y-1">
                            {categories.map((cat) => {
                                const hasChildren = cat.children && cat.children.length > 0;
                                const isExpanded = expandedCategories.includes(cat.id);
                                const isSelected = selectedCategoryId === cat.id;

                                return (
                                    <li key={cat.id} className="space-y-1">
                                        <div className="flex items-center justify-between text-sm py-1 cursor-pointer group">
                                            <span
                                                onClick={() => {
                                                    setSelectedCategoryId(isSelected ? null : cat.id);
                                                    resetPagination();
                                                }}
                                                className={`transition-colors hover:text-cyan-600 flex-1 ${isSelected ? "text-cyan-600 font-bold" : "text-gray-600"}`}
                                            >
                                                {cat.name}
                                            </span>
                                            {hasChildren && (
                                                <button
                                                    onClick={() => toggleCategoryExpand(cat.id)}
                                                    className="p-1 text-gray-400 hover:text-gray-700"
                                                >
                                                    <PlusIcon open={isExpanded} />
                                                </button>
                                            )}
                                        </div>
                                        {hasChildren && isExpanded && (
                                            <ul className="pl-4 border-l border-gray-100 space-y-1">
                                                {cat.children.map(child => {
                                                    const isChildSelected = selectedCategoryId === child.id;
                                                    return (
                                                        <li key={child.id}>
                                                            <span
                                                                onClick={() => {
                                                                    setSelectedCategoryId(isChildSelected ? null : child.id);
                                                                    resetPagination();
                                                                }}
                                                                className={`text-xs block py-1 cursor-pointer transition-colors hover:text-cyan-600 ${isChildSelected ? "text-cyan-600 font-bold" : "text-gray-500"}`}
                                                            >
                                                                {child.name}
                                                            </span>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </SidebarSection>

                    <div className="border-t border-gray-100 my-6" />

                    {/* Mức giá */}
                    <SidebarSection title="CHỌN MỨC GIÁ">
                        <ul className="space-y-2">
                            {priceRanges.map((range, idx) => {
                                const isSelected = selectedPriceIndex === idx;
                                return (
                                    <li
                                        key={range.label}
                                        onClick={() => {
                                            setSelectedPriceIndex(isSelected ? null : idx);
                                            resetPagination();
                                        }}
                                        className="flex items-center gap-2 cursor-pointer group"
                                    >
                                        <div className={`w-4 h-4 border rounded flex-shrink-0 flex items-center justify-center transition-colors ${isSelected ? "bg-cyan-500 border-cyan-500" : "border-gray-300 group-hover:border-cyan-400"}`}>
                                            {isSelected && (
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                        <span className={`text-sm group-hover:text-gray-900 ${isSelected ? "text-gray-900 font-medium" : "text-gray-600"}`}>
                                            {range.label}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </SidebarSection>

                    <div className="border-t border-gray-100 my-6" />

                    {/* Trạng thái */}
                    <SidebarSection title="TRẠNG THÁI">
                        <ul className="space-y-2">
                            <li
                                className="flex items-center gap-2 cursor-pointer group"
                                onClick={() => { setOnSaleOnly(!onSaleOnly); resetPagination(); }}
                            >
                                <div className={`w-4 h-4 border rounded flex-shrink-0 flex items-center justify-center transition-colors ${onSaleOnly ? "bg-cyan-500 border-cyan-500" : "border-gray-300 group-hover:border-cyan-400"}`}>
                                    {onSaleOnly && (
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <span className={`text-sm group-hover:text-gray-900 ${onSaleOnly ? "text-gray-900 font-medium" : "text-gray-600"}`}>
                                    Sản phẩm giảm giá
                                </span>
                            </li>
                        </ul>
                    </SidebarSection>

                    <div className="border-t border-gray-100 my-6" />

                    {/* Tác giả */}
                    <SidebarSection title="TÁC GIẢ">
                        <div className="relative mb-3">
                            <input
                                type="text"
                                placeholder="Tìm kiếm tác giả..."
                                value={authorSearch}
                                onChange={(e) => setAuthorSearch(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg pl-4 pr-9 py-2 text-sm focus:outline-none focus:border-cyan-400"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon /></span>
                        </div>
                        <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {filteredAuthors.map((author) => {
                                const isSelected = selectedAuthorId === author.id;
                                return (
                                    <li
                                        key={author.id}
                                        onClick={() => {
                                            setSelectedAuthorId(isSelected ? null : author.id);
                                            resetPagination();
                                        }}
                                        className="flex items-center gap-2 cursor-pointer group"
                                    >
                                        <div className={`w-4 h-4 border rounded flex-shrink-0 flex items-center justify-center transition-colors ${isSelected ? "bg-cyan-500 border-cyan-500" : "border-gray-300 group-hover:border-cyan-400"}`}>
                                            {isSelected && (
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                        <span className={`text-sm group-hover:text-gray-900 ${isSelected ? "text-gray-900 font-medium" : "text-gray-600"}`}>
                                            {author.fullName}
                                        </span>
                                    </li>
                                );
                            })}
                            {filteredAuthors.length === 0 && (
                                <li className="text-gray-400 text-xs py-1">Không tìm thấy tác giả</li>
                            )}
                        </ul>
                    </SidebarSection>

                    <div className="border-t border-gray-100 my-6" />

                    {/* Nhà xuất bản */}
                    <SidebarSection title="NHÀ XUẤT BẢN">
                        <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {publishers.map((pub) => {
                                const isSelected = selectedPublisherId === pub.id;
                                return (
                                    <li
                                        key={pub.id}
                                        onClick={() => {
                                            setSelectedPublisherId(isSelected ? null : pub.id);
                                            resetPagination();
                                        }}
                                        className="flex items-center gap-2 cursor-pointer group"
                                    >
                                        <div className={`w-4 h-4 border rounded flex-shrink-0 flex items-center justify-center transition-colors ${isSelected ? "bg-cyan-500 border-cyan-500" : "border-gray-300 group-hover:border-cyan-400"}`}>
                                            {isSelected && (
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                        <span className={`text-sm group-hover:text-gray-900 ${isSelected ? "text-gray-900 font-medium" : "text-gray-600"}`}>
                                            {pub.name}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </SidebarSection>

                    <div className="border-t border-gray-100 my-6" />

                    {/* Ngôn ngữ */}
                    <SidebarSection title="NGÔN NGỮ">
                        <ul className="space-y-2">
                            {languages.map((lang) => {
                                const isSelected = selectedLanguage === lang.value;
                                return (
                                    <li
                                        key={lang.value}
                                        onClick={() => {
                                            setSelectedLanguage(isSelected ? null : lang.value);
                                            resetPagination();
                                        }}
                                        className="flex items-center gap-2 cursor-pointer group"
                                    >
                                        <div className={`w-4 h-4 border rounded flex-shrink-0 flex items-center justify-center transition-colors ${isSelected ? "bg-cyan-500 border-cyan-500" : "border-gray-300 group-hover:border-cyan-400"}`}>
                                            {isSelected && (
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                        <span className={`text-sm group-hover:text-gray-900 ${isSelected ? "text-gray-900 font-medium" : "text-gray-600"}`}>
                                            {lang.label}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </SidebarSection>
                </aside>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    {/* Sort Bar */}
                    <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-100 flex-wrap">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <SortIcon />
                            <span>Sắp xếp theo</span>
                        </div>
                        {sortOptions.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => { setSortBy(opt.value); resetPagination(); }}
                                className={`text-sm px-4 py-1.5 rounded-lg transition-all ${sortBy === opt.value
                                    ? "bg-cyan-500 text-white font-semibold"
                                    : "text-gray-600 hover:bg-gray-100"}`}
                            >
                                {opt.label}
                            </button>
                        ))}

                        {(selectedCategoryId || selectedPublisherId || selectedAuthorId || selectedPriceIndex !== null || selectedLanguage || onSaleOnly || urlKeyword) && (
                            <button
                                onClick={() => {
                                    setSelectedCategoryId(null);
                                    setSelectedPublisherId(null);
                                    setSelectedAuthorId(null);
                                    setSelectedPriceIndex(null);
                                    setSelectedLanguage(null);
                                    setOnSaleOnly(false);
                                    setSortBy("createdAt,desc");
                                    setSearchParams({});
                                    resetPagination();
                                }}
                                className="text-sm px-4 py-1.5 rounded-lg text-red-500 hover:bg-red-50 font-medium ml-auto transition-colors"
                            >
                                Xóa tất cả bộ lọc
                            </button>
                        )}
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                            {error}
                        </div>
                    )}

                    {/* Grid List */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {Array.from({ length: 8 }).map((_, idx) => (
                                <ProductSkeleton key={idx} />
                            ))}
                        </div>
                    ) : books.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="text-6xl mb-4">📚</div>
                            <h3 className="text-lg font-bold text-gray-800">Không tìm thấy cuốn sách nào</h3>
                            <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
                                Hãy thử thay đổi bộ lọc, tìm kiếm bằng từ khóa khác hoặc xóa bớt bộ lọc để tiếp tục.
                            </p>
                            <button
                                onClick={() => {
                                    setSelectedCategoryId(null);
                                    setSelectedPublisherId(null);
                                    setSelectedAuthorId(null);
                                    setSelectedPriceIndex(null);
                                    setSelectedLanguage(null);
                                    setOnSaleOnly(false);
                                    setSearchParams({});
                                    resetPagination();
                                }}
                                className="mt-6 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl text-sm transition-colors"
                            >
                                Xem tất cả sách
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {books.map((book) => (
                                    <ProductCard key={book.id} product={book} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-12">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="w-10 h-10 rounded-xl border border-gray-200 text-gray-600 hover:border-cyan-300 hover:text-cyan-600 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-semibold"
                                    >
                                        «
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p)}
                                            className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${p === page
                                                ? "bg-cyan-500 text-white"
                                                : "border border-gray-200 text-gray-600 hover:border-cyan-300 hover:text-cyan-600"}`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                                        disabled={page === totalPages}
                                        className="w-10 h-10 rounded-xl border border-gray-200 text-gray-600 hover:border-cyan-300 hover:text-cyan-600 text-xl font-bold transition-colors flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        »
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}