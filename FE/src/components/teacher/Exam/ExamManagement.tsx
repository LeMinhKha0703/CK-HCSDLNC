import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { DownloadCloud, Plus, CheckCircle, FileText, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getExams } from '../../../api/teacher';



type AssignmentRecord = {
  examId: string;
  stt: string;
  name: string;
  group: string;
  type: string;
  createdAt: string;
  dueDate: string;
};

const ExamManagement = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(assignments.length / pageSize));
  const visibleAssignments = assignments.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const currentStart = assignments.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const currentEnd = Math.min(currentPage * pageSize, assignments.length);
  const pageWindowStart = Math.min(Math.max(1, currentPage), Math.max(1, totalPages - 2));
  const paginationPages = Array.from({ length: Math.min(3, totalPages) }, (_, i) => pageWindowStart + i);

  useEffect(() => {
    setIsLoading(true);
    getExams()
      .then(res => {
        const data = res.data.map((e: { examId: string; title: string; groupName: string; type: string; createdAt: string; endAt: string }, idx: number) => ({
          examId: e.examId,
          stt: String(idx + 1).padStart(2, '0'),
          name: e.title,
          group: e.groupName,
          type: e.type,
          createdAt: new Date(e.createdAt).toLocaleDateString('vi-VN'),
          dueDate: e.endAt ? new Date(e.endAt).toLocaleDateString('vi-VN') : '-',
        }));
        setAssignments(data);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const exportAssignmentsToExcel = () => {
    const worksheetData = assignments.map((assignment) => ({
      STT: assignment.stt,
      'Assignment Name': assignment.name,
      Group: assignment.group,
      Type: assignment.type,
      'Created At': assignment.createdAt,
      'Due Date': assignment.dueDate,
    }));
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Assignments');
    XLSX.writeFile(workbook, 'assignments-directory.xlsx');
  };

  return (
      <div className="max-w-6xl mx-auto pt-6">
        <div className="flex justify-between items-start mb-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold text-[#111827] mb-3 tracking-tight">Exam Management</h1>
            <p className="text-gray-600 text-[15px] leading-relaxed">
              Curate, analyze, and manage student assessments with editorial precision.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#f0f2f5] rounded-xl p-8 border border-white relative overflow-hidden h-[180px] shadow-sm">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <p className="text-gray-700 text-[14px] font-medium">Total Assignments</p>
              <h2 className="text-[54px] font-bold text-[#1a4cd2] leading-none mb-1">{assignments.length}</h2>
            </div>
            <div className="absolute -right-4 -bottom-10 opacity-[0.04] text-gray-900 pointer-events-none">
              <ClipboardList className="w-44 h-44" strokeWidth={1} />
            </div>
          </div>
          <div className="bg-[#f0f2f5] rounded-xl p-8 border border-white relative overflow-hidden h-[180px] shadow-sm">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <p className="text-gray-700 text-[14px] font-medium">Multiple Choice Assignments</p>
              <h2 className="text-[54px] font-bold text-[#1a4cd2] leading-none mb-1">{assignments.filter(a => a.type === 'MCQ').length}</h2>
            </div>
            <div className="absolute -right-4 -bottom-6 opacity-[0.04] text-gray-900 pointer-events-none flex flex-col space-y-3">
              <div className="flex items-center space-x-3"><CheckCircle className="w-12 h-12" /><div className="w-16 h-4 bg-gray-900 rounded"></div></div>
              <div className="flex items-center space-x-3"><CheckCircle className="w-12 h-12" /><div className="w-16 h-4 bg-gray-900 rounded"></div></div>
            </div>
          </div>
          <div className="bg-[#f0f2f5] rounded-xl p-8 border border-white relative overflow-hidden h-[180px] shadow-sm">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <p className="text-gray-700 text-[14px] font-medium">Essay Assignments</p>
              <h2 className="text-[54px] font-bold text-[#1a4cd2] leading-none mb-1">{assignments.filter(a => a.type === 'Essay').length}</h2>
            </div>
            <div className="absolute -right-4 -bottom-8 opacity-[0.04] text-gray-900 pointer-events-none">
              <FileText className="w-44 h-44" strokeWidth={1} />
            </div>
          </div>
        </div>

        {/* Assignments Table Section */}
        <div className="mb-10">
          <div className="flex justify-between items-end mb-6 px-1">
            <h2 className="text-xl font-bold text-[#111827]">Assignments</h2>
            <div className="flex space-x-3 items-center">
              <button 
                onClick={() => navigate('/teacher/createexam')}
                className="bg-[#1a4cd2] hover:bg-blue-800 text-white px-5 py-3 rounded-lg font-bold text-[14px] flex items-center shadow-sm transition-colors mt-2"
              >
                <Plus className="w-4 h-4 mr-2 stroke-[3px]" />
                Create
              </button>
              <button
                onClick={exportAssignmentsToExcel}
                className="bg-[#1a4cd2] hover:bg-blue-800 text-white px-5 py-3 rounded-lg font-bold text-[14px] flex items-center shadow-sm transition-colors mt-2"
              >
                <DownloadCloud className="w-5 h-5 mr-2" />
                Export (Excel)
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 pb-4">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                   <th className="py-5 px-8 w-24">STT</th>
                   <th className="py-5 px-8">ASSIGNMENT NAME</th>
                   <th className="py-5 px-8">TYPE</th>
                   <th className="py-5 px-8">CREATED AT</th>
                   <th className="py-5 px-8">DUE DATE</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                 {isLoading ? (
                   <tr><td colSpan={5} className="text-center py-8 text-slate-400">Đang tải...</td></tr>
                 ) : visibleAssignments.length === 0 ? (
                   <tr><td colSpan={5} className="text-center py-8 text-slate-400">Chưa có bài kiểm tra nào</td></tr>
                 ) : visibleAssignments.map((assignment, idx) => (
                  <tr 
                    key={idx} 
                    className={`hover:bg-gray-50/50 transition-colors group cursor-pointer`}
                    onClick={() => {
                      if (assignment.type === 'Essay') navigate(`/teacher/exams/essay/${assignment.examId}`);
                      else navigate(`/teacher/exams/mcq/${assignment.examId}`);
                    }}
                  >
                     <td className="py-5 px-8 text-[14px] text-gray-500 font-medium">
                       {assignment.stt}
                     </td>
                     <td className="py-5 px-8">
                       <div className="text-[15px] font-bold text-[#111827] mb-1 group-hover:text-[#1a38cf] transition-colors">{assignment.name}</div>
                       <div className="text-[13px] text-gray-500 font-medium">{assignment.group}</div>
                     </td>
                     <td className="py-5 px-8">
                       <span className={`inline-flex items-center px-4 py-1 rounded-full text-[11px] font-bold ${
                         assignment.type === 'Essay' ? 'bg-[#cdd8ff] text-[#1a38cf]' : 'bg-[#e0e7ff] text-[#1a38cf]'
                       }`}>
                         {assignment.type}
                       </span>
                     </td>
                     <td className="py-5 px-8 text-[14px] text-gray-600 font-medium">{assignment.createdAt}</td>
                     <td className="py-5 px-8 text-[14px] text-gray-600 font-medium">{assignment.dueDate}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
             
             <div className="px-8 mt-5 flex justify-between items-center text-[13px] text-gray-500">
               <span className="font-medium">Showing <span className="font-bold text-gray-900">{currentStart}-{currentEnd}</span> of {assignments.length} assignments</span>
               <div className="flex space-x-1.5 items-center">
                 <button
                   type="button"
                   onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                   disabled={currentPage === 1}
                   className="px-3.5 py-1.5 border border-gray-200 text-gray-600 rounded bg-white hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   Previous
                 </button>
                 {paginationPages.map((page) => (
                   <button
                     key={page}
                     type="button"
                     onClick={() => setCurrentPage(page)}
                     className={`px-3 py-1.5 rounded text-center min-w-[32px] font-semibold transition-colors ${
                       currentPage === page
                         ? 'text-[#1a38cf] border border-[#1a38cf] bg-[#f0f4ff]'
                         : 'text-gray-600 border border-gray-200 bg-white hover:bg-gray-50'
                     }`}
                   >
                     {page}
                   </button>
                 ))}
                 <button
                   type="button"
                   onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                   disabled={currentPage === totalPages}
                   className="px-3.5 py-1.5 border border-gray-200 text-gray-600 rounded bg-white hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   Next
                 </button>
               </div>
             </div>
          </div>
        </div>
      </div>
  );
};

export default ExamManagement;
