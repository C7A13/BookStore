import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../../../../../utils/api";
import {
    FaUsers,
    FaBook,
    FaRegComments,
    FaUserShield,
    FaShoppingCart,
    FaLayerGroup,
    FaMapMarkerAlt,
    FaPenNib,
    FaTag,
    FaWarehouse,
    FaTruck,
    FaCreditCard,
    FaBuilding,
    FaSignOutAlt
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";

import logoImg from "../../../../../assets/images/logo/logo.png";
import logoImgKC from "../../../../../assets/images/logo/logo-khongchu.png";

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
}

const menu = [
    {
        label: "Dashboard",
        icon: <MdDashboard className="w-5 h-5" />,
        path: "/admin",
    },
    {
        label: "Quản lý Sách",
        icon: <FaBook className="w-5 h-5" />,
        path: "/admin/books",
    },
    {
        label: "Quản lý Tác giả",
        icon: <FaPenNib className="w-5 h-5" />,
        path: "/admin/authors",
    },
    {
        label: "Quản lý Thể Loại",
        icon: <FaLayerGroup className="w-5 h-5" />,
        path: "/admin/categories",
    },
    {
        label: "Quản lý NXB",
        icon: <FaBuilding className="w-5 h-5" />,
        path: "/admin/publishers",
    },
    {
        label: "Quản lý Tài Khoản",
        icon: <FaUsers className="w-5 h-5" />,
        path: "/admin/users",
    },
    {
        label: "Quản lý Đơn Hàng",
        icon: <FaShoppingCart className="w-5 h-5" />,
        path: "/admin/orders",
    },
    {
        label: "Quản lý Vận Chuyển",
        icon: <FaTruck className="w-5 h-5" />,
        path: "/admin/shipments",
    },
    {
        label: "Quản lý Thanh Toán",
        icon: <FaCreditCard className="w-5 h-5" />,
        path: "/admin/payments",
    },
    {
        label: "Quản lý Kho Hàng",
        icon: <FaWarehouse className="w-5 h-5" />,
        path: "/admin/inventory",
    },
    {
        label: "Quản lý Địa Chỉ",
        icon: <FaMapMarkerAlt className="w-5 h-5" />,
        path: "/admin/addresses",
    },
    {
        label: "Quản lý Đánh Giá",
        icon: <FaRegComments className="w-5 h-5" />,
        path: "/admin/reviews",
    },
    {
        label: "Quản lý Khuyến Mãi",
        icon: <FaTag className="w-5 h-5" />,
        path: "/admin/promotions",
    },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
    const location = useLocation();
    const navigate = useNavigate();

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
            navigate("/login");
        }
    };

    return (
        <aside
            className={`h-screen flex flex-col justify-between shadow-md border-r transition-all duration-300
            ${isOpen ? "w-60" : "w-16"}
            bg-white text-gray-800 border-gray-200`}
        >
            {/* Logo */}
            <div>
                <div className="flex items-center justify-center py-4 border-b border-gray-200">
                    {isOpen ? (
                        <div className="flex items-center space-x-2">
                            <img
                                src={logoImgKC}
                                alt="Logo"
                                className="w-8 h-8"
                            />

                            <span className="font-bold text-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text">
                                Libro
                            </span>
                        </div>
                    ) : (
                        <img
                            src={logoImg}
                            alt="Logo"
                            className="w-8 h-8 mx-auto"
                        />
                    )}
                </div>

                {/* Menu */}
                <ul className="mt-2 space-y-1 px-2">
                    {menu.map((item) => {
                        const isActive =
                            location.pathname === item.path;

                        return (
                            <li key={item.path} className="relative group">
                                <Link
                                    to={item.path}
                                    className={`flex items-center px-3 py-3 rounded-xl transition-all duration-200
                                    ${isActive
                                            ? "bg-indigo-50 text-indigo-600 font-medium"
                                            : "text-gray-600 hover:bg-gray-100 hover:text-indigo-500"
                                        }`}
                                >
                                    <span className="mr-3">
                                        {item.icon}
                                    </span>

                                    {isOpen && (
                                        <span className="text-sm whitespace-nowrap">
                                            {item.label}
                                        </span>
                                    )}
                                </Link>

                                {/* Tooltip */}
                                {!isOpen && (
                                    <div
                                        className="absolute left-full top-1/2 -translate-y-1/2 ml-2
                                        opacity-0 group-hover:opacity-100 transition
                                        bg-white text-gray-800 border border-gray-200
                                        shadow-lg px-3 py-1 rounded-md whitespace-nowrap
                                        z-50 text-sm"
                                    >
                                        {item.label}
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* Logout */}
            <div className="border-t border-gray-200 h-14 flex items-center justify-center bg-white">
                <button
                    onClick={handleLogout}
                    className="flex items-center rounded-lg px-4 py-2 transition text-sm
                    text-red-600 hover:bg-red-100"
                >
                    <FaSignOutAlt className="w-5 h-5 mr-2" />

                    {isOpen && <span>Đăng xuất</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;