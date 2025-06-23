import React from 'react';

interface TopicEvolutionData {
  date: string;
  topics: {
    [key: string]: number;
  };
}

interface TopicEvolutionChartProps {
  data: TopicEvolutionData[];
}

export const TopicEvolutionChart: React.FC<TopicEvolutionChartProps> = ({ data }) => {
  // Get all unique topics
  const allTopics = Array.from(
    new Set(data.flatMap(d => Object.keys(d.topics)))
  );
  
  const colors = [
    '#a7c7e7', '#b8e6b8', '#f4c2a1', '#d4a5d4', 
    '#f0d4a3', '#c7e7a7', '#e7a7c7', '#a7e7d4'
  ];
  
  const maxValue = Math.max(
    ...data.flatMap(d => Object.values(d.topics))
  );
  
  return (
    <div className="h-64 bg-slate-900/50 rounded-lg border border-slate-700/50 p-4">
      <div className="relative h-full">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            {allTopics.map((topic, index) => (
              <linearGradient key={topic} id={`topicGradient${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={colors[index % colors.length]} stopOpacity="0.8"/>
                <stop offset="100%" stopColor={colors[index % colors.length]} stopOpacity="0.3"/>
              </linearGradient>
            ))}
          </defs>
          
          {/* Stacked areas */}
          {allTopics.map((topic, topicIndex) => {
            const points = data.map((point, index) => {
              const x = (index / (data.length - 1)) * 100;
              
              // Calculate cumulative height for stacking
              let cumulativeHeight = 0;
              for (let i = 0; i <= topicIndex; i++) {
                cumulativeHeight += point.topics[allTopics[i]] || 0;
              }
              
              let prevCumulativeHeight = 0;
              for (let i = 0; i < topicIndex; i++) {
                prevCumulativeHeight += point.topics[allTopics[i]] || 0;
              }
              
              const y1 = 100 - ((cumulativeHeight / maxValue) * 100);
              const y2 = 100 - ((prevCumulativeHeight / maxValue) * 100);
              
              return { x, y1, y2, value: point.topics[topic] || 0 };
            });
            
            const pathData = [
              // Top line
              ...points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y1}`),
              // Bottom line (reversed)
              ...points.reverse().map(p => `L ${p.x} ${p.y2}`),
              'Z'
            ].join(' ');
            
            return (
              <path
                key={topic}
                d={pathData}
                fill={`url(#topicGradient${topicIndex})`}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                <title>{topic}</title>
              </path>
            );
          })}
          
          {/* Topic lines - smooth without data points */}
          {allTopics.map((topic, topicIndex) => {
            const points = data.map((point, index) => {
              const x = (index / (data.length - 1)) * 100;
              
              let cumulativeHeight = 0;
              for (let i = 0; i <= topicIndex; i++) {
                cumulativeHeight += point.topics[allTopics[i]] || 0;
              }
              
              const y = 100 - ((cumulativeHeight / maxValue) * 100);
              return { x, y };
            });
            
            const pathData = points.map((point, index) => 
              `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
            ).join(' ');
            
            return (
              <path
                key={`line-${topic}`}
                d={pathData}
                fill="none"
                stroke={colors[topicIndex % colors.length]}
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
                opacity="0.8"
                className="drop-shadow-sm"
              />
            );
          })}
        </svg>
        
        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-slate-800/80 backdrop-blur-sm rounded-lg p-3 border border-slate-700/50 max-w-[200px]">
          <div className="text-slate-300 text-xs font-medium mb-2">Topics</div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            {allTopics.slice(0, 6).map((topic, index) => (
              <div key={topic} className="flex items-center space-x-1">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: colors[index % colors.length] }}
                ></div>
                <span className="text-slate-400 truncate">
                  {topic.length > 8 ? topic.slice(0, 6) + '..' : topic}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-slate-400 -ml-8">
          <span>{maxValue}</span>
          <span>{Math.round(maxValue / 2)}</span>
          <span>0</span>
        </div>
      </div>
    </div>
  );
};