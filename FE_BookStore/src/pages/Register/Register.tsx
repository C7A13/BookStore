import React, { useState } from 'react';
import { Eye, EyeOff, Mail } from 'lucide-react';
import { FaFacebook } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { validateRegisterForm } from '../../utils/formValidation';
import axios from 'axios';

const RegisterPage: React.FC = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '', 
        dateOfBirth: '',// 1. 📍 THÊM TRƯỜNG NHẬP LẠI MẬT KHẨU
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // 2. 📍 Trạng thái ẩn/hiện cho ô nhập lại mật khẩu
    const [success, setSuccess] = useState('');
    const [serverError, setServerError] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
        setServerError('');
    };

    const handleRegister = async (e: React.MouseEvent) => {
        e.preventDefault();

        const newErrors = validateRegisterForm(formData);

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        setServerError('');

        try {
            await axios.post('http://localhost:8080/auth/register', {
                fullName: formData.fullName,
                userName: formData.username,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                dateOfBirth: formData.dateOfBirth
                // ⚠️ Không cần gửi confirmPassword lên Backend, chỉ cần check khớp ở Frontend là đủ.
            });

            setSuccess('Đăng ký tài khoản thành công! Một email xác thực đã được gửi đến hòm thư của bạn.');
            
            setFormData({
                fullName: '',
                username: '',
                email: '',
                phone: '',
                password: '',
                confirmPassword: '', // Reset trường này luôn
                dateOfBirth: '',
            });

            setTimeout(() => {
                navigate('/login');
            }, 5000);

        } catch (error: any) {
            console.error("Lỗi đăng ký:", error);
            const backendMessage = error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
            setServerError(backendMessage);
        } finally {
            setLoading(false);
        }    
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4 py-8">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-semibold text-slate-900 mb-2">Tạo tài khoản</h1>
                    <p className="text-slate-600">
                        Đã có tài khoản?{' '}
                        <button onClick={() => navigate('/login')} className="text-blue-600 hover:text-blue-700 font-medium">
                            Đăng nhập
                        </button>
                    </p>
                </div>

                {/* Messages */}
                {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">{success}</div>}
                {serverError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">{serverError}</div>}

                {/* Form */}
                <div className="space-y-5">
                    {/* ... Các trường Full Name, Username, Email, Phone, Date of Birth giữ nguyên ... */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Họ và tên</label>
                            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Họ và tên" className={`w-full px-4 py-3 rounded-lg border ${errors.fullName ? 'border-red-400 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-200'} bg-white text-slate-900 focus:outline-none focus:ring-2`} />
                            {errors.fullName && <p className="text-red-600 text-xs mt-1">{errors.fullName}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Tên đăng nhập</label>
                            <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Tên đăng nhập" className={`w-full px-4 py-3 rounded-lg border ${errors.username ? 'border-red-400 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-200'} bg-white text-slate-900 focus:outline-none focus:ring-2`} />
                            {errors.username && <p className="text-red-600 text-xs mt-1">{errors.username}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Email của bạn là gì?</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Nhập địa chỉ email" className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-400 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-200'} bg-white text-slate-900 focus:outline-none focus:ring-2`} />
                        {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Số điện thoại</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Nhập số điện thoại" className={`w-full px-4 py-3 rounded-lg border ${errors.phone ? 'border-red-400 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-200'} bg-white text-slate-900 focus:outline-none focus:ring-2`} />
                        {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Ngày sinh</label>
                        <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className={`w-full px-4 py-3 rounded-lg border ${errors.dateOfBirth ? 'border-red-400 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-200'} bg-white text-slate-900 focus:outline-none focus:ring-2`} />
                        {errors.dateOfBirth && <p className="text-red-600 text-xs mt-1">{errors.dateOfBirth}</p>}
                    </div>

                    {/* Mật khẩu */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-slate-700">Tạo mật khẩu</label>
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-600 hover:text-slate-900 focus:outline-none">
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Nhập mật khẩu" className={`w-full px-4 py-3 rounded-lg border ${errors.password ? 'border-red-400 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-200'} bg-white text-slate-900 focus:outline-none focus:ring-2`} />
                        {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
                    </div>

                    {/* 3. 📍 THÊM GIAO DIỆN KHU VỰC: NHẬP LẠI MẬT KHẨU */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-slate-700">Nhập lại mật khẩu</label>
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-slate-600 hover:text-slate-900 focus:outline-none">
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <input 
                            type={showConfirmPassword ? 'text' : 'password'} 
                            name="confirmPassword" 
                            value={formData.confirmPassword} 
                            onChange={handleChange} 
                            placeholder="Xác nhận lại mật khẩu" 
                            className={`w-full px-4 py-3 rounded-lg border transition-colors ${errors.confirmPassword
                                ? 'border-red-400 focus:ring-red-200'
                                : 'border-slate-300 focus:ring-blue-200'
                            } bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2`} 
                        />
                        {errors.confirmPassword && (
                            <p className="text-red-600 text-xs mt-1">{errors.confirmPassword}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button onClick={handleRegister} disabled={loading} className={`w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-full transition-colors cursor-pointer ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {loading ? 'Đang xử lý...' : 'Tạo tài khoản'}
                    </button>
                </div>

                {/* Divider & Social Login */}
                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-300"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-gradient-to-br from-slate-50 to-slate-100 text-slate-600">Hoặc tiếp tục với</span></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <button type="button" className="flex items-center justify-center gap-2 border-2 border-slate-800 text-slate-800 font-semibold py-3 rounded-full hover:bg-slate-50"><FaFacebook size={20} /><span className="hidden sm:inline">Facebook</span></button>
                    <button type="button" className="flex items-center justify-center gap-2 border-2 border-slate-800 text-slate-800 font-semibold py-3 rounded-full hover:bg-slate-50"><Mail size={20} /><span className="hidden sm:inline">Google</span></button>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;