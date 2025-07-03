import React, { useState } from 'react';
import { Clock, Plus, Search, Filter, Archive, Trash2, Brain, Calendar, Tag, MoreHorizontal } from 'lucide-react';
import { CreateMemoryModal } from './CreateMemoryModal';
import { useMemoryNotes } from '../../hooks/useMemoryNotes';

export const ShortTermMemory: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { shortTermNotes, isLoading, moveToLongTerm, deleteNote } = useMemoryNotes();

  const getDaysRemaining = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, 30 - diffDays); // 30 days total
  };

  const getDaysRemainingColor = (days: number) => {
    if (days <= 3) return 'text-red-400';
    if (days <= 7) return 'text-yellow-400';
    return 'text-green-400';
  };

  const filteredNotes = shortTermNotes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 bg-slate-900 overflow-y-auto h-screen">
      {/* Header - Added left padding for mobile view to prevent overlap with hamburger menu */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 p-4 lg:p-6 sticky top-0 z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="pl-12 lg:pl-0">
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2 flex items-center space-x-3">
              <Clock className="h-8 w-8 text-orange-400" />
              <span>Short Term Memory</span>
            </h1>
            <p className="text-slate-400 text-sm lg:text-base">
              Temporary notes that will be archived after 30 days
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center space-x-2 px-4 py-2 text-slate-900 rounded-lg font-semibold transition-colors text-sm hover:opacity-90"
            style={{ background: '#C2B5FC' }}
          >
            <Plus className="h-4 w-4" />
            <span>Add Note</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 lg:p-6 space-y-6 bg-slate-900 min-h-full">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 text-sm"
              style={{ '--tw-ring-color': '#fb923c' } as React.CSSProperties}
            />
          </div>
        </div>

        {/* Notes Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-slate-400">Loading notes...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 lg:p-12 text-center">
            <Clock className="h-12 w-12 lg:h-16 lg:w-16 text-orange-400 mx-auto mb-4" />
            <h3 className="text-xl lg:text-2xl font-semibold text-white mb-2">No short term notes yet</h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Short term notes are perfect for temporary thoughts or ideas that you don't need to keep forever.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold transition-colors text-sm hover:bg-orange-600"
            >
              <Plus className="h-4 w-4" />
              <span>Create Your First Note</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {filteredNotes.map((note) => {
              const daysRemaining = getDaysRemaining(note.created_at);
              
              return (
                <div 
                  key={note.id} 
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 lg:p-6 hover:bg-slate-800 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-lg mb-2 truncate">
                        {note.title}
                      </h3>
                      <div className="flex items-center space-x-2 text-xs">
                        <Clock className={`h-3 w-3 ${getDaysRemainingColor(daysRemaining)}`} />
                        <span className={getDaysRemainingColor(daysRemaining)}>
                          {daysRemaining === 0 ? 'Expires today' : `${daysRemaining} days left`}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => moveToLongTerm(note.id)}
                        className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                        title="Move to Long Term Memory"
                      >
                        <Brain className="h-4 w-4 text-purple-400" />
                      </button>
                      <button
                        onClick={() => deleteNote(note.id, 'short-term')}
                        className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                        title="Delete Note"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </div>
                  </div>

                  {/* Content Preview */}
                  <p className="text-slate-300 text-sm leading-relaxed mb-4 line-clamp-3">
                    {note.content || 'No content'}
                  </p>

                  {/* Tags */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {note.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center text-xs px-2 py-1 rounded-md bg-orange-500/20 text-orange-400"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Date */}
                  <div className="mt-4 pt-3 border-t border-slate-700 flex items-center text-xs text-slate-400">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>
                      {new Date(note.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Memory Modal */}
      {showCreateModal && (
        <CreateMemoryModal
          memoryType="short-term"
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};