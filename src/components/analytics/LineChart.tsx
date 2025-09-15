import React from 'react';

interface LineData {
  date: string;
  value: number;
}

interface LineChartProps {
  data: LineData[];
}

export const LineChart: React.FC<LineChartProps> = ({ data }) => {
  const sanitized = (Array.isArray(data) ? data : []).map(d => ({
    date: d?.date ?? '',
    value: Number.isFinite(d?.value) ? Number(d.value) : 0,
  }));

  const hasData = sanitized.length > 0;
  const values = hasData ? sanitized.map(d => d.value) : [0, 0];
  const maxValueRaw = Math.max(...values);
  const minValueRaw = Math.min(...values);
  const maxValue = Number.isFinite(maxValueRaw) ? maxValueRaw : 0;
  const minValue = Number.isFinite(minValueRaw) ? minValueRaw : 0;
  const rangeRaw = maxValue - minValue;
  const range = Number.isFinite(rangeRaw) && rangeRaw !== 0 ? rangeRaw : 1;
  
  // Handle single-point case by duplicating the point at both ends to form a flat line
  const series = sanitized.length === 1
    ? [
        { date: sanitized[0].date, value: sanitized[0].value },
        { date: sanitized[0].date, value: sanitized[0].value },
      ]
    : sanitized;

  const points = series.map((point, index) => {
    const denominator = Math.max(1, series.length - 1);
    const x = (index / denominator) * 100;
    const y = 100 - (((point.value - minValue) / range) * 100);
    const xSafe = Number.isFinite(x) ? x : 0;
    const ySafe = Number.isFinite(y) ? Math.min(100, Math.max(0, y)) : 100;
    return { x: xSafe, y: ySafe, ...point };
  });
  
  const pathData = points.length > 0
    ? points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
    : 'M 0 100 L 100 100';
  
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
          <span>{Number.isFinite(maxValue) ? maxValue : 0}</span>
          <span>{Number.isFinite(maxValue) && Number.isFinite(minValue) ? Math.round((maxValue + minValue) / 2) : 0}</span>
          <span>{Number.isFinite(minValue) ? minValue : 0}</span>
        </div>
        
        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs text-slate-400 -mb-6">
          <span>{sanitized[0]?.date ?? ''}</span>
          <span>{sanitized[Math.floor(Math.max(0, sanitized.length - 1) / 2)]?.date ?? ''}</span>
          <span>{sanitized[sanitized.length - 1]?.date ?? ''}</span>
        </div>
      </div>
    </div>
  );
};