import React, { useState, useEffect, useCallback } from "react";
import { Search, Trash2, X } from "lucide-react";
import api from "../../utils/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Address {
    id: number;
    recipientName: string;
    recipientPhone: string;
    province: string;
    ward: string;
    detailAddress: string;
    isDefault: boolean;
    userId: number;
    userName: string;
    userEmail: string;
    createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (s: string) =>
    new Date(s).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteModal({ address, onConfirm, onCancel }: {
    address: Address;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                        <Trash2 className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                        <p className="font-bold text-slate-800">Xoá địa chỉ</p>
                        <p className="text-xs text-slate-400">Hành động này không thể hoàn tác</p>
                    </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 mb-5 text-sm text-slate-600 space-y-1">
                    <p><span className="text-slate-400">Người nhận:</span> <strong>{address.recipientName}</strong></p>
                    <p><span className="text-slate-400">Địa chỉ:</span> {address.detailAddress}, {address.ward}, {address.province}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        Huỷ
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-sm font-medium text-white transition-colors"
                    >
                        Xoá địa chỉ
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function AddressDetailPanel({ address, onClose, onDelete }: {
    address: Address;
    onClose: () => void;
    onDelete: (address: Address) => void;
}) {
    return (
        <div className="fixed inset-0 z-40 flex">
            <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            <div className="w-full max-w-md bg-white shadow-2xl flex flex-col overflow-hidden">
                {/* header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                    <div>
                        <p className="text-xs text-slate-400 font-semibold tracking-widest uppercase">Chi tiết địa chỉ</p>
                        <h2 className="font-bold text-slate-800">#{address.id}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                    {/* default badge */}
                    {address.isDefault && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Địa chỉ mặc định
                        </span>
                    )}

                    {/* recipient */}
                    <InfoSection title="Người nhận">
                        <InfoRow label="Họ tên" value={address.recipientName} />
                        <InfoRow label="Số điện thoại" value={address.recipientPhone} />
                    </InfoSection>

                    {/* address */}
                    <InfoSection title="Địa chỉ">
                        <InfoRow label="Chi tiết" value={address.detailAddress} />
                        <InfoRow label="Phường / Xã" value={address.ward} />
                        <InfoRow label="Tỉnh / Thành phố" value={address.province} />
                    </InfoSection>

                    {/* owner */}
                    <InfoSection title="Người dùng">
                        <InfoRow label="Tên" value={address.userName} />
                        <InfoRow label="Email" value={address.userEmail} />
                        <InfoRow label="ID" value={`#${address.userId}`} />
                    </InfoSection>

                    {/* meta */}
                    <InfoSection title="Thông tin khác">
                        <InfoRow label="Ngày tạo" value={fmtDate(address.createdAt)} />
                    </InfoSection>
                </div>

                {/* footer */}
                <div className="px-6 py-4 border-t border-slate-100">
                    <button
                        onClick={() => onDelete(address)}
                        className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors"
                    >
                        <span className="flex items-center justify-center gap-2">
                            <Trash2 className="w-4 h-4" />
                            Xoá địa chỉ này
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}

function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{title}</p>
            <div className="bg-slate-50 rounded-xl p-4 space-y-2">{children}</div>
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between text-sm">
            <span className="text-slate-400">{label}</span>
            <span className="font-medium text-slate-700 text-right max-w-[60%]">{value}</span>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AddressManagement() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [search, setSearch] = useState("");
    const [filterDefault, setFilterDefault] = useState<"ALL" | "DEFAULT" | "OTHER">("ALL");
    const [filterProvince, setFilterProvince] = useState("ALL");
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Address | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchAddresses = useCallback(() => {
        setLoading(true);
        api.get("/admin/addresses", {
            params: {
                page: 1,
                size: 10000
            }
        })
            .then((res) => {
                const list = res.data.result.data || [];
                const mapped: Address[] = list.map((a: any) => ({
                    id: a.id,
                    recipientName: a.recipientName,
                    recipientPhone: a.recipientPhone,
                    province: a.province,
                    ward: a.ward,
                    detailAddress: a.detailAddress,
                    isDefault: a.isDefault || false,
                    userId: a.userId,
                    userName: a.userName || `User #${a.userId}`,
                    userEmail: a.userEmail || "",
                    createdAt: a.createdAt,
                }));
                setAddresses(mapped);
            })
            .catch((err) => {
                console.error("Lỗi lấy danh sách địa chỉ:", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses]);

    const provinces = ["ALL", ...Array.from(new Set(addresses.map((a) => a.province)))];

    const filtered = addresses.filter((a) => {
        const q = search.toLowerCase();
        const matchSearch =
            !q ||
            a.recipientName.toLowerCase().includes(q) ||
            a.recipientPhone.includes(q) ||
            a.userName.toLowerCase().includes(q) ||
            a.userEmail.toLowerCase().includes(q) ||
            a.province.toLowerCase().includes(q) ||
            a.detailAddress.toLowerCase().includes(q);
        const matchDefault =
            filterDefault === "ALL" ||
            (filterDefault === "DEFAULT" && a.isDefault) ||
            (filterDefault === "OTHER" && !a.isDefault);
        const matchProvince = filterProvince === "ALL" || a.province === filterProvince;
        return matchSearch && matchDefault && matchProvince;
    });

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/admin/addresses/${id}`);
            setAddresses((prev) => prev.filter((a) => a.id !== id));
            setDeleteTarget(null);
            if (selectedAddress?.id === id) setSelectedAddress(null);
        } catch (err) {
            console.error("Không thể xoá địa chỉ:", err);
            alert("Lỗi khi xoá địa chỉ!");
        }
    };

    const requestDelete = (address: Address) => {
        setSelectedAddress(null);
        setDeleteTarget(address);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <div className="p-6 space-y-5 max-w-7xl mx-auto">
                {/* header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Quản lý địa chỉ</h1>
                        <p className="text-sm text-slate-400 mt-0.5">{filtered.length} địa chỉ</p>
                    </div>
                </div>

                {/* mini stats */}
                <div className="grid grid-cols-3 gap-3">
                    <MiniStat label="Tổng địa chỉ" value={addresses.length} color="text-indigo-600" />
                    <MiniStat label="Địa chỉ mặc định" value={addresses.filter((a) => a.isDefault).length} color="text-emerald-600" />
                    <MiniStat label="Người dùng" value={new Set(addresses.map((a) => a.userId)).size} color="text-violet-600" />
                </div>

                {/* toolbar */}
                <div className="flex gap-3 flex-wrap">
                    <div className="relative flex-1 min-w-48">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm theo tên, SĐT, email, địa chỉ..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder-slate-300"
                        />
                    </div>
                    <select
                        value={filterDefault}
                        onChange={(e) => setFilterDefault(e.target.value as "ALL" | "DEFAULT" | "OTHER")}
                        className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 text-slate-700"
                    >
                        <option value="ALL">Tất cả loại</option>
                        <option value="DEFAULT">Mặc định</option>
                        <option value="OTHER">Phụ</option>
                    </select>
                    <select
                        value={filterProvince}
                        onChange={(e) => setFilterProvince(e.target.value)}
                        className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 text-slate-700"
                    >
                        {provinces.map((p) => (
                            <option key={p} value={p}>{p === "ALL" ? "Tất cả tỉnh/thành" : p}</option>
                        ))}
                    </select>
                </div>

                {/* table */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                {["#", "Người nhận", "Địa chỉ", "Tỉnh/TP", "Người dùng", "Loại", "Ngày tạo", ""].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-indigo-600 text-sm font-semibold">Đang tải dữ liệu...</td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-slate-400 text-sm">Không tìm thấy địa chỉ nào</td>
                                </tr>
                            ) : (
                                filtered.map((addr) => (
                                    <tr key={addr.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-4 py-3 text-xs text-slate-400 font-mono">#{addr.id}</td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-slate-700">{addr.recipientName}</p>
                                            <p className="text-slate-400 text-xs">{addr.recipientPhone}</p>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 max-w-[200px]">
                                            <p className="truncate">{addr.detailAddress}</p>
                                            <p className="text-xs text-slate-400 truncate">{addr.ward}</p>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 text-xs whitespace-nowrap">{addr.province}</td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-slate-700">{addr.userName}</p>
                                            <p className="text-slate-400 text-xs">{addr.userEmail}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            {addr.isDefault ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                    Mặc định
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-500">
                                                    Phụ
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{fmtDate(addr.createdAt)}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setSelectedAddress(addr)}
                                                    className="text-xs font-semibold text-indigo-600 hover:underline"
                                                >
                                                    Chi tiết
                                                </button>
                                                <span className="text-slate-200">|</span>
                                                <button
                                                    onClick={() => requestDelete(addr)}
                                                    className="text-xs font-semibold text-red-500 hover:underline"
                                                >
                                                    Xoá
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Panel */}
            {selectedAddress && (
                <AddressDetailPanel
                    address={selectedAddress}
                    onClose={() => setSelectedAddress(null)}
                    onDelete={requestDelete}
                />
            )}

            {/* Delete Modal */}
            {deleteTarget && (
                <DeleteModal
                    address={deleteTarget}
                    onConfirm={() => handleDelete(deleteTarget.id)}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </div>
    );
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm">
            <p className="text-xs text-slate-400">{label}</p>
            <p className={`text-lg font-bold tabular-nums ${color}`}>{value}</p>
        </div>
    );
}