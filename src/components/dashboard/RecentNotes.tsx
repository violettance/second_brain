import React from 'react';
import { Search, Filter, Link } from 'lucide-react';
import { Note } from '../../types';

interface RecentNotesProps {
  notes: Note[];
}

export const RecentNotes: React.FC<RecentNotesProps> = ({ notes }) => {
  return (
    <div className="bg-surface  border border-ink rounded-xl p-4 lg:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 lg:mb-6 space-y-4 lg:space-y-0">
        <h2 className="text-lg lg:text-xl font-bold text-ink">Recent Notes</h2>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 lg:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Search notes..."
              className="w-full lg:w-64 pl-10 pr-4 py-2 bg-surface-muted border border-ink rounded-lg text-ink placeholder-slate-400 focus:outline-none focus:ring-2 text-sm"
              style={{ '--tw-ring-color': 'var(--color-brand-primary)' } as React.CSSProperties}
            />
          </div>
          <button className="p-2 bg-surface-muted hover:bg-surface-muted rounded-lg border border-ink transition-colors">
            <Filter className="h-4 w-4 text-muted" />
          </button>
        </div>
      </div>

      <div className="space-y-3 lg:space-y-4">
        {notes.map((note) => (
          <div key={note.id} className="p-3 lg:p-4 bg-surface-muted rounded-lg hover:bg-surface-muted transition-all cursor-pointer group">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-ink transition-colors text-sm lg:text-base">
                {note.title}
              </h3>
              <div className="flex items-center space-x-1 text-muted text-xs lg:text-sm">
                <Link className="h-3 w-3 lg:h-4 lg:w-4" />
                <span>{note.connections} connections</span>
              </div>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-4 text-xs lg:text-sm text-muted">
              <span className="px-2 py-1 bg-surface-muted rounded-full text-xs" style={{ backgroundColor: `color-mix(in srgb, ${note.color} 16%, transparent)`, color: note.color }}>
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
