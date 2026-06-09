import React, { useEffect, useState } from 'react';
import {
    Download,
    TrendingUp,
    TrendingDown,
    BookOpen,
    ShoppingCart,
    Users,
    DollarSign,
    AlertTriangle,
    RefreshCw,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from 'recharts';
import api from '../../utils/api';

// ─── TYPES (match backend DashboardResponse) ─────────────────────────────────
interface Stats {
    totalBooks: number;
    activeBooks: number;
    totalOrders: number;
    totalRevenue: number;
    totalUsers: number;
}
interface MonthlyCount { month: string; count: number; }
interface RevenueItem { month: string; revenue: number; last: number; }
interface OrderStatusItem { name: string; value: number; }
interface TopSellingBookItem { name: string; author: string; sold: number; }
interface LowStockBookItem { name: string; stock: number; }
interface HotCategoryItem { name: string; count: number; }

interface DashboardData {
    stats: Stats;
    bookByMonth: MonthlyCount[];
    orderByMonth: MonthlyCount[];
    revenueData: RevenueItem[];
    orderStatusData: OrderStatusItem[];
    topSellingBooks: TopSellingBookItem[];
    lowStockBooks: LowStockBookItem[];
    hotCategories: HotCategoryItem[];
}

// ─── COLORS for order status pie ─────────────────────────────────────────────
const ORDER_STATUS_COLORS: Record<string, string> = {
    'Chờ xác nhận': '#f59e0b',
    'Đang giao':    '#3b82f6',
    'Đã giao':      '#10b981',
    'Đã huỷ':       '#ef4444',
    'Hoàn tiền':    '#8b5cf6',
};

// ─── FORMAT HELPERS ───────────────────────────────────────────────────────────
const vnd = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

// ─── SKELETON CARD ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
    <div className="animate-pulse bg-white rounded-2xl p-6 border border-gray-100 h-32" />
);

