import React, { useState, useRef, useEffect } from 'react';
import { X, Save, Clock, Brain, Tag, Type, List, Hash, Quote, Code } from 'lucide-react';
import { useMemoryNotes } from '../../hooks/useMemoryNotes';

interface CreateMemoryModalProps {
  memoryType: 'short-term' | 'long-term';
  onClose: () => void;
}

export const CreateMemoryModal: React.FC<CreateMemoryModalProps> = ({ 
  memoryType, 
  onClose 
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const { saveNote } = useMemoryNotes();

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

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag();
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a title for your note');
      return;
    }

    setIsSaving(true);
    try {
      await saveNote({
        title: title.trim(),
        content: content.trim(),
        tags,
        memoryType
      });
      
      onClose();
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg" style={{ background: memoryType === 'short-term' ? '#fb923c' : '#C2B5FC' }}>
              {memoryType === 'short-term' ? (
                <Clock className="h-5 w-5 text-white" />
              ) : (
                <Brain className="h-5 w-5 text-slate-900" />
              )}
            </div>
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-white">
                Create {memoryType === 'short-term' ? 'Short Term' : 'Long Term'} Note
              </h2>
              <p className="text-slate-400 text-xs lg:text-sm">
                {memoryType === 'short-term' 
                  ? 'Temporary note - will be archived after 30 days'
                  : 'Permanent note - part of your knowledge base'
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 lg:h-6 lg:w-6 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 lg:space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Note Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title..."
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent text-base lg:text-lg font-semibold"
              style={{ '--tw-ring-color': memoryType === 'short-term' ? '#fb923c' : '#C2B5FC' } as React.CSSProperties}
            />
          </div>

          {/* Memory Type Info */}
          <div className={`p-4 rounded-xl border ${
            memoryType === 'short-term' 
              ? 'bg-orange-500/10 border-orange-500/30' 
              : 'border'
          }`} style={memoryType === 'long-term' ? { backgroundColor: '#C2B5FC10', borderColor: '#C2B5FC30' } : {}}>
            <div className="flex items-center space-x-3">
              {memoryType === 'short-term' ? (
                <>
                  <Clock className="h-5 w-5 text-orange-400" />
                  <div>
                    <div className="text-orange-400 font-medium">Short Term Memory</div>
                    <div className="text-slate-400 text-sm">This note will be automatically archived after 30 days unless moved to long term memory</div>
                  </div>
                </>
              ) : (
                <>
                  <Brain className="h-5 w-5" style={{ color: '#C2B5FC' }} />
                  <div>
                    <div className="font-medium" style={{ color: '#C2B5FC' }}>Long Term Memory</div>
                    <div className="text-slate-400 text-sm">This note will be permanently stored in your knowledge base</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Tags
            </label>
            <div className="space-y-3">
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add tags..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 text-sm"
                    style={{ '--tw-ring-color': memoryType === 'short-term' ? '#fb923c' : '#C2B5FC' } as React.CSSProperties}
                  />
                </div>
                <button
                  onClick={addTag}
                  className="px-4 py-2 text-white rounded-lg font-medium transition-colors text-sm hover:opacity-90"
                  style={{ background: memoryType === 'short-term' ? '#fb923c' : '#C2B5FC' }}
                >
                  Add
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center space-x-1 px-3 py-1 rounded-full text-sm"
                      style={memoryType === 'short-term' 
                        ? { backgroundColor: '#fb923c20', color: '#fb923c', border: '1px solid #fb923c50' }
                        : { backgroundColor: '#C2B5FC20', color: '#C2B5FC', border: '1px solid #C2B5FC50' }
                      }
                    >
                      <span>{tag}</span>
                      <button
                        onClick={() => removeTag(tag)}
                        className="transition-colors hover:opacity-70"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Content Editor */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Content
            </label>
            
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your note..."
              className="w-full h-48 lg:h-64 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 resize-none text-sm lg:text-base"
              style={{ '--tw-ring-color': memoryType === 'short-term' ? '#fb923c' : '#C2B5FC' } as React.CSSProperties}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4 lg:p-6 border-t border-slate-700 space-y-4 lg:space-y-0">
          <div className="text-xs lg:text-sm text-slate-400">
            {memoryType === 'short-term' ? (
              <span className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-orange-400" />
                <span>Short-term memory - Will be archived after 30 days</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <Brain className="h-4 w-4" style={{ color: '#C2B5FC' }} />
                <span>Long-term memory - Permanent knowledge base</span>
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="flex-1 lg:flex-none px-4 lg:px-6 py-2 lg:py-3 border border-slate-600 text-slate-300 rounded-xl font-semibold hover:bg-slate-700 transition-colors text-sm lg:text-base"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !title.trim()}
              className="flex-1 lg:flex-none flex items-center justify-center space-x-2 px-4 lg:px-6 py-2 lg:py-3 text-white rounded-xl font-semibold transition-colors text-sm lg:text-base hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: memoryType === 'short-term' ? '#fb923c' : '#C2B5FC' }}
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