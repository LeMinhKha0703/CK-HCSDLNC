import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { UserPlus, DownloadCloud, ArrowLeft } from 'lucide-react';
import StatCard from './StatCard';
import { TrendingUp, AlertTriangle, Star } from 'lucide-react';
import InviteStudentsModal from './InviteStudentsModal';
import { useParams, useNavigate } from 'react-router-dom';
import { getGroupDetail, inviteStudents } from '../../../api/teacher';

export interface GroupStudent {
  id: string;
  stt: string;
  name: string;
  email: string;
  averageGrade: string;
  gradeColorBg: string;
  gradeColorText: string;
}

interface ApiGroupDetailResponse {
  data: {
    groupName?: string;
    students?: {
      studentId: string;
      fullName: string;
      email: string;
      averageGrade: number;
    }[];
  };
}

interface GroupStats {
  totalStudents: number;
  gradeLow: number;
  gradeHigh: number;
}

interface GroupDetailsProps {
  onBack?: () => void;
  groupTitle?: string;
  students?: GroupStudent[];
  hideStats?: boolean;
}

const getGradeColors = (grade: number) => {
  if (grade < 5) return { bg: 'bg-[#fee2e2]', text: 'text-[#991b1b]' };
  if (grade > 8) return { bg: 'bg-[#d1f4e0]', text: 'text-[#0e7040]' };
  return { bg: 'bg-[#e5e7eb]', text: 'text-[#374151]' };
};

const GroupDetails: React.FC<GroupDetailsProps> = ({ onBack, groupTitle, students, hideStats = false }) => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [displayedStudents, setDisplayedStudents] = useState<GroupStudent[]>(students ?? []);
  const [stats, setStats] = useState<GroupStats>({ totalStudents: 0, gradeLow: 0, gradeHigh: 0 });
  const [groupName, setGroupName] = useState(groupTitle || 'Group Details');
  useEffect(() => {
    if (groupId && !students) {
      getGroupDetail(groupId)
        .then((res: ApiGroupDetailResponse) => {
          const data = res.data;
          setGroupName(data.groupName || 'Group Details');
          const mapped: GroupStudent[] = (data.students || []).map((s: { studentId: string; fullName: string; email: string; averageGrade: number }, idx: number) => {
            const grade = s.averageGrade !== null && s.averageGrade !== undefined ? parseFloat(s.averageGrade.toString()) : 0;
            const colors = getGradeColors(grade);
            return {
              id: s.studentId,
              stt: String(idx + 1).padStart(2, '0'),
              name: s.fullName,
              email: s.email,
              averageGrade: grade.toFixed(1),
              gradeColorBg: colors.bg,
              gradeColorText: colors.text,
            };
          });
          setDisplayedStudents(mapped);
          setStats({
            totalStudents: mapped.length,
            gradeLow: mapped.filter(s => parseFloat(s.averageGrade) < 5).length,
            gradeHigh: mapped.filter(s => parseFloat(s.averageGrade) > 8).length,
          });
        })
        .catch(console.error);
    } else if (students) {
      setDisplayedStudents(students);
      setStats({
        totalStudents: students.length,
        gradeLow: students.filter(s => parseFloat(s.averageGrade) < 5).length,
        gradeHigh: students.filter(s => parseFloat(s.averageGrade) > 8).length,
      });
    }
  }, [groupId, students]);

  const handleInviteStudents = async (studentEmails: string[]) => {
    try {
      if (groupId) {
        await inviteStudents(groupId, studentEmails);
        // Reload sau khi invite thành công
        const res = await getGroupDetail(groupId) as ApiGroupDetailResponse;
        const data = res.data;
        const mapped: GroupStudent[] = (data.students || []).map((s: { studentId: string; fullName: string; email: string; averageGrade: number }, idx: number) => {
          const grade = s.averageGrade !== null && s.averageGrade !== undefined ? parseFloat(s.averageGrade.toString()) : 0;
          const colors = getGradeColors(grade);
          return {
            id: s.studentId,
            stt: String(idx + 1).padStart(2, '0'),
            name: s.fullName,
            email: s.email,
            averageGrade: grade.toFixed(1),
            gradeColorBg: colors.bg,
            gradeColorText: colors.text,
          };
        });
        setDisplayedStudents(mapped);
      } else {
        // Fallback khi dùng local (không có groupId)
        const existingEmails = new Set(displayedStudents.map(s => s.email.toLowerCase()));
        const newStudents = studentEmails
          .filter(email => email && !existingEmails.has(email.toLowerCase()))
          .map((email, idx) => {
            const localPart = email.split('@')[0] || email;
            const name = localPart.split(/[._-]+/).filter(Boolean).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
            return {
              id: `${Date.now()}-${idx}`,
              stt: String(displayedStudents.length + idx + 1).padStart(2, '0'),
              name,
              email,
              averageGrade: '',
              gradeColorBg: 'bg-[#e5e7eb]',
              gradeColorText: 'text-[#374151]',
            };
          });
        setDisplayedStudents(prev => [...prev, ...newStudents]);
      }
    } catch (err) {
      console.error(err);
      alert('Invite thất bại!');
    }
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
    const fileName = `${groupName.replace(/\s+/g, '-')}-directory.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
      <div className="max-w-6xl mx-auto pt-6">
        <button onClick={handleBack} className="text-gray-500 hover:text-[#1a38cf] flex items-center mb-6 text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-[#111827] mb-3 tracking-tight">{groupName}</h1>
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
            value={hideStats ? '' : String(stats.totalStudents || displayedStudents.length)}
            subtitle="Students"
          />
          <StatCard 
            icon={<AlertTriangle className="w-5 h-5 text-[#dc2626]" />}
            iconBgColor="bg-[#fee2e2]"
            badgeText="CRITICAL"
            badgeBgColor="bg-[#fee2e2]"
            badgeTextColor="text-[#dc2626]"
            title="GRADE < 5.0"
            value={hideStats ? '' : String(stats.gradeLow)}
            subtitle="Students"
          />
          <StatCard 
            icon={<Star className="w-5 h-5 text-[#10b981]" />}
            iconBgColor="bg-[#d1fae5]"
            badgeText="EXCELLENCE"
            badgeBgColor="bg-[#d1fae5]"
            badgeTextColor="text-[#059669]"
            title="GRADE > 8.0"
            value={hideStats ? '' : String(stats.gradeHigh)}
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
          groupTitle={groupName} 
          onInviteStudents={handleInviteStudents}
        />
      </div>
  );
};

export default GroupDetails;