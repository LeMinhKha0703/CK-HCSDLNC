// src/components/common/ProtectedRoute.tsx
// Route Guard: Kiểm tra đăng nhập và role trước khi cho vào trang
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface Props {
  children: React.ReactNode;
  allowedRoles?: ('Student' | 'Teacher' | 'Admin')[];
}

const ProtectedRoute = ({ children, allowedRoles }: Props) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen text-slate-400">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Chuyển về trang mặc định theo role
    if (user.role === 'Student') return <Navigate to="/student/mygroups" replace />;
    if (user.role === 'Teacher') return <Navigate to="/teacher/groupmanagement" replace />;
    if (user.role === 'Admin') return <Navigate to="/admin/usermanagement" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
