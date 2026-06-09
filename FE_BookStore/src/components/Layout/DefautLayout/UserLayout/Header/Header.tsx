import React, { useState, useEffect, useRef } from "react";
import { Menu, X, ShoppingCart, User, Search, Edit, Package, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../../../../utils/api";
import axios from "axios";


import logoImg from "../../../../../assets/images/logo/logo.png";

// Import Cart Component
import Cart from "../Cart/Cart";

const Header: React.FC = () => {
    const navigate = useNavigate();
    const userMenuRef = useRef<HTMLDivElement>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [search, setSearch] = useState("");
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const [user, setUser] = useState<{ fullName?: string, email?: string, avatarUrl?: string } | null>(null);
    const [cartCount, setCartCount] = useState(0);

    const isLoggedIn = !!user;

    const fetchCartCount = async () => {
        try {
            const res = await api.get("/cart");
            if (res.data && res.data.result && res.data.result.items) {
                const count = res.data.result.items.length;
                setCartCount(count);
            } else {
                setCartCount(0);
            }
        } catch (error) {
            console.error("Failed to fetch cart count", error);
        }
    };

    useEffect(() => {
        fetchCartCount();
        window.addEventListener("cart_updated", fetchCartCount);
        return () => window.removeEventListener("cart_updated", fetchCartCount);
    }, []);

    useEffect(() => {
        const fetchUserProfile = async () => {
            // 1. Kiểm tra xem có phải phiên làm việc mới hoàn toàn không
            const isNewSession = !sessionStorage.getItem("session_active");
            const rememberMe = localStorage.getItem("remember_me") === "true";

            if (isNewSession) {
                sessionStorage.setItem("session_active", "true"); // Đánh dấu phiên hiện tại đã kích hoạt
                if (!rememberMe) {
                    // Nếu không tích ghi nhớ, xóa sạch access_token cũ của phiên trước
                    localStorage.removeItem("access_token");
                }
            }

            let token = localStorage.getItem("access_token");
            
            // 2. Thử silent refresh nếu không có access_token
            if (!token) {
                try {
                    const res = await axios.post(
                        "http://localhost:8080/auth/refresh",
                        {},
                        { withCredentials: true }
                    );
                    token = res.data.result.token;
                    localStorage.setItem("access_token", token);
                } catch (err) {
                    // Không có refresh token hoặc hết hạn -> Tiếp tục ở chế độ Guest
                    return;
                }
            }

            if (token) {
                try {
                    const res = await api.get("/users/profile");
                    if (res.data && res.data.result) {
                        setUser(res.data.result);
                    }
                } catch (error) {
                    console.error("Failed to fetch user profile", error);
                }
            }
        };
        fetchUserProfile();
    }, []);



    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Click outside để đóng user menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNavigate = (path: string) => {
        navigate(path);
        window.scrollTo({ top: 0, behavior: "smooth" });
        setIsOpen(false);
    };

    const handleLogoClick = () => {
        navigate("/");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (search.trim()) {
            navigate(`/books?keyword=${encodeURIComponent(search)}`);
            setSearch("");
        }
    };

    const toggleUserMenu = () => {
        setIsUserMenuOpen(!isUserMenuOpen);
    };

    const handleLogout = async () => {
        try {
            // Gọi backend để xóa HttpOnly Cookie refresh_token
            await api.post("/auth/log-out");
        } catch {
            // Dù thất bại vẫn logout phía client
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("access_token");
            localStorage.removeItem("user");
            setUser(null);
            setIsUserMenuOpen(false);
            navigate("/login");
        }
    };

    return (
        <>
            <header
                className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled
                    ? "bg-white/95 backdrop-blur-md shadow-md"
                    : "bg-transparent"
                    }`}
            >
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">

                        {/* Logo */}
                        <button onClick={handleLogoClick} className="flex items-center">
                            <img
                                src={logoImg}
                                alt="BookStore"
                                className="h-12 w-auto transition hover:scale-105"
                            />
                        </button>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex space-x-8 items-center">
                            {[
                                { name: "Trang chủ", to: "/" },
                                { name: "Sách", to: "/books" },
                                { name: "FAQ", to: "/faq" },
                                { name: "Giới thiệu", to: "/about" },
                                { name: "Liên hệ", to: "/contact" },
                            ].map((item) => (
                                <button
                                    key={item.name}
                                    onClick={() => handleNavigate(item.to)}
                                    className="text-gray-700 hover:text-cyan-600 font-medium transition"
                                >
                                    {item.name}
                                </button>
                            ))}

                            {/* Search Bar */}
                            <form onSubmit={handleSearch} className="relative ml-4">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Tìm kiếm sách..."
                                    className="pl-9 pr-4 py-1.5 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm w-56"
                                />
                                <Search
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />
                            </form>
                        </div>

                        {/* Right Icons - Desktop */}
                        <div className="hidden md:flex items-center space-x-6">
                            {/* Cart Icon */}
                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="relative text-gray-700 hover:text-cyan-600 transition p-1"
                            >
                                <ShoppingCart size={24} />
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium w-5 h-5 flex items-center justify-center rounded-full">
                                    {cartCount}
                                </span>
                            </button>

                            {/* User Icon + Dropdown */}
                            {isLoggedIn ? (
                                <div className="relative" ref={userMenuRef}>
                                    <button
                                        onClick={toggleUserMenu}
                                        className="flex items-center transition p-1 focus:outline-none"
                                        title="Tài khoản"
                                    >
                                        {user?.avatarUrl ? (
                                            <img
                                                src={user.avatarUrl}
                                                alt="Avatar"
                                                className="w-8 h-8 rounded-full object-cover border border-cyan-500 hover:scale-105 transition-transform duration-200"
                                            />
                                        ) : (
                                            <User size={24} className="text-gray-700 hover:text-cyan-600" />
                                        )}
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isUserMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                                            <div className="px-4 py-3 border-b flex items-center gap-3">
                                                {user?.avatarUrl ? (
                                                    <img
                                                        src={user.avatarUrl}
                                                        alt="Avatar"
                                                        className="w-10 h-10 rounded-full object-cover border border-cyan-500"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                                                        <span className="text-white font-bold text-lg">
                                                            {user?.fullName?.[0]?.toUpperCase() || 'U'}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-semibold text-gray-800 text-sm truncate">{user?.fullName || "Người dùng"}</p>
                                                    <p className="text-xs text-gray-500 truncate">{user?.email || ""}</p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    setIsUserMenuOpen(false);
                                                    navigate("/profile");
                                                }}
                                                className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 text-gray-700"
                                            >
                                                <Edit size={18} />
                                                Chỉnh sửa profile
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setIsUserMenuOpen(false);
                                                    navigate("/my-orders");
                                                }}
                                                className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 text-gray-700"
                                            >
                                                <Package size={18} />
                                                Danh sách đơn hàng
                                            </button>

                                            <div className="border-t my-1"></div>

                                            <button
                                                onClick={handleLogout}
                                                className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 text-red-600"
                                            >
                                                <LogOut size={18} />
                                                Đăng xuất
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={() => navigate("/login")}
                                    className="text-gray-700 hover:text-cyan-600 transition p-1"
                                >
                                    <User size={24} />
                                </button>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden text-gray-800 p-1"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            {isOpen ? <X size={26} /> : <Menu size={26} />}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {isOpen && (
                        <div className="md:hidden bg-white border-t px-4 py-5 space-y-4">
                            {isLoggedIn && (
                                <div className="flex items-center gap-3 pb-3 border-b">
                                    {user?.avatarUrl ? (
                                        <img
                                            src={user.avatarUrl}
                                            alt="Avatar"
                                            className="w-10 h-10 rounded-full object-cover border border-cyan-500"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                                            <span className="text-white font-bold text-lg">
                                                {user?.fullName?.[0]?.toUpperCase() || 'U'}
                                            </span>
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-gray-850 text-sm truncate">{user?.fullName || "Người dùng"}</p>
                                        <p className="text-xs text-gray-500 truncate">{user?.email || ""}</p>
                                    </div>
                                </div>
                            )}
                            {[
                                { name: "Trang chủ", to: "/" },
                                { name: "Sách", to: "/books" },
                                { name: "Hỏi đáp", to: "/faq" },
                                { name: "Giới thiệu", to: "/about" },
                                { name: "Liên hệ", to: "/contact" },
                            ].map((item) => (
                                <button
                                    key={item.name}
                                    onClick={() => handleNavigate(item.to)}
                                    className="block w-full text-left py-2 text-gray-700 hover:text-cyan-600 font-medium"
                                >
                                    {item.name}
                                </button>
                            ))}

                            <div className="flex flex-col gap-4 pt-4 border-t">
                                <button
                                    onClick={() => setIsCartOpen(true)}
                                    className="flex items-center gap-3 text-gray-700 hover:text-cyan-600"
                                >
                                    <ShoppingCart size={22} /> Giỏ hàng ({cartCount})
                                </button>

                                {isLoggedIn ? (
                                    <>
                                        <button
                                            onClick={() => navigate("/profile")}
                                            className="flex items-center gap-3 text-gray-700 hover:text-cyan-600"
                                        >
                                            <Edit size={22} /> Chỉnh sửa profile
                                        </button>
                                        <button
                                            onClick={() => navigate("/my-orders")}
                                            className="flex items-center gap-3 text-gray-700 hover:text-cyan-600"
                                        >
                                            <Package size={22} /> Danh sách đơn hàng
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 text-red-600 hover:text-red-700"
                                        >
                                            <LogOut size={22} /> Đăng xuất
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => navigate("/login")}
                                        className="flex items-center gap-3 text-gray-700 hover:text-cyan-600"
                                    >
                                        <User size={22} /> Đăng nhập
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </nav>
            </header>

            {/* Cart Sidebar */}
            {isCartOpen && (
                <div className="fixed inset-0 z-[60] flex">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsCartOpen(false)}
                    />
                    <div className="relative ml-auto w-full max-w-md h-full bg-white shadow-2xl overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-2xl font-bold text-gray-900">Giỏ hàng</h2>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="text-gray-500 hover:text-gray-800 transition"
                            >
                                <X size={28} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto">
                            <Cart isInModal={true} onClose={() => setIsCartOpen(false)} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;