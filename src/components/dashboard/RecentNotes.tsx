import React from 'react';
import { Search, Filter, Link } from 'lucide-react';
import { Note } from '../../types';

interface RecentNotesProps {
  notes: Note[];
}

export const RecentNotes: React.FC<RecentNotesProps> = ({ notes }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 lg:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 lg:mb-6 space-y-4 lg:space-y-0">
        <h2 className="text-lg lg:text-xl font-bold text-white">Recent Notes</h2>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 lg:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search notes..."
              className="w-full lg:w-64 pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 text-sm"
              style={{ '--tw-ring-color': '#C2B5FC' } as React.CSSProperties}
            />
          </div>
          <button className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg border border-slate-600 transition-colors">
            <Filter className="h-4 w-4 text-slate-400" />
          </button>
        </div>
      </div>

      <div className="space-y-3 lg:space-y-4">
        {notes.map((note) => (
          <div key={note.id} className="p-3 lg:p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700/70 transition-all cursor-pointer group">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-white transition-colors text-sm lg:text-base" style={{ color: 'white' }}>
                {note.title}
              </h3>
              <div className="flex items-center space-x-1 text-slate-400 text-xs lg:text-sm">
                <Link className="h-3 w-3 lg:h-4 lg:w-4" />
                <span>{note.connections} connections</span>
              </div>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-4 text-xs lg:text-sm text-slate-400">
              <span className="px-2 py-1 bg-slate-600 rounded-full text-xs" style={{ backgroundColor: note.color + '20', color: note.color }}>
                {note.category}
              </span>
              <span>{note.createdAt}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};