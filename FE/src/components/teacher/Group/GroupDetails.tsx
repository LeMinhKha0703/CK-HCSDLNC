import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { UserPlus, DownloadCloud, ArrowLeft } from 'lucide-react';
import StatCard from './StatCard';
import { TrendingUp, AlertTriangle, Star } from 'lucide-react';
import InviteStudentsModal from './InviteStudentsModal';

export interface GroupStudent {
  id: string;
  stt: string;
  name: string;
  email: string;
  averageGrade: string;
  gradeColorBg: string;
  gradeColorText: string;
}

const mockStudents: GroupStudent[] = [
  { id: '1', stt: '01', name: 'Alexander Wright', email: 'a.wright@university.edu', averageGrade: '9.2', gradeColorBg: 'bg-[#d1f4e0]', gradeColorText: 'text-[#0e7040]' },
  { id: '2', stt: '02', name: 'Benjamin Foster', email: 'b.foster@university.edu', averageGrade: '7.5', gradeColorBg: 'bg-[#e5e7eb]', gradeColorText: 'text-[#374151]' },
  { id: '3', stt: '03', name: 'Chloe Simmons', email: 'c.simmons@university.edu', averageGrade: '4.8', gradeColorBg: 'bg-[#fee2e2]', gradeColorText: 'text-[#991b1b]' },
  { id: '4', stt: '04', name: 'David Chen', email: 'd.chen@university.edu', averageGrade: '6.9', gradeColorBg: 'bg-[#e5e7eb]', gradeColorText: 'text-[#374151]' },
  { id: '5', stt: '05', name: 'Emma Thompson', email: 'e.thompson@university.edu', averageGrade: '8.7', gradeColorBg: 'bg-[#d1f4e0]', gradeColorText: 'text-[#0e7040]' },
  { id: '6', stt: '06', name: 'Frankie Müller', email: 'f.muller@university.edu', averageGrade: '3.2', gradeColorBg: 'bg-[#fee2e2]', gradeColorText: 'text-[#991b1b]' },
];

interface GroupDetailsProps {
  onBack?: () => void;
  groupTitle?: string;
  students?: GroupStudent[];
  hideStats?: boolean;
}

const GroupDetails: React.FC<GroupDetailsProps> = ({ onBack, groupTitle, students, hideStats = false }) => {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [displayedStudents, setDisplayedStudents] = useState<GroupStudent[]>(students ?? mockStudents);

  const formatStudentName = (email: string) => {
    const localPart = email.split('@')[0] || email;
    return localPart
      .split(/[._-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  };

  const handleInviteStudents = (studentEmails: string[]) => {
    setDisplayedStudents((currentStudents) => {
      const existingEmails = new Set(currentStudents.map((student) => student.email.toLowerCase()));
      const newStudents = studentEmails
        .map((email, index) => ({
          email: email.trim(),
          index,
        }))
        .filter(({ email }) => email && !existingEmails.has(email.toLowerCase()))
        .map(({ email }, index) => ({
          id: `${Date.now()}-${currentStudents.length + index}`,
          stt: String(currentStudents.length + index + 1).padStart(2, '0'),
          name: formatStudentName(email),
          email,
          averageGrade: '',
          gradeColorBg: 'bg-[#e5e7eb]',
          gradeColorText: 'text-[#374151]',
        }));

      return [...currentStudents, ...newStudents];
    });
  };

  const exportStudentsToExcel = () => {
    const worksheetData = displayedStudents.map((student) => ({
      STT: student.stt,
      'Student Name': student.name,
      Email: student.email,
      'Average Grade': student.averageGrade,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    const fileName = `${groupTitle?.replace(/\s+/g, '-') || 'group'}-directory.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
      <div className="max-w-6xl mx-auto pt-6">
        <button onClick={onBack} className="text-gray-500 hover:text-[#1a38cf] flex items-center mb-6 text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-[#111827] mb-3 tracking-tight">{groupTitle || 'Group Details'}</h1>
          <p className="text-gray-500 text-[15px]">Academic Performance & Student Progress Overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard 
            icon={<TrendingUp className="w-5 h-5 text-[#1a38cf]" />}
            iconBgColor="bg-[#e0e7ff]"
            badgeText="TOTAL"
            badgeBgColor="bg-[#e0e7ff]"
            badgeTextColor="text-[#1a38cf]"
            title="TOTAL STUDENTS"
            value={hideStats ? '' : String(displayedStudents.length)}
            subtitle="Students"
          />
          <StatCard 
            icon={<AlertTriangle className="w-5 h-5 text-[#dc2626]" />}
            iconBgColor="bg-[#fee2e2]"
            badgeText="CRITICAL"
            badgeBgColor="bg-[#fee2e2]"
            badgeTextColor="text-[#dc2626]"
            title="GRADE < 5.0"
            value={hideStats ? '' : '04'}
            subtitle="Students"
          />
          <StatCard 
            icon={<Star className="w-5 h-5 text-[#10b981]" />}
            iconBgColor="bg-[#d1fae5]"
            badgeText="EXCELLENCE"
            badgeBgColor="bg-[#d1fae5]"
            badgeTextColor="text-[#059669]"
            title="GRADE > 8.0"
            value={hideStats ? '' : '12'}
            subtitle="Students"
          />
        </div>

        {/* Directory Section */}
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-[#111827]">Student Directory</h2>
          <div className="flex space-x-4">
            <button 
              onClick={() => setIsInviteModalOpen(true)}
              className="bg-[#1a4cd2] hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center shadow-sm transition-colors text-sm"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Invite
            </button>
            <button
              onClick={exportStudentsToExcel}
              className="bg-[#1a4cd2] hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center shadow-sm transition-colors text-sm"
            >
              <DownloadCloud className="w-4 h-4 mr-2" />
              Export (Excel)
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#f9fafb] border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-[#f3f4f6]">
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">STT</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">STUDENT NAME</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">EMAIL</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">AVERAGE GRADE</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {displayedStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 text-sm text-[#1a4cd2] font-medium">{student.stt}</td>
                  <td className="py-4 px-6 text-sm font-bold text-gray-900">{student.name}</td>
                  <td className="py-4 px-6 text-sm text-gray-500">{student.email}</td>
                  <td className="py-4 px-6 text-right">
                    <span className={`inline-block px-3 py-1 rounded-md text-sm font-bold ${student.gradeColorBg} ${student.gradeColorText}`}>
                      {student.averageGrade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <InviteStudentsModal 
          isOpen={isInviteModalOpen} 
          onClose={() => setIsInviteModalOpen(false)} 
          groupTitle={groupTitle || 'Unnamed Group'} 
          onInviteStudents={handleInviteStudents}
        />
      </div>
  );
};

export default GroupDetails;