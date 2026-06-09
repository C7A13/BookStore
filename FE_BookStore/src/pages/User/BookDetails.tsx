import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface CategoryInfo {
    id: number;
    name: string;
    slug: string;
}

interface PublisherInfo {
    id: number;
    name: string;
}

interface AuthorInfo {
    id: number;
    fullName: string;
    slug: string;
    role: string;
}

interface BookImageInfo {
    id: number;
    url: string;
    altText: string;
    sortOrder: number;
}

interface BookDetailResponse {
    id: number;
    isbn?: string;
    title: string;
    slug: string;
    description: string;
    coverImage: string;
    price: number;
    salePrice?: number;
    discountPercent?: number;
    effectivePrice: number;
    isOnSale: boolean;
    stockQuantity: number;
    weightGram?: number;
    pageCount?: number;
    language?: string;
    yearPublished?: number;
    category?: CategoryInfo;
    publisher?: PublisherInfo;
    authors?: AuthorInfo[];
    images?: BookImageInfo[];
    avgRating?: number;
    reviewCount?: number;
}

interface RelatedBook {
    id: number;
    title: string;
    slug: string;
    coverImage: string;
    price: number;
    salePrice?: number;
    effectivePrice: number;
    isOnSale: boolean;
}

const coupons = [
    { code: "LIBRO200", desc: "Giảm 200k giá trị đơn hàng", exp: "12/12/2026", color: "bg-cyan-100 text-cyan-700" },
    { code: "LIBRO100", desc: "Giảm 100k cho đơn từ 500k", exp: "24/12/2026", color: "bg-emerald-100 text-emerald-700" },
];

const formatPrice = (p: number) => p.toLocaleString("vi-VN") + "đ";

