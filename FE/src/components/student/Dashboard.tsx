// src/components/student/Dashboard.tsx
// Màn hình My Groups - Student Dashboard
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyGroups } from '../../api/student';

interface Group {
  groupId: string;
  groupName: string;
  teacherName: string;
  createdAt: string;
  averageGrade: number | null;
  rankPosition: number | null;
}

// Màu accent ngẫu nhiên cho thẻ nhóm
const ACCENT_COLORS = ['bg-blue-700', 'bg-slate-500', 'bg-[#7b2600]', 'bg-emerald-700', 'bg-violet-700'];

const StudentSidebar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const path = window.location.pathname;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="hidden md:flex h-screen w-64 bg-white flex-col py-8 px-4 shrink-0 border-r border-[#edeeef] shadow-sm">
      <div className="mb-10 px-2">
        <h1 className="text-xl font-black text-[#003d9b] tracking-tight">Student</h1>
        <p className="text-xs text-slate-500 mt-1">{user?.fullName || 'Student'}</p>
      </div>
      <nav className="flex-1 space-y-2">
        <button
          onClick={() => navigate('/student/mygroups')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${path.includes('mygroups') || path.includes('group') ? 'bg-blue-50 text-[#003d9b] font-bold border-r-4 border-[#003d9b]' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <span className="material-symbols-outlined">group</span>
          <span className="text-sm font-medium">My Groups</span>
        </button>
        <button
          onClick={() => navigate('/student/notifications')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${path.includes('notifications') ? 'bg-blue-50 text-[#003d9b] font-bold border-r-4 border-[#003d9b]' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <span className="material-symbols-outlined">notifications</span>
          <span className="text-sm font-medium">Notifications</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 transition-all"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="text-sm font-medium">Log out</span>
        </button>
      </nav>
    </aside>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyGroups()
      .then(res => setGroups(res.data))
      .catch(() => setError('Không thể tải danh sách nhóm'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] font-body text-[#191c1d]">
      <StudentSidebar />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <header className="mb-10">
            <h2 className="text-4xl md:text-5xl font-black font-headline tracking-tight mb-6">My Groups</h2>
            <hr className="border-[#c3c6d6]/30" />
          </header>

          {isLoading && (
            <div className="text-center py-20 text-slate-400">Đang tải danh sách nhóm...</div>
          )}
          {error && (
            <div className="text-center py-20 text-red-400">{error}</div>
          )}

          {!isLoading && !error && groups.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              <span className="material-symbols-outlined text-6xl block mb-4">group_off</span>
              Bạn chưa tham gia nhóm nào. Hãy chờ giảng viên mời vào nhóm!
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            {groups.map((group, idx) => (
              <div
                key={group.groupId}
                onClick={() => navigate(`/student/group/${group.groupId}`)}
                className="group flex bg-white hover:bg-[#f3f4f5] border border-[#c3c6d6]/20 rounded-xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
              >
                <div className={`w-1.5 ${ACCENT_COLORS[idx % ACCENT_COLORS.length]} shrink-0`} />
                <div className="flex-1 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold font-headline group-hover:text-[#003d9b] transition-colors">{group.groupName}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-lg text-[#003d9b]">person</span>
                        <span>{group.teacherName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-lg text-slate-400">calendar_today</span>
                        <span>Created: {new Date(group.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>
                  {/* Avg Grade badge nếu có */}
                  {group.averageGrade !== null && (
                    <div className="flex items-center gap-3">
                      <div className="px-4 py-2 bg-blue-50 rounded-lg text-center">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Avg Grade</p>
                        <p className="text-xl font-black text-[#003d9b]">{group.averageGrade}</p>
                      </div>
                      {group.rankPosition && (
                        <div className="px-4 py-2 bg-slate-50 rounded-lg text-center">
                          <p className="text-[10px] uppercase font-bold text-slate-400">Rank</p>
                          <p className="text-xl font-black text-slate-700">#{group.rankPosition}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export { StudentSidebar };
export default Dashboard;
