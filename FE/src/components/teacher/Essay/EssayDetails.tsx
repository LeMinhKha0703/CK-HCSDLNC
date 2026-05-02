import React from 'react';
import * as XLSX from 'xlsx';
import { Calendar, DownloadCloud, ArrowLeft } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useNavigate, useParams } from 'react-router-dom';

interface EssayDetailsProps {
  onBack?: () => void;
  assignmentTitle?: string;
}

const mockSubmissions = [
  { stt: '01', name: 'Alexander Wright', status: 'Graded', score: '8.5', action: 'Review', statusColor: 'bg-gray-200 text-gray-700' },
  { stt: '02', name: 'Benjamin Foster', status: 'Submitted', score: '-', action: 'Grade', statusColor: 'bg-[#e0e7ff] text-[#1a38cf]' },
  { stt: '03', name: 'Chloe Simmons', status: 'Graded', score: '9.2', action: 'Review', statusColor: 'bg-gray-200 text-gray-700' },
  { stt: '04', name: 'David Chen', status: 'Not Submitted', score: '-', action: '-', statusColor: 'bg-gray-100 text-gray-500' },
  { stt: '05', name: 'Emma Thompson', status: 'Submitted', score: '-', action: 'Grade', statusColor: 'bg-[#e0e7ff] text-[#1a38cf]' },
];

const mockChartData = [
  { question: 1, averageScore: 0.8 },
  { question: 2, averageScore: 0.65 },
  { question: 3, averageScore: 0.9 },
  { question: 4, averageScore: 0.4 },
  { question: 5, averageScore: 0.75 },
  { question: 6, averageScore: 0.85 },
  { question: 7, averageScore: 0.6 },
  { question: 8, averageScore: 0.35 },
  { question: 9, averageScore: 0.5 },
  { question: 10, averageScore: 0.45 },
];

const maxScorePerQuestion = 1;

const EssayDetails: React.FC<EssayDetailsProps> = ({ onBack, assignmentTitle }) => {
  const navigate = useNavigate();
  const { examId } = useParams();

  const handleGrade = (subId: string) => {
    if (examId) navigate(`/teacher/exams/essay/${examId}/grade/${subId}`);
  };

  const handleReview = (subId: string) => {
    if (examId) navigate(`/teacher/exams/essay/${examId}/review/${subId}`);
  };

  const exportSubmissionsToExcel = () => {
    const worksheetData = mockSubmissions.map((submission) => ({
      STT: submission.stt,
      'Student Name': submission.name,
      Status: submission.status,
      Score: submission.score,
      Action: submission.action,
    }));
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Submissions');
    XLSX.writeFile(workbook, 'essay-submissions.xlsx');
  };

  return (
      <div className="max-w-6xl mx-auto pt-6">
        <button onClick={onBack || (() => navigate(-1))} className="text-gray-500 hover:text-[#1a38cf] flex items-center mb-6 text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        {/* Header Block */}
        <div className="bg-[#f3f4f6] rounded-xl p-8 mb-8 flex justify-between items-center shadow-sm">
          <div>
            <h1 className="text-[32px] font-bold text-[#111827] leading-none mb-3">{assignmentTitle}</h1>
            <div className="flex items-center space-x-4 mb-3">
              <span className="bg-[#e2e8f0] text-gray-700 text-xs font-bold px-3 py-1 rounded">ESSAY</span>
              <span className="text-sm text-gray-600 font-medium">Created: Oct 20, 2023</span>
              <div className="flex items-center text-sm text-gray-600 font-medium">
                <Calendar className="w-4 h-4 mr-2" />
                Due: Dec 15, 2023
              </div>
            </div>
          </div>

          <button onClick={exportSubmissionsToExcel} className="bg-[#0a44cc] hover:bg-[#0a3bbb] text-white px-6 py-2.5 rounded-lg font-bold text-sm flex items-center shadow-sm transition-colors">
            <DownloadCloud className="w-4 h-4 mr-2" />
            Export (Excel)
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:col-span-3 gap-6 mb-8">
          
          {/* Score Distribution */}
          <div className="md:col-span-2 bg-[#f3f4f6] rounded-xl p-8 relative shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Average Score per Question</h2>
                <p className="text-sm text-gray-500 mt-1">Average score normalized from 0 to {maxScorePerQuestion}</p>
              </div>
              {/* <button className="text-gray-500 hover:text-gray-800">
                <MoreHorizontal className="w-5 h-5" />
              </button> */}
            </div>

            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockChartData} margin={{ top: 20, right: 12, left: 0, bottom: 12 }}>
                  <CartesianGrid stroke="#e5e7eb" vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="question" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} label={{ value: 'Number of questions', position: 'bottom', offset: 0, fill: '#6b7280', fontSize: 12 }} />
                  <YAxis type="number" domain={[0, maxScorePerQuestion]} ticks={[0, maxScorePerQuestion]} axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} width={35} label={{ value: 'Average score', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 12 }}/>
                  <Bar dataKey="averageScore" fill="#1a4cd2" radius={[8, 8, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Student Submissions section */}
        <div className="bg-[#f3f4f6] rounded-xl shadow-sm overflow-hidden mb-10 pt-4">
          <div className="pl-6 pb-4 flex justify-between items-center">
            <h2 className="text-lg font-bold text-[#111827]">Student Submissions</h2>
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
                {mockSubmissions.map((sub, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="py-5 px-8 text-[14px] text-gray-500 font-medium">{sub.stt}</td>
                    <td className="py-5 px-8 text-[14px] font-bold text-gray-900">{sub.name}</td>
                    <td className="py-5 px-8">
                      <span className={`inline-block px-3 py-1 rounded-md text-xs font-semibold ${sub.statusColor}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-5 px-8 text-[14px] font-bold text-[#1a4cd2]">
                      {sub.status === 'Not Submitted' ? (
                        <span className="italic text-gray-500 font-normal">_ / 10</span>
                      ) : (
                        sub.score
                      )}
                    </td>
                    <td className="py-5 px-8 text-right">
                      {sub.status === 'Graded' ? (
                        <button 
                          onClick={() => handleReview(sub.stt)}
                          className="text-[#1a38cf] font-semibold text-sm hover:underline">
                          Review
                        </button>
                      ) : sub.status === 'Submitted' ? (
                        <button 
                          onClick={() => handleGrade(sub.stt)}
                          className="bg-[#b6c6ff] hover:bg-[#a3b7ff] text-[#1a38cf] px-6 py-1.5 rounded-md font-semibold text-sm transition-colors"
                        >
                          Grade
                        </button>
                      ) : (
                        <span className="text-gray-400"></span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
};

export default EssayDetails;