import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../../utils/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface CategoryTreeResponse {
    id: number;
    name: string;
    slug: string;
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
    authorName?: string;
}

const formatPrice = (p: number) => p.toLocaleString("vi-VN") + "đ";

export default function FreshlyAdded() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<string>("");
    const [tabs, setTabs] = useState<string[]>([]);
    const [categories, setCategories] = useState<CategoryTreeResponse[]>([]);
    const [books, setBooks] = useState<BookListResponse[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch categories tree on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get("/categories/public/tree");
                if (res.data?.result) {
                    const cats: CategoryTreeResponse[] = res.data.result;
                    setCategories(cats);
                    // Lấy tối đa 5 danh mục gốc làm tabs
                    const dynamicTabs = cats.slice(0, 5).map(c => c.name);
                    setTabs(dynamicTabs);
                    if (dynamicTabs.length > 0) {
                        setActiveTab(dynamicTabs[0]);
                    }
                }
            } catch (err) {
                console.error("Lỗi tải thể loại ở Trang chủ:", err);
            }
        };
        fetchCategories();
    }, []);

    // Fetch books whenever tab changes or categories are loaded
    useEffect(() => {
        if (!activeTab || categories.length === 0) return;

        const fetchBooksForTab = async () => {
            setLoading(true);
            try {
                const matchedCategory = categories.find(c => c.name.toLowerCase() === activeTab.toLowerCase());

                let res;
                if (matchedCategory) {
                    res = await api.get("/books", {
                        params: { categoryId: matchedCategory.id, size: 6, sort: "createdAt,desc", isActive: true }
                    });
                } else {
                    // Fallback to keyword search
                    res = await api.get("/books", {
                        params: { keyword: activeTab, size: 6, sort: "createdAt,desc", isActive: true }
                    });
                }

                if (res.data?.result?.data) {
                    setBooks(res.data.result.data);
                } else {
                    setBooks([]);
                }
            } catch (err) {
                console.error(`Lỗi tải sách cho tab ${activeTab}:`, err);
                setBooks([]);
            } finally {
                setLoading(false);
            }
        };

        fetchBooksForTab();
    }, [activeTab, categories]);

    const handleViewBook = (slug: string) => {
        navigate(`/books/${slug}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleAddToCart = async (bookId: number, title: string) => {
        try {
            await api.post("/cart/items", {
                bookId: bookId,
                quantity: 1
            });
            window.dispatchEvent(new Event("cart_updated"));
            toast.success(`Đã thêm cuốn "${title}" vào giỏ hàng!`);
        } catch (error) {
            console.error("Lỗi thêm vào giỏ hàng:", error);
            toast.error("Không thể thêm sách vào giỏ hàng!");
        }
    };

    return (
        <div className="w-full px-6 md:px-14 py-10" style={{ background: "#f5f5f5", fontFamily: "'Lora', Georgia, serif" }}>
            {/* Title */}
            <div className="flex items-center justify-center gap-3 mb-5">
                <span style={{ color: "#00838f", fontSize: 18 }}>✦</span>
                <h2 className="text-3xl md:text-4xl font-extrabold" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#004d5a" }}>
                    Sách Mới Về Kệ
                </h2>
                <span style={{ color: "#00838f", fontSize: 18 }}>✦</span>
            </div>

            {/* Tabs */}
            {tabs.length > 0 && (
                <div className="flex items-center justify-center gap-10 mb-7 border-b border-gray-200 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className="pb-3 text-base transition-all duration-200 relative whitespace-nowrap"
                            style={{ color: activeTab === tab ? "#1a1a1a" : "#888", fontWeight: activeTab === tab ? 700 : 400, fontFamily: "'Lora', Georgia, serif" }}
                        >
                            {tab}
                            {activeTab === tab && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 rounded-full" style={{ background: "#1a1a1a" }} />
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Grid display */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {Array.from({ length: 6 }).map((_, idx) => (
                        <div key={idx} className="bg-white rounded-xl overflow-hidden flex animate-pulse" style={{ minHeight: 170 }}>
                            <div className="bg-gray-200 w-[130px] h-full" />
                            <div className="flex-1 p-4 space-y-2">
                                <div className="h-3 bg-gray-200 rounded w-1/3" />
                                <div className="h-4 bg-gray-200 rounded w-3/4" />
                                <div className="h-4 bg-gray-200 rounded w-1/2 mt-auto" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : books.length === 0 ? (
                <div className="text-center py-12 text-gray-500 italic">
                    Chưa có sách nào trong chuyên mục này.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {books.map((book) => (
                        <div key={book.id} className="bg-white rounded-xl overflow-hidden flex hover:shadow-md transition-shadow duration-300" style={{ minHeight: 170 }}>
                            {/* Cover — full height left */}
                            <div 
                                onClick={() => handleViewBook(book.slug)}
                                className="relative flex-shrink-0 cursor-pointer" 
                                style={{ width: 130 }}
                            >
                                {book.isOnSale && book.discountPercent && (
                                    <span
                                        className="absolute top-2 left-2 z-10 text-white font-bold px-2 py-0.5 rounded"
                                        style={{ background: "#e53935", fontSize: 11 }}
                                    >
                                        -{book.discountPercent}%
                                    </span>
                                )}
                                <img src={book.coverImage || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200&h=300&fit=crop"} alt={book.title} className="w-full h-full object-cover" style={{ minHeight: 170 }} />
                            </div>

                            {/* Info — right */}
                            <div className="flex flex-col justify-between p-4 flex-1 min-w-0">
                                <div>
                                    <p className="text-xs font-semibold mb-1 truncate" style={{ color: "#00838f" }}>
                                        {book.authorName || "Đang cập nhật"}
                                    </p>
                                    <p
                                        onClick={() => handleViewBook(book.slug)}
                                        className="text-sm font-semibold leading-snug mb-3 hover:text-cyan-600 transition-colors cursor-pointer"
                                        style={{ color: "#1a1a1a", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" } as React.CSSProperties}
                                    >
                                        {book.title}
                                    </p>
                                    <div className="flex items-baseline gap-2 mb-3">
                                        <span className="text-sm font-bold" style={{ color: "#00838f" }}>{formatPrice(book.effectivePrice)}</span>
                                        {book.isOnSale && book.price > book.effectivePrice && (
                                            <span className="text-xs line-through text-gray-400">{formatPrice(book.price)}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleViewBook(book.slug)}
                                        className="w-9 h-9 rounded-full flex items-center justify-center transition hover:opacity-80"
                                        style={{ background: "#e0f7fa" }}
                                        title="Xem sách"
                                    >
                                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                                            <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="#00838f" strokeWidth="1.8" />
                                            <circle cx="12" cy="12" r="3" fill="#00838f" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleAddToCart(book.id, book.title)}
                                        className="w-9 h-9 rounded-full flex items-center justify-center transition hover:opacity-80"
                                        style={{ background: "#e0f7fa" }}
                                        title="Thêm vào giỏ"
                                    >
                                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                                            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="#00838f" strokeWidth="1.8" fill="none" />
                                            <line x1="3" y1="6" x2="21" y2="6" stroke="#00838f" strokeWidth="1.8" />
                                            <path d="M16 10a4 4 0 01-8 0" stroke="#00838f" strokeWidth="1.8" fill="none" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* CTA */}
            <div className="flex justify-center">
                <button
                    onClick={() => navigate("/books")}
                    className="px-10 py-3 rounded-full text-white font-semibold text-sm transition hover:opacity-90 active:scale-95 shadow-sm"
                    style={{ background: "linear-gradient(135deg, #00bcd4, #0097a7)", fontFamily: "'Lora', Georgia, serif" }}
                >
                    Xem tất cả →
                </button>
            </div>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Lora:wght@400;600&display=swap');
      `}</style>
            <ToastContainer position="top-center" autoClose={2000} />
        </div>
    );
}
