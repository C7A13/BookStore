import { useEffect, useRef, useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface StatItem {
    value: string;
    label: string;
}

interface TeamMember {
    name: string;
    role: string;
    quote: string;
    initial: string;
}

interface ValueItem {
    icon: string;
    title: string;
    desc: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────
const stats: StatItem[] = [
    { value: "200K+", label: "Đầu sách" },
    { value: "1.2M", label: "Độc giả" },
    { value: "98%", label: "Hài lòng" },
    { value: "24/7", label: "Hỗ trợ" },
];

const team: TeamMember[] = [
    {
        name: "Nguyễn Minh Anh",
        role: "Nhà sáng lập & CEO",
        quote: "Mỗi cuốn sách là một cánh cửa dẫn đến thế giới mới.",
        initial: "A",
    },
    {
        name: "Trần Phú Đức",
        role: "Giám đốc Nội dung",
        quote: "Chúng tôi chọn sách bằng trái tim, không chỉ bằng thuật toán.",
        initial: "Đ",
    },
    {
        name: "Lê Khánh Linh",
        role: "Trưởng nhóm Thiết kế",
        quote: "Trải nghiệm đọc bắt đầu từ khoảnh khắc bạn mở trang web.",
        initial: "L",
    },
];

const values: ValueItem[] = [
    { icon: "❦", title: "Tận tâm", desc: "Mỗi đơn hàng được đóng gói cẩn thận như một món quà." },
    { icon: "⊕", title: "Đa dạng", desc: "Từ sách thiếu nhi đến triết học, chúng tôi có tất cả." },
    { icon: "◈", title: "Uy tín", desc: "Chỉ sách chính hãng từ các nhà xuất bản được kiểm chứng." },
    { icon: "✦", title: "Cộng đồng", desc: "Xây dựng văn hóa đọc sách cho thế hệ tương lai." },
];

// ─── Hook ────────────────────────────────────────────────────────────────────
function useReveal(threshold = 0.15) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    obs.disconnect();
                }
            },
            { threshold }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);

    return { ref, visible };
}

// ─── Sections ────────────────────────────────────────────────────────────────
function HeroSection() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 80);
        return () => clearTimeout(t);
    }, []);

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#f8f9fa]">
            <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
                <div
                    className="inline-flex items-center gap-2 mb-10 px-4 py-1.5 border border-cyan-700/30 rounded-full text-cyan-700 text-xs tracking-[0.25em] uppercase"
                    style={{
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? "translateY(0)" : "translateY(12px)",
                        transition: "opacity 0.7s ease, transform 0.7s ease",
                        transitionDelay: "0.1s",
                    }}
                >
                    <span className="w-1 h-1 rounded-full bg-cyan-600 animate-pulse" />
                    Về chúng tôi
                </div>

                <h1
                    className="font-serif text-[#1f2937] leading-[1.05] tracking-tight"
                    style={{
                        fontSize: "clamp(3rem, 9vw, 7.5rem)",
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? "translateY(0)" : "translateY(20px)",
                        transition: "opacity 0.9s ease, transform 0.9s ease",
                        transitionDelay: "0.25s",
                    }}
                >
                    Libro
                </h1>

                <div
                    style={{
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? "translateY(0)" : "translateY(20px)",
                        transition: "opacity 0.9s ease, transform 0.9s ease",
                        transitionDelay: "0.4s",
                    }}
                >
                    <p className="mt-4 font-serif italic text-cyan-700/70 text-xl md:text-2xl tracking-wide">
                        “Nơi những cuốn sách tìm thấy chủ nhân của mình”
                    </p>
                    <div className="mt-8 mx-auto w-16 h-px bg-cyan-700/30" />
                    <p className="mt-8 text-stone-600 text-base md:text-lg leading-relaxed max-w-2xl mx-auto font-light">
                        Được thành lập năm 2018 tại Hà Nội, Libro ra đời với một sứ mệnh
                        đơn giản: mang những cuốn sách chất lượng đến tay mọi người, dù họ
                        ở bất cứ đâu trên dải đất hình chữ S này.
                    </p>
                </div>
            </div>
        </section>
    );
}

