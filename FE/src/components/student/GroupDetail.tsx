// src/components/student/GroupDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StudentSidebar } from './Dashboard';
import { getGroupDetail } from '../../api/student';

interface Exam {
  examId: string;
  title: string;
  type: string; // 'MCQ' | 'Essay'
  endAt: string | null;
  status: 'Pending' | 'Graded' | 'Locked';
  score: string; // '_/10' or 'X/10'
}

interface GroupInfo {
  groupId: string;
  groupName: string;
  teacherName: string;
  averageGrade: number | null;
  rankPosition: number | null;
  totalStudents: number;
  exams: Exam[];
}

const GroupDetail: React.FC = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState<GroupInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!groupId) return;
    getGroupDetail(groupId)
      .then(res => setGroup(res.data))
      .catch(() => setError('Không thể tải thông tin nhóm học'))
      .finally(() => setIsLoading(false));
  }, [groupId]);

  const handleAction = (exam: Exam) => {
    if (exam.status === 'Locked') return;
    
    // Nếu status = Pending -> Vào làm bài
    // Nếu status = Graded -> Đã làm, không cần làm lại (UI sẽ hiện điểm thay vì nút)
    if (exam.status === 'Pending') {
      if (exam.type === 'MCQ') {
        navigate(`/exams/mcq/${exam.examId}`);
      } else {
        navigate(`/exams/essay/${exam.examId}`);
      }
    }
  };

  return (
    <div className="flex h-screen bg-[#f8f9fa] text-[#191c1d] font-body overflow-hidden">
      <StudentSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#f8f9fa]">
        <div className="max-w-6xl mx-auto space-y-10">
          
          <button onClick={() => navigate('/student/mygroups')} className="flex items-center gap-2 text-[#003d9b] hover:text-[#0052cc] font-medium transition-colors">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Dashboard
          </button>

          {isLoading && <div className="text-center py-10">Đang tải thông tin...</div>}
          {error && <div className="text-center py-10 text-red-500">{error}</div>}

          {!isLoading && !error && group && (
            <>
              {/* Header Section */}
              <section className="space-y-6">
                <div className="space-y-3">
                  <h2 className="text-4xl md:text-6xl font-black font-headline tracking-tight text-[#191c1d]">
                    {group.groupName}
                  </h2>
                  <div className="flex items-center gap-2 text-slate-500 font-medium">
                    <span className="material-symbols-outlined text-[#003d9b] text-sm">school</span>
                    <span>{group.teacherName}</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 bg-white p-5 rounded-xl border border-[#c3c6d6]/30 shadow-sm flex items-center gap-4">
                    <div className="relative w-14 h-14 flex items-center justify-center border-4 border-[#003d9b] rounded-full text-[#003d9b] font-bold text-lg">
                      {group.averageGrade !== null ? group.averageGrade : '-'}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Average Grade</p>
                      <p className="text-lg font-bold font-headline">Subject Performance</p>
                    </div>
                  </div>

                  <div className="flex-1 bg-white p-5 rounded-xl border border-[#c3c6d6]/30 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#003d9b]">leaderboard</span>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Rank Position</p>
                      <p className="text-lg font-bold font-headline">
                        {group.rankPosition ? `${group.rankPosition}th ` : '- '}
                        <span className="text-sm font-medium text-slate-400">of {group.totalStudents} students</span>
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Exams List */}
              <section className="space-y-6">
                <h3 className="text-xl font-bold font-headline border-b border-[#c3c6d6]/30 pb-4">Upcoming & Past Exams</h3>
                
                {group.exams.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">Chưa có bài kiểm tra nào.</div>
                ) : (
                  <div className="grid gap-4">
                    {group.exams.map((exam) => (
                      <div key={exam.examId} className="flex flex-col md:flex-row items-center justify-between p-5 bg-white border border-[#c3c6d6]/20 rounded-xl hover:shadow-md transition-all gap-4">
                        <div className="flex items-center gap-5 w-full md:w-auto">
                          <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-[#003d9b] shadow-sm">
                            <span className="material-symbols-outlined">{exam.type === 'MCQ' ? 'quiz' : 'description'}</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-lg">{exam.title}</h4>
                            <div className="flex items-center gap-3 mt-1 text-xs">
                              <span className="px-2 py-0.5 rounded bg-blue-100 text-[#003d9b] font-medium uppercase tracking-wider text-[10px]">{exam.type}</span>
                              <span className="text-slate-500">
                                {exam.endAt ? `Due: ${new Date(exam.endAt).toLocaleString('vi-VN')}` : 'No due date'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="w-full md:w-auto">
                          {exam.status === 'Graded' ? (
                            <div className="text-right px-4">
                              <span className="block text-[10px] text-slate-400 font-bold uppercase">Final Score</span>
                              <span className="text-2xl font-black text-[#003d9b]">{exam.score}</span>
                            </div>
                          ) : exam.status === 'Pending' ? (
                            <button 
                              onClick={() => handleAction(exam)}
                              className="w-full md:w-32 py-2.5 rounded-lg font-bold text-sm bg-gradient-to-r from-[#003d9b] to-[#0052cc] text-white shadow-lg shadow-blue-500/20 hover:opacity-90 active:scale-95 transition-all"
                            >
                              Do
                            </button>
                          ) : (
                            <button 
                              disabled
                              className="w-full md:w-32 py-2.5 rounded-lg font-bold text-sm border-2 border-[#c3c6d6] text-[#c3c6d6] cursor-not-allowed transition-all"
                            >
                              Locked
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default GroupDetail;