export default function BookDetails() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();

    const [book, setBook] = useState<BookDetailResponse | null>(null);
    const [relatedBooks, setRelatedBooks] = useState<RelatedBook[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedImage, setSelectedImage] = useState<string>("");
    const [qty, setQty] = useState(1);
    const [tab, setTab] = useState<"mo-ta" | "danh-gia" | "binh-luan">("mo-ta");
    const [saved, setSaved] = useState<string | null>(null);

    // Review states
    const [reviews, setReviews] = useState<any[]>([]);
    const [reviewPage, setReviewPage] = useState(0);
    const [reviewTotalPages, setReviewTotalPages] = useState(1);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [ratingSummary, setRatingSummary] = useState({ avgRating: 0, reviewCount: 0 });
    const [eligibleOrders, setEligibleOrders] = useState<any[]>([]);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [formRating, setFormRating] = useState(5);
    const [formTitle, setFormTitle] = useState("");
    const [formBody, setFormBody] = useState("");
    const [formOrderId, setFormOrderId] = useState<string>("");
    const [submittingReview, setSubmittingReview] = useState(false);

    // Comment states
    const [comments, setComments] = useState<any[]>([]);
    const [commentPage, setCommentPage] = useState(0);
    const [commentTotalPages, setCommentTotalPages] = useState(1);
    const [commentCount, setCommentCount] = useState(0);
    const [commentLoading, setCommentLoading] = useState(false);
    const [newCommentBody, setNewCommentBody] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);
    const [replyingToId, setReplyingToId] = useState<number | null>(null);
    const [replyBody, setReplyBody] = useState("");
    const [submittingReply, setSubmittingReply] = useState(false);

    useEffect(() => {
        if (!book) return;
        const loadReviews = async () => {
            setReviewLoading(true);
            try {
                const res = await api.get(`/reviews/book/${book.id}`, {
                    params: { page: reviewPage, size: 5, sort: "createdAt,desc" }
                });
                if (res.data?.result) {
                    setReviews(res.data.result.data || []);
                    setReviewTotalPages(res.data.result.totalPages || 1);
                }
            } catch (err) {
                console.error("Lỗi khi tải bình luận:", err);
            } finally {
                setReviewLoading(false);
            }
        };
        loadReviews();
    }, [book?.id, reviewPage]);

    const loadRatingSummary = async () => {
        if (!book) return;
        try {
            const res = await api.get(`/reviews/book/${book.id}/summary`);
            if (res.data?.result) {
                setRatingSummary({
                    avgRating: res.data.result.avgRating || 0,
                    reviewCount: res.data.result.reviewCount || 0
                });
            }
        } catch (err) {
            console.error("Lỗi khi tải tóm tắt đánh giá:", err);
        }
    };

    useEffect(() => {
        if (book) {
            setRatingSummary({
                avgRating: book.avgRating || 0,
                reviewCount: book.reviewCount || 0
            });
            const token = localStorage.getItem("access_token");
            if (token) {
                const checkEligibility = async () => {
                    try {
                        const res = await api.get("/orders");
                        if (res.data?.result) {
                            const deliveredWithBook = res.data.result.filter((order: any) => 
                                order.status === "DELIVERED" && 
                                order.items.some((item: any) => item.bookId === book.id)
                            );
                            setEligibleOrders(deliveredWithBook);
                            if (deliveredWithBook.length > 0) {
                                setFormOrderId(String(deliveredWithBook[0].id));
                            }
                        }
                    } catch (err) {
                        console.error("Lỗi khi kiểm tra điều kiện đánh giá:", err);
                    }
                };
                checkEligibility();
            }
        }
    }, [book?.id]);

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formBody.trim()) {
            toast.error("Vui lòng nhập nội dung đánh giá!");
            return;
        }
        if (!formOrderId) {
            toast.error("Vui lòng chọn đơn hàng chứa cuốn sách này để đánh giá!");
            return;
        }
        setSubmittingReview(true);
        try {
            await api.post("/reviews", {
                bookId: book.id,
                orderId: Number(formOrderId),
                rating: formRating,
                title: formTitle,
                body: formBody
            });
            toast.success("Cảm ơn bạn đã gửi đánh giá thành công!");
            setFormRating(5);
            setFormTitle("");
            setFormBody("");
            setShowReviewForm(false);
            setReviewPage(0);
            const res = await api.get(`/reviews/book/${book.id}`, {
                params: { page: 0, size: 5, sort: "createdAt,desc" }
            });
            if (res.data?.result) {
                setReviews(res.data.result.data || []);
                setReviewTotalPages(res.data.result.totalPages || 1);
            }
            loadRatingSummary();
            setEligibleOrders(prev => prev.filter(o => String(o.id) !== formOrderId));
        } catch (err: any) {
            console.error("Lỗi gửi đánh giá:", err);
            const errMsg = err.response?.data?.message || "Không thể gửi đánh giá. Vui lòng thử lại!";
            toast.error(errMsg);
        } finally {
            setSubmittingReview(false);
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={`text-sm ${i < rating ? "text-amber-400" : "text-gray-200"}`}>
                        ★
                    </span>
                ))}
            </div>
        );
    };

    const loadComments = async () => {
        if (!book) return;
        setCommentLoading(true);
        try {
            const res = await api.get(`/comments/book/${book.id}`, {
                params: { page: commentPage, size: 5, sort: "createdAt,desc" }
            });
            if (res.data?.result) {
                setComments(res.data.result.data || []);
                setCommentTotalPages(res.data.result.totalPages || 1);
                setCommentCount(res.data.result.total || 0);
            }
        } catch (err) {
            console.error("Lỗi khi tải bình luận:", err);
        } finally {
            setCommentLoading(false);
        }
    };

    useEffect(() => {
        if (book) {
            loadComments();
        }
    }, [book?.id, commentPage]);

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCommentBody.trim()) {
            toast.error("Vui lòng nhập nội dung bình luận!");
            return;
        }
        setSubmittingComment(true);
        try {
            await api.post("/comments", {
                bookId: book.id,
                body: newCommentBody
            });
            toast.success("Đã gửi bình luận/câu hỏi thành công!");
            setNewCommentBody("");
            setCommentPage(0);
            const res = await api.get(`/comments/book/${book.id}`, {
                params: { page: 0, size: 5, sort: "createdAt,desc" }
            });
            if (res.data?.result) {
                setComments(res.data.result.data || []);
                setCommentTotalPages(res.data.result.totalPages || 1);
                setCommentCount(res.data.result.total || 0);
            }
        } catch (err: any) {
            console.error("Lỗi gửi bình luận:", err);
            const errMsg = err.response?.data?.message || "Không thể gửi bình luận. Vui lòng thử lại!";
            toast.error(errMsg);
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleSubmitReply = async (parentId: number) => {
        if (!replyBody.trim()) {
            toast.error("Vui lòng nhập nội dung phản hồi!");
            return;
        }
        setSubmittingReply(true);
        try {
            await api.post("/comments", {
                bookId: book.id,
                parentId: parentId,
                body: replyBody
            });
            toast.success("Phản hồi đã được gửi thành công!");
            setReplyBody("");
            setReplyingToId(null);
            const res = await api.get(`/comments/book/${book.id}`, {
                params: { page: commentPage, size: 5, sort: "createdAt,desc" }
            });
            if (res.data?.result) {
                setComments(res.data.result.data || []);
                setCommentTotalPages(res.data.result.totalPages || 1);
                setCommentCount(res.data.result.total || 0);
            }
        } catch (err: any) {
            console.error("Lỗi gửi phản hồi:", err);
            const errMsg = err.response?.data?.message || "Không thể gửi phản hồi. Vui lòng thử lại!";
            toast.error(errMsg);
        } finally {
            setSubmittingReply(false);
        }
    };

    useEffect(() => {
        const fetchBookDetails = async () => {
            if (!slug) return;
            setLoading(true);
            setError(null);
            try {
                const res = await api.get(`/books/${slug}`);
                if (res.data?.result) {
                    const data: BookDetailResponse = res.data.result;
                    setBook(data);
                    setSelectedImage(data.coverImage);

                    // Fetch related books
                    const relatedRes = await api.get(`/books/${data.id}/related?limit=4`);
                    if (relatedRes.data?.result) {
                        setRelatedBooks(relatedRes.data.result);
                    }
                } else {
                    setError("Không tìm thấy thông tin cuốn sách.");
                }
            } catch (err) {
                console.error("Lỗi tải chi tiết sách:", err);
                setError("Có lỗi xảy ra khi tải dữ liệu sách.");
            } finally {
                setLoading(false);
            }
        };

        fetchBookDetails();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-28 pb-12 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 text-sm font-medium">Đang tải chi tiết sách...</p>
                </div>
            </div>
        );
    }

    if (error || !book) {
        return (
            <div className="min-h-screen bg-gray-50 pt-28 pb-12 flex flex-col items-center justify-center text-center px-4">
                <div className="text-6xl mb-4">⚠️</div>
                <h2 className="text-xl font-bold text-gray-800">{error || "Không tìm thấy sản phẩm"}</h2>
                <button
                    onClick={() => navigate("/books")}
                    className="mt-6 px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl transition"
                >
                    Quay lại cửa hàng
                </button>
            </div>
        );
    }

    const hasImages = book.images && book.images.length > 0;
    const authorNames = book.authors && book.authors.length > 0
        ? book.authors.map((a) => a.fullName).join(", ")
        : "Đang cập nhật";

    const handleAddToCart = async () => {
        try {
            await api.post("/cart/items", {
                bookId: book.id,
                quantity: qty
            });
            window.dispatchEvent(new Event("cart_updated"));
            toast.success(`Đã thêm ${qty} cuốn "${book.title}" vào giỏ hàng!`);
        } catch (error) {
            console.error("Lỗi thêm vào giỏ hàng:", error);
            toast.error("Không thể thêm sách vào giỏ hàng!");
        }
    };



    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pt-24">
            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* TOP SECTION */}
                <div className="flex flex-col lg:flex-row gap-10 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">

                    {/* Book Images / Covers */}
                    <div className="flex flex-col items-center gap-4 min-w-[240px]">
                        <div className="w-[220px] h-[300px] overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-sm flex items-center justify-center">
                            <img
                                src={selectedImage || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop"}
                                alt={book.title}
                                className="w-full h-full object-cover transition-all duration-300"
                            />
                        </div>

                        {/* Sub images carousel */}
                        {hasImages && (
                            <div className="flex gap-2 max-w-[240px] overflow-x-auto pb-1">
                                <img
                                    src={book.coverImage}
                                    alt="main-cover"
                                    onClick={() => setSelectedImage(book.coverImage)}
                                    className={`rounded border-2 w-14 h-20 object-cover cursor-pointer ${selectedImage === book.coverImage ? "border-cyan-500" : "border-gray-200"}`}
                                />
                                {book.images?.map((img) => (
                                    <img
                                        key={img.id}
                                        src={img.url}
                                        alt={img.altText}
                                        onClick={() => setSelectedImage(img.url)}
                                        className={`rounded border-2 w-14 h-20 object-cover cursor-pointer ${selectedImage === img.url ? "border-cyan-500" : "border-gray-200"}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3 leading-tight">
                            {book.title}
                        </h1>

                        <div className="text-sm text-gray-500 space-y-1.5 mb-6">
                            <p>Tác giả: <span className="text-cyan-600 font-semibold">{authorNames}</span></p>
                            <p>Thể loại: <span className="text-gray-700 font-medium">{book.category?.name || "Đang cập nhật"}</span></p>
                            {book.isbn && <p>Mã sách (ISBN): <span className="text-gray-700 font-mono">{book.isbn}</span></p>}
                            <p>Tình trạng: {book.stockQuantity > 0
                                ? <span className="text-green-600 font-semibold">Còn hàng ({book.stockQuantity} cuốn)</span>
                                : <span className="text-red-500 font-semibold">Hết hàng</span>}
                            </p>
                        </div>

                        {/* Promo box */}
                        <div className="border-2 border-dashed border-cyan-200 rounded-2xl p-5 mb-6 bg-cyan-50/50">
                            <p className="font-bold text-cyan-800 mb-3 flex items-center gap-2">
                                🌟 Chương trình Khuyến Mãi Libro Book Store
                            </p>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li className="flex gap-2">
                                    <span className="text-cyan-500">✓</span>
                                    <span><strong>Freeship Năm Mới</strong> – Cho mọi đơn hàng trị giá từ 200K.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-cyan-500">✓</span>
                                    <span>Đăng ký thành viên nhận ngay voucher giảm 10% cho đơn hàng đầu tiên.</span>
                                </li>
                            </ul>
                        </div>

                        {/* Coupons */}
                        <div className="flex gap-3 flex-wrap mb-5">
                            {coupons.map((c) => (
                                <div key={c.code} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-2 shadow-sm text-sm">
                                    <div className={`rounded px-2.5 py-1 font-bold text-xs ${c.color}`}>{c.code}</div>
                                    <div>
                                        <p className="font-semibold text-gray-700">{c.desc}</p>
                                        <p className="text-gray-400 text-xs">HSD: {c.exp}</p>
                                    </div>
                                    <button
                                        className="text-cyan-500 border border-cyan-400 rounded-lg px-2.5 py-0.5 text-xs hover:bg-cyan-50 transition-colors"
                                        onClick={() => {
                                            setSaved(c.code);
                                            toast.info(`Đã lưu mã giảm giá: ${c.code}`);
                                        }}
                                    >
                                        {saved === c.code ? "Đã lưu ✓" : "Lưu mã"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Panel - Buy Card */}
                    <div className="w-full lg:w-[240px] flex-shrink-0 bg-gray-50 border border-gray-100 rounded-3xl p-5">
                        {/* Authors Section */}
                        {book.authors && book.authors.length > 0 && (
                            <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-3 shadow-sm mb-5">
                                <div className="w-10 h-10 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center font-extrabold text-sm shrink-0 uppercase">
                                    {book.authors[0].fullName.charAt(0)}
                                </div>
                                <div className="text-sm min-w-0">
                                    <p className="text-cyan-600 font-semibold truncate" title={book.authors[0].fullName}>
                                        {book.authors[0].fullName}
                                    </p>
                                    <p className="text-gray-400 text-xs">Tác giả</p>
                                </div>
                            </div>
                        )}

                        {/* Price & Actions */}
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-baseline gap-2 flex-wrap">
                                    <span className="text-3xl font-extrabold text-cyan-600">{formatPrice(book.effectivePrice)}</span>
                                    {book.isOnSale && book.price > book.effectivePrice && (
                                        <span className="text-gray-400 line-through text-sm">{formatPrice(book.price)}</span>
                                    )}
                                </div>
                                {book.isOnSale && book.discountPercent && (
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className="text-gray-500 text-xs">Ưu đãi giảm:</span>
                                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">-{book.discountPercent}%</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 font-medium">Số lượng:</span>
                                <div className="flex items-center border border-gray-200 bg-white rounded-xl overflow-hidden shadow-sm">
                                    <button
                                        className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 text-lg transition-colors"
                                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                                    >−</button>
                                    <span className="px-4 py-1.5 text-sm font-semibold border-x border-gray-100 text-gray-700 min-w-[32px] text-center">{qty}</span>
                                    <button
                                        className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 text-lg transition-colors"
                                        onClick={() => setQty((q) => q + 1)}
                                    >+</button>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    navigate("/checkout", {
                                        state: {
                                            buyNow: {
                                                bookId: book.id,
                                                quantity: qty,
                                                bookTitle: book.title,
                                                bookImage: book.coverImage,
                                                unitPrice: book.effectivePrice,
                                            }
                                        }
                                    });
                                }}
                                disabled={book.stockQuantity === 0}
                                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 rounded-xl transition duration-200 shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Mua ngay
                            </button>
                            <button
                                onClick={handleAddToCart}
                                disabled={book.stockQuantity === 0}
                                className="w-full border-2 border-cyan-500 text-cyan-600 hover:bg-cyan-50 font-semibold py-3 rounded-xl transition duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Thêm vào giỏ
                            </button>
                        </div>
                    </div>
                </div>

                {/* BOTTOM SECTION */}
                <div className="flex flex-col lg:flex-row gap-10 mt-10">
                    {/* Description & Technical details */}
                    <div className="flex-1 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                        <div className="flex border-b border-gray-100 mb-6">
                            {(["mo-ta", "danh-gia", "binh-luan"] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTab(t)}
                                    className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-all ${tab === t
                                        ? "border-cyan-500 text-cyan-600"
                                        : "border-transparent text-gray-400 hover:text-gray-600"
                                        }`}
                                >
                                    {t === "mo-ta" 
                                        ? "Mô tả sách" 
                                        : t === "danh-gia" 
                                            ? `Đánh giá (${ratingSummary.reviewCount || 0})` 
                                            : `Hỏi đáp (${commentCount})`}
                                </button>
                            ))}
                        </div>

                        {tab === "mo-ta" && (
                            <div className="space-y-6">
                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                    {book.description || "Cuốn sách này hiện chưa có mô tả chi tiết."}
                                </p>

                                <h3 className="font-bold text-gray-800 text-base border-t border-gray-50 pt-6">Thông số chi tiết</h3>
                                <table className="w-full border border-gray-100 rounded-2xl overflow-hidden text-sm">
                                    <tbody>
                                        {[
                                            ["Tác giả", authorNames],
                                            ["Thể loại", book.category?.name || "Đang cập nhật"],
                                            ["Nhà xuất bản", book.publisher?.name || "Đang cập nhật"],
                                            ["Năm xuất bản", book.yearPublished || "Đang cập nhật"],
                                            ["Trọng lượng (gr)", book.weightGram ? `${book.weightGram} g` : "Đang cập nhật"],
                                            ["Số trang", book.pageCount ? `${book.pageCount} trang` : "Đang cập nhật"],
                                            ["Ngôn ngữ", book.language === "vi" ? "Tiếng Việt" : book.language === "en" ? "Tiếng Anh" : book.language || "Đang cập nhật"],
                                        ].map(([label, value], i) => (
                                            <tr key={label} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                                                <td className="px-5 py-3.5 text-gray-500 font-medium border-b border-gray-100 w-1/3">{label}</td>
                                                <td className="px-5 py-3.5 text-gray-800 border-b border-gray-100">{value}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {tab === "danh-gia" && (
                            <div className="space-y-8 animate-fadeIn">
                                {/* Rating Summary Header */}
                                <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="text-center md:border-r md:pr-8 border-gray-200">
                                        <h4 className="text-4xl font-extrabold text-cyan-600">
                                            {ratingSummary.avgRating ? ratingSummary.avgRating.toFixed(1) : "0.0"}
                                        </h4>
                                        <div className="flex justify-center my-1">
                                            {renderStars(Math.round(ratingSummary.avgRating))}
                                        </div>
                                        <p className="text-xs text-gray-400 font-medium">
                                            ({ratingSummary.reviewCount || 0} nhận xét)
                                        </p>
                                    </div>
                                    <div className="flex-1">
                                        <h5 className="font-bold text-gray-800 text-sm mb-1">Đánh giá từ khách hàng</h5>
                                        <p className="text-xs text-gray-500 leading-relaxed">
                                            Nhận xét được viết bởi những khách hàng đã mua và trải nghiệm cuốn sách này trên Libro Book Store.
                                        </p>
                                    </div>
                                    {eligibleOrders.length > 0 && !showReviewForm && (
                                        <button
                                            onClick={() => setShowReviewForm(true)}
                                            className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm shrink-0 cursor-pointer"
                                        >
                                            Viết đánh giá
                                        </button>
                                    )}
                                </div>

                                {/* Review Writing Form */}
                                {showReviewForm && eligibleOrders.length > 0 && (
                                    <form onSubmit={handleSubmitReview} className="p-6 bg-white border border-gray-200 rounded-2xl space-y-4 shadow-sm animate-fadeIn">
                                        <div className="flex items-center justify-between border-b pb-3 mb-2">
                                            <h4 className="font-bold text-gray-900 text-base">Viết đánh giá của bạn</h4>
                                            <button 
                                                type="button" 
                                                onClick={() => setShowReviewForm(false)} 
                                                className="text-gray-400 hover:text-gray-600 text-sm font-medium cursor-pointer bg-transparent border-0"
                                            >
                                                Đóng
                                            </button>
                                        </div>

                                        {/* Order selector if multiple eligible orders */}
                                        {eligibleOrders.length > 1 ? (
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs font-bold text-gray-600">Chọn đơn hàng của bạn để đánh giá</label>
                                                <select
                                                    value={formOrderId}
                                                    onChange={(e) => setFormOrderId(e.target.value)}
                                                    className="border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white cursor-pointer"
                                                >
                                                    {eligibleOrders.map(o => (
                                                        <option key={o.id} value={o.id}>Mã đơn: {o.code} (Ngày mua: {new Date(o.orderedAt).toLocaleDateString("vi-VN")})</option>
                                                    ))}
                                                </select>
                                            </div>
                                        ) : null}

                                        {/* Star Rating selector */}
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-semibold text-gray-700">Đánh giá sao:</span>
                                            <div className="flex gap-1.5">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setFormRating(star)}
                                                        className="text-2xl hover:scale-110 transition-transform cursor-pointer bg-transparent border-0 p-0"
                                                    >
                                                        <span className={star <= formRating ? "text-amber-400" : "text-gray-200"}>★</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Title Input */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-bold text-gray-600">Tiêu đề đánh giá (không bắt buộc)</label>
                                            <input
                                                type="text"
                                                placeholder="VD: Rất hay, Sách đẹp đóng gói cẩn thận..."
                                                value={formTitle}
                                                onChange={(e) => setFormTitle(e.target.value)}
                                                className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                            />
                                        </div>

                                        {/* Body input */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-bold text-gray-600">Nội dung nhận xét <span className="text-red-500">*</span></label>
                                            <textarea
                                                rows={4}
                                                placeholder="Nhập nội dung đánh giá chi tiết của bạn về cuốn sách này..."
                                                value={formBody}
                                                onChange={(e) => setFormBody(e.target.value)}
                                                className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                                                required
                                            ></textarea>
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                            <button
                                                type="submit"
                                                disabled={submittingReview}
                                                className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all cursor-pointer border-0"
                                            >
                                                {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowReviewForm(false);
                                                    setFormRating(5);
                                                    setFormTitle("");
                                                    setFormBody("");
                                                }}
                                                className="px-6 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-sm transition-all cursor-pointer bg-white"
                                            >
                                                Hủy bỏ
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {/* Reviews List */}
                                <div className="space-y-5">
                                    {reviewLoading ? (
                                        <div className="py-12 flex justify-center">
                                            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    ) : reviews.length === 0 ? (
                                        <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl">
                                            <p className="text-sm text-gray-400 italic">Chưa có đánh giá nào cho cuốn sách này.</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="divide-y divide-gray-100">
                                                {reviews.map((rev) => (
                                                    <div key={rev.id} className="py-5 first:pt-0 last:pb-0 flex gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold text-sm shrink-0 uppercase">
                                                            {(rev.fullName || rev.userName || "U").charAt(0)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                                                <span className="font-semibold text-gray-800 text-sm truncate">
                                                                    {rev.fullName || rev.userName || "Khách mua hàng"}
                                                                </span>
                                                                <span className="text-[11px] text-gray-400">
                                                                    {new Date(rev.createdAt).toLocaleDateString("vi-VN")}
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center gap-3 mt-1 mb-2">
                                                                {renderStars(rev.rating)}
                                                                {rev.isVerified && (
                                                                    <span className="flex items-center gap-0.5 text-green-600 text-[10px] font-bold bg-green-50 px-1.5 py-0.5 rounded-md">
                                                                        ✓ Đã mua hàng
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {rev.title && (
                                                                <h5 className="font-bold text-gray-800 text-sm mb-1 leading-snug">
                                                                    {rev.title}
                                                                </h5>
                                                            )}
                                                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                                                                {rev.body}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Reviews Pagination */}
                                            {reviewTotalPages > 1 && (
                                                <div className="flex items-center justify-center gap-1.5 pt-4">
                                                    <button
                                                        onClick={() => setReviewPage(p => Math.max(0, p - 1))}
                                                        disabled={reviewPage === 0}
                                                        className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:text-cyan-600 hover:border-cyan-500 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs font-bold cursor-pointer bg-white"
                                                    >
                                                        «
                                                    </button>
                                                    {Array.from({ length: reviewTotalPages }).map((_, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => setReviewPage(i)}
                                                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${i === reviewPage
                                                                ? "bg-cyan-600 text-white border-0"
                                                                : "border border-gray-200 text-gray-500 hover:text-cyan-600 hover:border-cyan-500 bg-white"}`}
                                                        >
                                                            {i + 1}
                                                        </button>
                                                    ))}
                                                    <button
                                                        onClick={() => setReviewPage(p => Math.min(reviewTotalPages - 1, p + 1))}
                                                        disabled={reviewPage === reviewTotalPages - 1}
                                                        className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:text-cyan-600 hover:border-cyan-500 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs font-bold cursor-pointer bg-white"
                                                    >
                                                        »
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {tab === "binh-luan" && (
                            <div className="space-y-6 animate-fadeIn">
                                {/* Comment writing form */}
                                <form onSubmit={handleSubmitComment} className="space-y-3">
                                    <h4 className="font-bold text-gray-900 text-sm">Hỏi đáp & Thảo luận về sách</h4>
                                    <div className="relative">
                                        <textarea
                                            rows={3}
                                            placeholder={localStorage.getItem("access_token") ? "Nhập câu hỏi hoặc ý kiến của bạn về cuốn sách này..." : "Vui lòng đăng nhập để gửi bình luận..."}
                                            value={newCommentBody}
                                            onChange={(e) => setNewCommentBody(e.target.value)}
                                            disabled={!localStorage.getItem("access_token")}
                                            className="w-full border border-gray-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                                            required
                                        ></textarea>
                                    </div>
                                    {localStorage.getItem("access_token") ? (
                                        <button
                                            type="submit"
                                            disabled={submittingComment}
                                            className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all cursor-pointer border-0"
                                        >
                                            {submittingComment ? "Đang gửi..." : "Gửi câu hỏi"}
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => navigate("/login")}
                                            className="px-5 py-2.5 border border-cyan-500 text-cyan-600 hover:bg-cyan-50 font-bold rounded-xl text-sm transition-all cursor-pointer bg-white"
                                        >
                                            Đăng nhập ngay
                                        </button>
                                    )}
                                </form>

                                {/* List of Comments */}
                                <div className="space-y-5 pt-4 border-t border-gray-100">
                                    {commentLoading ? (
                                        <div className="py-12 flex justify-center">
                                            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    ) : comments.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400 italic">
                                            Chưa có câu hỏi hay thảo luận nào. Hãy là người đầu tiên đặt câu hỏi!
                                        </div>
                                    ) : (
                                        <div className="space-y-5 divide-y divide-gray-100">
                                            {comments.map((comment) => (
                                                <div key={comment.id} className="pt-5 first:pt-0 space-y-3">
                                                    {/* Parent comment info */}
                                                    <div className="flex gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold text-xs shrink-0 uppercase">
                                                            {(comment.fullName || comment.userName || "U").charAt(0)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <span className="font-semibold text-gray-800 text-xs truncate">
                                                                    {comment.fullName || comment.userName || "Khách"}
                                                                </span>
                                                                <span className="text-[10px] text-gray-400">
                                                                    {new Date(comment.createdAt).toLocaleDateString("vi-VN")}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-700 mt-1 leading-relaxed whitespace-pre-line">
                                                                {comment.body}
                                                            </p>
                                                            
                                                            {/* Reply toggle */}
                                                            {localStorage.getItem("access_token") && (
                                                                <button
                                                                    onClick={() => {
                                                                        if (replyingToId === comment.id) {
                                                                            setReplyingToId(null);
                                                                            setReplyBody("");
                                                                        } else {
                                                                            setReplyingToId(comment.id);
                                                                            setReplyBody("");
                                                                        }
                                                                    }}
                                                                    className="text-xs text-cyan-600 hover:text-cyan-800 font-semibold mt-2 cursor-pointer bg-transparent border-0 p-0"
                                                                >
                                                                    {replyingToId === comment.id ? "Hủy" : "Trả lời"}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Nested replies list */}
                                                    {comment.replies && comment.replies.length > 0 && (
                                                        <div className="pl-11 space-y-3">
                                                            {comment.replies.map((reply: any) => (
                                                                <div key={reply.id} className="flex gap-2.5 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                                                                    <div className="w-7 h-7 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center font-bold text-[10px] shrink-0 uppercase">
                                                                        {(reply.fullName || reply.userName || "U").charAt(0)}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center justify-between gap-2">
                                                                            <span className="font-semibold text-gray-800 text-[11px] truncate">
                                                                                {reply.fullName || reply.userName || "Khách"}
                                                                            </span>
                                                                            <span className="text-[9px] text-gray-400">
                                                                                {new Date(reply.createdAt).toLocaleDateString("vi-VN")}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-xs text-gray-600 mt-1 leading-relaxed whitespace-pre-line">
                                                                            {reply.body}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Reply Input Form */}
                                                    {replyingToId === comment.id && (
                                                        <div className="pl-11 flex gap-2 animate-fadeIn">
                                                            <input
                                                                type="text"
                                                                placeholder="Nhập câu trả lời của bạn..."
                                                                value={replyBody}
                                                                onChange={(e) => setReplyBody(e.target.value)}
                                                                className="flex-1 border border-gray-300 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => handleSubmitReply(comment.id)}
                                                                disabled={submittingReply}
                                                                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl text-xs disabled:opacity-50 transition-all border-0 cursor-pointer"
                                                            >
                                                                {submittingReply ? "..." : "Gửi"}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}

                                            {/* Comments Pagination */}
                                            {commentTotalPages > 1 && (
                                                <div className="flex items-center justify-center gap-1.5 pt-4">
                                                    <button
                                                        onClick={() => setCommentPage(p => Math.max(0, p - 1))}
                                                        disabled={commentPage === 0}
                                                        className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:text-cyan-600 hover:border-cyan-500 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs font-bold cursor-pointer bg-white"
                                                    >
                                                        «
                                                    </button>
                                                    {Array.from({ length: commentTotalPages }).map((_, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => setCommentPage(i)}
                                                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${i === commentPage
                                                                ? "bg-cyan-600 text-white border-0"
                                                                : "border border-gray-200 text-gray-500 hover:text-cyan-600 hover:border-cyan-500 bg-white"}`}
                                                        >
                                                            {i + 1}
                                                        </button>
                                                    ))}
                                                    <button
                                                        onClick={() => setCommentPage(p => Math.min(commentTotalPages - 1, p + 1))}
                                                        disabled={commentPage === commentTotalPages - 1}
                                                        className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:text-cyan-600 hover:border-cyan-500 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs font-bold cursor-pointer bg-white"
                                                    >
                                                        »
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Related Books Panel */}
                    <div className="w-full lg:w-[280px] shrink-0 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-5 text-base pb-3 border-b border-gray-100">Có Thể Bạn Thích</h3>
                        <div className="space-y-5">
                            {relatedBooks.map((related) => {
                                const handleRelatedClick = () => {
                                    navigate(`/books/${related.slug}`);
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                };

                                return (
                                    <div
                                        key={related.id}
                                        onClick={handleRelatedClick}
                                        className="flex gap-3 cursor-pointer group hover:bg-gray-50/80 p-2 rounded-xl transition-all duration-300"
                                    >
                                        <img
                                            src={related.coverImage || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=100&h=140&fit=crop"}
                                            alt={related.title}
                                            className="w-14 h-20 rounded-lg object-cover border border-gray-200 flex-shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-sm"
                                        />
                                        <div className="min-w-0 flex flex-col justify-between py-1">
                                            <p className="text-xs font-semibold text-gray-700 line-clamp-2 leading-snug group-hover:text-cyan-600 transition-colors">
                                                {related.title}
                                            </p>
                                            <div>
                                                <p className="text-cyan-600 font-bold text-sm">{formatPrice(related.effectivePrice)}</p>
                                                {related.isOnSale && related.price > related.effectivePrice && (
                                                    <p className="text-gray-400 line-through text-[11px]">{formatPrice(related.price)}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {relatedBooks.length === 0 && (
                                <p className="text-gray-400 text-xs italic text-center py-4">Không có sách liên quan.</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <ToastContainer position="top-center" autoClose={3000} />
        </div>
    );
}