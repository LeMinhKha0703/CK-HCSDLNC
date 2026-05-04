// src/App.tsx
// Routing trung tâm - Khớp 100% với SCREEN.md
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// ===== AUTH =====
import AuthForm from './components/student/AuthForm';

// ===== STUDENT (jsx → sẽ được chuyển tsx ở bước 3) =====
import Dashboard from './components/student/Dashboard';
import GroupDetail from './components/student/GroupDetail';
import Notifications from './components/student/Notifications';
import Quiz from './components/student/Quiz';
import Essay from './components/student/Essay';

// ===== TEACHER (đã là .tsx) =====
import GroupManagement from './components/teacher/Group/GroupManagement';
import GroupDetails from './components/teacher/Group/GroupDetails';
import ExamManagement from './components/teacher/Exam/ExamManagement';
import CreateExam from './components/teacher/Exam/CreateExam';
import EssayDetails from './components/teacher/Essay/EssayDetails';
import GradeEssay from './components/teacher/Essay/GradeEssay';
import EssayStudentResult from './components/teacher/Essay/EssayStudentResult';
import MCQDetails from './components/teacher/MCQ/MCQDetails';
import MCQStudentResult from './components/teacher/MCQ/MCQStudentResult';
import Sidebar from './components/sidebar/SideBar';

// ===== ADMIN =====
import Admin from './components/student/Admin';
import CreateUser from './components/student/CreateUser';

// Layout bọc Sidebar cho Teacher
const TeacherLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-screen bg-[#f9f9fb] font-sans antialiased overflow-hidden">
    <Sidebar type="teacher" />
    <div className="flex-1 overflow-y-auto">
      {children}
    </div>
  </div>
);

// Admin tự quản lý state và sidebar riêng — không cần wrapper

// Smart redirect sau khi đăng nhập dựa theo role
const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'Teacher') return <Navigate to="/teacher/groupmanagement" replace />;
  if (user.role === 'Admin') return <Navigate to="/admin/usermanagement" replace />;
  return <Navigate to="/student/mygroups" replace />;
};

function App() {
  return (
    <Routes>
      {/* === REDIRECT ROOT === */}
      <Route path="/" element={<RoleRedirect />} />

      {/* === PUBLIC: Auth === */}
      <Route path="/login" element={<AuthForm />} />
      <Route path="/register" element={<AuthForm />} />
      <Route path="/logout" element={<Navigate to="/login" replace />} />

      {/* === STUDENT Routes === */}
      <Route path="/student/mygroups" element={
        <ProtectedRoute allowedRoles={['Student']}>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/student/group/:groupId" element={
        <ProtectedRoute allowedRoles={['Student']}>
          <GroupDetail />
        </ProtectedRoute>
      } />
      <Route path="/student/notifications" element={
        <ProtectedRoute allowedRoles={['Student']}>
          <Notifications />
        </ProtectedRoute>
      } />
      <Route path="/exams/mcq/:examId" element={
        <ProtectedRoute allowedRoles={['Student']}>
          <Quiz />
        </ProtectedRoute>
      } />
      <Route path="/exams/essay/:examId" element={
        <ProtectedRoute allowedRoles={['Student']}>
          <Essay />
        </ProtectedRoute>
      } />

      {/* === TEACHER Routes === */}
      <Route path="/teacher/groupmanagement" element={
        <ProtectedRoute allowedRoles={['Teacher']}>
          <TeacherLayout>
            <GroupManagement />
          </TeacherLayout>
        </ProtectedRoute>
      } />
      <Route path="/teacher/group/:groupId" element={
        <ProtectedRoute allowedRoles={['Teacher']}>
          <TeacherLayout>
            <GroupDetails />
          </TeacherLayout>
        </ProtectedRoute>
      } />
      <Route path="/teacher/exammanagement" element={
        <ProtectedRoute allowedRoles={['Teacher']}>
          <TeacherLayout>
            <ExamManagement />
          </TeacherLayout>
        </ProtectedRoute>
      } />
      <Route path="/teacher/createexam" element={
        <ProtectedRoute allowedRoles={['Teacher']}>
          <TeacherLayout>
            <CreateExam />
          </TeacherLayout>
        </ProtectedRoute>
      } />
      <Route path="/teacher/exams/essay/:examId" element={
        <ProtectedRoute allowedRoles={['Teacher']}>
          <TeacherLayout>
            <EssayDetails />
          </TeacherLayout>
        </ProtectedRoute>
      } />
      <Route path="/teacher/exams/essay/:examId/grade/:submissionId" element={
        <ProtectedRoute allowedRoles={['Teacher']}>
          <TeacherLayout>
            <GradeEssay />
          </TeacherLayout>
        </ProtectedRoute>
      } />
      <Route path="/teacher/exams/essay/:examId/review/:submissionId" element={
        <ProtectedRoute allowedRoles={['Teacher']}>
          <TeacherLayout>
            <EssayStudentResult />
          </TeacherLayout>
        </ProtectedRoute>
      } />
      <Route path="/teacher/exams/mcq/:examId" element={
        <ProtectedRoute allowedRoles={['Teacher']}>
          <TeacherLayout>
            <MCQDetails />
          </TeacherLayout>
        </ProtectedRoute>
      } />
      <Route path="/teacher/exams/mcq/:examId/review/:submissionId" element={
        <ProtectedRoute allowedRoles={['Teacher']}>
          <TeacherLayout>
            <MCQStudentResult />
          </TeacherLayout>
        </ProtectedRoute>
      } />

      {/* === ADMIN Routes === */}
      <Route path="/admin/usermanagement" element={
        <ProtectedRoute allowedRoles={['Admin']}>
          <Admin />
        </ProtectedRoute>
      } />
      <Route path="/admin/create" element={
        <ProtectedRoute allowedRoles={['Admin']}>
          <CreateUser />
        </ProtectedRoute>
      } />

      {/* === 404 FALLBACK === */}
      <Route path="*" element={
        <div className="flex items-center justify-center h-screen text-center">
          <div>
            <h1 className="text-6xl font-black text-slate-200">404</h1>
            <p className="text-slate-500 mt-2">Không tìm thấy trang</p>
          </div>
        </div>
      } />
    </Routes>
  );
}

export default App;
