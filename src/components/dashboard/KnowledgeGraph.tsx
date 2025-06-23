import React from 'react';

export const KnowledgeGraph: React.FC = () => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Knowledge Graph</h2>
          <p className="text-slate-400 text-sm">Network visualization of your notes</p>
        </div>
      </div>

      <div className="relative h-64 bg-slate-900/50 rounded-lg border border-slate-700/50 overflow-hidden">
        {/* Simulated knowledge graph visualization */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full">
            {/* Central node */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center text-slate-900 font-semibold text-xs z-10" style={{ background: '#C2B5FC' }}>
              Daily Notes
            </div>
            
            {/* Connected nodes */}
            <div className="absolute top-8 left-8 w-12 h-12 rounded-full flex items-center justify-center text-slate-900 font-semibold text-xs" style={{ background: '#C2B5FC' }}>
              Research Ideas
            </div>
            <div className="absolute top-8 right-8 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
              Knowledge Hub
            </div>
            <div className="absolute bottom-8 left-16 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
              Learning
            </div>
            <div className="absolute bottom-8 right-16 w-14 h-14 bg-red-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
              Projects
            </div>

            {/* Connection lines */}
            <svg className="absolute inset-0 w-full h-full">
              <line x1="50%" y1="50%" x2="15%" y2="20%" stroke="#64748b" strokeWidth="2" opacity="0.6" />
              <line x1="50%" y1="50%" x2="85%" y2="20%" stroke="#64748b" strokeWidth="2" opacity="0.6" />
              <line x1="50%" y1="50%" x2="25%" y2="80%" stroke="#64748b" strokeWidth="2" opacity="0.6" />
              <line x1="50%" y1="50%" x2="75%" y2="80%" stroke="#64748b" strokeWidth="2" opacity="0.6" />
            </svg>

            {/* Active connections indicator */}
            <div className="absolute bottom-4 right-4 bg-slate-800 rounded-lg p-3 border border-slate-700">
              <div className="text-3xl font-bold text-white">156</div>
              <div className="text-xs text-slate-400">Active Connections</div>
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-analytics'))}
        className="w-full mt-4 text-slate-900 py-3 px-4 rounded-lg font-semibold transition-colors hover:opacity-90" 
        style={{ background: '#C2B5FC' }}
      >
        View Full Graph
      </button>
    </div>
  );
};