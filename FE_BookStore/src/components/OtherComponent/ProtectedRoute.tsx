import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [redirect, setRedirect] = useState(false);
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));

  useEffect(() => {
    const checkToken = async () => {
      let currentToken = token;
      let needsRefresh = false;

      if (!currentToken || currentToken === 'undefined') {
        needsRefresh = true;
      } else {
        try {
          const decoded: any = jwtDecode(currentToken);
          const currentTime = Date.now() / 1000;
          if (decoded.exp && decoded.exp < currentTime) {
            needsRefresh = true;
          }
        } catch (error) {
          needsRefresh = true;
        }
      }

      if (needsRefresh) {
        try {
          const res = await axios.post(
            'http://localhost:8080/auth/refresh',
            {},
            { withCredentials: true }
          );
          const newAccessToken = res.data.result.token;
          localStorage.setItem('access_token', newAccessToken);
          setToken(newAccessToken);
          setIsRefreshing(false);
        } catch (refreshError) {
          localStorage.removeItem('access_token');
          setRedirect(true);
          setIsRefreshing(false);
        }
      } else {
        setIsRefreshing(false);
      }
    };

    checkToken();
  }, [token]);

  if (isRefreshing) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', background: '#f8fafc', color: '#64748b' }}>
        <div style={{ border: '3px solid #f1f5f9', borderTop: '3px solid #6366f1', borderRadius: '50%', width: 36, height: 36, animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: 12, fontSize: 14, fontWeight: 500 }}>Đang xác thực phiên đăng nhập...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (redirect || !token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded: any = jwtDecode(token);
    if (requiredRole) {
      const userRoles = decoded.roles || [];
      if (!userRoles.includes(requiredRole)) {
        return <Navigate to="/403" replace />;
      }
    }
    return <>{children}</>;
  } catch (error) {
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
