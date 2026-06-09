import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const VerifySuccessPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm text-center border border-slate-100">
                <div className="flex justify-center mb-4 text-green-500">
                    <CheckCircle size={64} />
                </div>
                
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                    Xác thực tài khoản thành công!
                </h1>
                
                <p className="text-slate-600 mb-8">
                    Tài khoản của bạn đã được kích hoạt hoàn toàn. Bây giờ bạn đã có thể sử dụng đầy đủ các tính năng của hệ thống.
                </p>

                <button
                    onClick={() => navigate('/login')}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-full transition-colors cursor-pointer"
                >
                    Đi tới trang Đăng nhập
                </button>
            </div>
        </div>
    );
};

export default VerifySuccessPage;