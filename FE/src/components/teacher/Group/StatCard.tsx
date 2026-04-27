import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  iconBgColor: string;
  badgeText: string;
  badgeBgColor: string;
  badgeTextColor: string;
  title: string;
  value: string;
  subtitle: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  icon, 
  iconBgColor, 
  badgeText, 
  badgeBgColor, 
  badgeTextColor, 
  title, 
  value, 
  subtitle 
}) => {
  return (
    <div className="bg-slate-100 rounded-xl p-6 border border-slate-200">
      <div className="flex justify-between items-start mb-8">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconBgColor}`}>
          {icon}
        </div>
        <span className={`text-[11px] font-bold px-3 py-1 rounded-md ${badgeBgColor} ${badgeTextColor}`}>
          {badgeText}
        </span>
      </div>
      <div>
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">{title}</p>
        <div className="flex items-baseline space-x-2">
          <span className="text-4xl font-semibold text-gray-900 leading-none">{value}</span>
          <span className="text-gray-600 text-sm font-medium">{subtitle}</span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;