import React from 'react';

interface BarData {
  label: string;
  value: number;
  color: string;
}

interface BarChartProps {
  data: BarData[];
}

export const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="h-64 bg-slate-900/50 rounded-lg border border-slate-700/50 p-4">
      <div className="h-full flex items-end justify-between space-x-2">
        {data.map((bar, index) => {
          const height = (bar.value / maxValue) * 100;
          
          return (
            <div key={bar.label} className="flex-1 flex flex-col items-center">
              <div className="w-full flex flex-col items-center mb-2">
                <div
                  className="w-full rounded-t-lg transition-all duration-500 ease-out relative group cursor-pointer"
                  style={{
                    height: `${height}%`,
                    backgroundColor: bar.color,
                    minHeight: '4px'
                  }}
                >
                  {/* Tooltip */}
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {bar.value} notes
                  </div>
                </div>
              </div>
              
              <div className="text-slate-400 text-xs text-center font-medium">
                {bar.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};