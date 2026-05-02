// src/components/student/Notifications.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StudentSidebar } from './Dashboard';
import { getNotifications, acceptInvitation } from '../../api/student';

interface Notification {
  id: string;
  type: string;
  title: string;
  date: string;
  content: string;
  icon: string;
  hasAction: boolean;
}

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = () => {
    setIsLoading(true);
    getNotifications()
      .then(res => setNotifications(res.data))
      .catch(() => setError('Không thể tải thông báo'))
      .finally(() => setIsLoading(false));
  };

  const handleAccept = async (notifId: string) => {
    setProcessingId(notifId);
    try {
      await acceptInvitation(notifId);
      alert('Đã tham gia nhóm thành công!');
      fetchNotifications(); // Reload danh sách thông báo
      navigate('/student/mygroups'); // Chuyển về Dashboard để thấy nhóm mới
    } catch (err) {
      alert('Lỗi khi tham gia nhóm');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="bg-[#f8f9fa] text-[#191c1d] font-body antialiased flex min-h-screen">
      {/* SideNavBar */}
      <StudentSidebar />

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-10 max-w-5xl mx-auto w-full">
          {/* Header */}
          <section className="mb-12">
            <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight">Notifications</h2>
            <hr className="border-[#c3c6d6]/30 mt-6"/>
          </section>

          {isLoading && <div className="text-center py-10 text-slate-400">Đang tải thông báo...</div>}
          {error && <div className="text-center py-10 text-red-500">{error}</div>}

          {!isLoading && !error && notifications.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              <span className="material-symbols-outlined text-6xl block mb-4">notifications_off</span>
              Bạn không có thông báo nào.
            </div>
          )}

          {/* Feed */}
          <div className="space-y-6">
            {notifications.map((note) => (
              <div key={note.id} className="group relative bg-white border border-[#c3c6d6]/20 rounded-xl p-6 transition-all hover:shadow-md shadow-sm">
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className={`h-14 w-14 rounded-full flex items-center justify-center text-white ${note.type === 'invite' ? 'bg-gradient-to-br from-[#003d9b] to-[#0052cc]' : 'bg-slate-200 text-slate-600'}`}>
                      <span className="material-symbols-outlined text-2xl">{note.icon || 'notifications'}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-headline text-xl font-bold">{note.title}</h3>
                      <span className="text-xs text-slate-400 font-medium">
                        {new Date(note.date).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <div 
                      className="text-slate-600 leading-relaxed text-lg mb-6"
                      dangerouslySetInnerHTML={{ __html: note.content }}
                    />
                    {note.hasAction && note.type === 'invite' && (
                      <button 
                        onClick={() => handleAccept(note.id)}
                        disabled={processingId === note.id}
                        className="bg-gradient-to-r from-[#003d9b] to-[#0052cc] text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-60"
                      >
                        {processingId === note.id ? 'Đang xử lý...' : 'Accept Invitation'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!isLoading && notifications.length > 0 && (
            <div className="mt-16 text-center">
              <div className="inline-flex items-center gap-4 text-slate-300">
                <div className="h-px w-12 bg-slate-200"></div>
                <span className="text-xs font-bold tracking-widest uppercase">End of recent activity</span>
                <div className="h-px w-12 bg-slate-200"></div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Notifications;
