import React from 'react';
import { 
  Search, 
  Filter, 
  Edit3, 
  Clock, 
  Brain, 
  Tag, 
  Calendar,
  MoreHorizontal 
} from 'lucide-react';
import { useDailyNotes } from '../../hooks/useDailyNotes';
import { DailyNote } from '../../types/database';

interface NotesListProps {
  selectedDate: Date | null;
  onEditNote: () => void;
}

export const NotesList: React.FC<NotesListProps> = ({ selectedDate, onEditNote }) => {
  const { notes, isLoading, error } = useDailyNotes(selectedDate || undefined);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 lg:p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-slate-400">Loading notes...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 lg:p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-red-400">Error loading notes: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 lg:mb-6 space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-lg lg:text-xl font-bold text-white mb-1">
            {selectedDate ? `Notes for ${formatDate(selectedDate.toISOString())}` : 'All Notes'}
          </h2>
          <p className="text-slate-400 text-xs lg:text-sm">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'} found
          </p>
        </div>
        
        {/* Search and Filter */}
        <div className="flex items-center space-x-3">
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

      {/* Notes List */}
      <div className="space-y-3 lg:space-y-4">
        {notes.length === 0 ? (
          <div className="text-center py-8 lg:py-12">
            <Calendar className="h-10 w-10 lg:h-12 lg:w-12 text-slate-500 mx-auto mb-4" />
            <div className="text-slate-400 text-base lg:text-lg mb-2">
              {selectedDate ? 'No notes for this date' : 'No notes found'}
            </div>
            <div className="text-slate-500 text-sm">
              {selectedDate 
                ? 'Create your first note for this day'
                : 'Start writing to build your knowledge base'
              }
            </div>
          </div>
        ) : (
          notes.map((note) => (
            <div 
              key={note.id} 
              className="p-4 lg:p-5 bg-slate-700/50 rounded-xl hover:bg-slate-700/70 transition-all cursor-pointer group border border-slate-600/50 hover:border-slate-500/50"
            >
              {/* Note Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-base lg:text-lg mb-1 transition-colors truncate" style={{ color: 'white' }}>
                    {note.title}
                  </h3>
                  <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-4 text-xs lg:text-sm text-slate-400">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3 lg:h-4 lg:w-4" />
                      <span>{formatDate(note.note_date)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {note.memory_type === 'short-term' ? (
                        <>
                          <Clock className="h-3 w-3 lg:h-4 lg:w-4 text-orange-400" />
                          <span className="text-orange-400">Short-term</span>
                        </>
                      ) : (
                        <>
                          <Brain className="h-3 w-3 lg:h-4 lg:w-4" style={{ color: '#C2B5FC' }} />
                          <span style={{ color: '#C2B5FC' }}>Long-term</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                  <button
                    onClick={onEditNote}
                    className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    <Edit3 className="h-3 w-3 lg:h-4 lg:w-4 text-slate-400" />
                  </button>
                  <button className="p-2 hover:bg-slate-600 rounded-lg transition-colors">
                    <MoreHorizontal className="h-3 w-3 lg:h-4 lg:w-4 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Note Content Preview */}
              <p className="text-slate-300 text-sm leading-relaxed mb-4 line-clamp-3">
                {note.content || 'No content'}
              </p>

              {/* Tags */}
              {note.tags && note.tags.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Tag className="h-3 w-3 lg:h-4 lg:w-4 text-slate-500 flex-shrink-0" />
                  <div className="flex flex-wrap gap-2 min-w-0">
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-slate-600/50 text-slate-400 rounded-md text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      {notes.length > 0 && (
        <div className="mt-4 lg:mt-6 pt-4 border-t border-slate-700/50">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between text-sm space-y-4 lg:space-y-0">
            <div className="text-slate-400">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'} total
            </div>
            <div className="flex flex-wrap items-center gap-4 lg:gap-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-slate-400">
                  {notes.filter(n => n.memory_type === 'short-term').length} Short-term
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ background: '#C2B5FC' }}></div>
                <span className="text-slate-400">
                  {notes.filter(n => n.memory_type === 'long-term').length} Long-term
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};