import React, { useRef, useEffect } from 'react';
import { X, Edit3, Clock, Brain, Calendar, Tag } from 'lucide-react';
import { DailyNote } from '../../types/database';

interface NotePreviewModalProps {
  note: DailyNote;
  onClose: () => void;
  onEdit: () => void;
}

export const NotePreviewModal: React.FC<NotePreviewModalProps> = ({ note, onClose, onEdit }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const yesterdayString = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    
    if (dateString === todayString) {
      return 'Today';
    } else if (dateString === yesterdayString) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="p-2 rounded-lg" style={{ 
              background: note.memory_type === 'short-term' ? '#fb923c' : '#C2B5FC' 
            }}>
              {note.memory_type === 'short-term' ? (
                <Clock className="h-5 w-5 text-white" />
              ) : (
                <Brain className="h-5 w-5 text-slate-900" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-white truncate">{note.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-slate-400 mt-1">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatDate(note.note_date)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  {note.memory_type === 'short-term' ? (
                    <>
                      <Clock className="h-3.5 w-3.5 text-orange-400" />
                      <span className="text-orange-400">Short-term</span>
                    </>
                  ) : (
                    <>
                      <Brain className="h-3.5 w-3.5" style={{ color: '#C2B5FC' }} />
                      <span style={{ color: '#C2B5FC' }}>Long-term</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={onEdit}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <Tag className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-300">Tags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {note.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center text-sm px-3 py-1 rounded-full border"
                    style={{ 
                      backgroundColor: note.memory_type === 'short-term' 
                        ? 'rgba(251, 146, 60, 0.2)' 
                        : 'rgba(194, 181, 252, 0.2)',
                      color: note.memory_type === 'short-term' ? '#fb923c' : '#C2B5FC',
                      borderColor: note.memory_type === 'short-term' 
                        ? 'rgba(251, 146, 60, 0.3)' 
                        : 'rgba(194, 181, 252, 0.3)'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Note Content */}
          <div>
            <div className="text-white text-base leading-relaxed whitespace-pre-wrap prose prose-invert max-w-none">
              {note.content ? (
                <div className="whitespace-pre-wrap text-white text-base leading-relaxed">
                  {note.content.split('\n').map((line, lineIndex) => (
                    <div key={lineIndex}>
                      {line.split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*|`[^`\n]+`|\[[^\]]+\]\([^)]+\))/).map((part, partIndex) => {
                        // Bold text - remove ** but keep bold formatting
                        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
                          return <strong key={partIndex} className="font-bold">{part.slice(2, -2)}</strong>;
                        }
                        // Italic text - remove * but keep italic formatting
                        else if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**') && part.length > 2) {
                          return <em key={partIndex} className="italic">{part.slice(1, -1)}</em>;
                        }
                        // Inline code - remove ` but keep code formatting
                        else if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
                          return (
                            <code key={partIndex} className="bg-slate-700 px-1 py-0.5 rounded text-sm">
                              {part.slice(1, -1)}
                            </code>
                          );
                        }
                        // Links - show link text but make it clickable
                        else if (part.match(/\[[^\]]+\]\([^)]+\)/)) {
                          const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
                          if (match) {
                            return (
                              <a 
                                key={partIndex}
                                href={match[2]} 
                                className="text-blue-400 hover:text-blue-300 underline" 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                {match[1]}
                              </a>
                            );
                          }
                        }
                        // Regular text
                        return <span key={partIndex}>{part}</span>;
                      })}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-400 italic text-center py-8">
                  This note has no content yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div>
              Created: {new Date(note.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </div>
            <div>
              Last updated: {new Date(note.updated_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 