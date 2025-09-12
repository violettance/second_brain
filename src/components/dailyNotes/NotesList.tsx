import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Edit3, 
  Clock, 
  Brain, 
  Tag, 
  Calendar,
  MoreHorizontal,
  Trash2,
  Star
} from 'lucide-react';
import { useDailyNotes } from '../../hooks/useDailyNotes';
import { DailyNote } from '../../types/database';
import { logger } from '../../lib/logger';

interface NotesListProps {
  selectedDate: Date | null;
  onEditNote: (note: DailyNote) => void;
  onDirectEdit?: (note: DailyNote) => void;
  notes?: DailyNote[];
  onRefresh?: () => Promise<void>;
}

export const NotesList: React.FC<NotesListProps> = ({ selectedDate, onEditNote, onDirectEdit, notes: propNotes, onRefresh }) => {
  // Use provided notes or fetch them if not provided (for backward compatibility)
  const hookData = useDailyNotes(propNotes ? undefined : (selectedDate || undefined));
  const notes = propNotes || hookData.notes;
  const isLoading = propNotes ? false : hookData.isLoading;
  const error = propNotes ? null : hookData.error;
  const deleteNote = hookData.deleteNote;
  const updateNote = hookData.updateNote;
  const [searchTerm, setSearchTerm] = useState('');
  const [showOptions, setShowOptions] = useState<string | null>(null);

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const formatDate = (dateString: string) => {
    // Parse date string without timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    
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

  const handleDeleteNote = async (noteId: string, memoryType: 'short-term' | 'long-term') => {
    try {
      await deleteNote(noteId, memoryType);
      // Refresh notes if callback provided
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      logger.error('Error deleting note', { error: error.message });
    }
  };

  const toggleMemoryType = async (note: DailyNote) => {
    try {
      const newMemoryType = note.memory_type === 'short-term' ? 'long-term' : 'short-term';
      await updateNote(note.id, { memory_type: newMemoryType });
      setShowOptions(null);
      // Refresh notes if callback provided
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      logger.error('Error updating note memory type', { error: error.message });
    }
  };

  const handleStarNote = async (note: DailyNote) => {
    try {
      const isStarred = note.tags?.includes('starred') || false;
      const newTags = isStarred 
        ? note.tags.filter(tag => tag !== 'starred')
        : [...(note.tags || []), 'starred'];
      
      await updateNote(note.id, { tags: newTags });
      setShowOptions(null);
      // Refresh notes if callback provided
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      logger.error('Error starring note', { error: error.message });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
        <div className="flex items-center justify-center py-8">
          <div className="text-slate-400">Loading notes...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
        <div className="flex items-center justify-center py-8">
          <div className="text-red-400">Error loading notes: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-medium text-white">
            {selectedDate ? `Notes for ${formatDate(`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`)}` : 'All Notes'}
          </h2>
          <p className="text-slate-400 text-xs">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'} found
          </p>
        </div>
        
        {/* Search */}
        <div className="relative w-48">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-1 text-xs"
            style={{ '--tw-ring-color': '#C2B5FC' } as React.CSSProperties}
          />
        </div>
      </div>

      {/* Notes List */}
      <div className="space-y-3 pr-1">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-10 w-10 text-slate-500 mx-auto mb-3" />
            <div className="text-slate-400 text-sm mb-1">
              {selectedDate ? 'No notes for this date' : 'No notes found'}
            </div>
            <div className="text-slate-500 text-xs">
              {selectedDate 
                ? 'Create your first note for this day'
                : 'Start writing to build your knowledge base'
              }
            </div>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div 
              key={note.id} 
              className="p-3 bg-slate-700/40 rounded-lg hover:bg-slate-700/60 transition-all cursor-pointer group border border-slate-600/40"
            >
              {/* Note Header */}
              <div className="flex items-start justify-between mb-2">
                <div 
                  className="flex-1 min-w-0"
                  onClick={() => onEditNote(note)}
                >
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-white text-sm truncate">
                      {note.title}
                    </h3>
                    {note.tags?.includes('starred') && (
                      <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                    )}
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(note.note_date)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {note.memory_type === 'short-term' ? (
                        <>
                          <Clock className="h-3 w-3 text-orange-400" />
                          <span className="text-orange-400">Short-term</span>
                        </>
                      ) : (
                        <>
                          <Brain className="h-3 w-3" style={{ color: '#C2B5FC' }} />
                          <span style={{ color: '#C2B5FC' }}>Long-term</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <button
                    onClick={() => setShowOptions(showOptions === note.id ? null : note.id)}
                    className="p-1 hover:bg-slate-600 rounded transition-colors"
                  >
                    <MoreHorizontal className="h-4 w-4 text-slate-400" />
                  </button>
                  
                  {/* Options Menu */}
                  {showOptions === note.id && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50 py-1">
                      <button
                        onClick={() => {
                          if (onDirectEdit) {
                            onDirectEdit(note);
                          } else {
                            onEditNote(note);
                          }
                          setShowOptions(null);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 flex items-center space-x-2"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Edit Note</span>
                      </button>
                      
                      <button
                        onClick={() => toggleMemoryType(note)}
                        className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 flex items-center space-x-2"
                      >
                        {note.memory_type === 'short-term' ? (
                          <>
                            <Brain className="h-3.5 w-3.5" style={{ color: '#C2B5FC' }} />
                            <span>Move to Long-term</span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-3.5 w-3.5 text-orange-400" />
                            <span>Move to Short-term</span>
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleStarNote(note)}
                        className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 flex items-center space-x-2"
                      >
                        <Star className={`h-3.5 w-3.5 ${note.tags?.includes('starred') ? 'text-yellow-400' : 'text-slate-400'}`} />
                        <span>{note.tags?.includes('starred') ? 'Remove Star' : 'Star Note'}</span>
                      </button>
                      
                      <div className="border-t border-slate-700 my-1"></div>
                      
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this item?')) {
                            handleDeleteNote(note.id, note.memory_type);
                          }
                          setShowOptions(null);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-slate-700 flex items-center space-x-2"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete Note</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Note Content */}
              <div 
                className="text-slate-300 text-xs leading-relaxed line-clamp-2 mb-2"
                onClick={() => onEditNote(note)}
              >
                {note.content 
                  ? note.content
                      .replace(/\*\*([^*\n]+)\*\*/g, '$1')  // Remove ** for bold
                      .replace(/\*([^*\n]+)\*/g, '$1')      // Remove * for italic
                      .replace(/`([^`\n]+)`/g, '$1')        // Remove ` for code
                      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links, keep text
                  : 'No content'
                }
              </div>

              {/* Tags */}
              {note.tags && note.tags.length > 0 && note.tags.some(tag => tag !== 'starred') && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {note.tags
                    .filter(tag => tag !== 'starred')
                    .slice(0, 3)
                    .map((tag, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center text-xs px-1.5 py-0.5 rounded"
                        style={{ 
                          backgroundColor: note.memory_type === 'short-term' ? 'rgba(251, 146, 60, 0.2)' : 'rgba(194, 181, 252, 0.2)',
                          color: note.memory_type === 'short-term' ? '#fb923c' : '#C2B5FC'
                        }}
                                              >
                          {tag}
                        </span>
                    ))}
                  {note.tags.filter(tag => tag !== 'starred').length > 3 && (
                    <span className="inline-flex items-center text-xs px-1.5 py-0.5 rounded bg-slate-600/40 text-slate-400">
                      +{note.tags.filter(tag => tag !== 'starred').length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};