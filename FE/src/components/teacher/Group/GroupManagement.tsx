import { useState, useEffect } from 'react';
import { GraduationCap, Compass, Code, Brain, Plus } from 'lucide-react';
import GroupCard from './GroupCard';
import CreateGroupModal from './CreateGroupModal';
import { useNavigate } from 'react-router-dom';
import { getGroups, createGroup } from '../../../api/teacher';

interface ApiGroup {
  groupId: string;
  groupName: string;
  totalStudents: number;
  createdAt: string;
}

const GROUP_ICONS = [
  <GraduationCap className="h-8 w-8 text-white" />,
  <Compass className="h-7 w-7 text-[#1a38cf]" />,
  <Code className="h-7 w-7 text-[#a53b26]" />,
  <Brain className="h-7 w-7 text-[#0a1e3f]" />,
];
const GROUP_COLORS = ['bg-[#1a4cd2]', 'bg-[#cdd8ff]', 'bg-[#fae6de]', 'bg-[#d8e3ff]'];

const GroupManagement = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiGroups, setApiGroups] = useState<ApiGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGroups = () => {
    setIsLoading(true);
    getGroups()
      .then(res => setApiGroups(res.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { fetchGroups(); }, []);

  const handleCreateGroup = async (groupName: string, studentEmails: string[]) => {
    try {
      await createGroup({ groupName, studentEmails });
      fetchGroups();
    } catch (err) {
      console.error(err);
      alert('Failed to create group!');
    }
  };



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

        {isLoading ? (
          <div className="text-center py-10 text-slate-400">Loading groups...</div>
        ) : (
          <div className="space-y-4">
            {apiGroups.length === 0 && (
              <div className="text-center py-10 text-slate-400">You don't have any groups yet. Create your first group!</div>
            )}
            {apiGroups.map((group, idx) => (
              <GroupCard
                key={group.groupId}
                title={group.groupName}
                studentsCount={group.totalStudents}
                createdDate={new Date(group.createdAt).toLocaleDateString('vi-VN')}
                icon={GROUP_ICONS[idx % GROUP_ICONS.length]}
                iconBgColor={GROUP_COLORS[idx % GROUP_COLORS.length]}
                onClick={() => navigate(`/teacher/group/${group.groupId}`)}
              />
            ))}
          </div>
        )}
        <CreateGroupModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreateGroup={handleCreateGroup}
        />
      </div>
  );
};

export default GroupManagement;