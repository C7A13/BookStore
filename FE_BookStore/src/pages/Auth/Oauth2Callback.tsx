import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


const Oauth2Callback = () => {
    const navigate = useNavigate();
    const hasFetched = useRef(false); // Ngăn React StrictMode gọi 2 lần

    useEffect(() => {
        // React StrictMode chạy useEffect 2 lần trong dev → code OAuth chỉ dùng 1 lần → lỗi 500
        if (hasFetched.current) return;
        hasFetched.current = true;

        const currentPath = window.location.pathname; // Ví dụ: /oauth2/callback/google
        const type = currentPath.includes('google') ? "GOOGLE" : "FACEBOOK";

        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');

        if (code) {
            // 2. Gửi mã code này sang API xử lý của Backend
            axios.post('http://localhost:8080/auth/login/social',
                {
                    code: code,
                    loginType: type
                },
                { withCredentials: true }  // BẮT BUỘC: để browser nhận cookie refresh_token từ BE
            )
                .then(response => {
                    // 3. Backend xử lý thành công và trả về chuỗi JWT của hệ thống bạn
                    const apiResponse = response.data;

                    const accessToken = apiResponse.result.token;

                    localStorage.setItem('access_token', accessToken);

                    // 5. Đưa người dùng vào trang chủ (Home)
                    navigate('/', { replace: true });
                })
                .catch(error => {
                    console.error("Đăng nhập thất bại:", error);
                    console.error("Response data:", error?.response?.data);
                    navigate('/login', { replace: true });
                });
        } else {
            navigate('/login', { replace: true });
        }
    }, [navigate]);

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2>Đang xử lý đăng nhập bằng Google... vui lòng đợi trong giây lát!</h2>
        </div>
    );
};

export default Oauth2Callback;