import React, { useState } from 'react';
import { Eye, EyeOff, Mail } from 'lucide-react';
import { FaFacebook } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { validateLoginForm } from '../../utils/formValidation';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
    const [serverError, setServerError] = useState<string>('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleChangeUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value);
        if (errors.username) {
            setErrors((prev) => ({ ...prev, username: undefined }));
        }
        setServerError('');
    };

    const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        if (errors.password) {
            setErrors((prev) => ({ ...prev, password: undefined }));
        }
        setServerError('');
    };

    const handleLogin = async (e: React.MouseEvent) => {
        e.preventDefault();

        const newErrors = validateLoginForm({ username, password });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        setServerError('');
        setSuccess('');

        try {
            // 1. Gọi API đăng nhập thực tế
            const response = await axios.post(
                'http://localhost:8080/auth/login',
                {
                    identifier: username,
                    password: password,
                    remember: remember
                },
                { withCredentials: true }
            );


            // 2. Lấy object ApiResponse gốc trả về từ Backend
            const apiResponse = response.data;

            // 3. Móc chuỗi token nằm bên trong mục 'result' theo đúng JSON của bạn
            const accessToken = apiResponse.result.token;

            // 4. Lưu Access Token vào LocalStorage
            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('remember_me', remember ? 'true' : 'false');


            // Merge guest cart with user cart after login
            try {
                await axios.post('http://localhost:8080/cart/merge', {}, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                    withCredentials: true
                });
            } catch (mergeError) {
                console.error("Failed to merge cart:", mergeError);
            }

            // 5. Giải mã token để lấy danh sách Roles
            const decoded: any = jwtDecode(accessToken);
            console.log("Dữ liệu Token giải mã:", decoded);


            const userRoles = decoded.roles || [];
            const isAdmin = userRoles.includes('ROLE_ADMIN');

            // 6. Hiển thị thông báo và điều hướng
            setSuccess('Đăng nhập thành công!');
            setLoading(false);

            setTimeout(() => {
                if (isAdmin) {
                    navigate('/admin');
                } else {
                    navigate('/'); 
                }
            }, 800);

        } catch (error: any) {
            setLoading(false);
            console.error('Lỗi Đăng nhập:', error);

            // Đọc message lỗi từ object ApiResponse của bạn khi đăng nhập thất bại
            if (error.response && error.response.data) {
                setServerError(error.response.data.message || 'Tên đăng nhập hoặc mật khẩu không đúng!');
            } else {
                setServerError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau!');
            }
        }
    };

    // Các hàm social login chỉ để demo giao diện
    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:8080/oauth2/authorization/google';
    };

    const handleFacebookLogin = () => {
        window.location.href = 'http://localhost:8080/oauth2/authorization/facebook';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-semibold text-slate-900 mb-2">
                        Đăng nhập
                    </h1>
                    <p className="text-slate-600">
                        Chưa có tài khoản?{' '}
                        <button
                            onClick={() => navigate('/register')}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Đăng ký
                        </button>
                    </p>
                </div>

                {/* Messages */}
                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
                        {success}
                    </div>
                )}
                {serverError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {serverError}
                    </div>
                )}

                {/* Form */}
                <div className="space-y-5">
                    {/* Username */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Tên đăng nhập hoặc Email
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={handleChangeUsername}
                            placeholder="Nhập tên đăng nhập hoặc email"
                            className={`w-full px-4 py-3 rounded-lg border transition-colors ${errors.username
                                ? 'border-red-400 focus:ring-red-200'
                                : 'border-slate-300 focus:ring-blue-200'
                                } bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2`}
                        />
                        {errors.username && (
                            <p className="text-red-600 text-xs mt-1">{errors.username}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-slate-700">
                                Mật khẩu
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-slate-600 hover:text-slate-900 focus:outline-none"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={handleChangePassword}
                            placeholder="Nhập mật khẩu"
                            className={`w-full px-4 py-3 rounded-lg border transition-colors ${errors.password
                                ? 'border-red-400 focus:ring-red-200'
                                : 'border-slate-300 focus:ring-blue-200'
                                } bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2`}
                        />
                        {errors.password && (
                            <p className="text-red-600 text-xs mt-1">{errors.password}</p>
                        )}
                    </div>

                    {/* Remember & Forgot */}
                    <div className="flex justify-between items-center text-sm">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={remember}
                                onChange={() => setRemember(!remember)}
                                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                            />
                            <span className="text-slate-700">Ghi nhớ đăng nhập</span>
                        </label>
                        <button className="text-blue-600 hover:text-blue-700 font-medium">
                            Quên mật khẩu?
                        </button>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-full transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                    </button>
                </div>

                {/* Divider */}
                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-gradient-to-br from-slate-50 to-slate-100 text-slate-600">
                            Hoặc tiếp tục với
                        </span>
                    </div>
                </div>

                {/* Social Login */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={handleFacebookLogin}
                        className="flex items-center justify-center gap-2 border-2 border-blue-700 text-blue-700 font-semibold py-3 rounded-full hover:bg-blue-50 transition-colors"
                    >
                        <FaFacebook size={20} />
                        <span className="hidden sm:inline">Facebook</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="flex items-center justify-center gap-2 border-2 border-red-600 text-red-600 font-semibold py-3 rounded-full hover:bg-red-50 transition-colors"
                    >
                        <Mail size={20} />
                        <span className="hidden sm:inline">Google</span>
                    </button>


                </div>
            </div>
        </div>
    );
};

export default LoginPage;