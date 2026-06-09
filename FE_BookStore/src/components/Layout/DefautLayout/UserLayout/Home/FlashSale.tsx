import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../../utils/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
}

const formatPrice = (price: number): string =>
    price.toLocaleString("vi-VN") + "đ";

const CartIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const ChevronLeft = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
);

const ChevronRight = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
);

export default function FlashSale() {
    const navigate = useNavigate();
    const [books, setBooks] = useState<BookListResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const visibleCount = 4;

    const productRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const fetchFlashSale = async () => {
            setLoading(true);
            try {
                const res = await api.get("/books/on-sale", {
                    params: { size: 10 }
                });
                if (res.data?.result?.data) {
                    setBooks(res.data.result.data);
                }
            } catch (err) {
                console.error("Lỗi khi lấy sách khuyến mãi:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFlashSale();
    }, []);

    const handlePrev = () => setActiveIndex((prev) => Math.max(0, prev - 1));
    const handleNext = () =>
        setActiveIndex((prev) => Math.min(books.length - visibleCount, prev + 1));

    const visibleProducts = books.slice(activeIndex, activeIndex + visibleCount);
    const canPrev = activeIndex > 0;
    const canNext = activeIndex < books.length - visibleCount;

    // Stagger slide entry intersection effect
    useEffect(() => {
        if (books.length === 0) return;
        productRefs.current = productRefs.current.slice(0, visibleProducts.length);

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry, index) => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            entry.target.classList.add("opacity-100", "translate-y-0");
                        }, index * 80);
                    }
                });
            },
            { threshold: 0.1 }
        );

        productRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => observer.disconnect();
    }, [visibleProducts, books]);

    const handleProductClick = (slug: string) => {
        navigate(`/books/${slug}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleAddToCart = async (e: React.MouseEvent, bookId: number, title: string) => {
        e.stopPropagation();
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

    if (loading) {
        return (
            <div className="bg-gray-50 py-12 flex items-center justify-center">
                <div className="text-gray-400 text-sm animate-pulse">Đang tải sách bán chạy...</div>
            </div>
        );
    }

    if (books.length === 0) {
        return null; // Hide best sellers section if there are no books
    }

    return (
        <div className="bg-gray-50 flex items-center justify-center p-8">
            <div className="w-full max-w-7xl">

                {/* Flash Sale Banner */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-wide" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#004d5a" }}>
                        Flash Sale
                    </h1>
                    <div className="w-24 h-1 bg-cyan-600 mx-auto mt-4 rounded-full"></div>
                    <p className="text-gray-500 mt-3 text-base md:text-lg italic" style={{ fontFamily: "'Lora', Georgia, serif" }}>
                        Khuyến mãi cực sốc, ưu đãi có giới hạn
                    </p>
                </div>

                <div className="flex items-center gap-4">

                    {/* Left Arrow */}
                    <button
                        onClick={handlePrev}
                        disabled={!canPrev}
                        className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-cyan-600 hover:bg-cyan-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shadow-sm"
                    >
                        <ChevronLeft />
                    </button>

                    {/* Main Container */}
                    <div className="flex-1 border-4 border-cyan-500 rounded-3xl bg-white px-8 py-10">

                        {/* Progress bar */}
                        <div className="flex justify-center mb-10">
                            <div className="w-64 h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full transition-all duration-700"
                                    style={{
                                        width: `${Math.min(100, ((activeIndex + visibleCount) / books.length) * 100)}%`,
                                    }}
                                />
                            </div>
                        </div>

                        {/* Products Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {visibleProducts.map((product, index) => (
                                <div
                                    key={product.id}
                                    ref={(el) => {
                                        productRefs.current[index] = el;
                                    }}
                                    onClick={() => handleProductClick(product.slug)}
                                    className="flex flex-col items-center opacity-0 translate-y-8 transition-all duration-700 ease-out cursor-pointer group hover:-translate-y-1"
                                >
                                    {/* Image */}
                                    <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden bg-gray-50 mb-4 border border-gray-100 shadow-sm relative">
                                        <img
                                            src={product.coverImage || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop"}
                                            alt={product.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        {product.discountPercent && (
                                            <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                                                -{product.discountPercent}%
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Name */}
                                    <p className="text-base font-semibold text-gray-800 text-center leading-tight mb-3 h-12 line-clamp-2 group-hover:text-cyan-600 transition-colors">
                                        {product.title}
                                    </p>

                                    {/* Prices */}
                                    <div className="flex items-baseline gap-2 mb-5">
                                        <span className="text-cyan-600 font-extrabold text-2xl">
                                            {formatPrice(product.effectivePrice)}
                                        </span>
                                        {product.price > product.effectivePrice && (
                                            <span className="text-gray-400 text-base line-through">
                                                {formatPrice(product.price)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Button */}
                                    <button 
                                        onClick={(e) => handleAddToCart(e, product.id, product.title)}
                                        disabled={product.stockQuantity === 0}
                                        className="flex items-center justify-center gap-2 w-full bg-cyan-500 hover:bg-cyan-600 active:scale-[0.97] text-white font-semibold py-3 rounded-2xl transition-all duration-200 disabled:opacity-50"
                                    >
                                        <CartIcon />
                                        Thêm vào giỏ
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Arrow */}
                    <button
                        onClick={handleNext}
                        disabled={!canNext}
                        className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-cyan-600 hover:bg-cyan-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shadow-sm"
                    >
                        <ChevronRight />
                    </button>
                </div>
            </div>
            <ToastContainer position="top-center" autoClose={2000} />
        </div>
    );
}