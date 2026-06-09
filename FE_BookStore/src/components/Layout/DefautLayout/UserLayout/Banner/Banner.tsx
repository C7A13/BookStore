import { useEffect, useState } from "react";
import BgImage from "../../../../../assets/images/background/anh3.webp";

const books = [
    {
        id: 1,
        url: "https://tuvanmuasam.com/wp-content/uploads/2021/05/cuon-sach-tam-ly-hoc-hay-nhat-1.jpg",
    },
    {
        id: 2,
        url: "https://www.elleman.vn/app/uploads/2020/05/08/177837/The-Children-of-Men_sach-khoa-hoc-vien-tuong_elle-man_0520.jpg",
    },
    {
        id: 3,
        url: "https://cdn0.fahasa.com/media/flashmagazine/images/page_images/nghe_thuat_song_vung_vang/2023_08_16_15_42_04_2-390x510.png",
    },
];

export default function Banner() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div
            className="relative w-full min-h-[720px] md:min-h-[800px] overflow-hidden flex items-center"
            style={{
                backgroundImage: `url(${BgImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed",
            }}
        >
            {/* Overlay blur */}
            <div className="absolute inset-0 bg-white/70 backdrop-blur-md"></div>

            {/* Content */}
            <div className="relative z-20 flex flex-col md:flex-row items-center justify-between w-full max-w-7xl mx-auto px-8 md:px-16 py-12 gap-10">

                {/* Left */}
                <div
                    className={`flex-1 max-w-xl transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                        }`}
                >
                    <h1
                        className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.35] mb-3"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#004d5a" }}
                    >
                        Cùng LIBRO Book Store
                    </h1>

                    <h1
                        className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.35] mb-6"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#004d5a" }}
                    >
                        Khám Phá <br />
                        <span
                            className="underline decoration-2 decoration-cyan-500 underline-offset-4"
                            style={{ color: "#00838f", textDecorationColor: "#00838f" }}
                        >
                            Thế Giới Sách
                        </span>
                    </h1>

                    <p
                        className="text-lg md:text-xl mb-8"
                        style={{ fontFamily: "'Lora', Georgia, serif", color: "#00626e" }}
                    >
                        Nơi Mỗi Trang Sách Là Một Cuộc Phiêu Lưu
                    </p>

                    <button
                        className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-white font-semibold text-base shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200"
                        style={{
                            background: "linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)",
                            fontFamily: "'Lora', Georgia, serif",
                        }}
                    >
                        Xem thêm <span className="text-lg">→</span>
                    </button>
                </div>

                {/* Right */}
                <div
                    className={`relative flex items-end justify-center flex-1 min-h-[320px] transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                        }`}
                >
                    <div className="relative flex items-end justify-center w-full max-w-md h-80">
                        {books.map((book, i) => (
                            <div
                                key={book.id}
                                className="absolute bottom-0 transition-all duration-300 hover:scale-110 hover:-translate-y-4 cursor-pointer"
                                style={{
                                    left: `${i * 30}%`,
                                    zIndex: i === 1 ? 20 : 10,
                                    transform: `rotate(${i === 0 ? -8 : i === 1 ? 2 : 8}deg) 
                                    scale(${i === 1 ? 1.15 : 1}) 
                                    translateY(${i === 1 ? 0 : 20}px)`,
                                }}
                            >
                                <img
                                    src={book.url}
                                    alt={`Book ${book.id}`}
                                    className="w-40 md:w-52 h-60 md:h-72 object-cover rounded-lg"
                                    style={{
                                        boxShadow:
                                            i === 1
                                                ? "0 25px 60px rgba(0,150,180,0.35)"
                                                : "0 12px 35px rgba(0,100,140,0.2)",
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Lora:wght@400;600&display=swap');
            `}</style>
        </div>
    );
}