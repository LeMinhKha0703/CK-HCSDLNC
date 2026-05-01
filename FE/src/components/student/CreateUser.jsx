import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateUser = ({ users, setUsers }) => {
  const navigate = useNavigate();

  // State quản lý form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Teacher');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email) return;

    // Tạo user mới
    const newUser = {
      id: `UID-${Math.floor(10000 + Math.random() * 90000)}`,
      name: name,
      email: email,
      role: role,
      initial: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      color: role === 'Student' ? 'bg-[#e1e3e4] text-[#434654]' : 'bg-[#dae2ff] text-[#001848]'
    };

    setUsers([...users, newUser]); // Cập nhật mảng chung
    navigate('/admin'); // Quay lại trang admin
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <aside className="fixed left-0 top-0 h-full w-64 border-r border-slate-100 bg-white flex flex-col p-4 gap-2 z-30 shadow-xl shadow-slate-200/20">
        <div className="flex items-center gap-3 px-2 py-6 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-800 flex items-center justify-center text-white">
            <span className="material-symbols-outlined">analytics</span>
          </div>
          <div>
            <div className="font-black text-blue-800 text-base leading-none">Admin Console</div>
            <div className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">System Management</div>
          </div>
        </div>
        <nav className="flex-grow space-y-1">
          <button onClick={() => navigate('/admin')} className="w-full flex items-center gap-3 px-3 py-2.5 text-blue-700 font-semibold bg-blue-50 rounded-lg">
            <span className="material-symbols-outlined">group</span>
            <span>User Management</span>
          </button>
        </nav>
      </aside>

      <main className="ml-64 min-h-screen">
        <header className="flex justify-between items-center px-8 py-3 w-full border-b border-slate-200/50 bg-slate-50">
          <h1 className="text-xl font-bold text-blue-700">Editorial Analytics</h1>
        </header>

        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-slate-900">Create New User</h3>
                <p className="text-sm text-slate-500 mt-1">Assign roles and set primary access credentials.</p>
              </div>
              <button onClick={() => navigate('/admin')} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form className="p-8 space-y-6" onSubmit={handleSubmit}>
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
                  placeholder="sarah.j@editorial.com" 
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
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 px-1">Temp Password</label>
                  <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium outline-none" type="password" defaultValue="••••••••"/>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => navigate('/admin')} className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 rounded-lg text-sm">Cancel</button>
                <button type="submit" className="flex-1 bg-[#0052cc] text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-500/20 text-sm hover:bg-blue-700">Create User</button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateUser;