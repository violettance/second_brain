import React, { useState, useRef, useEffect } from 'react';
import { X, Save, Clock, Brain, Tag, Type, List, Hash, Quote, Code, Sparkles, Loader2, Plus, Crown } from 'lucide-react';
import { useMemoryNotes } from '../../hooks/useMemoryNotes';
import { generateTags } from '../../lib/aiProxy';
import { CompactVoiceRecorder } from '../CompactVoiceRecorder';
import { PaywallModal } from '../analytics/PaywallModal';
import { useAuth } from '../../contexts/AuthContext';
import { logger } from '../../lib/logger';

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
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [aiAddedTags, setAiAddedTags] = useState<string[]>([]);
  const [showPaywall, setShowPaywall] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const { saveNote } = useMemoryNotes();
  const { isPro } = useAuth();

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if paywall is open
      if (showPaywall) return;
      
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, showPaywall]);

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

  const handleGenerateTags = async () => {
    if (!title.trim() && !content.trim()) {
      alert('Please add a title or content to generate tags');
      return;
    }
    setIsGeneratingTags(true);
    try {
      const newAiTags = await generateTags({ title: title.trim(), content: content.trim() });
      const uniqueNewTags = newAiTags.filter(tag => !tags.includes(tag));
      setTags([...tags, ...uniqueNewTags]);
      setAiAddedTags([...aiAddedTags, ...uniqueNewTags]);
    } catch (err) {
      logger.error('Error generating tags', { error: err.message });
      if (err instanceof Error && err.message === 'MISSING_GEMINI_API_KEY') {
        alert('AI tagging requires configuration. Add VITE_GEMINI_API_KEY to your environment and reload.');
      } else if (err instanceof Error && err.message === 'SERVICE_OVERLOADED') {
        alert('AI service is overloaded. Please try again in a moment.');
      } else {
        alert('Failed to generate AI tags. Please try again.');
      }
    } finally {
      setIsGeneratingTags(false);
    }
  };

  const handleRemoveAiTag = (tagToRemove: string) => {
    setTags(currentTags => currentTags.filter(tag => tag !== tagToRemove));
    setAiAddedTags(currentAiTags => currentAiTags.filter(tag => tag !== tagToRemove));
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
      logger.error('Error saving note', { error: error.message });
      alert('Failed to save note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleVoiceTextUpdate = (newVoiceText: string) => {
    // Simply append the new text - the voice recorder only sends incremental changes
    setContent(prevContent => prevContent + newVoiceText);
  };

  const handleUpgradeClick = () => {
    setShowPaywall(true);
  };

  return (
    <div className="fixed inset-0 bg-black/50  z-50 flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="bg-surface border border-ink rounded-2xl w-full max-w-4xl max-h-modal overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-ink">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg" style={{ background: memoryType === 'short-term' ? 'var(--color-brand-yellow)' : 'var(--color-brand-primary)' }}>
              {memoryType === 'short-term' ? (
                <Clock className="h-5 w-5 text-ink" />
              ) : (
                <Brain className="h-5 w-5 text-ink" />
              )}
            </div>
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-ink">
                Create {memoryType === 'short-term' ? 'Short Term' : 'Long Term'} Note
              </h2>
              <p className="text-muted text-xs lg:text-sm">
                {memoryType === 'short-term' 
                  ? 'Temporary note - will be archived after 30 days'
                  : 'Permanent note - part of your knowledge base'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Voice Recording - Compact */}
            <div className="flex items-center">
              <CompactVoiceRecorder
                onTextUpdate={handleVoiceTextUpdate}
                isProUser={isPro}
                onUpgradeClick={handleUpgradeClick}
                theme={memoryType}
                enableAI={false} // Disabled for faster real-time dictation
                recordingTimeout={15} // 15 seconds timeout for longer dictation
                language="en-US" // TODO: Get from app-wide language settings
              />
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface-muted rounded-lg transition-colors"
            >
              <X className="h-5 w-5 lg:h-6 lg:w-6 text-muted" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 lg:space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-muted mb-2">
              Note Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title..."
              className="w-full px-4 py-3 bg-surface-muted border border-ink rounded-xl text-ink placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent text-base lg:text-lg font-semibold"
              style={{ '--tw-ring-color': memoryType === 'short-term' ? 'var(--color-brand-yellow)' : 'var(--color-brand-primary)' } as React.CSSProperties}
            />
          </div>

          {/* Memory Type Info */}
          <div className={`p-4 rounded-xl border ${
            memoryType === 'short-term' 
              ? 'bg-orange-500/10 border-orange-500/30' 
              : 'border'
          }`} style={memoryType === 'long-term' ? { backgroundColor: 'color-mix(in srgb, var(--color-brand-purple) 10%, transparent)', borderColor: 'color-mix(in srgb, var(--color-brand-purple) 30%, transparent)' } : {}}>
            <div className="flex items-center space-x-3">
              {memoryType === 'short-term' ? (
                <>
                  <Clock className="h-5 w-5 text-brand-yellow-ink" />
                  <div>
                    <div className="text-brand-yellow-ink font-medium">Short Term Memory</div>
                    <div className="text-muted text-sm">This note will be automatically archived after 30 days unless moved to long term memory</div>
                  </div>
                </>
              ) : (
                <>
                  <Brain className="h-5 w-5" style={{ color: 'var(--color-brand-primary)' }} />
                  <div>
                    <div className="font-medium" style={{ color: 'var(--color-brand-primary)' }}>Long Term Memory</div>
                    <div className="text-muted text-sm">This note will be permanently stored in your knowledge base</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-muted mb-3">
              Tags
            </label>
            <div className="space-y-3">
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted" />
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add tags..."
                    className="w-full pl-10 pr-4 py-2 bg-surface-muted border border-ink rounded-lg text-ink placeholder-slate-400 focus:outline-none focus:ring-2 text-sm"
                    style={{ '--tw-ring-color': memoryType === 'short-term' ? 'var(--color-brand-yellow)' : 'var(--color-brand-primary)' } as React.CSSProperties}
                  />
                </div>
                <button
                  onClick={addTag}
                  className="px-4 py-2 text-ink rounded-lg font-medium transition-colors text-sm hover:opacity-90"
                  style={{ background: memoryType === 'short-term' ? 'var(--color-brand-yellow)' : 'var(--color-brand-primary)' }}
                >
                  Add
                </button>
                <button
                  onClick={handleGenerateTags}
                  disabled={isGeneratingTags || (!title.trim() && !content.trim())}
                  className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm ${
                    memoryType === 'short-term'
                      ? 'bg-orange-500/20 hover:bg-orange-500/30 border-orange-500/30'
                      : 'bg-purple-600/20 hover:bg-purple-600/30 border-purple-500/30'
                  }`}
                  title="Suggest Tags with AI"
                >
                  {isGeneratingTags ? (
                    <Loader2 className={`h-4 w-4 animate-spin ${memoryType === 'short-term' ? 'text-brand-yellow-ink' : 'text-brand-purple-deep'}`} />
                  ) : (
                    <Sparkles className={`h-4 w-4 ${memoryType === 'short-term' ? 'text-brand-yellow-ink' : 'text-brand-purple-deep'}`} />
                  )}
                  <span className={memoryType === 'short-term' ? 'text-brand-yellow-ink' : 'text-brand-purple-deep'}>Suggest Tags with AI</span>
                </button>
              </div>
              
              {/* AI Suggested Tags */}
              {aiAddedTags.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Sparkles className={`h-4 w-4 ${memoryType === 'short-term' ? 'text-brand-yellow-ink' : 'text-brand-purple-deep'}`} />
                    <span className={`text-sm font-medium ${memoryType === 'short-term' ? 'text-brand-yellow-ink' : 'text-brand-purple-deep'}`}>AI Added Tags (click X to remove)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {aiAddedTags.map((tag) => (
                      <div
                        key={tag}
                        className={`flex items-center space-x-1 px-3 py-1 border rounded-lg text-sm ${
                          memoryType === 'short-term'
                            ? 'bg-orange-500/10 border-orange-500/30 text-brand-yellow-ink'
                            : 'bg-purple-600/10 border-purple-500/30 text-brand-purple-deep'
                        }`}
                      >
                        <span>{tag}</span>
                        <button
                          onClick={() => handleRemoveAiTag(tag)}
                          className={`rounded-full p-0.5 ${
                            memoryType === 'short-term' 
                              ? 'hover:bg-orange-500/20' 
                              : 'hover:bg-purple-600/20'
                          }`}
                          title="Remove tag"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tags.filter(t => !aiAddedTags.includes(t)).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.filter(t => !aiAddedTags.includes(t)).map((tag) => (
                    <span
                      key={tag}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-full border text-sm ${
                        memoryType === 'short-term'
                          ? 'border-brand-yellow/50 bg-brand-yellow/20 text-brand-yellow-ink'
                          : 'border-brand-purple/50 bg-brand-purple/20 text-brand-purple-ink'
                      }`}
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
            <label className="block text-sm font-medium text-muted mb-3">
              Content
            </label>
            
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your note..."
              className="w-full h-48 lg:h-64 px-4 py-3 bg-surface-muted border border-ink rounded-xl text-ink placeholder-slate-400 focus:outline-none focus:ring-2 resize-none text-sm lg:text-base"
              style={{ '--tw-ring-color': memoryType === 'short-term' ? 'var(--color-brand-yellow)' : 'var(--color-brand-primary)' } as React.CSSProperties}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4 lg:p-6 border-t border-ink space-y-4 lg:space-y-0">
          <div className="text-xs lg:text-sm text-muted">
            {memoryType === 'short-term' ? (
              <span className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-brand-yellow-ink" />
                <span>Short-term memory - Will be archived after 30 days</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <Brain className="h-4 w-4" style={{ color: 'var(--color-brand-primary)' }} />
                <span>Long-term memory - Permanent knowledge base</span>
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="flex-1 lg:flex-none px-4 lg:px-6 py-2 lg:py-3 border border-ink text-muted rounded-xl font-semibold hover:bg-surface-muted transition-colors text-sm lg:text-base"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !title.trim()}
              className="flex-1 lg:flex-none flex items-center justify-center space-x-2 px-4 lg:px-6 py-2 lg:py-3 text-ink rounded-xl font-semibold transition-colors text-sm lg:text-base hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: memoryType === 'short-term' ? 'var(--color-brand-yellow)' : 'var(--color-brand-primary)' }}
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Saving...' : 'Save Note'}</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Paywall Modal */}
      {showPaywall && (
        <PaywallModal
          feature="voice-recording"
          onClose={() => setShowPaywall(false)}
          onUpgrade={() => {
            // TODO: Implement upgrade logic
            logger.info('Upgrade clicked', { component: 'CreateMemoryModal' });
            setShowPaywall(false);
          }}
        />
      )}
    </div>
  );
};
