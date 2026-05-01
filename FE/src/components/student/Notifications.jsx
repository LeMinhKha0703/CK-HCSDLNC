import React from 'react';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
  const navigate = useNavigate();

  const notifications = [
    {
      id: 1,
      type: 'invite',
      title: 'Course Invitation',
      date: 'Sep 15, 2023',
      content: (
        <>
          <span className="font-bold text-[#191c1d]">Prof. Sarah Chen</span> invited you to join the{' '}
          <span className="italic text-[#003d9b] font-semibold">Advanced UX Design</span> workspace for the Spring Semester.
        </>
      ),
      icon: 'school',
      hasAction: true
    },
    {
      id: 2,
      type: 'comment',
      title: 'New comment on your Portfolio Review',
      date: 'Sep 14, 2023',
      content: 'Michael Roe left a comment on your thread.',
      icon: 'comment',
      hasAction: false
    }
  ];

  return (
    <div className="bg-[#f8f9fa] text-[#191c1d] font-body antialiased flex min-h-screen">
      {/* SideNavBar */}
      <aside className="hidden md:flex h-screen w-64 bg-white flex-col py-8 px-4 shrink-0 border-r border-[#edeeef] shadow-sm">
        <div className="mb-10 px-2">
          <h1 className="text-xl font-black text-[#003d9b] tracking-tight">Student</h1>
          <p className="text-xs text-slate-500 mt-1">Julian Reed</p>
        </div>
        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-600 hover:bg-slate-100"
          >
            <span className="material-symbols-outlined">group</span>
            <span className="text-sm font-medium">My Groups</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 text-[#003d9b] font-bold border-r-4 border-[#003d9b]">
            <span className="material-symbols-outlined fill-1">notifications</span>
            <span className="text-sm">Notifications</span>
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 transition-all"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm font-medium">Log out</span>
          </button>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-10 max-w-5xl mx-auto w-full">
          {/* Header */}
          <section className="mb-12">
            <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight">Notifications</h2>
            <hr className="border-slate-200 mt-6"/>
          </section>

          {/* Feed */}
          <div className="space-y-6">
            {notifications.map((note) => (
              <div key={note.id} className="group relative bg-white border border-slate-100 rounded-xl p-6 transition-all hover:bg-[#edeeef]/50 shadow-sm">
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className={`h-14 w-14 rounded-full flex items-center justify-center text-white ${note.type === 'invite' ? 'bg-gradient-to-br from-[#003d9b] to-[#0052cc]' : 'bg-slate-200 text-slate-600'}`}>
                      <span className="material-symbols-outlined text-2xl">{note.icon}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-headline text-xl font-bold">{note.title}</h3>
                      <span className="text-xs text-slate-400 font-medium">{note.date}</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-lg mb-6">{note.content}</p>
                    {note.hasAction && (
                      <button className="bg-gradient-to-r from-[#003d9b] to-[#0052cc] text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-100 active:scale-95 transition-all">
                        Accept Invitation
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-4 text-slate-300">
              <div className="h-px w-12 bg-slate-200"></div>
              <span className="text-xs font-bold tracking-widest uppercase">End of recent activity</span>
              <div className="h-px w-12 bg-slate-200"></div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Notifications;