// ─── DASHBOARD COMPONENT ─────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboard = () => {
        setLoading(true);
        setError(null);
        api.get('/admin/dashboard')
            .then(res => {
                setData(res.data.result);
            })
            .catch(err => {
                console.error('Dashboard fetch error:', err);
                setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại!');
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    // ── Revenue growth calculation ──────────────────────────────────────────
    const revenueItems = data?.revenueData ?? [];
    const currentMonthRevenue = revenueItems.length > 0 ? Number(revenueItems[revenueItems.length - 1].revenue) : 0;
    const lastMonthRevenue    = revenueItems.length > 1 ? Number(revenueItems[revenueItems.length - 2].revenue) : 0;
    const growth = lastMonthRevenue > 0
        ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
        : '0.0';

    // ── Total for progress bar ───────────────────────────────────────────────
    const totalOrderStatusSum = (data?.orderStatusData ?? []).reduce((s, i) => s + i.value, 0) || 1;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard Quản Trị</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Tổng quan hệ thống theo thời gian thực</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchDashboard}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-600 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50 transition"
                        >
                            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                            Làm mới
                        </button>
                        <button
                            onClick={() => alert('Tính năng xuất Excel đang phát triển...')}
                            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition"
                        >
                            <Download size={18} /> Xuất báo cáo
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

                {/* ── Error banner ─────────────────────────────────────────── */}
                {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                        <AlertTriangle size={20} className="shrink-0" />
                        <span className="text-sm font-medium">{error}</span>
                        <button onClick={fetchDashboard} className="ml-auto text-sm underline font-semibold">Thử lại</button>
                    </div>
                )}

                {/* ── KPI Stats ────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
                    ) : (
                        [
                            {
                                label: 'Tổng Sách',
                                value: data?.stats.totalBooks.toLocaleString() ?? '—',
                                sub: `${data?.stats.activeBooks.toLocaleString() ?? 0} đang bán`,
                                icon: <BookOpen size={22} />,
                                gradient: 'from-blue-500 to-blue-600',
                            },
                            {
                                label: 'Sách Đang Bán',
                                value: data?.stats.activeBooks.toLocaleString() ?? '—',
                                sub: 'Trên toàn hệ thống',
                                icon: <TrendingUp size={22} />,
                                gradient: 'from-emerald-500 to-emerald-600',
                            },
                            {
                                label: 'Tổng Đơn Hàng',
                                value: data?.stats.totalOrders.toLocaleString() ?? '—',
                                sub: 'Từ trước đến nay',
                                icon: <ShoppingCart size={22} />,
                                gradient: 'from-violet-500 to-violet-600',
                            },
                            {
                                label: 'Doanh Thu',
                                value: data?.stats.totalRevenue != null ? vnd(data.stats.totalRevenue) : '—',
                                sub: 'Đơn đã giao thành công',
                                icon: <DollarSign size={22} />,
                                gradient: 'from-amber-500 to-orange-500',
                            },
                            {
                                label: 'Khách Hàng',
                                value: data?.stats.totalUsers.toLocaleString() ?? '—',
                                sub: 'Tài khoản đã đăng ký',
                                icon: <Users size={22} />,
                                gradient: 'from-pink-500 to-rose-500',
                            },
                        ].map((item, i) => (
                            <div key={i} className={`bg-gradient-to-br ${item.gradient} p-5 rounded-2xl shadow-md text-white`}>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-2xl font-bold truncate">{item.value}</p>
                                        <p className="text-sm font-semibold mt-1 opacity-95">{item.label}</p>
                                        <p className="text-xs mt-0.5 opacity-75">{item.sub}</p>
                                    </div>
                                    <div className="ml-3 bg-white/20 rounded-xl p-2 shrink-0">
                                        {item.icon}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* ── Revenue Chart ─────────────────────────────────────────── */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Thống kê Doanh thu</h3>
                            <p className="text-sm text-gray-500">So sánh với cùng tháng năm ngoái</p>
                        </div>
                        {!loading && data && (
                            <div className="text-right">
                                <p className="text-2xl font-bold text-emerald-600">{currentMonthRevenue} triệu</p>
                                <p className="text-xs text-gray-500">Tháng này</p>
                                <p className={`text-sm font-semibold flex items-center justify-end gap-1 mt-1 ${Number(growth) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {Number(growth) >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                    {growth}% so với tháng trước
                                </p>
                            </div>
                        )}
                    </div>
                    {loading ? (
                        <div className="animate-pulse h-72 bg-gray-100 rounded-xl" />
                    ) : (
                        <ResponsiveContainer width="100%" height={320}>
                            <LineChart data={data?.revenueData ?? []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                                <YAxis tickFormatter={v => v + ' tr'} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13 }}
                                    formatter={(v: any) => [`${v} triệu`, '']}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="Năm nay" />
                                <Line type="monotone" dataKey="last" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Năm trước" />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* ── Books by Month + Orders by Month ─────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4">Sách được thêm theo tháng</h3>
                        {loading ? (
                            <div className="animate-pulse h-56 bg-gray-100 rounded-xl" />
                        ) : (
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={data?.bookByMonth ?? []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                                    <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13 }} />
                                    <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} name="Số sách" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4">Đơn hàng theo tháng</h3>
                        {loading ? (
                            <div className="animate-pulse h-56 bg-gray-100 rounded-xl" />
                        ) : (
                            <ResponsiveContainer width="100%" height={240}>
                                <LineChart data={data?.orderByMonth ?? []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                                    <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13 }} />
                                    <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} name="Đơn hàng" />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* ── Order Status Pie ──────────────────────────────────────── */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Thống kê trạng thái đơn hàng</h3>
                    {loading ? (
                        <div className="animate-pulse h-56 bg-gray-100 rounded-xl" />
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={data?.orderStatusData ?? []}
                                        cx="50%" cy="50%"
                                        innerRadius={75} outerRadius={115}
                                        dataKey="value"
                                        paddingAngle={3}
                                    >
                                        {(data?.orderStatusData ?? []).map((entry, index) => (
                                            <Cell key={index} fill={ORDER_STATUS_COLORS[entry.name] ?? '#94a3b8'} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13 }} />
                                </PieChart>
                            </ResponsiveContainer>

                            <div className="space-y-4">
                                {(data?.orderStatusData ?? []).map(item => (
                                    <div key={item.name}>
                                        <div className="flex justify-between mb-1.5 text-sm">
                                            <span className="flex items-center gap-2 text-gray-700 font-medium">
                                                <span
                                                    style={{ background: ORDER_STATUS_COLORS[item.name] ?? '#94a3b8' }}
                                                    className="inline-block w-3 h-3 rounded-full"
                                                />
                                                {item.name}
                                            </span>
                                            <span className="font-bold text-gray-900">{item.value.toLocaleString()} đơn</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${(item.value / totalOrderStatusSum) * 100}%`,
                                                    backgroundColor: ORDER_STATUS_COLORS[item.name] ?? '#94a3b8'
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Top Selling + Low Stock + Hot Categories ─────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Top Selling */}
                    <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-5">🏆 Top 5 sách bán chạy nhất</h3>
                        {loading ? (
                            <div className="space-y-3">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="animate-pulse h-14 bg-gray-100 rounded-xl" />
                                ))}
                            </div>
                        ) : (data?.topSellingBooks ?? []).length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-8">Chưa có dữ liệu</p>
                        ) : (
                            <div className="space-y-3">
                                {(data?.topSellingBooks ?? []).map((book, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-indigo-50 rounded-xl transition">
                                        <div className="flex items-center gap-4">
                                            <span className={`text-xl font-extrabold w-8 text-center ${idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-amber-700' : 'text-gray-300'}`}>
                                                #{idx + 1}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-gray-800 truncate max-w-xs">{book.name}</p>
                                                <p className="text-xs text-gray-500">{book.author}</p>
                                            </div>
                                        </div>
                                        <p className="font-bold text-emerald-600 shrink-0 ml-4">{book.sold.toLocaleString()} cuốn</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        {/* Low Stock */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                            <h3 className="font-bold text-orange-600 mb-4 flex items-center gap-2">
                                <AlertTriangle size={16} /> Sách sắp hết hàng
                            </h3>
                            {loading ? (
                                <div className="space-y-2">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="animate-pulse h-9 bg-gray-100 rounded-lg" />
                                    ))}
                                </div>
                            ) : (data?.lowStockBooks ?? []).length === 0 ? (
                                <p className="text-sm text-gray-400">Không có sách sắp hết</p>
                            ) : (
                                (data?.lowStockBooks ?? []).map((b, i) => (
                                    <div key={i} className="py-2.5 border-b last:border-0 flex justify-between items-center">
                                        <span className="text-sm text-gray-700 truncate max-w-[150px]">{b.name}</span>
                                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg shrink-0 ml-2">
                                            Còn {b.stock}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Hot Categories */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4">🔥 Thể loại hot</h3>
                            {loading ? (
                                <div className="space-y-2">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="animate-pulse h-9 bg-gray-100 rounded-lg" />
                                    ))}
                                </div>
                            ) : (data?.hotCategories ?? []).length === 0 ? (
                                <p className="text-sm text-gray-400">Chưa có dữ liệu</p>
                            ) : (
                                (data?.hotCategories ?? []).map(cat => (
                                    <div key={cat.name} className="flex justify-between items-center py-2.5 border-b last:border-0">
                                        <span className="text-sm text-gray-700">{cat.name}</span>
                                        <span className="text-sm font-bold text-indigo-600">{cat.count.toLocaleString()} sách</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;