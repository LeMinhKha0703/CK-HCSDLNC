import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const groups = [
    { id: 1, title: "Advanced Macroeconomics", teacher: "Prof. Marcus Thorne", date: "Sep 12, 2023", color: "bg-blue-700" },
    { id: 2, title: "Microeconomics", teacher: "Prof. Marcus Sterling", date: "Oct 05, 2023", color: "bg-slate-500" },
    { id: 3, title: "Statistical Analysis", teacher: "Dr. Sarah Jenkins", date: "Nov 15, 2023", color: "bg-[#7b2600]" },
  ];

  const handleLogout = (e) => {
    e.preventDefault();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] font-body text-[#191c1d]">
      {/* Sidebar */}
      <aside className="hidden md:flex h-screen w-64 bg-white flex-col py-8 px-4 shrink-0 border-r border-[#edeeef] shadow-sm">
  <div className="mb-10 px-2">
    <h1 className="text-xl font-black text-[#003d9b] tracking-tight">Student</h1>
    <p className="text-xs text-slate-500 mt-1">Julian Reed</p>
  </div>
  <nav className="flex-1 space-y-2">
    {/* My Groups - Active nếu đang ở dashboard */}
    <button 
      onClick={() => navigate('/dashboard')}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${window.location.pathname.includes('dashboard') ? 'bg-blue-50 text-[#003d9b] font-bold border-r-4 border-[#003d9b]' : 'text-slate-600 hover:bg-slate-100'}`}
    >
      <span className="material-symbols-outlined">group</span>
      <span className="text-sm font-medium">My Groups</span>
    </button>
    
    {/* Notifications - Active nếu đang ở notifications */}
    <button 
      onClick={() => navigate('/notifications')}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${window.location.pathname.includes('notifications') ? 'bg-blue-50 text-[#003d9b] font-bold border-r-4 border-[#003d9b]' : 'text-slate-600 hover:bg-slate-100'}`}
    >
      <span className="material-symbols-outlined">notifications</span>
      <span className="text-sm font-medium">Notifications</span>
    </button>

    <button 
      onClick={() => navigate('/login')}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 transition-all mt-auto"
    >
      <span className="material-symbols-outlined">logout</span>
      <span className="text-sm font-medium">Log out</span>
    </button>
  </nav>
</aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <header className="mb-10">
            <h2 className="text-4xl md:text-5xl font-black font-headline tracking-tight mb-6">My Groups</h2>
            <hr className="border-[#c3c6d6]/30" />
          </header>

          <div className="grid grid-cols-1 gap-6">
            {groups.map((group) => (
              <div 
                key={group.id} 
                onClick={() => navigate(`/courses/${group.title}`)}
                className="group flex bg-white hover:bg-[#f3f4f5] border border-[#c3c6d6]/20 rounded-xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
              >
                <div className={`w-1.5 ${group.color} shrink-0`}></div>
                <div className="flex-1 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold font-headline group-hover:text-[#003d9b] transition-colors">{group.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-lg text-[#003d9b]">person</span><span>{group.teacher}</span></div>
                      <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-lg text-slate-400">calendar_today</span><span>Created: {group.date}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;