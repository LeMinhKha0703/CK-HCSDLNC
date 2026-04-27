// In Teacher's Dashboard
import React from 'react';
import { Users, Calendar } from 'lucide-react';

interface GroupCardProps {
  title: string;
  studentsCount: number;
  createdDate: string;
  icon: React.ReactNode;
  iconBgColor: string;
  onClick: () => void;
}

const GroupCard: React.FC<GroupCardProps> = ({ title, studentsCount, createdDate, icon, iconBgColor, onClick }) => {
  return (
    <div 
      className="bg-[#f3f4f6] rounded-xl p-5 flex items-center justify-between shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-center space-x-5">
        <div className={`w-[60px] h-[60px] rounded-lg flex items-center justify-center text-white ${iconBgColor}`}>
          {icon}
        </div>
        <div>
          <h3 className="text-[20px] font-semibold text-gray-900 mb-1.5">{title}</h3>
          <div className="flex items-center text-gray-600 text-[14px] space-x-6">
            <span className="flex items-center font-medium">
              <Users className="w-4 h-4 mr-2 stroke-[2.5px]" />
              {studentsCount} Students
            </span>
            {createdDate ? (
              <span className="flex items-center font-medium">
                <Calendar className="w-4 h-4 mr-2 stroke-[2px]" />
                Created: {createdDate}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupCard;