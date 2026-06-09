
import { FaFacebook, FaInstagram, FaYoutube, FaTwitter } from 'react-icons/fa';


import { useEffect, useRef, useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    const animatedRef = useRef(false);
    const [email, setEmail] = useState('');

    useEffect(() => {
        const handleScroll = () => {
            const footer = document.querySelector('.footer-container');
            const elements = document.querySelectorAll('.footer-animate-item');

            if (footer) {
                const rect = footer.getBoundingClientRect();
                const isVisible = rect.top < window.innerHeight - 100;

                if (isVisible) {
                    if (!animatedRef.current) {
                        footer.classList.add('footer-visible');
                        elements.forEach((el, index) => {
                            setTimeout(() => {
                                el.classList.add('footer-item-visible');
                            }, 150 * index);
                        });
                        animatedRef.current = true;
                    }
                } else {
                    footer.classList.remove('footer-visible');
                    elements.forEach((el) => el.classList.remove('footer-item-visible'));
                    animatedRef.current = false;
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleScroll);
        setTimeout(handleScroll, 300);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, []);

    return (
        <footer className="footer-container bg-gradient-to-b from-slate-900 to-black text-white pt-16 pb-6 mt-20 border-t border-white/10 shadow-2xl opacity-0 translate-y-5 transition-all duration-[600ms] ease-[cubic-bezier(0.4,2,0.6,1)] [&.footer-visible]:opacity-100 [&.footer-visible]:translate-y-0">
            <div className="container max-w-7xl mx-auto px-4">

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-8">

                    {/* Brand */}
                    <div className="footer-animate-item opacity-0 translate-y-10 scale-95 transition-all duration-[600ms] [&.footer-item-visible]:opacity-100 [&.footer-item-visible]:translate-y-0 [&.footer-item-visible]:scale-100">
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="bg-gradient-to-br from-cyan-500 to-teal-600 p-2 rounded-lg">
                                <MapPin className="text-white" size={24} />
                            </div>
                            <span className="font-extrabold text-2xl bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                                Libro
                            </span>
                        </div>

                        <p className="italic text-gray-300 text-sm mb-4">
                            Khám phá thế giới tri thức cùng chúng tôi
                        </p>

                        <div className="space-y-2 text-gray-400 text-sm">
                            <div className="flex items-center">
                                <Phone size={16} className="mr-3 text-cyan-400" />
                                <span>0123 456 789</span>
                            </div>
                            <div className="flex items-center">
                                <Mail size={16} className="mr-3 text-cyan-400" />
                                <span>support@booknest.com</span>
                            </div>
                            <div className="flex items-center">
                                <MapPin size={16} className="mr-3 text-cyan-400" />
                                <span>123 Đường Sách, Hà Nội</span>
                            </div>
                        </div>
                    </div>

                    {/* Links */}
                    <div className="footer-animate-item opacity-0 translate-y-10 scale-95 transition-all duration-[600ms] [&.footer-item-visible]:opacity-100 [&.footer-item-visible]:translate-y-0 [&.footer-item-visible]:scale-100">
                        <h5 className="font-bold text-white mb-4 pb-2 relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-1 after:w-10 after:bg-gradient-to-r after:from-cyan-400 after:to-teal-500 after:rounded">
                            Liên kết nhanh
                        </h5>

                        <ul className="space-y-2">
                            {[
                                'Sách mới',
                                'Thể loại',
                                'Tác giả nổi bật',
                                'Sách bán chạy',
                                'Blog sách'
                            ].map((item) => (
                                <li key={item}>
                                    <a
                                        href="#"
                                        className="inline-flex items-center text-gray-400 hover:text-cyan-400 transition hover:translate-x-1 before:content-['›'] before:mr-2 before:text-cyan-400"
                                    >
                                        <span className="ml-6">{item}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter + Social */}
                    <div className="footer-animate-item opacity-0 translate-y-10 scale-95 transition-all duration-[600ms] [&.footer-item-visible]:opacity-100 [&.footer-item-visible]:translate-y-0 [&.footer-item-visible]:scale-100">
                        <h5 className="font-bold text-white mb-4 pb-2 relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-1 after:w-10 after:bg-gradient-to-r after:from-cyan-400 after:to-teal-500 after:rounded">
                            Kết nối với chúng tôi
                        </h5>

                        <p className="mb-3 text-gray-300 text-sm">
                            Đăng ký để nhận ưu đãi sách mới nhất
                        </p>

                        <div className="flex mb-6">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-white/10 border border-white/20 rounded-l-lg px-3 py-2 w-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                placeholder="Email của bạn"
                            />
                            <button className="bg-gradient-to-r from-cyan-500 to-teal-600 px-4 rounded-r-lg">
                                <Mail size={18} />
                            </button>
                        </div>

                        <div className="flex gap-3">
                            {[
                                { icon: FaFacebook, href: '#' },
                                { icon: FaInstagram, href: '#' },
                                { icon: FaYoutube, href: '#' },
                                { icon: FaTwitter, href: '#' }
                            ].map(({ icon: Icon }, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-teal-600 transition"
                                >
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Map */}
                    <div className="footer-animate-item opacity-0 translate-y-10 scale-95 transition-all duration-[600ms] [&.footer-item-visible]:opacity-100 [&.footer-item-visible]:translate-y-0 [&.footer-item-visible]:scale-100">
                        <h5 className="font-bold text-white mb-4 pb-2 relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-1 after:w-10 after:bg-gradient-to-r after:from-cyan-400 after:to-teal-500 after:rounded">
                            Cửa hàng
                        </h5>

                        <div className="h-40 rounded-lg overflow-hidden shadow-lg">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.096339873328!2d105.84713001531662!3d21.028811985998207!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab009cd0a263%3A0x3b8d9d6a7c7b7b7b!2sHanoi%2C%20Vietnam!5e0!3m2!1sen!2svn!4v1697671234567"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                loading="lazy"
                                title="Hà Nội map"
                            />
                        </div>
                    </div>

                </div>

                <div className="border-t border-white/10 pt-6 mt-8"></div>

                <div className="footer-animate-item grid grid-cols-1 md:grid-cols-2 gap-4 items-center opacity-0 translate-y-10 scale-95 transition-all duration-[600ms] [&.footer-item-visible]:opacity-100 [&.footer-item-visible]:translate-y-0 [&.footer-item-visible]:scale-100">
                    <p className="text-center md:text-left text-sm text-gray-400">
                        © {new Date().getFullYear()} Libro. All rights reserved.
                    </p>

                    <div className="text-center md:text-right space-x-4 text-sm">
                        <a href="#" className="text-gray-400 hover:text-cyan-400 hover:underline">
                            Chính sách bảo mật
                        </a>
                        <a href="#" className="text-gray-400 hover:text-cyan-400 hover:underline">
                            Điều khoản
                        </a>
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Footer;