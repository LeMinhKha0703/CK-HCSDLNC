// src/components/student/DeleteUserModal.tsx
import React from 'react';

interface UserData {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
}

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userData: UserData | null;
}

const DeleteUserModal: React.FC<DeleteUserModalProps> = ({ isOpen, onClose, onConfirm, userData }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#191c1d]/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-[0_32px_64px_rgba(25,28,29,0.1)] overflow-hidden">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#ffdad6] flex items-center justify-center text-[#ba1a1a]">
              <span className="material-symbols-outlined text-2xl">warning</span>
            </div>
            <div>
              <h3 className="font-bold text-xl text-[#191c1d] tracking-tight">Delete User</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Permanent Action</p>
            </div>
          </div>

          <p className="text-slate-600 leading-relaxed font-medium mb-8">
            Are you sure you want to delete this user? This action cannot be undone.
          </p>

          <div className="bg-[#f3f4f5] rounded-xl p-4 mb-8">
            <p className="text-sm font-bold text-[#191c1d]">{userData?.name || 'User Name'}</p>
            <p className="text-xs text-slate-400">{userData?.email}</p>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl bg-[#e7e8e9] text-[#434654] font-bold text-sm hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 px-4 py-3 rounded-xl bg-[#ba1a1a] text-white font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-red-500/20"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal;
