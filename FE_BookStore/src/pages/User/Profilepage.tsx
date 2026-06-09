import { useState, useEffect, useRef } from "react";
import { User, Lock, Camera, Trash2 } from "lucide-react";
import axios from "axios";
import api from "../../utils/api";

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = "profile" | "password";

interface ProfileForm {
    fullName: string;
    userName: string;
    phone: string;
    dob: string;
}

interface PasswordForm {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (s: string) =>
    new Date(s).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });

// ─── Input Field ──────────────────────────────────────────────────────────────
function Field({
    label,
    type = "text",
    value,
    onChange,
    placeholder,
    disabled,
    hint,
    suffix,
}: {
    label: string;
    type?: string;
    value: string;
    onChange?: (v: string) => void;
    placeholder?: string;
    disabled?: boolean;
    hint?: React.ReactNode;
    suffix?: React.ReactNode;
}) {
    const [show, setShow] = useState(false);
    const inputType = type === "password" ? (show ? "text" : "password") : type;

    return (
        <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                {label}
            </label>
            <div className="relative">
                <input
                    type={inputType}
                    value={value}
                    onChange={(e) => onChange?.(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none
            ${disabled
                            ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
                            : "bg-white border-slate-200 text-slate-700 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                        }
            ${suffix || type === "password" ? "pr-12" : ""}
          `}
                />
                {type === "password" && (
                    <button
                        type="button"
                        onClick={() => setShow((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                        {show ? "Ẩn" : "Hiện"}
                    </button>
                )}
                {suffix && type !== "password" && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>
                )}
            </div>
            {hint && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}
        </div>
    );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type }: { message: string; type: "success" | "error" }) {
    return (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium
      ${type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-600"}`}>
            <span>{type === "success" ? "✅" : "❌"}</span>
            {message}
        </div>
    );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({
    name,
    avatarUrl,
    onUpload,
    onDelete,
    uploading
}: {
    name: string;
    avatarUrl?: string;
    onUpload: (file: File) => void;
    onDelete: () => void;
    uploading: boolean;
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const initials = name ? name.trim().split(" ").slice(-2).map((w) => w[0]).join("").toUpperCase() : "U";

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onUpload(file);
        }
    };

    return (
        <div className="relative flex flex-col items-center">
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg overflow-hidden group">
                {uploading ? (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                        <svg className="w-6 h-6 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                    </div>
                ) : null}
                {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                    initials
                )}
                
                {/* Overlay khi hover để cập nhật ảnh */}
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-semibold transition-opacity duration-200"
                >
                    <Camera className="w-4 h-4 mb-0.5" />
                    Thay đổi
                </button>
            </div>
            
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />
            
            {avatarUrl && !uploading && (
                <button
                    type="button"
                    onClick={onDelete}
                    className="mt-2 text-xs font-semibold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"
                >
                    <Trash2 className="w-3.5 h-3.5" /> Xóa ảnh
                </button>
            )}
        </div>
    );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────
function ProfileTab({
    profile,
    onRefresh,
    setToast
}: {
    profile: any;
    onRefresh: () => void;
    setToast: (t: { message: string; type: "success" | "error" } | null) => void;
}) {
    const [form, setForm] = useState<ProfileForm>({
        fullName: profile?.fullName || "",
        userName: profile?.userName || "",
        phone: profile?.phone || "",
        dob: profile?.dob || "",
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (profile) {
            setForm({
                fullName: profile.fullName || "",
                userName: profile.userName || "",
                phone: profile.phone || "",
                dob: profile.dob || "",
            });
        }
    }, [profile]);

    const set = (k: keyof ProfileForm) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await api.put("/users/profile/update", {
                fullName: form.fullName,
                userName: form.userName,
                phone: form.phone,
                dob: form.dob || null,
                email: profile.email
            });
            sessionStorage.setItem("profile_toast_success", "Cập nhật thông tin thành công!");
            window.location.reload();
        } catch (error: any) {
            console.error("Lỗi khi cập nhật hồ sơ:", error);
            const errMsg = error.response?.data?.message || "Cập nhật thông tin thất bại!";
            setToast({ message: errMsg, type: "error" });
            setTimeout(() => setToast(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="space-y-5">
                {/* Email - readonly */}
                <Field
                    label="Email"
                    value={profile.email}
                    disabled
                    suffix={
                        profile.isEmailVerified ? (
                            <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                                Đã xác thực
                            </span>
                        ) : (
                            <span className="text-xs font-semibold text-amber-500">Chưa xác thực</span>
                        )
                    }
                    hint="Email không thể thay đổi sau khi đăng ký."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label="Họ và tên" value={form.fullName} onChange={set("fullName")} placeholder="Nhập họ và tên" />
                    <Field
                        label="Tên người dùng"
                        value={form.userName}
                        disabled
                        placeholder="username"
                        hint="Tên người dùng không thể thay đổi."
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field
                        label="Số điện thoại"
                        value={form.phone}
                        onChange={set("phone")}
                        placeholder="09xxxxxxxx"
                        suffix={
                            profile.isPhoneVerified ? (
                                <span className="text-xs font-semibold text-emerald-500">✓</span>
                            ) : (
                                <button className="text-xs font-semibold text-indigo-500 hover:underline whitespace-nowrap">
                                    Xác thực
                                </button>
                            )
                        }
                    />
                    <Field
                        label="Ngày sinh"
                        type="date"
                        value={form.dob}
                        onChange={set("dob")}
                    />
                </div>

                {/* Account info */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-xs text-slate-400 mb-0.5">Trạng thái tài khoản</p>
                        <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            {profile.status === "ACTIVE" ? "Hoạt động" : "Bị khóa"}
                        </span>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 mb-0.5">Đăng nhập gần nhất</p>
                        <p className="font-medium text-slate-600">{profile.lastLoginAt ? fmtDate(profile.lastLoginAt) : "Chưa đăng nhập"}</p>
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-semibold rounded-xl transition-colors"
                    >
                        {loading ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                        ) : null}
                        {loading ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                </div>
            </div>
        </>
    );
}

// ─── Password Tab ─────────────────────────────────────────────────────────────
function PasswordTab({
    setToast
}: {
    setToast: (t: { message: string; type: "success" | "error" } | null) => void;
}) {
    const [form, setForm] = useState<PasswordForm>({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [loading, setLoading] = useState(false);

    const set = (k: keyof PasswordForm) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

    const strength = (pw: string) => {
        let s = 0;
        if (pw.length >= 8) s++;
        if (/[A-Z]/.test(pw)) s++;
        if (/[0-9]/.test(pw)) s++;
        if (/[^A-Za-z0-9]/.test(pw)) s++;
        return s;
    };

    const pw = form.newPassword;
    const str = strength(pw);
    const strLabel = ["", "Yếu", "Trung bình", "Khá", "Mạnh"][str];
    const strColor = ["", "bg-red-400", "bg-amber-400", "bg-blue-400", "bg-emerald-400"][str];

    const handleSubmit = async () => {
        if (form.newPassword !== form.confirmPassword) {
            setToast({ message: "Mật khẩu xác nhận không khớp!", type: "error" });
            setTimeout(() => setToast(null), 3000);
            return;
        }
        if (str < 2) {
            setToast({ message: "Mật khẩu quá yếu, vui lòng chọn mật khẩu mạnh hơn.", type: "error" });
            setTimeout(() => setToast(null), 3000);
            return;
        }
        setLoading(true);
        try {
            await api.put("/users/profile/change-password", {
                oldPassword: form.currentPassword,
                newPassword: form.newPassword,
                confirmPassword: form.confirmPassword
            });
            setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setToast({ message: "Đổi mật khẩu thành công!", type: "success" });
            setTimeout(() => setToast(null), 3000);
        } catch (error: any) {
            console.error("Lỗi khi thay đổi mật khẩu:", error);
            const errMsg = error.response?.data?.message || "Đổi mật khẩu thất bại!";
            setToast({ message: errMsg, type: "error" });
            setTimeout(() => setToast(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="space-y-5">
                <Field
                    label="Mật khẩu hiện tại"
                    type="password"
                    value={form.currentPassword}
                    onChange={set("currentPassword")}
                    placeholder="Nhập mật khẩu hiện tại"
                />

                <div>
                    <Field
                        label="Mật khẩu mới"
                        type="password"
                        value={form.newPassword}
                        onChange={set("newPassword")}
                        placeholder="Tối thiểu 8 ký tự"
                    />
                    {pw.length > 0 && (
                        <div className="mt-2 space-y-1">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= str ? strColor : "bg-slate-100"}`} />
                                ))}
                            </div>
                            <p className="text-xs text-slate-400">
                                Độ mạnh: <span className="font-semibold text-slate-600">{strLabel}</span>
                            </p>
                        </div>
                    )}
                </div>

                <Field
                    label="Xác nhận mật khẩu mới"
                    type="password"
                    value={form.confirmPassword}
                    onChange={set("confirmPassword")}
                    placeholder="Nhập lại mật khẩu mới"
                    hint={
                        form.confirmPassword.length > 0 && form.confirmPassword !== form.newPassword
                            ? <span className="text-red-500">Mật khẩu không khớp</span>
                            : undefined
                    }
                />

                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-700 space-y-1">
                    <p className="font-semibold">Lưu ý khi đặt mật khẩu:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-amber-600 text-xs">
                        <li>Tối thiểu 8 ký tự</li>
                        <li>Nên có chữ hoa, chữ thường, số và ký tự đặc biệt</li>
                        <li>Không dùng thông tin cá nhân dễ đoán</li>
                    </ul>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !form.currentPassword || !form.newPassword || !form.confirmPassword}
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-semibold rounded-xl transition-colors"
                    >
                        {loading ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                        ) : null}
                        {loading ? "Đang lưu..." : "Đổi mật khẩu"}
                    </button>
                </div>
            </div>
        </>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
    const [tab, setTab] = useState<Tab>("profile");
    const [profile, setProfile] = useState<any>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const fetchProfile = async () => {
        try {
            const res = await api.get("/users/profile");
            setProfile(res.data.result);
        } catch (error) {
            console.error("Lỗi khi tải thông tin cá nhân:", error);
        } finally {
            setLoadingProfile(false);
        }
    };

    useEffect(() => {
        fetchProfile();
        const successMsg = sessionStorage.getItem("profile_toast_success");
        if (successMsg) {
            setToast({ message: successMsg, type: "success" });
            sessionStorage.removeItem("profile_toast_success");
            setTimeout(() => setToast(null), 3000);
        }
    }, []);

    const handleUploadAvatar = async (file: File) => {
        if (file.size > 2 * 1024 * 1024) {
            setToast({ message: "Ảnh không được vượt quá 2MB", type: "error" });
            setTimeout(() => setToast(null), 3000);
            return;
        }

        setUploadingAvatar(true);
        try {
            // 1. Lấy chữ ký số từ backend
            const sigRes = await api.get("/users/profile/avatar/signature");
            const { signature, timestamp, apiKey, cloudName, folder } = sigRes.data.result;

            // 2. Upload lên Cloudinary bằng signature
            const formData = new FormData();
            formData.append("file", file);
            formData.append("api_key", apiKey);
            formData.append("timestamp", timestamp.toString());
            formData.append("signature", signature);
            formData.append("folder", folder);

            const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
            const clRes = await axios.post(cloudinaryUrl, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            const secureUrl = clRes.data.secure_url;

            // 3. Cập nhật avatar trên backend
            await api.put("/users/profile/avatar", { avatarUrl: secureUrl });
            sessionStorage.setItem("profile_toast_success", "Cập nhật ảnh đại diện thành công!");
            window.location.reload();
        } catch (error: any) {
            console.error("Lỗi upload avatar:", error);
            const errMsg = error.response?.data?.message || "Tải ảnh đại diện lên thất bại!";
            setToast({ message: errMsg, type: "error" });
            setTimeout(() => setToast(null), 3000);
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleDeleteAvatar = async () => {
        setUploadingAvatar(true);
        try {
            await api.put("/users/profile/avatar", { avatarUrl: "" });
            sessionStorage.setItem("profile_toast_success", "Xóa ảnh đại diện thành công!");
            window.location.reload();
        } catch (error: any) {
            console.error("Lỗi xóa avatar:", error);
            const errMsg = error.response?.data?.message || "Xóa ảnh đại diện thất bại!";
            setToast({ message: errMsg, type: "error" });
            setTimeout(() => setToast(null), 3000);
        } finally {
            setUploadingAvatar(false);
        }
    };

    if (loadingProfile) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <svg className="w-8 h-8 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <p className="text-sm text-slate-500 font-medium">Đang tải thông tin cá nhân...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <p className="text-red-500 font-semibold">Không thể tải thông tin hồ sơ. Vui lòng đăng nhập lại!</p>
            </div>
        );
    }

    const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
        { key: "profile", label: "Thông tin cá nhân", icon: User },
        { key: "password", label: "Đổi mật khẩu", icon: Lock },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans pt-24 pb-16">
            <div className="max-w-2xl mx-auto px-4">

                {/* Header card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-5 flex items-center gap-5">
                    <Avatar 
                        name={profile.fullName || profile.userName || "User"} 
                        avatarUrl={profile.avatarUrl} 
                        onUpload={handleUploadAvatar}
                        onDelete={handleDeleteAvatar}
                        uploading={uploadingAvatar}
                    />
                    <div>
                        <h1 className="text-lg font-bold text-slate-800">{profile.fullName || "Chưa thiết lập họ tên"}</h1>
                        <p className="text-sm text-slate-400">{profile.email}</p>
                        <p className="text-xs text-slate-300 mt-0.5">@{profile.userName}</p>
                    </div>
                </div>

                {/* Tab bar */}
                <div className="flex gap-1 bg-white border border-slate-100 rounded-2xl p-1 shadow-sm mb-5">
                    {tabs.map((t) => {
                        const Icon = t.icon;
                        return (
                            <button
                                key={t.key}
                                onClick={() => setTab(t.key)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all
                ${tab === t.key
                                        ? "bg-indigo-50 text-indigo-700 shadow-sm"
                                        : "text-slate-500 hover:text-slate-700"}`}
                            >
                                <Icon className="w-4 h-4" />
                                {t.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    {tab === "profile" && (
                        <ProfileTab 
                            profile={profile} 
                            onRefresh={fetchProfile} 
                            setToast={setToast}
                        />
                    )}
                    {tab === "password" && (
                        <PasswordTab 
                            setToast={setToast}
                        />
                    )}
                </div>
            </div>
            
            {toast && <Toast {...toast} />}
        </div>
    );
}