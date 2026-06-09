import { motion, useInView } from 'framer-motion';
import { DollarSign, BookOpen, Truck, ShieldCheck } from 'lucide-react';
import React, { useRef } from 'react';

interface Reason {
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    title: string;
    description: string;
}

interface CustomVariants {
    [key: string]: any;
}

export default function WhyChoose() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    const reasons: Reason[] = [
        {
            icon: DollarSign,
            title: 'Giá cả tốt nhất',
            description: 'Libro cam kết mang đến mức giá cạnh tranh nhất thị trường cùng nhiều chương trình khuyến mãi hấp dẫn.',
        },
        {
            icon: BookOpen,
            title: 'Sách chất lượng cao',
            description: 'Toàn bộ sách đều là hàng chính hãng, mới 100%, được chọn lọc kỹ lưỡng từ các nhà xuất bản uy tín.',
        },
        {
            icon: Truck,
            title: 'Giao hàng nhanh chóng',
            description: 'Giao hàng toàn quốc trong vòng 1-3 ngày. Miễn phí vận chuyển cho đơn hàng từ 300.000đ.',
        },
        {
            icon: ShieldCheck,
            title: 'Chính sách rõ ràng',
            description: 'Đổi trả dễ dàng trong 7 ngày, bảo hành sách lỗi, thanh toán an toàn và minh bạch.',
        },
    ];

    const headerVariants: CustomVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 2, 0.6, 1] } },
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

    const cardHoverVariants: CustomVariants = {
        initial: { scale: 1 },
        hover: { scale: 1.05, transition: { duration: 0.3 } },
    };

    return (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    variants={headerVariants}
                    initial="hidden"
                    animate={isInView ? 'visible' : 'hidden'}
                    className="text-center mb-12"
                >
                    <p className="text-orange-500 text-sm font-semibold mb-2 italic">Lý do nên chọn</p>
                    <h2 className="text-4xl font-bold text-gray-800 mb-4">
                        Tại Sao Nên Chọn <span className="text-cyan-500">Libro</span>?
                    </h2>
                    <p className="text-gray-600 text-base leading-relaxed max-w-2xl mx-auto">
                        Với hơn 10.000 đầu sách và kinh nghiệm phục vụ hàng nghìn khách hàng, Libro mang đến trải nghiệm mua sách tốt nhất cho bạn.
                    </p>
                </motion.div>

                {/* Reasons Grid */}
                <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {reasons.map((reason, index) => {
                        const Icon = reason.icon;
                        return (
                            <motion.div
                                key={index}
                                custom={index}
                                variants={cardVariants}
                                initial="hidden"
                                animate={isInView ? 'visible' : 'hidden'}
                                whileHover="hover"
                                className="text-center flex flex-col items-center"
                            >
                                <motion.div
                                    variants={cardHoverVariants}
                                    className="w-20 h-20 flex items-center justify-center mb-6"
                                >
                                    <div className="w-16 h-16 border-2 border-teal-500 rounded-lg flex items-center justify-center">
                                        <Icon className="w-10 h-10 text-teal-500" strokeWidth={1.5} />
                                    </div>
                                </motion.div>
                                <h3 className="text-lg font-bold text-gray-800 mb-3">{reason.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{reason.description}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}