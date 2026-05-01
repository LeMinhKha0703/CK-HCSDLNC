import { useNavigate } from 'react-router-dom';
import { Users, FileText, LogOut } from 'lucide-react';

interface SideBarProps {
  type?: 'exam' | 'admin' | 'student' | 'teacher';
  currentQuestion?: number | string;
  onQuestionSelect?: (id: number | string) => void;
  answers?: Record<string, unknown>;
  questions?: Array<{ id: number | string }>;
  activeMenu?: string;
  setActiveMenu?: (menu: string) => void;
}

const SideBar = ({
  type = 'student',
  currentQuestion,
  onQuestionSelect,
  answers = {},
  questions = [],
  activeMenu = 'groups',
  setActiveMenu = () => {},
}: SideBarProps) => {
  const navigate = useNavigate();

  if (type === 'teacher') {
    return (
      <div className="w-64 bg-[#f8f9fc] h-screen border-r border-gray-200 flex flex-col py-8 shadow-sm">
        <div className="px-8 mb-5">
          <h1 className="text-[#1a38cf] font-bold text-lg tracking-tight">Teacher</h1>
        </div>

        <div className="px-8 mb-12">
          <h1 className="text-gray-500 font-semibold text-sm tracking-tight">(Teacher's name here)</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <button
            onClick={() => setActiveMenu('groups')}
            className={`w-full flex items-center px-8 py-3 transition-colors font-medium ${
              activeMenu === 'groups'
                ? 'bg-white text-[#1a38cf] shadow-sm border-r-[3px] border-[#1a38cf]'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`}
          >
            <Users className="w-5 h-5 mr-3" />
            Group Management
          </button>
          <button
            onClick={() => setActiveMenu('exams')}
            className={`w-full flex items-center px-8 py-3 transition-colors font-medium ${
              activeMenu === 'exams'
                ? 'bg-white text-[#1a38cf] shadow-sm border-r-[3px] border-[#1a38cf]'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`}
          >
            <FileText className="w-5 h-5 mr-3" />
            Exam Management
          </button>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="flex w-full items-center px-8 py-3 text-gray-500 hover:text-gray-700 transition-colors font-medium"
          >
            <LogOut className="w-5 h-5 mr-3 -rotate-180" />
            Log out
          </button>
        </nav>
      </div>
    );
  }

  if (type === 'exam') {
    return (
      <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-slate-50 flex flex-col p-4 overflow-y-auto hidden md:flex border-r border-slate-100">
        <div className="mb-6">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest font-headline">Question Navigator</h2>
          <p className="text-xs text-slate-500 font-medium">{questions.length || 50} Total Questions</p>
        </div>
        <div className="grid grid-cols-5 gap-2 mb-8">
          {questions.map((q) => (
            <div
              key={q.id}
              onClick={() => onQuestionSelect?.(q.id)}
              className={`h-10 w-10 flex items-center justify-center text-xs font-bold transition-all cursor-pointer rounded-md border
              ${currentQuestion === q.id
                ? 'bg-blue-600 text-white scale-90'
                : answers[q.id]
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'}`}
            >
              {q.id}
            </div>
          ))}
        </div>
      </aside>
    );
  }

  if (type === 'admin') {
    return (
      <aside className="fixed left-0 top-0 h-full w-64 border-r border-slate-100 bg-white shadow-xl shadow-slate-200/20 flex flex-col p-4 gap-2 z-30">
        <div className="mb-8 px-2 flex items-center gap-3">
          <div>
            <h1 className="font-['Manrope'] font-black text-[#003d9b] text-lg leading-tight">Admin</h1>
            <p className="text-xs text-slate-500">System Management</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          <a className="flex items-center gap-3 px-3 py-2.5 text-[#0052cc] font-semibold bg-blue-50 rounded-lg" href="#">
            <span className="material-symbols-outlined">group</span>
            <span className="font-['Manrope']">User Management</span>
          </a>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-all"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-['Manrope']">Log out</span>
          </button>
        </nav>
      </aside>
    );
  }

  if (type === 'student') {
    return (
      <aside className="hidden md:flex h-screen w-64 bg-white flex-col py-8 px-4 shrink-0 border-r border-[#edeeef] shadow-sm">
        <div className="mb-10 px-2">
          <h1 className="text-xl font-black text-[#003d9b] tracking-tight">Student</h1>
          <p className="text-xs text-slate-500 mt-1">Julian Reed</p>
        </div>
        <nav className="flex-1 space-y-2">
          <button
            onClick={() => navigate('/dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${window.location.pathname.includes('dashboard') ? 'bg-blue-50 text-[#003d9b] font-bold border-r-4 border-[#003d9b]' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <span className="material-symbols-outlined">group</span>
            <span className="text-sm font-medium">My Groups</span>
          </button>

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
    );
  }

  return null;
};

export default SideBar;
