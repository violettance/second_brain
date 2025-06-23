import React from 'react';

export const KnowledgeGraph: React.FC = () => {
  // Önizleme için örnek veri (analytics'teki gibi)
  const nodes = [
    { id: '1', label: 'Daily Notes', x: 50, y: 50, size: 7, color: '#C2B5FC' },
    { id: '2', label: 'Research', x: 20, y: 30, size: 4, color: '#C2B5FC' },
    { id: '3', label: 'Knowledge', x: 80, y: 30, size: 4, color: '#4ADE80' },
    { id: '4', label: 'Learning', x: 30, y: 80, size: 3.5, color: '#FB923C' },
    { id: '5', label: 'Projects', x: 70, y: 80, size: 5, color: '#F87171' },
  ];
  const edges = [
    { from: '1', to: '2' },
    { from: '1', to: '3' },
    { from: '1', to: '4' },
    { from: '1', to: '5' },
  ];

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Knowledge Network</h2>
          <p className="text-slate-400 text-sm">Preview of your note graph</p>
        </div>
        {/* Özet istatistikler */}
        <div className="flex flex-col items-end text-xs text-slate-400">
          <div>Total Nodes: <span className="text-white font-semibold">5</span></div>
          <div>Total Links: <span className="text-white font-semibold">4</span></div>
          <div>Most Active: <span className="text-purple-300 font-semibold">Daily Notes</span></div>
        </div>
      </div>
      <div className="relative h-64 bg-slate-900/50 rounded-lg border border-slate-700/50 overflow-hidden flex-shrink-0 mb-0 mt-2">
        {/* SVG Graph Preview */}
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          {/* Edges */}
          {edges.map((edge, i) => {
            const from = nodes.find(n => n.id === edge.from);
            const to = nodes.find(n => n.id === edge.to);
            if (!from || !to) return null;
            return (
              <line
                key={i}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="#64748b"
                strokeWidth="1"
                opacity="0.6"
              />
            );
          })}
          {/* Nodes */}
          {nodes.map((node, i) => (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={node.size}
                fill={node.color}
                stroke="#fff"
                strokeWidth={node.id === '1' ? '1.5' : '0.5'}
                opacity={node.id === '1' ? 1 : 0.95}
              />
              <text
                x={node.x}
                y={node.y + node.size + 3}
                textAnchor="middle"
                className="fill-slate-200 font-medium"
                style={{ fontSize: '4px' }}
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>
        {/* Stat kutusu */}
        <div className="absolute bottom-3 right-3 bg-slate-800/90 rounded-lg px-3 py-2 border border-slate-700/50 flex flex-col items-center">
          <div className="text-lg font-bold text-white leading-none">156</div>
          <div className="text-xs text-slate-400">Connections</div>
        </div>
      </div>
      <div className="flex flex-col flex-1 justify-between h-full gap-3 mt-8">
        <div className="px-0">
          <div className="bg-slate-800/80 rounded-lg p-5 border border-slate-700/50 w-full">
            <div className="text-slate-300 text-sm font-semibold mb-2">Network Insights</div>
            <div className="text-slate-400 text-sm">Your notes are well connected. <span className="text-purple-300 font-semibold">Daily Notes</span> is the most central node. Keep adding notes to grow your network!</div>
          </div>
        </div>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-analytics'))}
          className="w-full text-slate-900 py-3 px-4 rounded-lg font-semibold transition-colors hover:opacity-90 mt-2"
          style={{ background: '#C2B5FC' }}
        >
          View Full Graph
        </button>
      </div>
    </div>
  );
};