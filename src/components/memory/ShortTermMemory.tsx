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
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 p-4 lg:p-6 sticky top-0 z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div>
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
        {/* Search and Stats */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="relative flex-1 lg:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search short term notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 text-sm"
              style={{ '--tw-ring-color': '#C2B5FC' } as React.CSSProperties}
            />
          </div>
          
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
              <span className="text-slate-400">{filteredNotes.length} notes</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <span className="text-slate-400">Auto-archive in 30 days</span>
            </div>
          </div>
        </div>

        {/* Notes Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-slate-400">Loading notes...</div>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-16 w-16 text-slate-500 mx-auto mb-4" />
            <div className="text-slate-400 text-lg mb-2">No short term notes</div>
            <div className="text-slate-500 text-sm">Create your first temporary note</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => {
              const daysRemaining = getDaysRemaining(note.created_at);
              return (
                <div 
                  key={note.id} 
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition-all group"
                >
                  {/* Note Header */}
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
                    <div className="flex items-center space-x-2 mb-4">
                      <Tag className="h-3 w-3 text-slate-500 flex-shrink-0" />
                      <div className="flex flex-wrap gap-1 min-w-0">
                        {note.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {note.tags.length > 3 && (
                          <span className="px-2 py-1 bg-slate-600/50 text-slate-400 rounded text-xs">
                            +{note.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                    <div className="flex items-center space-x-2 text-slate-400 text-xs">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(note.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => moveToLongTerm(note.id)}
                        className="flex items-center space-x-1 px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-xs font-medium hover:bg-purple-500/30 transition-colors"
                      >
                        <Archive className="h-3 w-3" />
                        <span>Save</span>
                      </button>
                    </div>
                  </div>

                  {/* Expiry Warning */}
                  {daysRemaining <= 7 && (
                    <div className={`mt-3 p-2 rounded-lg text-xs ${
                      daysRemaining <= 3 
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {daysRemaining === 0 
                        ? '⚠️ This note will be archived today!'
                        : `⚠️ Will be archived in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`
                      }
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Note Modal */}
      {showCreateModal && (
        <CreateMemoryModal 
          memoryType="short-term"
          onClose={() => setShowCreateModal(false)} 
        />
      )}
    </div>
  );
};