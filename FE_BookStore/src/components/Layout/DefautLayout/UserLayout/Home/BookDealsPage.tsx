import { Send, ArrowRight } from 'lucide-react';
import React, { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface CustomVariants {
    [key: string]: any;
}

const BookDealsPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    const handleSubscribe = () => {
        if (email) {
            alert(`Cảm ơn bạn! Đã đăng ký nhận ưu đãi với email: ${email}`);
            setEmail('');
        }
    };

    const cardVariants: CustomVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: (index: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: index * 0.2,
                duration: 0.6,
                ease: [0.4, 2, 0.6, 1],
            },
        }),
    };

    const imageVariants: CustomVariants = {
        initial: { scale: 1 },
        hover: { scale: 1.1, transition: { duration: 0.5 } },
    };

    const overlayVariants: CustomVariants = {
        initial: { background: 'linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent)' },
        hover: { background: 'linear-gradient(to top, rgba(0, 0, 0, 0.75), transparent)', transition: { duration: 0.5 } },
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-8">
            <div ref={ref} className="max-w-7xl w-full grid md:grid-cols-2 gap-12 items-center">

                {/* Left Card - Ưu đãi đặc biệt */}
                <motion.div
                    custom={0}
                    variants={cardVariants}
                    initial="hidden"
                    animate={isInView ? 'visible' : 'hidden'}
                    className="relative h-[420px] rounded-2xl overflow-hidden"
                >
                    <motion.img
                        src="https://img5.thuthuatphanmem.vn/uploads/2021/12/28/hinh-nen-sach-dep-cho-may-tinh_012557083.jpg"
                        alt="Sách và ưu đãi Libro"
                        variants={imageVariants}
                        initial="initial"
                        whileHover="hover"
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                    />
                    <motion.div
                        variants={overlayVariants}
                        initial="initial"
                        whileHover="hover"
                        className="absolute inset-0"
                    />

                    <div className="relative h-full flex flex-col justify-end p-10 text-white">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                            Ưu Đãi <span className="text-cyan-400">Đặc Biệt</span> Tại Libro
                        </h1>
                        <p className="text-base mb-6 text-white/90 max-w-md">
                            Giảm đến 50% cho hàng trăm đầu sách hay,
                            quà tặng kèm và freeship cho thành viên.
                        </p>
                        <motion.button
                            whileHover={{ x: 5 }}
                            transition={{ duration: 0.3 }}
                            className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium px-8 py-3 rounded-lg w-fit flex items-center gap-2"
                        >
                            Xem Ưu Đãi Ngay <ArrowRight className="w-4 h-4" />
                        </motion.button>
                    </div>
                </motion.div>

                {/* Right Card - Newsletter */}
                <motion.div
                    custom={1}
                    variants={cardVariants}
                    initial="hidden"
                    animate={isInView ? 'visible' : 'hidden'}
                    className="bg-gray-50 rounded-2xl p-12 h-[420px] flex flex-col justify-between"
                >
                    <div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-8 text-gray-900">
                            Đừng Bỏ Lỡ <span className="text-cyan-500">Ưu Đãi</span>
                        </h2>
                        <p className="text-gray-600 text-base mb-6 leading-relaxed">
                            Đăng ký nhận bản tin từ Libro để cập nhật sách mới,
                            chương trình giảm giá độc quyền và những món quà bất ngờ.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <Send className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Nhập địa chỉ email của bạn"
                                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-full focus:outline-none focus:border-cyan-400 transition-colors text-gray-700 placeholder-gray-400"
                            />
                        </div>
                        <motion.button
                            onClick={handleSubscribe}
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                            className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium px-10 py-3.5 rounded-full uppercase text-sm tracking-wide"
                        >
                            Đăng Ký
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default BookDealsPage;