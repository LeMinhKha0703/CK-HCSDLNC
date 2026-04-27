//TEACHER
import { useState } from 'react';
import Sidebar from './components/sidebar/SideBar';
import GroupManagement from './pages/teacher/GroupManagementPage';
import ExamManagement from './pages/teacher/ExamManagementPage';
// import './App.css';


//STUDENT
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import AuthForm from './components/student/AuthForm';
import Dashboard from './components/student/Dashboard';
import Quiz from './components/student/Quiz';
import Essay from './components/student/Essay';
import Admin from './components/student/Admin';
import CreateUser from './components/student/CreateUser';
import DeleteUserModal from './components/student/DeleteUserModal';
import GroupDetail from './components/student/GroupDetail'; 
import Notifications from './components/student/Notifications'; // Import file thông báo của bạn

const defaultUsers = [
  { id: 'UID-90210', name: 'Julianne Davenport', email: 'j.davenport@editorial.com', role: 'Teacher', initial: 'JD', color: 'bg-[#b6c8fe] text-[#415382]' },
  { id: 'UID-88432', name: 'Dr. Julian Vane', email: 'j.vane@analytics.edu', role: 'Teacher', initial: 'JV', color: 'bg-[#ffdbcf] text-[#380d00]' },
  { id: 'UID-76511', name: 'Sarah Miller', email: 'sarah.m@analytics.edu', role: 'Teacher', initial: 'SL', color: 'bg-[#dae2ff] text-[#001848]' },
  { id: 'UID-44321', name: 'Mark K.', email: 'm.kubiak@analytics.edu', role: 'Student', initial: 'MK', color: 'bg-[#e1e3e4] text-[#434654]' },
];

function App() {
  //TEACHER
  const [activeMenu, setActiveMenu] = useState('groups');

  //STUDENT
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('students-admin-users');
    if (!saved) return defaultUsers;
    try {
      return JSON.parse(saved);
    } catch {
      return defaultUsers;
    }
  });

  //STUDENT
  useEffect(() => {
    localStorage.setItem('students-admin-users', JSON.stringify(users));
  }, [users]);

  return (

    // <div className="flex h-screen bg-[#f9f9fb] font-sans antialiased overflow-hidden">
    //   <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
    //   {activeMenu === 'groups' ? <GroupManagement /> : <ExamManagement />}
    // </div>
    

    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<AuthForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<Admin users={users} setUsers={setUsers} />} />
        <Route path="/notifications" element={<Notifications />} />

        {/* Các trang hỗ trợ Admin như trong hình thiết kế */}
        <Route path="/admin/create" element={<CreateUser users={users} setUsers={setUsers} />} />
        <Route path="/admin/delete" element={<DeleteUserModal />} />

        {/* Route Courses và Exams */}
        <Route path="/courses/:courseName" element={<GroupDetail />} />
        <Route path="/exams/quiz/:quizId" element={<Quiz />} /> 
        <Route path="/exams/essay/:essayId" element={<Essay />} /> 
        <Route path="/notifications" element={<Notifications />} />

        {/* Teacher */}
        <Route
          path="/teacher"
          element={
            <div className="flex h-screen bg-[#f9f9fb] font-sans antialiased overflow-hidden">
              <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} type="teacher" />
              {activeMenu === 'groups' ? <GroupManagement /> : <ExamManagement />}
            </div>
          }
        />

        {/* Route dự phòng */}
        <Route path="/detail" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<div className="p-20 text-center text-2xl">404 - Không tìm thấy trang</div>} />
      </Routes>
    </Router>
  );
}

export default App;
