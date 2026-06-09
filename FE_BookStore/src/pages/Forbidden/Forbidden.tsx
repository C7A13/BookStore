import { Home, LogIn, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ForbiddenPage() {
    const navigate = useNavigate();

    return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
            <section className="w-full max-w-3xl text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500 ring-8 ring-red-100">
                    <ShieldAlert className="h-10 w-10" />
                </div>

                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-500">
                    403 Forbidden
                </p>
                <h1 className="mt-3 text-4xl font-bold text-slate-900 sm:text-5xl">
                    Bạn không có quyền truy cập
                </h1>
                <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600">
                    Tài khoản hiện tại không được phép xem trang này. Vui lòng quay lại trang trước hoặc trở về trang chủ.
                </p>

                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:w-auto"
                    >
                        <LogIn className="h-4 w-4" />
                        Đăng nhập
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
                    >
                        <Home className="h-4 w-4" />
                        Về trang chủ
                    </button>
                </div>
            </section>
        </main>
    );
}
