// src/components/student/Notifications.tsx
// Student Notifications screen
// Tích hợp Toast để hiển thị lỗi từ sp_AcceptGroupInvitation (RAISERROR → HTTP 400)
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StudentSidebar } from './Dashboard';
import { getNotifications, acceptInvitation } from '../../api/student';
import { ToastContainer, useToast } from '../common/Toast';

interface Notification {
  notifId: string;
  type: string;       // 'Invite_Group' | 'Normal'
  title: string;
  sendDate: string;
  content: string;
  isRead: boolean;
  targetId: string | null;
  hasAction?: boolean;
}

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = () => {
    setIsLoading(true);
    getNotifications()
      .then(res => setNotifications(res.data))
      .catch(() => addToast('Failed to load notifications.', 'error'))
      .finally(() => setIsLoading(false));
  };

  const handleAccept = async (notif: Notification) => {
    setProcessingId(notif.notifId);
    try {
      const res = await acceptInvitation(notif.notifId);
      // Thành công → SP sp_AcceptGroupInvitation đã COMMIT transaction
      addToast('Successfully joined the group!', 'success');
      fetchNotifications(); // Reload danh sách thông báo (IsRead sẽ = 1)
      // Điều hướng vào nhóm mới sau 1.2s (để user thấy toast)
      if (res.data?.groupId) {
        setTimeout(() => navigate(`/student/group/${res.data.groupId}`), 1200);
      }
    } catch (err: unknown) {
      // Lỗi từ SP (RAISERROR) đã được BE parse thành HTTP 400/404 với message rõ ràng
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      const msg = axiosErr?.response?.data?.detail || 'Failed to join the group. Please try again.';
      addToast(msg, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const getIcon = (type: string) => type === 'Invite_Group' ? 'group_add' : 'notifications';

  return (
    <div className="bg-[#f8f9fa] text-[#191c1d] font-body antialiased flex min-h-screen">
      <StudentSidebar />

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-10 max-w-5xl mx-auto w-full">
          {/* Header */}
          <section className="mb-12">
            <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight">Notifications</h2>
            <hr className="border-[#c3c6d6]/30 mt-6"/>
          </section>

          {isLoading && (
            <div className="text-center py-10 text-slate-400">Loading notifications...</div>
          )}

          {!isLoading && notifications.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              <span className="material-symbols-outlined text-6xl block mb-4">notifications_off</span>
              You have no notifications.
            </div>
          )}

          {/* Feed */}
          <div className="space-y-6">
            {notifications.map((note) => (
              <div
                key={note.notifId}
                className={`group relative bg-white border rounded-xl p-6 transition-all hover:shadow-md shadow-sm ${note.isRead ? 'border-[#c3c6d6]/20' : 'border-[#003d9b]/30 bg-blue-50/30'}`}
              >
                {/* Unread indicator */}
                {!note.isRead && (
                  <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-[#003d9b]" />
                )}

                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className={`h-14 w-14 rounded-full flex items-center justify-center text-white ${note.type === 'Invite_Group' ? 'bg-gradient-to-br from-[#003d9b] to-[#0052cc]' : 'bg-slate-200 text-slate-600'}`}>
                      <span className="material-symbols-outlined text-2xl">{getIcon(note.type)}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-headline text-xl font-bold">{note.title}</h3>
                      <span className="text-xs text-slate-400 font-medium">
                        {new Date(note.sendDate).toLocaleString('en-US')}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-base mb-6">{note.content}</p>

                    {/* Accept button — chỉ hiện cho loại Invite_Group chưa đọc */}
                    {note.type === 'Invite_Group' && !note.isRead && (
                      <button
                        onClick={() => handleAccept(note)}
                        disabled={processingId === note.notifId}
                        className="bg-gradient-to-r from-[#003d9b] to-[#0052cc] text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-60"
                      >
                        {processingId === note.notifId ? 'Processing...' : 'Accept Invitation'}
                      </button>
                    )}

                    {/* Đã chấp nhận → hiện badge */}
                    {note.type === 'Invite_Group' && note.isRead && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Joined
                      </span>
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

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default Notifications;
