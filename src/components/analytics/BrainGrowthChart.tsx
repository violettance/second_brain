import React from 'react';

interface BrainGrowthData {
  date: string;
  totalNotes: number;
  capacity: number;
  fillPercentage: number;
}

interface BrainGrowthChartProps {
  data: BrainGrowthData[];
}

export const BrainGrowthChart: React.FC<BrainGrowthChartProps> = ({ data }) => {
  const maxCapacity = Math.max(...data.map(d => d.capacity));
  
  return (
    <div className="h-64 bg-slate-900/50 rounded-lg border border-slate-700/50 p-4">
      <div className="relative h-full">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Grid lines */}
          <defs>
            <pattern id="brainGrid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#374151" strokeWidth="0.3" opacity="0.3"/>
            </pattern>
            
            {/* Brain fill gradient */}
            <linearGradient id="brainFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#a7c7e7" stopOpacity="0.8"/>
              <stop offset="50%" stopColor="#d4a5d4" stopOpacity="0.6"/>
              <stop offset="100%" stopColor="#f4c2a1" stopOpacity="0.4"/>
            </linearGradient>
            
            {/* Capacity gradient */}
            <linearGradient id="capacityFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#64748b" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#64748b" stopOpacity="0.1"/>
            </linearGradient>
          </defs>
          
          <rect width="100" height="100" fill="url(#brainGrid)" />
          
          {/* Capacity area (brain outline) */}
          <path
            d={data.map((point, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - ((point.capacity / maxCapacity) * 100);
              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ') + ' L 100 100 L 0 100 Z'}
            fill="url(#capacityFill)"
            opacity="0.5"
          />
          
          {/* Brain fill area */}
          <path
            d={data.map((point, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - ((point.totalNotes / maxCapacity) * 100);
              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ') + ' L 100 100 L 0 100 Z'}
            fill="url(#brainFill)"
          />
          
          {/* Brain fill line - smooth without points */}
          <path
            d={data.map((point, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - ((point.totalNotes / maxCapacity) * 100);
              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')}
            fill="none"
            stroke="#a7c7e7"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            className="drop-shadow-sm"
          />
          
          {/* Capacity line - smooth without points */}
          <path
            d={data.map((point, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - ((point.capacity / maxCapacity) * 100);
              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')}
            fill="none"
            stroke="#64748b"
            strokeWidth="1"
            strokeDasharray="3,3"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        
        {/* Brain icon overlay */}
        <div className="absolute top-4 right-4 opacity-20">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#a7c7e7" strokeWidth="1">
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
          </svg>
        </div>
        
        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-slate-800/80 backdrop-blur-sm rounded-lg p-3 border border-slate-700/50">
          <div className="space-y-2 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-1 bg-gradient-to-r from-blue-300 to-purple-300 rounded"></div>
              <span className="text-slate-300">Knowledge Fill</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-1 bg-slate-500 rounded opacity-50" style={{ borderStyle: 'dashed' }}></div>
              <span className="text-slate-400">Brain Capacity</span>
            </div>
          </div>
        </div>
        
        {/* Current fill percentage */}
        <div className="absolute top-4 left-4 bg-slate-800/80 backdrop-blur-sm rounded-lg p-3 border border-slate-700/50">
          <div className="text-center">
            <div className="text-lg font-bold" style={{ color: '#a7c7e7' }}>
              {data[data.length - 1]?.fillPercentage || 0}%
            </div>
            <div className="text-xs text-slate-400">Brain Full</div>
          </div>
        </div>
      </div>
    </div>
  );
};