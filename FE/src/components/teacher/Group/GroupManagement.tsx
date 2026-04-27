import { useState } from 'react';
import { GraduationCap, Compass, Code, Brain, Plus } from 'lucide-react';
import GroupCard from './GroupCard';
import CreateGroupModal from './CreateGroupModal';
import GroupDetails, { type GroupStudent } from './GroupDetails';

interface CreatedGroup {
  id: string;
  title: string;
  students: GroupStudent[];
}

const mockGroups = [
  {
    id: 1,
    title: 'Advanced Data Structures - Section A',
    studentsCount: 32,
    createdDate: 'Sep 12, 2023',
    icon: <GraduationCap className="h-8 w-8 text-white" />,
    iconBgColor: 'bg-[#1a4cd2]',
  },
  {
    id: 2,
    title: 'System Architecture & Design',
    studentsCount: 28,
    createdDate: 'Oct 05, 2023',
    icon: <Compass className="h-7 w-7 text-[#1a38cf]" />,
    iconBgColor: 'bg-[#cdd8ff]',
  },
  {
    id: 3,
    title: 'Backend Engineering Fundamentals',
    studentsCount: 45,
    createdDate: 'Nov 18, 2023',
    icon: <Code className="h-7 w-7 text-[#a53b26]" />,
    iconBgColor: 'bg-[#fae6de]',
  },
  {
    id: 4,
    title: 'Machine Learning Basics',
    studentsCount: 19,
    createdDate: 'Jan 10, 2024',
    icon: <Brain className="h-7 w-7 text-[#0a1e3f]" />,
    iconBgColor: 'bg-[#d8e3ff]',
  },
];

const formatStudentName = (email: string) => {
  const localPart = email.split('@')[0] || email;
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
};

const GroupManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedCreatedGroup, setSelectedCreatedGroup] = useState<CreatedGroup | null>(null);
  const [createdGroups, setCreatedGroups] = useState<CreatedGroup[]>([]);

  const handleCreateGroup = (groupName: string, studentEmails: string[]) => {
    const students: GroupStudent[] = studentEmails.map((email, index) => ({
      id: `${Date.now()}-${index}`,
      stt: String(index + 1).padStart(2, '0'),
      name: formatStudentName(email),
      email,
      averageGrade: '',
      gradeColorBg: 'bg-[#e5e7eb]',
      gradeColorText: 'text-[#374151]',
    }));

    setCreatedGroups((prev) => [
      {
        id: Date.now().toString(),
        title: groupName,
        students,
      },
      ...prev,
    ]);
  };

  if (selectedCreatedGroup) {
    return (
      <GroupDetails
        groupTitle={selectedCreatedGroup.title}
        students={selectedCreatedGroup.students}
        hideStats
        onBack={() => setSelectedCreatedGroup(null)}
      />
    );
  }

  if (selectedGroup) {
    return <GroupDetails groupTitle={selectedGroup} onBack={() => setSelectedGroup(null)} />;
  }

  return (
      <div className="max-w-5xl mx-auto pt-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl font-bold text-[#111827] mb-2 tracking-tight">Group Management</h1>
            <p className="text-gray-500 text-[15px]">Manage and monitor your academic groups and student performance.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#1a4cd2] hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg font-medium text-sm flex items-center shadow-sm transition-colors mt-2"
          >
            <Plus className="w-4 h-4 mr-2 stroke-[3px]" />
            Create New Group
          </button>
        </div>

        <div className="w-full h-[1px] bg-gray-200 mb-8"></div>

        <div className="space-y-4">
          {mockGroups.map((group) => (
            <GroupCard
              key={group.id}
              title={group.title}
              studentsCount={group.studentsCount}
              createdDate={group.createdDate}
              icon={group.icon}
              iconBgColor={group.iconBgColor}
              onClick={() => setSelectedGroup(group.title)}
            />
          ))}
          {createdGroups.map((group) => (
            <GroupCard
              key={group.id}
              title={group.title}
              studentsCount={group.students.length}
              createdDate=""
              icon={<GraduationCap className="h-8 w-8 text-white" />}
              iconBgColor="bg-[#1a4cd2]"
              onClick={() => setSelectedCreatedGroup(group)}
            />
          ))}
        </div>
        <CreateGroupModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreateGroup={handleCreateGroup}
        />
      </div>
  );
};

export default GroupManagement;