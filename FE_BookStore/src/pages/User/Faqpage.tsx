import { useState } from "react";
import { HelpCircle, ChevronDown, ShoppingBag, Truck, RotateCcw, ShieldCheck, Search } from "lucide-react";

interface FAQItem {
    id: string;
    question: string;
    answer: string;
}

interface FAQCategory {
    id: string;
    name: string;
    icon: React.ElementType;
    items: FAQItem[];
}

const faqData: FAQCategory[] = [
    {
        id: "ordering",
        name: "Đặt hàng & Thanh toán",
        icon: ShoppingBag,
        items: [
            {
                id: "ord-1",
                question: "Làm sao để tôi đặt mua sách trên website?",
                answer: "Bạn chỉ cần truy cập vào mục 'Sách', chọn cuốn sách yêu thích và click 'Thêm vào giỏ hàng'. Sau đó, truy cập vào Giỏ hàng ở góc phải màn hình, điền thông tin giao hàng và xác nhận thanh toán."
            },
            {
                id: "ord-2",
                question: "Website hỗ trợ các hình thức thanh toán nào?",
                answer: "Chúng tôi hỗ trợ thanh toán khi nhận hàng (COD), chuyển khoản ngân hàng qua mã QR động, và thanh toán online bảo mật qua các cổng liên kết."
            },
            {
                id: "ord-3",
                question: "Tôi có thể hủy đơn hàng sau khi đã đặt thành công không?",
                answer: "Bạn có thể hủy đơn hàng từ mục 'Đơn hàng của tôi' trong vòng 30 phút kể từ lúc đặt hàng thành công. Sau thời gian đó, đơn hàng sẽ được chuyển sang bộ phận đóng gói và không thể hủy trực tuyến."
            }
        ]
    },
    {
        id: "shipping",
        name: "Vận chuyển & Giao nhận",
        icon: Truck,
        items: [
            {
                id: "ship-1",
                question: "Thời gian giao hàng mất bao lâu?",
                answer: "Nội thành TP.HCM và Hà Nội: 1 - 2 ngày làm việc. Các tỉnh thành khác: 3 - 5 ngày làm việc. Trong các dịp lễ Tết hoặc chương trình khuyến mãi lớn, thời gian giao hàng có thể kéo dài thêm 1-2 ngày."
            },
            {
                id: "ship-2",
                question: "Phí vận chuyển được tính như thế nào?",
                answer: "Phí vận chuyển mặc định là 30.000đ cho đơn hàng dưới 300.000đ. Đơn hàng từ 300.000đ trở lên sẽ được hỗ trợ miễn phí giao hàng toàn quốc."
            },
            {
                id: "ship-3",
                question: "Tôi có thể kiểm tra hành trình đơn hàng ở đâu?",
                answer: "Bạn hãy đăng nhập vào tài khoản, truy cập mục 'Danh sách đơn hàng' để theo dõi chi tiết trạng thái vận chuyển từ lúc chuẩn bị đến lúc giao thành công."
            }
        ]
    },
    {
        id: "return",
        name: "Đổi trả & Hoàn tiền",
        icon: RotateCcw,
        items: [
            {
                id: "ret-1",
                question: "Chính sách đổi trả sách lỗi như thế nào?",
                answer: "Chúng tôi áp dụng chính sách 1 đổi 1 trong vòng 7 ngày kể từ khi nhận hàng đối với các lỗi từ nhà sản xuất (như sách in ngược trang, thiếu trang, rách trang hoặc hỏng bìa nặng trong quá trình vận chuyển)."
            },
            {
                id: "ret-2",
                question: "Tôi có phải chịu phí gửi hàng khi đổi trả sách lỗi không?",
                answer: "Hoàn toàn không. Nếu phát sinh lỗi do nhà sản xuất hoặc giao sai sách, BookStore sẽ chịu 100% phí vận chuyển thu hồi và giao lại sách mới."
            },
            {
                id: "ret-3",
                question: "Thời gian nhận lại tiền hoàn trả là bao lâu?",
                answer: "Sau khi chúng tôi nhận lại sản phẩm đổi trả và kiểm tra hợp lệ, tiền hoàn sẽ được gửi lại vào tài khoản ngân hàng của bạn trong vòng 3 - 5 ngày làm việc."
            }
        ]
    },
    {
        id: "account",
        name: "Tài khoản & Bảo mật",
        icon: ShieldCheck,
        items: [
            {
                id: "acc-1",
                question: "Làm cách nào để tôi cập nhật thông tin cá nhân hoặc mật khẩu?",
                answer: "Bạn hãy click vào biểu tượng tài khoản ở góc phải màn hình -> Chọn 'Chỉnh sửa profile'. Tại đây bạn có thể cập nhật Họ tên, Số điện thoại, Ngày sinh và Đổi mật khẩu mới."
            },
            {
                id: "acc-2",
                question: "Tôi bị quên mật khẩu đăng nhập thì phải làm sao?",
                answer: "Tại trang Đăng nhập, bạn hãy click vào nút 'Quên mật khẩu', nhập Email đăng ký tài khoản. Hệ thống sẽ gửi một liên kết khôi phục mật khẩu mới về hộp thư của bạn."
            },
            {
                id: "acc-3",
                question: "Thông tin cá nhân của tôi có được bảo mật không?",
                answer: "BookStore cam kết bảo mật tuyệt đối dữ liệu người dùng. Mật khẩu được mã hóa một chiều (Bcrypt) và thông tin mua hàng được bảo vệ bằng các giao thức mã hóa chuẩn quốc tế."
            }
        ]
    }
];

