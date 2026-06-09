import React, { useState } from "react";
import { Phone, Mail, MapPin, Clock, Send, MessageSquare, User, Info } from "lucide-react";
import Swal from "sweetalert2";

interface ContactForm {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
}

export default function ContactPage() {
    const [form, setForm] = useState<ContactForm>({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (!form.name.trim() || !form.email.trim() || !form.message.trim() || !form.subject.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Thiếu thông tin",
                text: "Vui lòng điền đầy đủ các trường bắt buộc (*).",
                confirmButtonColor: "#4f46e5"
            });
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
            Swal.fire({
                icon: "error",
                title: "Email không hợp lệ",
                text: "Vui lòng nhập địa chỉ email chính xác.",
                confirmButtonColor: "#4f46e5"
            });
            return;
        }

        setLoading(true);

        // Simulate sending request
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            Swal.fire({
                icon: "success",
                title: "Gửi liên hệ thành công!",
                text: "Cảm ơn bạn đã phản hồi. Chúng tôi sẽ phản hồi lại bạn qua email sớm nhất có thể.",
                confirmButtonColor: "#4f46e5"
            });

            // Reset form
            setForm({
                name: "",
                email: "",
                phone: "",
                subject: "",
                message: "",
            });
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Lỗi kết nối",
                text: "Đã có lỗi xảy ra trong quá trình gửi. Vui lòng thử lại sau.",
                confirmButtonColor: "#4f46e5"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* Header Banner */}
            <div className="pt-28 pb-16 text-center border-b border-slate-100 bg-gradient-to-b from-indigo-50 to-slate-50 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="max-w-2xl mx-auto px-4 relative z-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
                        Liên hệ với chúng tôi
                    </h1>
                    <p className="text-sm md:text-base text-slate-500 mt-3">
                        Ý kiến đóng góp và thắc mắc của bạn là động lực giúp BookStore cải thiện chất lượng dịch vụ tốt hơn mỗi ngày.
                    </p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Panel: Contact Info */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                            <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3">
                                Thông tin liên hệ
                            </h2>

                            <div className="space-y-5">
                                {/* Address */}
                                <div className="flex gap-4 items-start">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-700 text-sm">Địa chỉ cửa hàng</h4>
                                        <p className="text-slate-500 text-sm mt-0.5 leading-relaxed">
                                            161B Lý Chính Thắng, Phường Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh
                                        </p>
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="flex gap-4 items-start">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-700 text-sm">Điện thoại hỗ trợ</h4>
                                        <p className="text-slate-500 text-sm mt-0.5">
                                            028 3931 6289
                                        </p>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            (Hỗ trợ từ 8:00 - 21:00 hàng ngày)
                                        </p>
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="flex gap-4 items-start">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-700 text-sm">Địa chỉ email</h4>
                                        <p className="text-slate-500 text-sm mt-0.5">
                                            support@bookstore.com
                                        </p>
                                        <p className="text-slate-500 text-sm">
                                            info@bookstore.com
                                        </p>
                                    </div>
                                </div>

                                {/* Clock */}
                                <div className="flex gap-4 items-start">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-700 text-sm">Giờ mở cửa</h4>
                                        <p className="text-slate-500 text-sm mt-0.5">
                                            Thứ 2 - Chủ Nhật: 08:00 - 22:00
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            (Trừ các ngày lễ Tết lớn theo quy định)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Google Map Embed */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-72">
                            <iframe 
                                title="BookStore Map"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.418471415132!2d106.6806509!3d10.7792275!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3919.418471415132!2zMTYxQiBMw70gQ2jDrW5oIFRo4bqvbmcsIFBoxrDhu51uZyA3LCBRdeG6rW4gMywgVGjDoG5oIHBo4buRIEjhu5MgQ2jDrSBNaW5o!5e0!3m2!1svi!2svn!4v1700000000000!5m2!1svi!2svn" 
                                width="100%" 
                                height="100%" 
                                style={{ border: 0 }} 
                                allowFullScreen={false} 
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    </div>

                    {/* Right Panel: Contact Form */}
                    <div className="lg:col-span-7">
                        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Gửi tin nhắn phản hồi</h2>
                                <p className="text-xs text-slate-400 mt-1">
                                    Chúng tôi rất hân hạnh được lắng nghe ý kiến từ bạn. Hãy để lại tin nhắn theo biểu mẫu bên dưới.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {/* Name */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                        Họ và tên <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            placeholder="Nguyễn Văn A"
                                            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all text-slate-700"
                                            required
                                        />
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                        Địa chỉ Email <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            placeholder="example@gmail.com"
                                            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all text-slate-700"
                                            required
                                        />
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {/* Phone */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                        Số điện thoại
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={form.phone}
                                            onChange={handleChange}
                                            placeholder="09xxxxxxxx"
                                            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all text-slate-700"
                                        />
                                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    </div>
                                </div>

                                {/* Subject */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                        Chủ đề liên hệ <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="subject"
                                            value={form.subject}
                                            onChange={handleChange}
                                            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all text-slate-700 appearance-none"
                                            required
                                        >
                                            <option value="">-- Chọn chủ đề --</option>
                                            <option value="Tư vấn sách">Tư vấn mua sách</option>
                                            <option value="Hỗ trợ đơn hàng">Hỗ trợ / Khiếu nại đơn hàng</option>
                                            <option value="Hợp tác kinh doanh">Hợp tác & Quảng cáo</option>
                                            <option value="Góp ý dịch vụ">Đóng góp ý kiến dịch vụ</option>
                                        </select>
                                        <Info className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    </div>
                                </div>
                            </div>

                            {/* Message */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                    Nội dung tin nhắn <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <textarea
                                        name="message"
                                        value={form.message}
                                        onChange={handleChange}
                                        placeholder="Nhập nội dung bạn muốn gửi tới BookStore tại đây..."
                                        rows={5}
                                        className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all text-slate-700 resize-none"
                                        required
                                    ></textarea>
                                    <MessageSquare className="absolute left-3.5 top-4 text-slate-400 w-4 h-4" />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer"
                                >
                                    {loading ? (
                                        <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                    {loading ? "Đang gửi..." : "Gửi thông tin"}
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}
