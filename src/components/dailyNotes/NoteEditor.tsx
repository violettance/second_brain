import React, { useState } from 'react';
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
  Code
} from 'lucide-react';
import { useDailyNotes } from '../../hooks/useDailyNotes';

interface NoteEditorProps {
  selectedDate: Date;
  onClose: () => void;
  onSave: () => void;
}

type MemoryType = 'short-term' | 'long-term';
type BlockType = 'paragraph' | 'heading1' | 'heading2' | 'heading3' | 'heading4' | 'bullet-list' | 'numbered-list' | 'quote' | 'code';

export const NoteEditor: React.FC<NoteEditorProps> = ({ 
  selectedDate, 
  onClose, 
  onSave 
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [memoryType, setMemoryType] = useState<MemoryType>('short-term');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [currentBlock, setCurrentBlock] = useState<BlockType>('paragraph');
  const [isSaving, setIsSaving] = useState(false);

  const { saveNote } = useDailyNotes();

  const blockTypes = [
    { type: 'paragraph' as BlockType, label: 'Paragraph', icon: Type },
    { type: 'heading1' as BlockType, label: 'Heading 1', icon: Hash },
    { type: 'heading2' as BlockType, label: 'Heading 2', icon: Hash },
    { type: 'heading3' as BlockType, label: 'Heading 3', icon: Hash },
    { type: 'heading4' as BlockType, label: 'Heading 4', icon: Hash },
    { type: 'bullet-list' as BlockType, label: 'Bullet List', icon: List },
    { type: 'numbered-list' as BlockType, label: 'Numbered List', icon: List },
    { type: 'quote' as BlockType, label: 'Quote', icon: Quote },
    { type: 'code' as BlockType, label: 'Code Block', icon: Code },
  ];

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
        memoryType,
        noteDate: selectedDate
      });
      
      onSave();
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-slate-700">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-white">Create Note</h2>
            <p className="text-slate-400 text-xs lg:text-sm">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
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
              style={{ '--tw-ring-color': '#C2B5FC' } as React.CSSProperties}
            />
          </div>

          {/* Memory Type & Tags Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Memory Type */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Memory Type
              </label>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => setMemoryType('short-term')}
                  className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border transition-all text-sm ${
                    memoryType === 'short-term'
                      ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                      : 'bg-slate-700 text-slate-400 border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <Clock className="h-4 w-4 lg:h-5 lg:w-5" />
                  <span className="font-medium">Short-term</span>
                </button>
                <button
                  onClick={() => setMemoryType('long-term')}
                  className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border transition-all text-sm ${
                    memoryType === 'long-term'
                      ? 'border'
                      : 'bg-slate-700 text-slate-400 border-slate-600 hover:border-slate-500'
                  }`}
                  style={memoryType === 'long-term' ? { backgroundColor: '#C2B5FC20', color: '#C2B5FC', borderColor: '#C2B5FC50' } : {}}
                >
                  <Brain className="h-4 w-4 lg:h-5 lg:w-5" />
                  <span className="font-medium">Long-term</span>
                </button>
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
                      style={{ '--tw-ring-color': '#C2B5FC' } as React.CSSProperties}
                    />
                  </div>
                  <button
                    onClick={addTag}
                    className="px-4 py-2 text-slate-900 rounded-lg font-medium transition-colors text-sm hover:opacity-90"
                    style={{ background: '#C2B5FC' }}
                  >
                    Add
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center space-x-1 px-3 py-1 border rounded-full text-sm"
                        style={{ backgroundColor: '#C2B5FC20', color: '#C2B5FC', borderColor: '#C2B5FC50' }}
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
          </div>

          {/* Content Editor */}
          <div>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-3 space-y-3 lg:space-y-0">
              <label className="block text-sm font-medium text-slate-300">
                Content
              </label>
              
              {/* Formatting Toolbar */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center space-y-2 lg:space-y-0 lg:space-x-1">
                {/* Block Type Selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowBlockMenu(!showBlockMenu)}
                    className="w-full lg:w-auto flex items-center justify-center space-x-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-slate-300 text-sm transition-colors"
                  >
                    <Type className="h-4 w-4" />
                    <span>{blockTypes.find(b => b.type === currentBlock)?.label}</span>
                  </button>
                  
                  {showBlockMenu && (
                    <div className="absolute top-full left-0 lg:right-0 lg:left-auto mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 min-w-[200px]">
                      {blockTypes.map((block) => (
                        <button
                          key={block.type}
                          onClick={() => {
                            setCurrentBlock(block.type);
                            setShowBlockMenu(false);
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-slate-700 transition-colors text-slate-300 first:rounded-t-lg last:rounded-b-lg"
                        >
                          <block.icon className="h-4 w-4" />
                          <span>{block.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Text Formatting */}
                <div className="flex items-center justify-center space-x-1 border-l border-slate-600 pl-2 ml-2">
                  <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                    <Bold className="h-4 w-4 text-slate-400" />
                  </button>
                  <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                    <Italic className="h-4 w-4 text-slate-400" />
                  </button>
                  <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                    <Underline className="h-4 w-4 text-slate-400" />
                  </button>
                  <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                    <Link className="h-4 w-4 text-slate-400" />
                  </button>
                  <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                    <Image className="h-4 w-4 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>
            
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your note..."
              className="w-full h-48 lg:h-64 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 resize-none text-sm lg:text-base"
              style={{ '--tw-ring-color': '#C2B5FC' } as React.CSSProperties}
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
              className="flex-1 lg:flex-none flex items-center justify-center space-x-2 px-4 lg:px-6 py-2 lg:py-3 text-slate-900 rounded-xl font-semibold transition-colors text-sm lg:text-base hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
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