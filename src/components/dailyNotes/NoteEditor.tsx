import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Brain, 
  Clock, 
  Tag, 
  Type, 
  List, 
  Hash, 
  Quote,
  Bold,
  Italic,
  Underline,
  Link,
  Image,
  Code,
  Trash2,
  Plus
} from 'lucide-react';
import { useDailyNotes } from '../../hooks/useDailyNotes';
import { DailyNote } from '../../types/database';

interface NoteEditorProps {
  selectedDate: Date;
  existingNote?: DailyNote;
  defaultMemoryType?: 'short-term' | 'long-term';
  onClose: () => void;
  onSave: () => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  selectedDate,
  existingNote,
  defaultMemoryType,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState(existingNote?.title || '');
  const [content, setContent] = useState(existingNote?.content || '');
  const [memoryType, setMemoryType] = useState<'short-term' | 'long-term'>(existingNote?.memory_type || defaultMemoryType || 'short-term');
  const [tags, setTags] = useState<string[]>(existingNote?.tags || []);
  const [currentTag, setCurrentTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { saveNote, updateNote } = useDailyNotes(selectedDate);

  useEffect(() => {
    // Focus the title input when the modal opens
    const titleInput = document.getElementById('note-title');
    if (titleInput) {
      titleInput.focus();
    }
  }, []);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setIsSaving(true);
    setError(null);
    
    try {
      if (existingNote) {
        await updateNote(existingNote.id, {
          title,
          content,
          tags,
          memory_type: memoryType
        });
      } else {
        await saveNote({
          title,
          content,
          tags,
          memoryType,
          noteDate: selectedDate
        });
      }
      onSave();
    } catch (err) {
      console.error('Error saving note:', err);
      console.error('NoteEditor - Error type:', typeof err);
      console.error('NoteEditor - Error constructor:', err?.constructor?.name);
      console.error('NoteEditor - Error is Error instance:', err instanceof Error);
      console.error('NoteEditor - Error stringified:', JSON.stringify(err, null, 2));
      setError(`Failed to save note: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-medium text-white">
            {existingNote ? 'Edit Note' : 'New Note'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700 rounded-md transition-colors"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Title */}
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Type className="h-4 w-4 text-slate-400" />
              <label htmlFor="note-title" className="text-sm font-medium text-slate-300">
                Title
              </label>
            </div>
            <input
              id="note-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-1 text-sm"
              style={{ '--tw-ring-color': '#C2B5FC' } as React.CSSProperties}
            />
          </div>
          
          {/* Memory Type */}
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Brain className="h-4 w-4 text-slate-400" />
              <label className="text-sm font-medium text-slate-300">
                Memory Type
              </label>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMemoryType('short-term')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all ${
                  memoryType === 'short-term'
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : 'bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600'
                }`}
              >
                <Clock className="h-4 w-4" />
                <span className="text-sm">Short Term</span>
              </button>
              
              <button
                onClick={() => setMemoryType('long-term')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all ${
                  memoryType === 'long-term'
                    ? 'border border-purple-500/30 text-purple-400'
                    : 'bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600'
                }`}
                style={memoryType === 'long-term' ? { backgroundColor: 'rgba(194, 181, 252, 0.2)' } : {}}
              >
                <Brain className="h-4 w-4" style={{ color: memoryType === 'long-term' ? '#C2B5FC' : 'currentColor' }} />
                <span className="text-sm" style={{ color: memoryType === 'long-term' ? '#C2B5FC' : 'currentColor' }}>Long Term</span>
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <List className="h-4 w-4 text-slate-400" />
              <label htmlFor="note-content" className="text-sm font-medium text-slate-300">
                Content
              </label>
            </div>
            
            {/* Basic Formatting Toolbar */}
            <div className="flex items-center space-x-1 mb-2 p-1 bg-slate-700 rounded-t-md border-x border-t border-slate-600">
              <button className="p-1 hover:bg-slate-600 rounded">
                <Bold className="h-4 w-4 text-slate-400" />
              </button>
              <button className="p-1 hover:bg-slate-600 rounded">
                <Italic className="h-4 w-4 text-slate-400" />
              </button>
              <button className="p-1 hover:bg-slate-600 rounded">
                <Underline className="h-4 w-4 text-slate-400" />
              </button>
              <div className="h-4 border-r border-slate-600 mx-1"></div>
              <button className="p-1 hover:bg-slate-600 rounded">
                <Link className="h-4 w-4 text-slate-400" />
              </button>
              <button className="p-1 hover:bg-slate-600 rounded">
                <Image className="h-4 w-4 text-slate-400" />
              </button>
              <button className="p-1 hover:bg-slate-600 rounded">
                <Code className="h-4 w-4 text-slate-400" />
              </button>
              <div className="h-4 border-r border-slate-600 mx-1"></div>
              <button className="p-1 hover:bg-slate-600 rounded">
                <Quote className="h-4 w-4 text-slate-400" />
              </button>
            </div>
            
            <textarea
              id="note-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note here..."
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-b-md text-white placeholder-slate-400 focus:outline-none focus:ring-1 text-sm min-h-[200px]"
              style={{ '--tw-ring-color': '#C2B5FC' } as React.CSSProperties}
            />
          </div>
          
          {/* Tags */}
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Tag className="h-4 w-4 text-slate-400" />
              <label htmlFor="note-tags" className="text-sm font-medium text-slate-300">
                Tags
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="note-tags"
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add tags..."
                  className="w-full pl-10 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-1 text-sm"
                  style={{ '--tw-ring-color': '#C2B5FC' } as React.CSSProperties}
                />
              </div>
              <button
                onClick={handleAddTag}
                disabled={!currentTag.trim()}
                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-md border border-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4 text-slate-400" />
              </button>
            </div>
            
            {/* Tags List */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map((tag) => (
                  <div 
                    key={tag}
                    className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs ${
                      memoryType === 'short-term' 
                        ? 'bg-orange-500/20 text-orange-400' 
                        : ''
                    }`}
                    style={memoryType === 'long-term' ? { backgroundColor: 'rgba(194, 181, 252, 0.2)', color: '#C2B5FC' } : {}}
                  >
                    <span>#{tag}</span>
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:bg-slate-600 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-3 py-2 rounded-md text-sm">
              {error}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-700">
          <div className="text-xs text-slate-400">
            {existingNote ? 'Last edited: ' + new Date(existingNote.updated_at).toLocaleString() : 'New note for ' + selectedDate.toLocaleDateString()}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-md text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !title.trim()}
              className="flex items-center space-x-2 px-4 py-2 text-slate-900 rounded-md text-sm transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: '#C2B5FC' }}
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Saving...' : 'Save Note'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};