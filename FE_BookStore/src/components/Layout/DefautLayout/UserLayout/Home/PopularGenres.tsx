import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../../utils/api';

const DEFAULT_COVER = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=420&fit=crop";

const GENRE_COVERS: Record<string, string> = {
    "Tiểu thuyết": "https://down-vn.img.susercontent.com/file/vn-11134207-7qukw-lfgebc23iq9h5a",
    "Truyện ngắn": "https://cdn0.fahasa.com/media/flashmagazine/images/page_images/danh_tac_van_hoc_viet_nam___truyen_ngan_khai_hung/2023_01_07_10_25_14_1-390x510.jpg",
    "Thiếu nhi": "https://cf.shopee.vn/file/5e958c8b7354ee8e341137dfb69b0aea",
    "Tâm lý học": "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1442726934i/4865.jpg",
    "Kỹ năng sống": "https://cdn0.fahasa.com/media/catalog/product/8/9/8934974186120.jpg",
    "Kinh tế": "https://cdn0.fahasa.com/media/catalog/product/8/9/8935086856772.jpg",
    "Lịch sử": "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lnryx38vuu3xe8",
    "Khoa học viễn tưởng": "https://mtg.1cdn.vn/2020/09/25/www-motthegioi-vn_dgftlxrozs10awv1lxrodxlldc1rag9hlwhvyy1nawetdhvvbmctagf5lw5oyxqtzte1nja2ntqzodi4nja-.jpg",
    "Văn học": "https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=300&h=420&fit=crop",
    "Truyện tranh": "https://images.unsplash.com/photo-1607604276583-61ae21ea622a?w=300&h=420&fit=crop",
    "Khoa học & Công nghệ": "https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=300&h=420&fit=crop",
    "Tôn giáo & Tâm linh": "https://images.unsplash.com/photo-1545989253-02cc26577f88?w=300&h=420&fit=crop"
};

interface Category {
    id: number;
    name: string;
    slug: string;
}

const VISIBLE = 6;

export default function PopularGenres() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const navigate = useNavigate();

    const [genres, setGenres] = useState<Category[]>([]);
    const [startIndex, setStartIndex] = useState(0);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // Lấy danh sách danh mục (tree), ta có thể lấy top level (cha) hoặc lấy tất cả tuỳ API
                // public/tree trả về cấp độ cha - con
                const res = await api.get("/categories/public/tree");
                if (res.data?.result) {
                    setGenres(res.data.result);
                }
            } catch (err) {
                console.error("Lỗi khi lấy danh mục:", err);
            }
        };
        fetchCategories();
    }, []);

    const canPrev = startIndex > 0;
    const canNext = startIndex + VISIBLE < genres.length;

    const prev = () => { if (canPrev) setStartIndex((s) => s - 1); };
    const next = () => { if (canNext) setStartIndex((s) => s + 1); };

    const visibleGenres = genres.slice(startIndex, startIndex + VISIBLE);

    return (
        <div className="w-full px-8 md:px-16 py-10" style={{ fontFamily: "'Lora', Georgia, serif" }}>
            {/* Header */}
            <motion.div
                ref={ref}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6 }}
                className="flex items-center justify-between mb-8"
            >
                <h2
                    className="text-3xl md:text-4xl font-extrabold"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#00838f" }}
                >
                    Thể Loại Nổi Bật
                </h2>
                <button
                    onClick={() => navigate("/books")}
                    className="text-sm font-semibold flex items-center gap-1 hover:underline transition"
                    style={{ color: "#004d5a" }}
                >
                    Xem tất cả <span>→</span>
                </button>
            </motion.div>

            {/* Carousel */}
            <div className="relative flex items-center">
                {/* Prev Button */}
                <button
                    onClick={prev}
                    disabled={!canPrev}
                    className="absolute -left-5 z-10 w-9 h-9 rounded-full border border-gray-300 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    ‹
                </button>

                {/* Genres Grid */}
                {genres.length > 0 ? (
                    <div className="grid gap-5 w-full" style={{ gridTemplateColumns: `repeat(${Math.min(VISIBLE, genres.length)}, minmax(0, 1fr))` }}>
                        {visibleGenres.map((genre, i) => (
                            <motion.div
                                key={genre.id}
                                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.95 }}
                                transition={{
                                    duration: 0.5,
                                    delay: i * 0.05,
                                    ease: "easeOut"
                                }}
                                whileHover={{ scale: 1.05, y: -8 }}
                                onClick={() => navigate(`/books?category=${genre.id}`)}
                                className="flex flex-col items-center group cursor-pointer"
                            >
                                <div className="w-full aspect-[2/3] overflow-hidden rounded-md bg-gray-100 shadow-sm">
                                    <img
                                        src={GENRE_COVERS[genre.name] || DEFAULT_COVER}
                                        alt={genre.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <p
                                    className="mt-3 text-xs font-bold tracking-wider text-center uppercase"
                                    style={{ color: "#00838f" }}
                                >
                                    {genre.name}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-gray-500 text-sm italic w-full text-center">Đang tải danh mục...</div>
                )}

                {/* Next Button */}
                <button
                    onClick={next}
                    disabled={!canNext}
                    className="absolute -right-5 z-10 w-9 h-9 rounded-full border border-gray-300 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    ›
                </button>
            </div>

            {/* Font Import */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Lora:wght@400;600&display=swap');
            `}</style>
        </div>
    );
}