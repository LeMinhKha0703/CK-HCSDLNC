import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { ArrowLeft, Calendar, DownloadCloud } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate, useParams } from 'react-router-dom';

interface MCQDetailsProps {
  onBack?: () => void;
  assignmentTitle?: string;
}

const mockSubmissions = [
  { stt: '01', initials: 'AS', name: 'Alice Smith', bg: 'bg-[#cdd8ff]', score: '9/10', scoreColor: 'text-gray-900', status: 'Graded', statusColor: 'bg-gray-200 text-gray-700' },
  { stt: '02', initials: 'BJ', name: 'Bob Johnson', bg: 'bg-[#cdd8ff]', score: '8/10', scoreColor: 'text-gray-900', status: 'Graded', statusColor: 'bg-gray-200 text-gray-700' },
  { stt: '03', initials: 'CD', name: 'Charlie Davis', bg: 'bg-[#cdd8ff]', score: '_ / 10', scoreColor: 'text-[#6b7280]', status: 'Not Submitted', statusColor: 'bg-gray-100 text-gray-500' },
  { stt: '04', initials: 'EE', name: 'Eva Evans', bg: 'bg-[#cdd8ff]', score: '9/10', scoreColor: 'text-gray-900', status: 'Graded', statusColor: 'bg-gray-200 text-gray-700' },
];

const questionData = [
  { question: 1, students: 3 },
  { question: 2, students: 4 },
  { question: 3, students: 2 },
  { question: 4, students: 5 },
  { question: 5, students: 1 },
  { question: 6, students: 3 },
  { question: 7, students: 4 },
  { question: 8, students: 2 },
  { question: 9, students: 5 },
  { question: 10, students: 3 },
];

const MCQDetails: React.FC<MCQDetailsProps> = ({ onBack, assignmentTitle }) => {
  const navigate = useNavigate();
  const { examId } = useParams();
  const [reviewingStudent, setReviewingStudent] = useState<string | null>(null);
  const totalStudents = mockSubmissions.length;

  const handleReview = (subId: string) => {
    if (examId) navigate(`/teacher/exams/mcq/${examId}/review/${subId}`);
    else setReviewingStudent(subId);
  };

  const exportSubmissionsToExcel = () => {
    const worksheetData = mockSubmissions.map((submission) => ({
      STT: submission.stt,
      'Student Name': submission.name,
      Status: submission.status,
      Score: submission.score,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Submissions');
    XLSX.writeFile(workbook, 'mcq-submissions.xlsx');
  };

  if (reviewingStudent) {
    return <MCQStudentResult studentName={reviewingStudent} onBack={() => setReviewingStudent(null)} />;
  }

  return (
    <div className="max-w-6xl mx-auto pt-6">
    
        {/* Header Navigation */}
        <div className="flex justify-between items-center mb-6">
            <button onClick={onBack || (() => navigate(-1))} className="text-gray-500 hover:text-[#1a38cf] flex items-center mb-6 text-sm font-medium transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
        </div>

        {/* Header Block */}
        <div className="bg-[#f3f4f6] rounded-xl p-8 mb-8 flex justify-between items-center shadow-sm">
          <div>
            <h1 className="text-[32px] font-bold text-[#111827] leading-none mb-3">{assignmentTitle}</h1>
            <div className="flex items-center space-x-4 mb-3">
              <span className="bg-[#e2e8f0] text-gray-700 text-xs font-bold px-3 py-1 rounded">MULTIPLE CHOICE</span>
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
                <h2 className="text-lg font-bold text-gray-900">Question Performance</h2>
                <p className="text-sm text-gray-500 mt-1">Students who answered each question correctly</p>
              </div>
              {/* <button className="text-gray-500 hover:text-gray-800">
                <MoreHorizontal className="w-5 h-5" />
              </button> */}
            </div>

            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={questionData} margin={{ top: 20, right: 12, left: 0, bottom: 12 }}>
                  <CartesianGrid stroke="#e5e7eb" vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="question" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} label={{ value: 'Question', position: 'bottom', offset: 0, fill: '#6b7280', fontSize: 12 }} />
                  <YAxis domain={[0, totalStudents]} allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} width={35} label={{ value: 'Students', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 12 }}/>
                  <Tooltip cursor={{ fill: 'rgba(59,130,246,0.08)' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 10px 30px rgba(15,23,42,0.08)' }} />
                  <Bar dataKey="students" fill="#1a4cd2" radius={[8, 8, 0, 0]} barSize={20} />
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
                      {sub.status === 'Not Submitted' ? null : sub.status === 'Graded' ? (
                        <button
                          onClick={() => handleReview(sub.stt)}
                          className="text-[#1a38cf] font-semibold text-sm hover:underline"
                        >
                          Review
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

export default MCQDetails;
