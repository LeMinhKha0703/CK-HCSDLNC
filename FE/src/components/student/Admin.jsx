import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DeleteUserModal from './DeleteUserModal';
import Sidebar from '../Sidebar/SideBar';

const Admin = ({ users, setUsers }) => {
  const navigate = useNavigate();
  
  // Logic Modal & Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All Roles');
  
  const itemsPerPage = 5;
  
  // Lọc users theo search term và role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'All Roles' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });
  
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const pageUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleEditClick = (user) => {
    setEditingId(user.id);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
  };

  const handleSaveEdit = () => {
    if (!editName.trim() || !editEmail.trim()) {
      alert('Please fill in all fields');
      return;
    }

    const updatedUsers = users.map(user => {
      if (user.id === editingId) {
        const newInitial = editName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        const newColor = editRole === 'Student' ? 'bg-[#e1e3e4] text-[#434654]' : 'bg-[#b6c8fe] text-[#415382]';
        return {
          ...user,
          name: editName,
          email: editEmail,
          role: editRole,
          initial: newInitial,
          color: newColor
        };
      }
      return user;
    });

    setUsers(updatedUsers);
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditEmail('');
    setEditRole('');
  };

  const handleConfirmDelete = () => {
    setUsers(users.filter(u => u.id !== selectedUser.id));
    setIsModalOpen(false);
  };

  return (
    <div className="bg-[#f8f9fa] font-['Inter'] text-[#191c1d] min-h-screen flex">
      <Sidebar type="admin" />

      {/* Main Content */}
      <div className="ml-64 flex flex-col min-h-screen w-full">
        {/* TopNavBar */}
        <header className="flex justify-between items-center px-8 py-3 w-full border-b border-slate-200/50 bg-slate-50 sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
              <input 
                className="w-full bg-[#e7e8e9] border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" 
                placeholder="Search systems, users..." 
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="flex items-center bg-[#e7e8e9] rounded-lg px-3 py-1 text-sm border border-transparent hover:border-slate-300 transition-colors">
              <span className="material-symbols-outlined text-sm mr-2">filter_list</span>
              <select 
                className="bg-transparent border-none focus:ring-0 text-slate-600 text-xs py-1 outline-none"
                value={filterRole}
                onChange={(e) => {
                  setFilterRole(e.target.value);
                  setCurrentPage(1);
                }}
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
                {pageUsers.map((user) => (
                  editingId === user.id ? (
                    /* Row chế độ EDIT */
                    <tr key={user.id} className="bg-white shadow-sm border-y border-blue-500/10">
                      <td className="px-6 py-4 text-xs font-mono text-slate-500">{user.id}</td>
                      <td className="px-6 py-4">
                        <input 
                          className="w-full bg-[#f3f4f5] border-b-2 border-[#003d9b] rounded-t-lg px-3 py-1 text-sm font-bold outline-none" 
                          type="text" 
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input 
                          className="w-full bg-[#f3f4f5] border-b-2 border-[#003d9b] rounded-t-lg px-3 py-1 text-sm outline-none" 
                          type="email" 
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <select className="w-full bg-[#f3f4f5] border-b-2 border-[#003d9b] rounded-t-lg px-3 py-1 text-xs font-semibold outline-none"
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value)}
                        >
                          <option value="Teacher">Teacher</option>
                          <option value="Student">Student</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={handleSaveEdit} className="px-4 py-1.5 bg-[#003d9b] text-white rounded-lg text-xs font-bold hover:bg-blue-900 transition-all">Save</button>
                          <button onClick={handleCancelEdit} className="px-4 py-1.5 bg-[#e7e8e9] text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-300 transition-all">Cancel</button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    /* Row chế độ STATIC */
                    <tr key={user.id} className="group hover:bg-white transition-colors">
                      <td className="px-6 py-4 text-xs font-mono text-slate-500">{user.id}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-[#191c1d]">{user.name}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${user.role === 'Student' ? 'bg-[#e1e3e4]' : 'bg-[#b6c8fe] text-[#415382]'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEditClick(user)} className="p-1.5 text-slate-400 hover:text-[#0052cc] hover:bg-blue-50 rounded-lg transition-all">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button onClick={() => handleDeleteClick(user)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
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
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg ${currentPage === 1 ? 'text-slate-300 bg-slate-100' : 'text-slate-400 hover:bg-slate-200'}`}
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              {(() => {
                let pages = [];
                if (totalPages <= 3) {
                  pages = Array.from({length: totalPages}, (_, i) => i + 1);
                } else {
                  if (currentPage === 1) {
                    pages = [1, 2, 3];
                  } else if (currentPage === totalPages) {
                    pages = [totalPages - 2, totalPages - 1, totalPages];
                  } else {
                    pages = [currentPage - 1, currentPage, currentPage + 1];
                  }
                }
                return pages.map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-8 h-8 text-xs rounded-lg font-bold ${page === currentPage ? 'bg-[#003d9b] text-white' : 'text-slate-500 hover:bg-slate-200'}`}
                  >
                    {page}
                  </button>
                ));
              })()}
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg ${currentPage === totalPages ? 'text-slate-300 bg-slate-100' : 'text-slate-400 hover:bg-slate-200'}`}
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </main>
      </div>

      <DeleteUserModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={handleConfirmDelete}
        userData={selectedUser}
      />
    </div>
  );
};

export default Admin;