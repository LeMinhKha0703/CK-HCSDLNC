import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { Calendar, DownloadCloud, ArrowLeft } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { useNavigate, useParams } from 'react-router-dom';
import { getExamDetail } from '../../../api/teacher';

interface Submission {
  submissionId: string;
  fullName: string;
  status: string;
  totalScore: number | null;
  submitedAt: string;
}

interface ChartPoint {
  questionId: string;
  averageScore: number;
}

interface ExamDetail {
  examId: string;
  title: string;
  type: string;
  totalQuestions: number;
  createdAt: string;
  endAt: string;
  submissions: Submission[];
  chartData: ChartPoint[];
}

const EssayDetails: React.FC = () => {
  const navigate = useNavigate();
  const { examId } = useParams<{ examId: string }>();
  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!examId) return;
    getExamDetail(examId)
      .then(res => setExam(res.data))
      .catch(() => setError('Failed to load exam details.'))
      .finally(() => setIsLoading(false));
  }, [examId]);

  const handleGrade = (subId: string) => {
    if (examId) navigate(`/teacher/exams/essay/${examId}/grade/${subId}`);
  };

  const handleReview = (subId: string) => {
    if (examId) navigate(`/teacher/exams/essay/${examId}/review/${subId}`);
  };

  const exportSubmissionsToExcel = () => {
    if (!exam) return;
    const worksheetData = exam.submissions.map((sub, idx) => ({
      STT: String(idx + 1).padStart(2, '0'),
      'Student Name': sub.fullName,
      Status: sub.status,
      Score: sub.totalScore !== null ? `${sub.totalScore}/10` : '_/10',
    }));
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Submissions');
    XLSX.writeFile(workbook, 'essay-submissions.xlsx');
  };

  // Chuẩn bị dữ liệu biểu đồ từ MongoDB Aggregation Pipeline
  // Điểm tối đa mỗi câu luôn tính trên thang 10
  const maxScorePerQuestion = 10;
  const chartData = (exam?.chartData ?? []).map(d => ({
    question: d.questionId,
    averageScore: d.averageScore,
  }));

  if (isLoading) return <div className="max-w-6xl mx-auto pt-6 text-center py-20 text-slate-400">Loading exam details...</div>;
  if (error || !exam) return <div className="max-w-6xl mx-auto pt-6 text-center py-20 text-red-500">{error || 'Exam not found.'}</div>;

  return (
    <div className="max-w-6xl mx-auto pt-6">

      <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-[#1a38cf] flex items-center mb-6 text-sm font-medium transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </button>

      {/* Header Block */}
      <div className="bg-[#f3f4f6] rounded-xl p-8 mb-8 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-[32px] font-bold text-[#111827] leading-none mb-3">{exam.title}</h1>
          <div className="flex items-center space-x-4 mb-3">
            <span className="bg-[#e2e8f0] text-gray-700 text-xs font-bold px-3 py-1 rounded">ESSAY</span>
            <span className="text-sm text-gray-600 font-medium">
              Created: {new Date(exam.createdAt).toLocaleDateString('en-US')}
            </span>
            <div className="flex items-center text-sm text-gray-600 font-medium">
              <Calendar className="w-4 h-4 mr-2" />
              Due: {new Date(exam.endAt).toLocaleDateString('en-US')}
            </div>
          </div>
        </div>
        <button onClick={exportSubmissionsToExcel} className="bg-[#0a44cc] hover:bg-[#0a3bbb] text-white px-6 py-2.5 rounded-lg font-bold text-sm flex items-center shadow-sm transition-colors">
          <DownloadCloud className="w-4 h-4 mr-2" /> Export (Excel)
        </button>
      </div>

      {/* Analytics Chart — Data from MongoDB Aggregation Pipeline */}
      <div className="bg-[#f3f4f6] rounded-xl p-8 mb-8 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900">Average Score per Question</h2>
          <p className="text-sm text-gray-500 mt-1">Average score per question (scale 0–{maxScorePerQuestion})</p>
        </div>
        {chartData.length === 0 ? (
          <div className="text-center py-10 text-gray-400 italic">No graded submission data available for chart yet.</div>
        ) : (
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 12, left: 0, bottom: 12 }}>
                <CartesianGrid stroke="#e5e7eb" vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="question"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  label={{ value: 'Question', position: 'bottom', offset: 0, fill: '#6b7280', fontSize: 12 }}
                />
                <YAxis
                  type="number"
                  domain={[0, maxScorePerQuestion]}
                  ticks={[0, 2, 4, 6, 8, 10]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  width={35}
                  label={{ value: 'Avg Score', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(59,130,246,0.08)' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 10px 30px rgba(15,23,42,0.08)' }}
                  formatter={(value: number) => [`${value.toFixed(2)} / 10`, 'Avg Score']}
                />
                <Bar dataKey="averageScore" name="Average Score" fill="#1a4cd2" radius={[8, 8, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Student Submissions section */}
      <div className="bg-[#f3f4f6] rounded-xl shadow-sm overflow-hidden mb-10 pt-4">
        <div className="pl-6 pb-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-[#111827]">Student Submissions ({exam.submissions.length})</h2>
        </div>
        <div className="bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-t border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                <th className="py-4 px-8 w-24">STT</th>
                <th className="py-4 px-8">STUDENT NAME</th>
                <th className="py-4 px-8">STATUS</th>
                <th className="py-4 px-8">SCORE</th>
                <th className="py-4 px-8 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {exam.submissions.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-slate-400">No submissions yet.</td></tr>
              ) : exam.submissions.map((sub, idx) => {
                const statusColor =
                  sub.status === 'Graded' ? 'bg-gray-200 text-gray-700' :
                  sub.status === 'Pending' ? 'bg-[#e0e7ff] text-[#1a38cf]' :
                  'bg-gray-100 text-gray-500';
                return (
                  <tr key={sub.submissionId} className="hover:bg-gray-50 transition-colors">
                    <td className="py-5 px-8 text-[14px] text-gray-500 font-medium">
                      {String(idx + 1).padStart(2, '0')}
                    </td>
                    <td className="py-5 px-8 text-[14px] font-bold text-gray-900">{sub.fullName}</td>
                    <td className="py-5 px-8">
                      <span className={`inline-block px-3 py-1 rounded-md text-xs font-semibold ${statusColor}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-5 px-8 text-[14px] font-bold text-[#1a4cd2]">
                      {sub.status === 'Graded' && sub.totalScore !== null
                        ? `${sub.totalScore}/10`
                        : <span className="italic text-gray-500 font-normal">_/10</span>
                      }
                    </td>
                    <td className="py-5 px-8 text-right">
                      {sub.status === 'Graded' ? (
                        <button
                          onClick={() => handleReview(sub.submissionId)}
                          className="text-[#1a38cf] font-semibold text-sm hover:underline"
                        >
                          Review
                        </button>
                      ) : sub.status === 'Pending' ? (
                        <button
                          onClick={() => handleGrade(sub.submissionId)}
                          className="bg-[#b6c6ff] hover:bg-[#a3b7ff] text-[#1a38cf] px-6 py-1.5 rounded-md font-semibold text-sm transition-colors"
                        >
                          Grade
                        </button>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EssayDetails;