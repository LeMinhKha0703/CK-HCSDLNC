// src/components/common/Toast.tsx
// Toast notification component tái sử dụng để hiển thị lỗi / thành công
import React, { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;      // ms, default 4000
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', duration = 4000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Đợi animation fade-out xong rồi unmount
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles: Record<ToastType, { bar: string; icon: string; bg: string }> = {
    success: { bar: 'bg-emerald-500', icon: 'check_circle',   bg: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
    error:   { bar: 'bg-red-500',     icon: 'error',           bg: 'bg-red-50 border-red-200 text-red-800' },
    warning: { bar: 'bg-amber-500',   icon: 'warning',         bg: 'bg-amber-50 border-amber-200 text-amber-800' },
    info:    { bar: 'bg-blue-500',    icon: 'info',            bg: 'bg-blue-50 border-blue-200 text-blue-800' },
  };

  const s = styles[type];

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-xl border shadow-lg max-w-md w-full
        transition-all duration-300
        ${s.bg}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}
    >
      {/* Color bar kiri */}
      <div className={`w-1 self-stretch rounded-full ${s.bar} shrink-0`} />
      <span className="material-symbols-outlined text-xl shrink-0">{s.icon}</span>
      <p className="flex-1 text-sm font-medium leading-snug">{message}</p>
      <button onClick={() => { setVisible(false); setTimeout(onClose, 300); }} className="shrink-0 opacity-50 hover:opacity-100 transition-opacity">
        <span className="material-symbols-outlined text-base">close</span>
      </button>
    </div>
  );
};


// =============================================
// ToastContainer — đặt vào góc màn hình
// =============================================
interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: number) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => (
  <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
    {toasts.map((t) => (
      <div key={t.id} className="pointer-events-auto">
        <Toast message={t.message} type={t.type} onClose={() => onRemove(t.id)} />
      </div>
    ))}
  </div>
);


// =============================================
// useToast hook — dùng trong bất kỳ component nào
// =============================================
export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, addToast, removeToast };
}
