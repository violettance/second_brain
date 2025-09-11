import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Plus, Search, Edit3, Trash2, Calendar, Tag, Star, Sparkles, Crown, Loader2, X } from 'lucide-react';
import { CreateMemoryModal } from './CreateMemoryModal';
import { NotePreviewModal } from '../dailyNotes/NotePreviewModal';
import { NoteEditor } from '../dailyNotes/NoteEditor';
import { useMemoryNotes } from '../../hooks/useMemoryNotes';
import { DailyNote } from '../../types/database';
import { useAuth } from '../../contexts/AuthContext';
import { generateLongTermInsights } from '../../lib/gemini';

// Helper component to parse and render the AI analysis
const ParsedAnalysis = ({ text }: { text: string }) => {
  // Split the text into sections based on the emojis, keeping the emojis
  const sections = text.split(/(?=🔗|📈|🚀|🤔)/).filter(s => s.trim() !== '');

  return (
    <div className="space-y-4">
      {sections.map((section, index) => {
        const lines = section.trim().split('\n');
        const title = lines[0];
        const bullets = lines.slice(1).filter(line => line.trim().startsWith('•'));

        return (
          <div key={index} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
            <h3 className="font-semibold text-purple-300 mb-3 text-base">{title}</h3>
            {bullets.length > 0 ? (
              <ul className="space-y-2">
                {bullets.map((bullet, i) => (
                  <li key={i} className="text-slate-300 text-sm leading-relaxed flex items-start">
                    <span className="mr-2 mt-1 text-purple-400 text-xs">◆</span>
                    <span>{bullet.replace('•', '').trim()}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-400 text-sm">{lines.slice(1).join('\n')}</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const LongTermMemory: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewNote, setPreviewNote] = useState<DailyNote | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState<DailyNote | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const { longTermNotes, isLoading, deleteNote, refetch } = useMemoryNotes();
  const { user } = useAuth();
  const [showAiInsights, setShowAiInsights] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // 24h Caching for AI Insights with content checksum
  useEffect(() => {
    if (!user || (user as any).subscription_plan !== 'pro' || !longTermNotes || longTermNotes.length === 0) {
      return;
    }

    const cacheKey = `aiInsights_long_term_${user.id}`;
    const cached = localStorage.getItem(cacheKey);
    const now = Date.now();
    const TTL_MS = 24 * 60 * 60 * 1000; // 24h
    const checksum = (() => {
      try { return btoa(unescape(encodeURIComponent(JSON.stringify(longTermNotes.map(n => ({ t: n.title, c: n.content })))))); } catch { return '' }
    })();

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        // Use cached result if still within 24h, regardless of content changes
        if (parsed?.timestamp && (now - parsed.timestamp) < TTL_MS && parsed?.data) {
          setAiAnalysis(parsed.data);
          return;
        }
      } catch {}
    }

    const scheduleRetry = (delayMs: number) => {
      const at = Date.now() + delayMs;
      localStorage.setItem('ai_long_term_retry_at', String(at));
      setAiAnalysis('Analyzing all notes... this may take up to a minute.');
      setTimeout(() => {
        // Clear flag and trigger a new run by updating a dummy state via storage event pattern
        localStorage.removeItem('ai_long_term_retry_at');
        void fetchInsights();
      }, delayMs);
    };

    const fetchInsights = async () => {
      setAiLoading(true);
      try {
        // If short-term just triggered, respect a simple client-side rate gate
        const gate = Number(localStorage.getItem('ai_rate_gate_until') || '0');
        const nowMs = Date.now();
        if (gate && gate > nowMs) {
          await new Promise(res => setTimeout(res, Math.min(gate - nowMs, 20000)));
        }
        // Respect queued retry if exists
        const retryAt = Number(localStorage.getItem('ai_long_term_retry_at') || '0');
        if (retryAt && retryAt > Date.now()) {
          await new Promise(res => setTimeout(res, Math.min(retryAt - Date.now(), 60000)));
        }
        let analysis = await generateLongTermInsights(longTermNotes);
        if (analysis === 'AI analysis could not be generated.') {
          // single retry after 10s to ride out quota window
          await new Promise(res => setTimeout(res, 10000));
          analysis = await generateLongTermInsights(longTermNotes);
        }
        if (analysis === 'AI analysis could not be generated.') {
          // Queue for later to avoid quota collisions
          scheduleRetry(60000);
        } else {
          setAiAnalysis(analysis);
          localStorage.setItem(cacheKey, JSON.stringify({ timestamp: now, checksum, data: analysis }));
        }
      } catch (error) {
        console.error("Failed to fetch long-term AI insights:", error);
        // Queue on error as well
        scheduleRetry(60000);
      } finally {
        setAiLoading(false);
      }
    };
    fetchInsights();
  }, [user, longTermNotes]);

  const filteredAndSortedNotes = longTermNotes
    .filter(note =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const handleCloseModal = () => {
    setShowCreateModal(false);
    // Refresh the notes list after modal closes
    refetch();
  };

  const handleNoteClick = (note: DailyNote) => {
    setPreviewNote(note);
    setShowPreview(true);
  };

  const handleNoteUpdate = (updatedNote: DailyNote) => {
    // This is a bit of a hack to force a re-render. 
    // In a real app, this state would likely be managed by the useMemoryNotes hook.
    // Forcing a local state update to reflect the change immediately.
    // A better approach would be to update the cache in useMemoryNotes hook.
    // Let's assume for now the hook's cache will be eventually consistent.
    longTermNotes.map(n => n.id === updatedNote.id ? updatedNote : n);
    setPreviewNote(updatedNote); // Update the note in the preview modal as well
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewNote(null);
  };

  const handleEditFromPreview = () => {
    if (previewNote) {
      setEditingNote(previewNote);
      setShowEditor(true);
      setShowPreview(false);
      setPreviewNote(null);
    }
  };

  const handleEditNote = (note: DailyNote) => {
    setEditingNote(note);
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setEditingNote(undefined);
    // Refresh notes after saving
    refetch();
  };

  return (
    <div className="flex-1 bg-slate-900 overflow-y-auto h-screen">
      {/* Header - Added left padding for mobile view to prevent overlap with hamburger menu */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 p-4 lg:p-6 sticky top-0 z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="pl-12 lg:pl-0">
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2 flex items-center space-x-3">
              <Brain className="h-8 w-8" style={{ color: '#C2B5FC' }} />
              <span>Long Term Memory</span>
            </h1>
            <p className="text-slate-400 text-sm lg:text-base">
              Permanent knowledge base for important information
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {longTermNotes && longTermNotes.length > 0 && (
              <button
                onClick={() => {
                  if ((user as any)?.subscription_plan === 'pro') {
                    setShowAiInsights(!showAiInsights);
                  } else {
                    setShowAiInsights(true);
                  }
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm border ${
                  (user as any)?.subscription_plan === 'pro'
                    ? 'bg-slate-700/50 text-slate-200 hover:bg-slate-700 border-slate-600/80'
                    : 'bg-transparent text-slate-500 border-slate-700/80 cursor-pointer opacity-70 hover:opacity-100'
                }`}
                title={(user as any)?.subscription_plan === 'pro' ? 'Toggle AI Analysis' : 'Upgrade to unlock'}
              >
                <Crown className={`h-4 w-4 ${(user as any)?.subscription_plan === 'pro' ? 'text-yellow-400' : 'text-slate-500'}`} />
                <span className="hidden lg:inline">AI Insights</span>
              </button>
            )}
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
      </div>

      {/* Main Content */}
      <div className="p-4 lg:p-6 space-y-6 bg-slate-900 min-h-full">
        {/* Search and Filter */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="relative flex-1 lg:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search long term notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 text-sm"
              style={{ '--tw-ring-color': '#C2B5FC' } as React.CSSProperties}
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 text-sm"
              style={{ '--tw-ring-color': '#C2B5FC' } as React.CSSProperties}
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
            
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ background: '#C2B5FC' }}></div>
              <span className="text-slate-400">{filteredAndSortedNotes.length} notes</span>
            </div>
          </div>
        </div>

        {/* Knowledge Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{longTermNotes.length}</div>
            <div className="text-slate-400 text-sm">Total Notes</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">
              {longTermNotes.reduce((acc, note) => acc + (note.tags?.length || 0), 0)}
            </div>
            <div className="text-slate-400 text-sm">Total Tags</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">
              {longTermNotes.filter(note => {
                const daysSinceCreated = Math.floor((Date.now() - new Date(note.created_at).getTime()) / (1000 * 60 * 60 * 24));
                return daysSinceCreated <= 7;
              }).length}
            </div>
            <div className="text-slate-400 text-sm">This Week</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">∞</div>
            <div className="text-slate-400 text-sm">Permanent</div>
          </div>
        </div>

        {/* Notes Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-slate-400">Loading notes...</div>
          </div>
        ) : filteredAndSortedNotes.length === 0 ? (
          <div className="text-center py-12">
            <Brain className="h-16 w-16 text-slate-500 mx-auto mb-4" />
            <div className="text-slate-400 text-lg mb-2">No long term notes</div>
            <div className="text-slate-500 text-sm">Create your first permanent note</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedNotes.map((note) => (
              <div 
                key={note.id} 
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition-all group cursor-pointer"
                onClick={() => handleNoteClick(note)}
              >
                {/* Note Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-lg mb-2 truncate">
                      {note.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-xs">
                      <Brain className="h-3 w-3" style={{ color: '#C2B5FC' }} />
                      <span style={{ color: '#C2B5FC' }}>Permanent Knowledge</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditNote(note);
                      }}
                      className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                      title="Edit Note"
                    >
                      <Edit3 className="h-4 w-4 text-slate-400" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this item?')) {
                          deleteNote(note.id, 'long-term');
                        }
                      }}
                      className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                      title="Delete Note"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                </div>

                {/* Content Preview */}
                <p className="text-slate-300 text-sm leading-relaxed mb-4 line-clamp-4">
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
                          className="px-2 py-1 rounded text-xs"
                          style={{ backgroundColor: '#C2B5FC20', color: '#C2B5FC' }}
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
                  
                  {/* Permanent Badge */}
                  <div className="flex items-center space-x-1 px-2 py-1 rounded-lg text-xs" style={{ backgroundColor: '#C2B5FC20', color: '#C2B5FC' }}>
                    <Star className="h-3 w-3" />
                    <span>Permanent</span>
                  </div>
                </div>

                {/* Knowledge Indicator */}
                <div className="mt-3 p-2 rounded-lg text-xs border" style={{ backgroundColor: '#C2B5FC10', borderColor: '#C2B5FC30', color: '#C2B5FC' }}>
                  💡 Part of your permanent knowledge base
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Note Modal */}
      {showCreateModal && (
        <CreateMemoryModal 
          memoryType="long-term"
          onClose={handleCloseModal} 
        />
      )}

      {/* Note Preview Modal */}
      {showPreview && previewNote && (
        <NotePreviewModal
          note={previewNote}
          onClose={handleClosePreview}
          onEdit={handleEditFromPreview}
          onUpdateNote={handleNoteUpdate}
          refetchNotes={refetch}
        />
      )}

      {/* Note Editor Modal */}
      {showEditor && (
        <NoteEditor
          selectedDate={editingNote?.note_date ? new Date(editingNote.note_date + 'T00:00:00') : new Date()}
          existingNote={editingNote}
          defaultMemoryType="long-term"
          onClose={handleCloseEditor}
          onSave={handleCloseEditor}
        />
      )}

      {/* AI Insights Slide Panel */}
      <div className={`fixed top-0 right-0 h-full w-80 lg:w-96 bg-slate-800/95 backdrop-blur-sm border-l border-slate-700/50 transform transition-transform duration-300 ease-in-out z-50 ${showAiInsights ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Panel Header */}
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg" style={{ background: '#C2B5FC20' }}>
                  <Sparkles className="h-6 w-6" style={{ color: '#C2B5FC' }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">AI Knowledge Analysis</h2>
                  <p className="text-slate-400 text-sm">Uncovering deep insights</p>
                </div>
              </div>
              <button onClick={() => setShowAiInsights(false)} className="p-2 hover:bg-slate-600 rounded-lg transition-colors" title="Close panel">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
          </div>
          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {(user as any)?.subscription_plan === 'pro' ? (
              <div>
                {aiLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto mb-3" />
                      <p className="text-slate-400">Analyzing your knowledge base...</p>
                    </div>
                  </div>
                ) : aiAnalysis ? (
                  <>
                    <ParsedAnalysis text={aiAnalysis} />
                    <div className="text-xs text-slate-500 text-center mt-4">
                      <p>Insights are automatically refreshed once every 24 hours.</p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Sparkles className="h-12 w-12 text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-400">Not enough notes for analysis.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mb-6"><Crown className="h-16 w-16 text-purple-400 mx-auto" /></div>
                <h3 className="text-lg font-bold text-white mb-3">Unlock Deep Knowledge Analysis</h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">Upgrade to Pro to uncover hidden connections, emerging patterns, and strategic next steps from your permanent knowledge base.</p>
                <Link to="/pricing">
                  <button className="w-full px-4 py-3 bg-purple-500 text-white rounded-lg font-semibold transition-colors hover:bg-purple-600">Upgrade to Pro</button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for mobile when panel is open */}
      {showAiInsights && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setShowAiInsights(false)} />}
    </div>
  );
};