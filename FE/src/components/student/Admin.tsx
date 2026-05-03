// src/components/student/Admin.tsx
// Admin User Management — kết nối API thực
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUsers, updateUser, deleteUser } from '../../api/admin';
import DeleteUserModal from './DeleteUserModal';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All Roles');
  const [isSaving, setIsSaving] = useState(false);

  const itemsPerPage = 5;

  const fetchUsers = () => {
    setIsLoading(true);
    const params: { role?: string; search?: string } = {};
    if (filterRole !== 'All Roles') params.role = filterRole;
    if (searchTerm) params.search = searchTerm;
    getUsers(params)
      .then(res => setUsers(res.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [filterRole, searchTerm]);

  const filteredUsers = users;
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const pageUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  React.useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const handleEditClick = (u: User) => {
    setEditingId(u.id);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditRole(u.role);
  };

  const handleSaveEdit = async () => {
    if (!editName.trim() || !editEmail.trim() || !editingId) return;
    setIsSaving(true);
    try {
      await updateUser(editingId, { fullName: editName, email: editEmail, role: editRole });
      fetchUsers();
      setEditingId(null);
    } catch (err) {
      alert('Cập nhật thất bại!');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (u: User) => {
    setSelectedUser(u);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    try {
      await deleteUser(selectedUser.id);
      fetchUsers();
    } catch (err) {
      alert('Failed to delete user!');
    } finally {
      setIsModalOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const paginationPages: number[] = [];
  const windowStart = Math.min(Math.max(1, currentPage - 1), Math.max(1, totalPages - 2));
  for (let i = 0; i < Math.min(3, totalPages); i++) paginationPages.push(windowStart + i);

  return (
    <div className="bg-[#f8f9fa] font-['Inter'] text-[#191c1d] min-h-screen flex">
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
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
        >
          <span className="material-symbols-outlined">logout</span>
          <span>Log out</span>
        </button>
      </aside>

      {/* Main Content */}
      <div className="ml-64 flex flex-col min-h-screen w-full">
        {/* TopNavBar */}
        <header className="flex justify-between items-center px-8 py-3 w-full border-b border-slate-200/50 bg-slate-50 sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
              <input 
                className="w-full bg-[#e7e8e9] border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" 
                placeholder="Search users..." 
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <div className="flex items-center bg-[#e7e8e9] rounded-lg px-3 py-1 text-sm border border-transparent hover:border-slate-300 transition-colors">
              <span className="material-symbols-outlined text-sm mr-2">filter_list</span>
              <select 
                className="bg-transparent border-none focus:ring-0 text-slate-600 text-xs py-1 outline-none"
                value={filterRole}
                onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1); }}
              >
                <option value="All Roles">All Roles</option>
                <option value="Teacher">Teacher</option>
                <option value="Student">Student</option>
              </select>
            </div>
          </div>
        </header>

        {/* Canvas */}
        <main className="flex-1 p-8 space-y-8 bg-[#f8f9fa]">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <h2 className="text-3xl font-['Manrope'] font-extrabold tracking-tight text-[#191c1d]">User Management</h2>
              <p className="text-slate-500 text-sm">Directory of all registered entities with system access privileges.</p>
            </div>
            <button 
              onClick={() => navigate('/admin/create')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#003d9b] to-[#0052cc] text-white font-semibold rounded-lg shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span>Create New User</span>
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-16 text-slate-400">Loading user list...</div>
          ) : (
            <>
              {/* Table */}
              <div className="bg-[#f3f4f5] rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#e7e8e9]/50 border-b border-slate-200">
                      <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">USER ID</th>
                      <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">FULL NAME</th>
                      <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">EMAIL</th>
                      <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">ROLE</th>
                      <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/50">
                    {pageUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-slate-400">Không tìm thấy người dùng nào</td>
                      </tr>
                    ) : pageUsers.map((u) => (
                      editingId === u.id ? (
                        /* Row chế độ EDIT */
                        <tr key={u.id} className="bg-white shadow-sm border-y border-blue-500/10">
                          <td className="px-6 py-4 text-xs font-mono text-slate-500">{u.id}</td>
                          <td className="px-6 py-4">
                            <input className="w-full bg-[#f3f4f5] border-b-2 border-[#003d9b] rounded-t-lg px-3 py-1 text-sm font-bold outline-none" type="text" value={editName} onChange={(e) => setEditName(e.target.value)} />
                          </td>
                          <td className="px-6 py-4">
                            <input className="w-full bg-[#f3f4f5] border-b-2 border-[#003d9b] rounded-t-lg px-3 py-1 text-sm outline-none" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                          </td>
                          <td className="px-6 py-4">
                            <select className="w-full bg-[#f3f4f5] border-b-2 border-[#003d9b] rounded-t-lg px-3 py-1 text-xs font-semibold outline-none" value={editRole} onChange={(e) => setEditRole(e.target.value)}>
                              <option value="Teacher">Teacher</option>
                              <option value="Student">Student</option>
                              <option value="Admin">Admin</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={handleSaveEdit} disabled={isSaving} className="px-4 py-1.5 bg-[#003d9b] text-white rounded-lg text-xs font-bold hover:bg-blue-900 transition-all disabled:opacity-60">
                                {isSaving ? '...' : 'Save'}
                              </button>
                              <button onClick={() => setEditingId(null)} className="px-4 py-1.5 bg-[#e7e8e9] text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-300 transition-all">Cancel</button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        /* Row chế độ STATIC */
                        <tr key={u.id} className="group hover:bg-white transition-colors">
                          <td className="px-6 py-4 text-xs font-mono text-slate-500">{u.id}</td>
                          <td className="px-6 py-4"><span className="text-sm font-bold text-[#191c1d]">{u.name}</span></td>
                          <td className="px-6 py-4 text-sm text-slate-600">{u.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${u.role === 'Student' ? 'bg-[#e1e3e4] text-[#434654]' : u.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-[#b6c8fe] text-[#415382]'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => handleEditClick(u)} className="p-1.5 text-slate-400 hover:text-[#0052cc] hover:bg-blue-50 rounded-lg transition-all">
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                              </button>
                              <button onClick={() => handleDeleteClick(u)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col gap-3 px-2 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs text-slate-500">
                  Showing {filteredUsers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
                </span>
                <div className="flex items-center gap-1 flex-wrap">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className={`p-2 rounded-lg ${currentPage === 1 ? 'text-slate-300 bg-slate-100' : 'text-slate-400 hover:bg-slate-200'}`}>
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  {paginationPages.map(page => (
                    <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 text-xs rounded-lg font-bold ${page === currentPage ? 'bg-[#003d9b] text-white' : 'text-slate-500 hover:bg-slate-200'}`}>
                      {page}
                    </button>
                  ))}
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className={`p-2 rounded-lg ${currentPage === totalPages ? 'text-slate-300 bg-slate-100' : 'text-slate-400 hover:bg-slate-200'}`}>
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      <DeleteUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleConfirmDelete} userData={selectedUser} />
    </div>
  );
};

export default Admin;
