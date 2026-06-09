import axios from 'axios';

// Khởi tạo một thực thể axios dùng chung cho toàn dự án
const api = axios.create({
  baseURL: 'http://localhost:8080', // Domain cơ sở của Spring Boot (Ví dụ: http://localhost:8080)
  withCredentials: true, // Đảm bảo trình duyệt tự gửi kèm Cookie (Refresh Token) lên BE khi refresh
});

// INTERCEPTOR REQUEST: Tự động móc Access Token từ LocalStorage gắn vào Header trước khi gửi
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// INTERCEPTOR RESPONSE: Tự động xử lý ngầm (Silent Refresh) nếu Access Token hết hạn (Lỗi 401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu BE báo lỗi 401 (Unauthorized) và request này chưa từng thử refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try { 
        const res = await axios.post(
          'http://localhost:8080/auth/refresh',
          {},
          { withCredentials: true } // Trình duyệt tự đính kèm HttpOnly Cookie chứa RF token lên đây
        );

        const newAccessToken = res.data.result.token;

        // Cập nhật lại Access Token mới tinh vào LocalStorage
        localStorage.setItem('access_token', newAccessToken);

        // Đính Access Token mới này vào Request cũ bị lỗi lúc nãy và chạy lại nó
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return api(originalRequest); 
      } catch (refreshError) {
        // Nếu ngay cả Refresh Token trong Cookie cũng hết hạn -> Xóa token
        localStorage.removeItem('access_token');
        
        // Tránh redirect khi người dùng đang truy cập các trang công cộng (public)
        const publicPaths = ['/', '/books', '/faq', '/about', '/contact', '/login', '/register', '/profile', '/my-orders', '/checkout'];
        const path = window.location.pathname;
        const isPublicPath = publicPaths.includes(path) || path.startsWith('/books/') || path.startsWith('/oauth2/') || path.startsWith('/verify-success');
        
        if (!isPublicPath) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }

    }

    return Promise.reject(error);
  }
);

export default api;