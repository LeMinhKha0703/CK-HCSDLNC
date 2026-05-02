// src/context/AuthContext.tsx
// Context toàn cục lưu thông tin đăng nhập (token, role, user info)
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserInfo {
  userId: string;
  fullName: string;
  role: 'Student' | 'Teacher' | 'Admin';
}

interface AuthContextType {
  user: UserInfo | null;
  token: string | null;
  login: (token: string, userInfo: UserInfo) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Khôi phục session từ localStorage khi app khởi động
  useEffect(() => {
    const savedToken = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user_info');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, userInfo: UserInfo) => {
    localStorage.setItem('access_token', newToken);
    localStorage.setItem('user_info', JSON.stringify(userInfo));
    setToken(newToken);
    setUser(userInfo);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook để sử dụng AuthContext dễ dàng
export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải được dùng bên trong AuthProvider');
  return ctx;
};
