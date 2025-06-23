import React from 'react';

interface LineData {
  date: string;
  value: number;
}

interface LineChartProps {
  data: LineData[];
}

export const LineChart: React.FC<LineChartProps> = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;
  
  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((point.value - minValue) / range) * 100;
    return { x, y, ...point };
  });
  
  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');
  
  return (
    <div className="h-64 bg-slate-900/50 rounded-lg border border-slate-700/50 p-4">
      <div className="relative h-full">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
          
          {/* Area under curve */}
          <path
            d={`${pathData} L 100 100 L 0 100 Z`}
            fill="url(#gradient)"
            opacity="0.3"
          />
          
          {/* Smooth line without data points */}
          <path
            d={pathData}
            fill="none"
            stroke="#a7c7e7"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            className="drop-shadow-sm"
          />
          
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#a7c7e7" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#a7c7e7" stopOpacity="0.1"/>
            </linearGradient>
          </defs>
        </svg>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-slate-400 -ml-8">
          <span>{maxValue}</span>
          <span>{Math.round((maxValue + minValue) / 2)}</span>
          <span>{minValue}</span>
        </div>
        
        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs text-slate-400 -mb-6">
          <span>{data[0]?.date}</span>
          <span>{data[Math.floor(data.length / 2)]?.date}</span>
          <span>{data[data.length - 1]?.date}</span>
        </div>
      </div>
    </div>
  );
};