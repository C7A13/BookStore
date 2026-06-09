import React, { useState, useEffect } from "react";
import { User, Lock, Key, Save } from "lucide-react";
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
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

// ─── Input Field Component ──────────────────────────────────────────────────
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
        <div className="flex flex-col gap-1.5 w-full">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-semibold"
                    >
                        {show ? "Ẩn" : "Hiện"}
                    </button>
                )}
                {suffix && type !== "password" && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>
                )}
            </div>
            {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
        </div>
    );
}

// ─── Toast Component ────────────────────────────────────────────────────────
function Toast({ message, type }: { message: string; type: "success" | "error" }) {
    return (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium
      ${type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-600"}`}>
            <span>{type === "success" ? "✅" : "❌"}</span>
            {message}
        </div>
    );
}

// ─── Main Admin Profile Page Component ──────────────────────────────────────
export default function AdminProfile() {
    const [tab, setTab] = useState<Tab>("profile");
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const [profileEmail, setProfileEmail] = useState("");
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);
    const [lastLogin, setLastLogin] = useState("");

    const [profileForm, setProfileForm] = useState<ProfileForm>({
        fullName: "",
        userName: "",
        phone: "",
        dob: "",
    });

    const [passwordForm, setPasswordForm] = useState<PasswordForm>({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    // Fetch profile data on mount
    const fetchProfile = () => {
        api.get("/users/profile")
            .then((res) => {
                const data = res.data.result;
                setProfileEmail(data.email);
                setIsEmailVerified(data.isEmailVerified || data.emailVerified || false);
                setIsPhoneVerified(data.isPhoneVerified || data.phoneVerified || false);
                setLastLogin(data.lastLoginAt || "");
                setProfileForm({
                    fullName: data.fullName || "",
                    userName: data.userName || "",
                    phone: data.phone || "",
                    dob: data.dob || "",
                });
            })
            .catch((err) => {
                console.error("Lỗi lấy thông tin admin:", err);
                setToast({ message: "Không thể lấy thông tin hồ sơ!", type: "error" });
                setTimeout(() => setToast(null), 3000);
            });
    };

    useEffect(() => {
        fetchProfile();
        const successMsg = sessionStorage.getItem("admin_profile_toast_success");
        if (successMsg) {
            setToast({ message: successMsg, type: "success" });
            sessionStorage.removeItem("admin_profile_toast_success");
            setTimeout(() => setToast(null), 3000);
        }
    }, []);

    const setProfileVal = (k: keyof ProfileForm) => (v: string) =>
        setProfileForm((p) => ({ ...p, [k]: v }));

    const setPasswordVal = (k: keyof PasswordForm) => (v: string) =>
        setPasswordForm((p) => ({ ...p, [k]: v }));

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profileForm.fullName.trim() || !profileForm.userName.trim()) {
            setToast({ message: "Họ tên và Tên người dùng là bắt buộc!", type: "error" });
            setTimeout(() => setToast(null), 3000);
            return;
        }

        setLoading(true);
        try {
            await api.put("/users/profile/update", profileForm);
            sessionStorage.setItem("admin_profile_toast_success", "Cập nhật hồ sơ thành công!");
            window.location.reload();
        } catch (err: any) {
            console.error("Lỗi cập nhật hồ sơ:", err);
            const msg = err.response?.data?.message || "Cập nhật hồ sơ thất bại!";
            setToast({ message: msg, type: "error" });
            setLoading(false);
            setTimeout(() => setToast(null), 3000);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            setToast({ message: "Vui lòng nhập đầy đủ mật khẩu!", type: "error" });
            setTimeout(() => setToast(null), 3000);
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setToast({ message: "Mật khẩu xác nhận không khớp!", type: "error" });
            setTimeout(() => setToast(null), 3000);
            return;
        }

        if (passwordForm.newPassword.length < 8) {
            setToast({ message: "Mật khẩu mới phải dài tối thiểu 8 ký tự!", type: "error" });
            setTimeout(() => setToast(null), 3000);
            return;
        }

        setLoading(true);
        try {
            await api.put("/users/profile/change-password", {
                oldPassword: passwordForm.oldPassword,
                newPassword: passwordForm.newPassword,
                confirmPassword: passwordForm.confirmPassword,
            });
            setToast({ message: "Đổi mật khẩu thành công!", type: "success" });
            setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err: any) {
            console.error("Lỗi đổi mật khẩu:", err);
            const msg = err.response?.data?.message || "Đổi mật khẩu thất bại!";
            setToast({ message: msg, type: "error" });
        } finally {
            setLoading(false);
            setTimeout(() => setToast(null), 3000);
        }
    };

    const formatDateTime = (s: string) => {
        if (!s) return "—";
        return new Date(s).toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-6">
            <div className="max-w-2xl mx-auto">
                {/* Title */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-800">Hồ sơ cá nhân</h1>
                    <p className="text-sm text-slate-500 mt-1">Quản lý và cập nhật thông tin cá nhân của bạn</p>
                </div>

                {/* Tab switcher */}
                <div className="flex gap-1 bg-white border border-slate-200 rounded-2xl p-1 shadow-sm mb-5">
                    <button
                        onClick={() => setTab("profile")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all
              ${tab === "profile"
                                ? "bg-indigo-50 text-indigo-700 shadow-sm font-semibold"
                                : "text-slate-500 hover:text-slate-700"}`}
                    >
                        <User className="w-4 h-4" />
                        Thông tin cá nhân
                    </button>
                    <button
                        onClick={() => setTab("password")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all
              ${tab === "password"
                                ? "bg-indigo-50 text-indigo-700 shadow-sm font-semibold"
                                : "text-slate-500 hover:text-slate-700"}`}
                    >
                        <Lock className="w-4 h-4" />
                        Đổi mật khẩu
                    </button>
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    {tab === "profile" ? (
                        <form onSubmit={handleProfileSubmit} className="space-y-5">
                            {/* Email - Read-only */}
                            <Field
                                label="Email"
                                value={profileEmail}
                                disabled
                                suffix={
                                    isEmailVerified ? (
                                        <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                                            Đã xác thực
                                        </span>
                                    ) : (
                                        <span className="text-xs font-semibold text-amber-500">Chưa xác thực</span>
                                    )
                                }
                                hint="Email tài khoản quản trị không thể chỉnh sửa."
                            />

                            {/* Full Name & Username */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <Field
                                    label="Họ và tên *"
                                    value={profileForm.fullName}
                                    onChange={setProfileVal("fullName")}
                                    placeholder="Nhập họ và tên"
                                />
                                <Field
                                    label="Tên đăng nhập (Username) *"
                                    value={profileForm.userName}
                                    onChange={setProfileVal("userName")}
                                    placeholder="username"
                                    hint="Chỉ viết liền, chữ thường hoặc số."
                                />
                            </div>

                            {/* Phone & Birthday */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <Field
                                    label="Số điện thoại"
                                    value={profileForm.phone}
                                    onChange={setProfileVal("phone")}
                                    placeholder="09xxxxxxxx"
                                    suffix={
                                        isPhoneVerified ? (
                                            <span className="text-xs font-semibold text-emerald-500">✓ Đã xác thực</span>
                                        ) : null
                                    }
                                />
                                <Field
                                    label="Ngày sinh"
                                    type="date"
                                    value={profileForm.dob}
                                    onChange={setProfileVal("dob")}
                                />
                            </div>

                            {/* Log Info */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 grid grid-cols-2 gap-4 text-sm mt-2">
                                <div>
                                    <p className="text-xs text-slate-400 mb-0.5">Quyền truy cập</p>
                                    <span className="inline-flex items-center gap-1.5 font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md text-xs">
                                        ADMINISTRATOR
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 mb-0.5">Đăng nhập cuối cùng</p>
                                    <p className="font-semibold text-slate-600 text-xs">{formatDateTime(lastLogin)}</p>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
                                >
                                    <Save className="w-4 h-4" />
                                    {loading ? "Đang lưu..." : "Lưu thay đổi"}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handlePasswordSubmit} className="space-y-5">
                            <Field
                                label="Mật khẩu hiện tại *"
                                type="password"
                                value={passwordForm.oldPassword}
                                onChange={setPasswordVal("oldPassword")}
                                placeholder="Nhập mật khẩu cũ của bạn"
                            />

                            <Field
                                label="Mật khẩu mới *"
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={setPasswordVal("newPassword")}
                                placeholder="Tối thiểu 8 ký tự"
                            />

                            <Field
                                label="Xác nhận mật khẩu mới *"
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={setPasswordVal("confirmPassword")}
                                placeholder="Nhập lại mật khẩu mới"
                                hint={
                                    passwordForm.confirmPassword.length > 0 &&
                                        passwordForm.confirmPassword !== passwordForm.newPassword ? (
                                        <span className="text-red-500 font-semibold">Mật khẩu xác nhận chưa trùng khớp</span>
                                    ) : undefined
                                }
                            />

                            {/* Info list */}
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-700 space-y-1.5">
                                <p className="font-semibold flex items-center gap-1.5">
                                    ⚠️ Nguyên tắc đặt mật khẩu:
                                </p>
                                <ul className="list-disc list-inside space-y-0.5 text-amber-600 text-xs pl-2">
                                    <li>Tối thiểu từ 8 ký tự trở lên</li>
                                    <li>Nên chứa chữ hoa, chữ thường và chữ số</li>
                                    <li>Tránh sử dụng lại các thông tin cá nhân như ngày sinh, số điện thoại</li>
                                </ul>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
                                >
                                    <Key className="w-4 h-4" />
                                    {loading ? "Đang đổi..." : "Cập nhật mật khẩu"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {toast && <Toast message={toast.message} type={toast.type} />}
        </div>
    );
}