function StatsSection() {
    const { ref, visible } = useReveal();
    return (
        <section ref={ref} className="bg-white py-24 px-6">
            <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((s, i) => (
                    <div
                        key={s.label}
                        className="text-center"
                        style={{
                            opacity: visible ? 1 : 0,
                            transform: visible ? "translateY(0)" : "translateY(24px)",
                            transition: "opacity 0.7s ease, transform 0.7s ease",
                            transitionDelay: `${i * 0.1}s`,
                        }}
                    >
                        <div className="font-serif text-cyan-700" style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)" }}>
                            {s.value}
                        </div>
                        <div className="mt-1 text-stone-600 text-sm tracking-widest uppercase">
                            {s.label}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

function StorySection() {
    const { ref, visible } = useReveal();
    return (
        <section ref={ref} className="bg-[#f8f9fa] py-32 px-6">
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                {/* Book Illustration */}
                <div
                    className="relative"
                    style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? "translateX(0)" : "translateX(-30px)",
                        transition: "opacity 0.9s ease, transform 0.9s ease",
                    }}
                >
                    <div className="relative w-full aspect-square max-w-sm mx-auto">
                        <div className="absolute inset-0 rounded-full border border-cyan-700/20" />
                        <div className="absolute inset-8 rounded-full" style={{ background: "radial-gradient(circle at 40% 40%, #e0f2fe, #f8f9fa)" }} />

                        {[
                            { top: "58%", left: "22%", w: "56%", h: "9%", color: "#67e8f9", rotate: "-8deg" },
                            { top: "50%", left: "18%", w: "64%", h: "9%", color: "#22d3ee", rotate: "-3deg" },
                            { top: "43%", left: "20%", w: "60%", h: "9%", color: "#67e8f9", rotate: "2deg" },
                            { top: "36%", left: "24%", w: "52%", h: "9%", color: "#22d3ee", rotate: "6deg" },
                            { top: "29%", left: "22%", w: "56%", h: "9%", color: "#67e8f9", rotate: "-4deg" },
                        ].map((b, i) => (
                            <div
                                key={i}
                                className="absolute rounded-sm shadow-lg"
                                style={{
                                    top: b.top,
                                    left: b.left,
                                    width: b.w,
                                    height: b.h,
                                    background: b.color,
                                    transform: `rotate(${b.rotate})`,
                                    boxShadow: "2px 4px 12px rgba(0,0,0,0.1)",
                                }}
                            />
                        ))}

                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="font-serif text-cyan-700/20 select-none" style={{ fontSize: "8rem" }}>L</span>
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? "translateX(0)" : "translateX(30px)",
                        transition: "opacity 0.9s ease, transform 0.9s ease",
                        transitionDelay: "0.15s",
                    }}
                >
                    <div className="text-cyan-700/70 text-xs tracking-[0.3em] uppercase mb-6">Câu chuyện của chúng tôi</div>
                    <h2 className="font-serif text-[#1f2937] leading-tight mb-8" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
                        Từ một góc nhỏ<br />
                        <span className="text-cyan-700">đến triệu độc giả</span>
                    </h2>
                    <div className="space-y-5 text-stone-600 leading-relaxed">
                        <p>
                            Libro bắt đầu từ một căn phòng nhỏ ở phố cổ Hà Nội, nơi hai
                            người bạn cùng chia sẻ niềm đam mê đọc sách quyết định biến tình
                            yêu ấy thành sự nghiệp.
                        </p>
                        <p>
                            Hành trình không phải lúc nào cũng phẳng lặng. Nhưng điều thôi
                            thúc chúng tôi tiến lên là những tin nhắn từ khách hàng — cô giáo
                            miền núi nhận được bộ sách khoa học cho học sinh, người bố đặt
                            cuốn truyện tranh để đọc cùng con mỗi tối…
                        </p>
                        <p>
                            Hôm nay, với hơn 200.000 đầu sách và đội ngũ 80 người, chúng tôi
                            vẫn giữ vững triết lý ban đầu: mỗi cuốn sách là một người bạn
                            đồng hành xứng đáng được yêu thương.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

function ValuesSection() {
    const { ref, visible } = useReveal();
    return (
        <section ref={ref} className="bg-white py-32 px-6">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-20" style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)" }}>
                    <div className="text-cyan-700/70 text-xs tracking-[0.3em] uppercase mb-4">Giá trị cốt lõi</div>
                    <h2 className="font-serif text-[#1f2937]" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>Những điều chúng tôi tin</h2>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {values.map((v, i) => (
                        <div
                            key={v.title}
                            className="group relative p-8 border border-cyan-700/20 rounded-2xl hover:border-cyan-600 transition-all duration-500 bg-white"
                            style={{
                                opacity: visible ? 1 : 0,
                                transform: visible ? "translateY(0)" : "translateY(28px)",
                                transitionDelay: `${0.1 + i * 0.1}s`,
                            }}
                        >
                            <div className="text-cyan-600 text-3xl mb-5">{v.icon}</div>
                            <h3 className="text-[#1f2937] font-serif text-lg mb-3">{v.title}</h3>
                            <p className="text-stone-600 text-sm leading-relaxed">{v.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function TeamSection() {
    const { ref, visible } = useReveal();
    return (
        <section ref={ref} className="bg-[#f8f9fa] py-32 px-6">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-20" style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)" }}>
                    <div className="text-cyan-700/70 text-xs tracking-[0.3em] uppercase mb-4">Con người</div>
                    <h2 className="font-serif text-[#1f2937]" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>Đội ngũ sáng lập</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {team.map((m, i) => (
                        <div
                            key={m.name}
                            className="group text-center"
                            style={{
                                opacity: visible ? 1 : 0,
                                transform: visible ? "translateY(0)" : "translateY(28px)",
                                transition: "opacity 0.7s ease, transform 0.7s ease",
                                transitionDelay: `${0.1 + i * 0.12}s`,
                            }}
                        >
                            <div className="relative w-24 h-24 mx-auto mb-6">
                                <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                    style={{ background: "radial-gradient(circle, rgba(34,211,238,0.25), transparent)" }} />
                                <div
                                    className="w-full h-full rounded-full flex items-center justify-center font-serif text-2xl text-cyan-700 border border-cyan-700/30"
                                    style={{ background: "linear-gradient(135deg, #e0f2fe, #bae6fd)" }}
                                >
                                    {m.initial}
                                </div>
                            </div>
                            <h3 className="text-[#1f2937] font-serif text-lg">{m.name}</h3>
                            <div className="text-cyan-700/70 text-xs tracking-wider uppercase mt-1 mb-4">{m.role}</div>
                            <p className="text-stone-600 text-sm italic leading-relaxed">"{m.quote}"</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function CtaSection() {
    const { ref, visible } = useReveal();
    return (
        <section ref={ref} className="relative py-40 px-6 bg-white">
            <div className="relative z-10 text-center max-w-2xl mx-auto" style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)" }}>
                <h2 className="font-serif text-[#1f2937] leading-tight mb-6" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
                    Bắt đầu hành trình<br />
                    <span className="text-cyan-700">khám phá sách hôm nay</span>
                </h2>
                <p className="text-stone-600 mb-10 leading-relaxed">
                    Hơn 200.000 đầu sách đang chờ bạn. Giao hàng toàn quốc, đổi trả miễn phí trong 30 ngày.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="px-8 py-4 bg-cyan-700 hover:bg-cyan-800 text-white font-medium rounded-xl transition-colors">
                        Khám phá ngay
                    </button>
                    <button className="px-8 py-4 border border-cyan-700 text-cyan-700 hover:bg-cyan-50 rounded-xl transition-colors">
                        Liên hệ chúng tôi
                    </button>
                </div>
            </div>
        </section>
    );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function AboutPage() {
    return (
        <div className="min-h-screen antialiased bg-white">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap');
                
                * { box-sizing: border-box; margin: 0; padding: 0; }
                
                .font-serif { 
                    font-family: 'Noto Serif', Georgia, serif;
                    font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
                    text-rendering: optimizeLegibility;
                    -webkit-font-smoothing: antialiased;
                }
            `}</style>

            <HeroSection />
            <StatsSection />
            <StorySection />
            <ValuesSection />
            <TeamSection />
            <CtaSection />

            <footer className="bg-[#f8f9fa] py-12 px-6 text-center border-t border-cyan-700/10">
                <div className="font-serif text-cyan-700/70 text-xl mb-3">Libro</div>
                <p className="text-stone-500 text-xs tracking-widest">
                    © 2025 Libro. Tất cả quyền được bảo lưu.
                </p>
            </footer>
        </div>
    );
}