export default function FaqPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState<string>("all");
    const [openItems, setOpenItems] = useState<string[]>([]);

    const toggleItem = (id: string) => {
        setOpenItems(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    // Filter FAQ based on search and category
    const filteredCategories = faqData.map(cat => {
        // filter items inside this category
        const matchedItems = cat.items.filter(item =>
            item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return { ...cat, items: matchedItems };
    }).filter(cat => {
        // keep category if matches activeCategory and has matching items
        const isCatMatch = activeCategory === "all" || cat.id === activeCategory;
        return isCatMatch && cat.items.length > 0;
    });

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* Header Banner */}
            <div className="pt-28 pb-16 text-center border-b border-slate-100 bg-gradient-to-b from-indigo-50 to-slate-50 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="max-w-2xl mx-auto px-4 relative z-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
                        Trung tâm Trợ giúp & Hỏi đáp
                    </h1>
                    <p className="text-sm md:text-base text-slate-500 mt-3">
                        Tìm câu trả lời nhanh chóng cho các câu hỏi thường gặp về mua sách, giao nhận, và bảo mật tài khoản.
                    </p>

                    {/* Instant Search Bar */}
                    <div className="mt-8 relative max-w-lg mx-auto">
                        <input
                            type="text"
                            placeholder="Nhập câu hỏi hoặc từ khóa cần tìm..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            id="faq-search-input"
                            className="w-full bg-white border border-slate-200 shadow-sm rounded-full pl-12 pr-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all text-slate-700 placeholder-slate-400"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Main Layout */}
            <div className="max-w-4xl mx-auto px-4 py-10">
                {/* Category Filter Pills */}
                <div className="flex flex-wrap gap-2 justify-center mb-8">
                    <button
                        onClick={() => setActiveCategory("all")}
                        id="faq-cat-all"
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-200
              ${activeCategory === "all"
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                            }`}
                    >
                        <HelpCircle className="w-3.5 h-3.5" />
                        Tất cả
                    </button>
                    {faqData.map(cat => {
                        const Icon = cat.icon;
                        const isActive = activeCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                id={`faq-cat-${cat.id}`}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-200
                  ${isActive
                                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                                    }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {cat.name}
                            </button>
                        );
                    })}
                </div>

                {/* FAQ List Accordions */}
                <div className="space-y-8">
                    {filteredCategories.map(cat => {
                        const Icon = cat.icon;
                        return (
                            <div key={cat.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <Icon className="w-4.5 h-4.5" />
                                    </div>
                                    <h2 className="font-bold text-slate-800 text-lg">{cat.name}</h2>
                                </div>

                                <div className="divide-y divide-slate-100">
                                    {cat.items.map(item => {
                                        const isOpen = openItems.includes(item.id);
                                        return (
                                            <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                                                <button
                                                    onClick={() => toggleItem(item.id)}
                                                    id={`faq-btn-${item.id}`}
                                                    className="w-full flex items-center justify-between text-left font-medium text-slate-700 hover:text-indigo-600 transition-colors py-2"
                                                >
                                                    <span className="text-sm md:text-base leading-snug">{item.question}</span>
                                                    <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 ml-4 transition-transform duration-300 ${isOpen ? "rotate-180 text-indigo-500" : ""}`} />
                                                </button>
                                                <div
                                                    className={`overflow-hidden transition-all duration-300 ease-in-out
                            ${isOpen ? "max-h-[300px] opacity-100 mt-2" : "max-h-0 opacity-0"}`}
                                                >
                                                    <p className="text-slate-500 text-sm leading-relaxed bg-slate-50/50 rounded-xl p-3 border border-slate-100/50">
                                                        {item.answer}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}

                    {filteredCategories.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
                            <div className="text-5xl mb-4">🔍</div>
                            <h3 className="text-slate-700 font-bold text-lg">Không tìm thấy kết quả</h3>
                            <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
                                Hãy thử tìm kiếm bằng một từ khóa khác hoặc chuyển sang mục 'Tất cả'.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
