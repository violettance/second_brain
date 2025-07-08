import React from 'react';

export const KnowledgeNetworkPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-6">
      <div className="bg-slate-800/70 border border-slate-700 rounded-2xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-white mb-2">Knowledge Network</h1>
        <p className="text-slate-400 text-base mb-6">Preview of your note graph</p>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Total Nodes:</span>
            <span className="text-lg font-semibold text-white">5</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Total Links:</span>
            <span className="text-lg font-semibold text-white">4</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Most Active:</span>
            <span className="text-lg font-semibold text-white">Daily Notes</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 