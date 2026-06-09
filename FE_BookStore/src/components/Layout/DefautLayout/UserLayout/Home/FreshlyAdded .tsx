import { useState } from "react";

const tabs = ["Tiểu Thuyết", "Thiếu Nhi", "Truyện Ngắn", "Tôn Giáo"];

const booksByTab: Record<string, { author: string; title: string; price: string; oldPrice: string; discount: string; cover: string }[]> = {
    "Tiểu Thuyết": [
        { author: "J.K.Rowling", title: "Harry Potter Và Bảo Bối Tử Thần - Tập 7...", price: "233.000đ", oldPrice: "285.000đ", discount: "- 18%", cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1474171184i/136251.jpg" },
        { author: "J.K.Rowling", title: "Harry Potter Và Hoàng Tử Lai - Tập ...", price: "200.900đ", oldPrice: "245.000đ", discount: "- 18%", cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1587697303i/1.jpg" },
        { author: "J.K.Rowling", title: "Harry Potter Và Hội Phượng Hoàng - Tậ...", price: "315.000đ", oldPrice: "385.000đ", discount: "- 18%", cover: "https://bizweb.dktcdn.net/thumb/1024x1024/100/524/712/products/8934974184027.jpg?v=1724318730927" },
        { author: "J.K.Rowling", title: "Harry Potter Và Chiếc Cốc Lửa - Tậ...", price: "254.000đ", oldPrice: "310.000đ", discount: "- 18%", cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1554006152i/6.jpg" },
        { author: "J.K.Rowling", title: "Harry Potter Và Tên Tù Nhân Ngục...", price: "168.000đ", oldPrice: "205.000đ", discount: "- 18%", cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1630547330i/5.jpg" },
        { author: "J.K.Rowling", title: "Harry Potter Và Phòng Chứa Bí Mật ...", price: "139.000đ", oldPrice: "170.000đ", discount: "- 18%", cover: "https://bizweb.dktcdn.net/thumb/1024x1024/100/524/712/products/8934974182290.jpg?v=1724315900347" },
    ],
    "Thiếu Nhi": [
        { author: "Antoine de Saint-Exupéry", title: "Hoàng Tử Bé", price: "55.000đ", oldPrice: "69.000đ", discount: "- 20%", cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1367545329i/157993.jpg" },
        { author: "Roald Dahl", title: "Charlie Và Nhà Máy Sô-Cô-La", price: "72.000đ", oldPrice: "89.000đ", discount: "- 19%", cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1684152687i/6310.jpg" },
        { author: "Lewis Carroll", title: "Alice Ở Xứ Sở Thần Tiên", price: "68.000đ", oldPrice: "85.000đ", discount: "- 20%", cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1391458382i/24213.jpg" },
        { author: "A.A. Milne", title: "Gấu Pooh - Câu Chuyện Khu Rừng", price: "59.000đ", oldPrice: "75.000đ", discount: "- 21%", cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388334706i/24178.jpg" },
        { author: "Carlo Collodi", title: "Pinocchio", price: "48.000đ", oldPrice: "60.000đ", discount: "- 20%", cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388212083i/1617.jpg" },
        { author: "J.M. Barrie", title: "Peter Pan", price: "52.000đ", oldPrice: "65.000đ", discount: "- 20%", cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1328326411i/34268.jpg" },
    ],
    "Truyện Ngắn": [
        { author: "O. Henry", title: "Món Quà Giáng Sinh", price: "45.000đ", oldPrice: "55.000đ", discount: "- 18%", cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388212711i/1381900.jpg" },
        { author: "Anton Chekhov", title: "Truyện Ngắn Chọn Lọc", price: "89.000đ", oldPrice: "110.000đ", discount: "- 19%", cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388188616i/5031.jpg" },
        { author: "Guy de Maupassant", title: "Viên Mỡ Bò", price: "65.000đ", oldPrice: "80.000đ", discount: "- 19%", cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388210588i/1118.jpg" },
        { author: "Edgar Allan Poe", title: "Truyện Kinh Dị Chọn Lọc", price: "79.000đ", oldPrice: "98.000đ", discount: "- 19%", cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327910937i/11218.jpg" },
        { author: "Franz Kafka", title: "Hóa Thân", price: "55.000đ", oldPrice: "68.000đ", discount: "- 19%", cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388530668i/485894.jpg" },
        { author: "Ernest Hemingway", title: "Ông Già Và Biển Cả", price: "62.000đ", oldPrice: "76.000đ", discount: "- 18%", cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1329189714i/2165.jpg" },
    ],
    "Tôn Giáo": [
        { author: "Thích Nhất Hạnh", title: "Phép Lạ Của Sự Tỉnh Thức", price: "68.000đ", oldPrice: "85.000đ", discount: "- 20%", cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388175551i/95747.jpg" },
        { author: "Dalai Lama", title: "Nghệ Thuật Hạnh Phúc", price: "89.000đ", oldPrice: "110.000đ", discount: "- 19%", cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1386924546i/38210.jpg" },
        { author: "C.S. Lewis", title: "Chúa Kitô Thuần Túy", price: "75.000đ", oldPrice: "93.000đ", discount: "- 19%", cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388460536i/11838.jpg" },
        { author: "Thích Nhất Hạnh", title: "Bước Tới Thảnh Thơi", price: "59.000đ", oldPrice: "73.000đ", discount: "- 19%", cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388212083i/1617.jpg" },
        { author: "Paulo Coelho", title: "Nhà Giả Kim", price: "69.000đ", oldPrice: "85.000đ", discount: "- 19%", cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1654371463i/865.jpg" },
        { author: "Viktor Frankl", title: "Đi Tìm Lẽ Sống", price: "79.000đ", oldPrice: "98.000đ", discount: "- 19%", cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1535115320i/40745.jpg" },
    ],
};

export default function FreshlyAdded() {
    const [activeTab, setActiveTab] = useState("Tiểu Thuyết");
    const books = booksByTab[activeTab] || [];

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
            <div className="flex items-center justify-center gap-10 mb-7 border-b border-gray-200">
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

            {/* Book grid: 3 cols, 2 rows */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {books.map((book, i) => (
                    <div key={i} className="bg-white rounded-xl overflow-hidden flex" style={{ minHeight: 170 }}>
                        {/* Cover — full height left */}
                        <div className="relative flex-shrink-0" style={{ width: 130 }}>
                            <span
                                className="absolute top-2 left-2 z-10 text-white font-bold px-2 py-0.5 rounded"
                                style={{ background: "#e53935", fontSize: 11 }}
                            >
                                {book.discount}
                            </span>
                            <img src={book.cover} alt={book.title} className="w-full h-full object-cover" style={{ minHeight: 170 }} />
                        </div>

                        {/* Info — right */}
                        <div className="flex flex-col justify-between p-4 flex-1">
                            <div>
                                <p className="text-xs font-semibold mb-1" style={{ color: "#00838f" }}>{book.author}</p>
                                <p
                                    className="text-sm font-semibold leading-snug mb-3"
                                    style={{ color: "#1a1a1a", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" } as React.CSSProperties}
                                >
                                    {book.title}
                                </p>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-sm font-bold" style={{ color: "#00838f" }}>{book.price}</span>
                                    <span className="text-xs line-through text-gray-400">{book.oldPrice}</span>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-2">
                                <button
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

            {/* CTA */}
            <div className="flex justify-center">
                <button
                    className="px-10 py-3 rounded-full text-white font-semibold text-sm transition hover:opacity-90 active:scale-95"
                    style={{ background: "linear-gradient(135deg, #00bcd4, #0097a7)", fontFamily: "'Lora', Georgia, serif" }}
                >
                    Xem tất cả →
                </button>
            </div>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Lora:wght@400;600&display=swap');
      `}</style>
        </div>
    );
}