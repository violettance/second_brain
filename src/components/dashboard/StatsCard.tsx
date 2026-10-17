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
    <div className="sb-panel p-4 transition-transform duration-fast hover:-translate-y-0.5 lg:p-6">
      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <h3 className="text-muted text-xs lg:text-sm font-medium">{title}</h3>
        <div className="rounded-md border-2 border-ink p-1.5 lg:p-2" style={{ backgroundColor: `color-mix(in srgb, ${iconColor} 16%, transparent)` }}>
          <Icon className="h-4 w-4 lg:h-5 lg:w-5" style={{ color: iconColor }} />
        </div>
      </div>
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="font-display text-xl font-bold text-ink lg:text-3xl">{value}</div>
          <div className="text-xs lg:text-sm text-muted">{change}</div>
        </div>
      </div>
    </div>
  );
};
