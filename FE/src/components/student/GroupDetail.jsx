import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar/SideBar';

const GroupDetail = () => {
  const { groupName } = useParams(); // Lấy tên môn học từ URL
  const navigate = useNavigate();

  const assignments = [
    { id: 1, title: "Fiscal Policy Analysis", type: "Essay", status: "Due in 3 days", action: "Do", isLocked: false },
    { id: 2, title: "Monetary Theory Quiz", type: "Essay", status: "Completed Oct 12", score: "_ /10", isLocked: false },
    { id: 3, title: "Global Market Dynamics", type: "Essay", status: "Available next week", action: "Locked", isLocked: true },
  ];

  // Logic xử lý khi bấm nút "Do"
  const handleAction = (item) => {
    if (item.isLocked) return; // Nếu bị khóa thì không làm gì cả

    if (item.type === "Multiple Choice") {
      navigate(`/exams/quiz/${item.id}`); // Điều hướng sang trang trắc nghiệm
    } else {
      navigate(`/exams/essay/${item.id}`); // Điều hướng sang trang tự luận
    }
  };

  return (
    <div className="flex h-screen bg-[#f8f9fa] text-[#191c1d] font-body overflow-hidden">
      <Sidebar type="student" />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#f8f9fa]">
        <div className="max-w-6xl mx-auto space-y-10">
          
          {/* Header Section */}
          <section className="space-y-6">
            <div className="space-y-3">
              <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-[#003d9b] hover:text-[#0052cc] font-medium transition-colors">
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Back to Dashboard
              </button>
              <h2 className="text-4xl md:text-6xl font-black font-headline tracking-tight text-[#191c1d]">
                {groupName || "Course Detail"}
              </h2>
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <span className="material-symbols-outlined text-[#003d9b] text-sm">school</span>
                <span>Prof. Marcus Thorne</span>
              </div>
            </div>

            {/* Metrics */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="relative w-14 h-14 flex items-center justify-center border-4 border-blue-700 rounded-full text-[#003d9b] font-bold text-lg">
                  8.5
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Average Grade</p>
                  <p className="text-lg font-bold font-headline">Subject Performance</p>
                </div>
              </div>

              <div className="flex-1 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#003d9b]">leaderboard</span>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Rank Position</p>
                  <p className="text-lg font-bold font-headline">12th <span className="text-sm font-medium text-slate-400">of 45 students</span></p>
                </div>
              </div>
            </div>
          </section>

          {/* Assignments List */}
          <section className="space-y-6">
            <h3 className="text-xl font-bold font-headline border-b border-slate-200 pb-4">Upcoming & Past Assignments</h3>
            <div className="grid gap-4">
              {assignments.map((as) => (
                <div key={as.id} className="flex flex-col md:flex-row items-center justify-between p-5 bg-[#edeeef]/50 rounded-xl hover:bg-[#edeeef] transition-all gap-4">
                  <div className="flex items-center gap-5 w-full md:w-auto">
                    <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center text-[#003d9b] shadow-sm">
                      <span className="material-symbols-outlined">{as.score ? 'quiz' : 'description'}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{as.title}</h4>
                      <div className="flex items-center gap-3 mt-1 text-xs">
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-[#003d9b] font-medium">{as.type}</span>
                        <span className="text-slate-500">{as.status}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-auto">
                    {as.score ? (
                      <div className="text-right px-4">
                        <span className="block text-[10px] text-slate-400 font-bold uppercase">Final Score</span>
                        <span className="text-2xl font-black text-[#003d9b]">{as.score}</span>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleAction(as)}
                        className={`w-full md:w-32 py-2.5 rounded-lg font-bold text-sm transition-all ${as.isLocked ? 'border-2 border-[#003d9b] text-[#003d9b] cursor-not-allowed' : 'bg-gradient-to-r from-[#003d9b] to-[#0052cc] text-white shadow-lg shadow-blue-200 hover:scale-105 active:scale-95'}`}
                      >
                        {as.action}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default GroupDetail;