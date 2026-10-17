import React from 'react';

interface BubbleData {
  topic: string;
  frequency: number;
  color: string;
  size: number;
}

interface BubbleChartProps {
  data: BubbleData[];
}

export const BubbleChart: React.FC<BubbleChartProps> = ({ data }) => {
  return (
    <div className="relative h-80 bg-canvas rounded-lg border border-ink overflow-hidden">
      <div className="absolute inset-0 p-6">
        {data.map((bubble, index) => {
          // Better distributed positions for larger, closer bubbles
          const positions = [
            { x: 30, y: 30 }, // Programming - top left
            { x: 70, y: 25 }, // AI/ML - top right
            { x: 25, y: 70 }, // Philosophy - bottom left
            { x: 75, y: 70 }, // Design - bottom right
            { x: 50, y: 45 }, // Research - center
            { x: 85, y: 50 }, // Learning - right center
            { x: 15, y: 50 }, // Ideas - left center
            { x: 50, y: 15 }, // Projects - top center
          ];
          
          const position = positions[index % positions.length];
          
          // Much larger bubble sizes (increased by 60%)
          const rootStyle = getComputedStyle(document.documentElement);
          const minimumSize = Number.parseFloat(rootStyle.getPropertyValue('--bubble-size-min'));
          const sizeScale = Number.parseFloat(rootStyle.getPropertyValue('--bubble-size-scale'));
          const fontSizeBreakpoint = Number.parseFloat(rootStyle.getPropertyValue('--bubble-font-size-breakpoint'));
          const enhancedSize = Math.max(minimumSize, bubble.size * sizeScale);
          
          return (
            <div
              key={bubble.topic}
              className="absolute rounded-full flex items-center justify-center font-bold cursor-pointer hover:scale-110 transition-all duration-300 group"
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                width: `${enhancedSize}px`,
                height: `${enhancedSize}px`,
                backgroundColor: bubble.color,
                color: 'var(--color-brand-dark)', // Dark blue text for better contrast
                transform: 'translate(-50%, -50%)',
                border: `var(--bubble-border-width) solid ${bubble.color}`,
                fontSize: enhancedSize > fontSizeBreakpoint ? 'var(--type-sm)' : 'var(--type-xs)',
              }}
            >
              <span className="text-center leading-tight px-3 font-bold text-ink drop-shadow-sm">
                {bubble.topic.length > 12 ? bubble.topic.slice(0, 10) + '...' : bubble.topic}
              </span>
              
              {/* Enhanced Tooltip */}
              <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-surface  text-ink text-xs px-4 py-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap border border-ink z-20">
                <div className="font-bold text-sm">{bubble.topic}</div>
                <div className="text-muted">{bubble.frequency} notes</div>
                <div className="text-xs" style={{ color: bubble.color }}>
                  {bubble.frequency > 30 ? 'High Activity' : bubble.frequency > 20 ? 'Medium Activity' : 'Low Activity'}
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800/95"></div>
              </div>
            </div>
          );
        })}
        
        {/* Smaller edge bubbles for more realistic distribution */}
        {[
          { topic: 'Notes', x: 10, y: 20, size: 35, color: 'var(--color-brand-primary)' },
          { topic: 'Tasks', x: 90, y: 15, size: 30, color: 'var(--color-brand-secondary)' },
          { topic: 'Goals', x: 5, y: 85, size: 32, color: 'var(--color-brand-purple)' },
          { topic: 'Books', x: 95, y: 85, size: 28, color: 'var(--color-brand-yellow)' },
          { topic: 'Quotes', x: 15, y: 5, size: 26, color: 'var(--color-brand-secondary)' },
          { topic: 'Links', x: 85, y: 5, size: 24, color: 'var(--color-brand-primary)' },
        ].map((smallBubble, index) => (
          <div
            key={`small-${index}`}
            className="absolute rounded-full flex items-center justify-center font-semibold cursor-pointer hover:scale-110 transition-all duration-300 group"
            style={{
              left: `${smallBubble.x}%`,
              top: `${smallBubble.y}%`,
              width: `${smallBubble.size}px`,
              height: `${smallBubble.size}px`,
              backgroundColor: smallBubble.color,
              color: 'var(--color-brand-dark)',
              transform: 'translate(-50%, -50%)',
              fontSize: 'var(--type-xs)',
              border: `var(--border-width-thin) solid ${smallBubble.color}`,
            }}
          >
            <span className="text-center leading-tight font-bold text-ink">
              {smallBubble.topic.slice(0, 5)}
            </span>
          </div>
        ))}
      </div>
      
      {/* Subtle animated background */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="bubblePattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="1.5" fill="var(--color-brand-secondary)" opacity="0.4">
                <animate attributeName="opacity" values="0.2;0.6;0.2" dur="4s" repeatCount="indefinite"/>
              </circle>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#bubblePattern)" />
        </svg>
      </div>
    </div>
  );
};
