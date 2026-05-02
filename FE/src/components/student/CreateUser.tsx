// src/components/student/CreateUser.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createUser } from '../../api/admin';

const CreateUser: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Teacher');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Vui lòng điền đủ thông tin');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await createUser({ fullName: name, email, password, role });
      navigate('/admin/usermanagement');
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { detail?: string } } };
      setError(axErr.response?.data?.detail || 'Tạo người dùng thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#f8f9fa] text-[#191c1d] min-h-screen flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 border-r border-slate-100 bg-white flex flex-col p-4 gap-2 z-30 shadow-xl shadow-slate-200/20">
        <div className="mb-8 px-2 flex items-center gap-3 pt-4">
          <div>
            <h1 className="font-black text-[#003d9b] text-lg leading-tight">Admin</h1>
            <p className="text-xs text-slate-500">{authUser?.fullName || 'System Management'}</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          <button
            onClick={() => navigate('/admin/usermanagement')}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-[#0052cc] font-semibold bg-blue-50 rounded-lg"
          >
            <span className="material-symbols-outlined">group</span>
            <span>User Management</span>
          </button>
        </nav>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
        >
          <span className="material-symbols-outlined">logout</span>
          <span>Log out</span>
        </button>
      </aside>

      <main className="ml-64 min-h-screen flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-black text-slate-900">Create New User</h3>
              <p className="text-sm text-slate-500 mt-1">Assign roles and set primary access credentials.</p>
            </div>
            <button onClick={() => navigate('/admin/usermanagement')} className="text-slate-400 hover:text-slate-600">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <form className="p-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 px-1">Fullname</label>
              <input 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-medium" 
                placeholder="e.g. Sarah Jenkins" 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 px-1">Email Address</label>
              <input 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-medium" 
                placeholder="sarah.j@university.edu" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 px-1">System Role</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="Teacher">Teacher</option>
                  <option value="Student">Student</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 px-1">Password</label>
                <input 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20" 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <button 
                type="button" 
                onClick={() => navigate('/admin/usermanagement')} 
                className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 rounded-lg text-sm hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isLoading}
                className="flex-1 bg-[#0052cc] text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-500/20 text-sm hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {isLoading ? 'Đang tạo...' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateUser;
