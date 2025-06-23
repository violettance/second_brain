import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
  icon: LucideIcon;
  iconColor: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  iconColor 
}) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 lg:p-6 hover:bg-slate-800/70 transition-all duration-200">
      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <h3 className="text-slate-400 text-xs lg:text-sm font-medium">{title}</h3>
        <div className="p-1.5 lg:p-2 rounded-lg" style={{ backgroundColor: iconColor + '20' }}>
          <Icon className="h-4 w-4 lg:h-5 lg:w-5" style={{ color: iconColor }} />
        </div>
      </div>
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-xl lg:text-3xl font-bold text-white mb-1">{value}</div>
          <div className="text-xs lg:text-sm text-slate-400">{change}</div>
        </div>
      </div>
    </div>
  );
};