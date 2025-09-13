import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Plus, Search, Filter, Archive, Trash2, Brain, Calendar, Tag, MoreHorizontal, Sparkles, Crown, Loader2, X, ArrowRight } from 'lucide-react';
import { CreateMemoryModal } from './CreateMemoryModal';
import { NotePreviewModal } from '../dailyNotes/NotePreviewModal';
import { NoteEditor } from '../dailyNotes/NoteEditor';
import { useMemoryNotes } from '../../hooks/useMemoryNotes';
import { DailyNote } from '../../types/database';
import { generateAiInsights } from '../../lib/aiProxy';
import { useAuth } from '../../contexts/AuthContext';
import { logger } from '../../lib/logger';

function simpleHash(str: string): string {
  let hash = 0, i, chr;
  if (str.length === 0) return hash.toString();
  for (i = 0; i < str.length; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString();
}

export const ShortTermMemory: React.FC = React.memo(() => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewNote, setPreviewNote] = useState<DailyNote | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState<DailyNote | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const { shortTermNotes, isLoading, moveToLongTerm, deleteNote, refetch } = useMemoryNotes();
  const { user } = useAuth();
  const [showAiInsights, setShowAiInsights] = useState(false);

  const [aiInsights, setAiInsights] = useState<{ summary: string | null; recommendations: any[] }>({ summary: null, recommendations: [] });
  const [aiInsightsLoading, setAiInsightsLoading] = useState(false);

  // 24h Caching and AI Insights Logic with content checksum
  useEffect(() => {
    if (!user || (user as any).subscription_plan !== 'pro' || !shortTermNotes || shortTermNotes.length === 0) {
      return;
    }

    const cacheKey = `aiInsights_short_term_${user.id}`;
    const cached = localStorage.getItem(cacheKey);
    const now = Date.now();
    const TTL_MS = 24 * 60 * 60 * 1000; // 24h
    const checksum = simpleHash(JSON.stringify(shortTermNotes.map(n => ({ t: n.title, c: (n as any).content }))));

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        // Use cached result if still within 24h, regardless of content changes
        if (parsed?.timestamp && (now - parsed.timestamp) < TTL_MS && parsed?.data) {
          setAiInsights(parsed.data);
          return;
        }
      } catch {}
    }

    const fetchInsights = async () => {
      setAiInsightsLoading(true);
      try {
        // Rate gate: block other AI calls for ~20s to avoid 429
        const gateUntil = Date.now() + 20000;
        localStorage.setItem('ai_rate_gate_until', String(gateUntil));
        // Try once; if failure text, wait 10s and retry once
        let insights = await generateAiInsights(shortTermNotes);
        if (insights.summary === 'AI insight could not be generated.') {
          await new Promise(res => setTimeout(res, 10000));
          insights = await generateAiInsights(shortTermNotes);
        }
        setAiInsights(insights);
        // Only cache successful results
        if (insights.summary && insights.summary !== 'AI insight could not be generated.') {
          localStorage.setItem(cacheKey, JSON.stringify({ timestamp: now, checksum, data: insights }));
        }
      } catch (error) {
        logger.error("Failed to fetch AI insights", { error: error.message });
        setAiInsights({ summary: 'Failed to generate AI insights.', recommendations: [] });
      } finally {
        setAiInsightsLoading(false);
      }
    };
    fetchInsights();
  }, [user, shortTermNotes]);

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

  const filteredAndSortedNotes = shortTermNotes
    .filter(note =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'expiring':
          return getDaysRemaining(a.created_at) - getDaysRemaining(b.created_at);
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
              <Clock className="h-8 w-8 text-orange-400" />
              <span>Short Term Memory</span>
            </h1>
            <p className="text-slate-400 text-sm lg:text-base">
              Temporary notes that will be archived after 30 days
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {shortTermNotes && shortTermNotes.length > 0 && (
              <button
                onClick={() => {
                  if ((user as any)?.subscription_plan === 'pro') {
                    setShowAiInsights(!showAiInsights);
                  } else {
                    setShowAiInsights(true); // Open panel to show upgrade message
                  }
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm border ${
                  (user as any)?.subscription_plan === 'pro'
                    ? 'bg-slate-700/50 text-slate-200 hover:bg-slate-700 border-slate-600/80'
                    : 'bg-transparent text-slate-500 border-slate-700/80 cursor-pointer opacity-70 hover:opacity-100'
                }`}
                title={(user as any)?.subscription_plan === 'pro' ? 'Toggle AI Insights' : 'Upgrade to unlock'}
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
              placeholder="Search short term notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 text-sm"
              style={{ '--tw-ring-color': '#fb923c' } as React.CSSProperties}
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 text-sm"
              style={{ '--tw-ring-color': '#fb923c' } as React.CSSProperties}
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="alphabetical">Alphabetical</option>
              <option value="expiring">Expiring Soon</option>
            </select>
            
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-orange-400"></div>
              <span className="text-slate-400">{filteredAndSortedNotes.length} notes</span>
            </div>
          </div>
        </div>

        {/* Notes Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-slate-400">Loading notes...</p>
          </div>
        ) : filteredAndSortedNotes.length === 0 ? (
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
            {filteredAndSortedNotes.map((note) => {
              const daysRemaining = getDaysRemaining(note.created_at);
              
              return (
                <div 
                  key={note.id} 
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 lg:p-6 hover:bg-slate-800 transition-all group cursor-pointer"
                  onClick={() => handleNoteClick(note)}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          moveToLongTerm(note.id);
                        }}
                        className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                        title="Move to Long Term Memory"
                      >
                        <Brain className="h-4 w-4 text-purple-400" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Are you sure you want to delete this item?')) {
                            deleteNote(note.id, 'short-term');
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
                          {tag}
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
          onClose={handleCloseModal}
        />
      )}

      {/* Note Preview Modal */}
      {showPreview && previewNote && (
        <NotePreviewModal
          note={previewNote}
          onClose={handleClosePreview}
          onEdit={handleEditFromPreview}
        />
      )}

      {/* Note Editor Modal */}
      {showEditor && (
        <NoteEditor
          selectedDate={editingNote?.note_date ? new Date(editingNote.note_date + 'T00:00:00') : new Date()}
          existingNote={editingNote}
          defaultMemoryType="short-term"
          onClose={handleCloseEditor}
          onSave={handleCloseEditor}
        />
      )}

      {/* AI Insights Slide Panel */}
      <div className={`fixed top-0 right-0 h-full w-80 lg:w-96 bg-slate-800/95 backdrop-blur-sm border-l border-slate-700/50 transform transition-transform duration-300 ease-in-out z-50 ${
        showAiInsights ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Panel Header */}
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg" style={{ background: '#fb923c20' }}>
                  <Sparkles className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">AI Insights</h2>
                  <p className="text-slate-400 text-sm">
                    Analyzing {shortTermNotes?.length || 0} notes • Smart patterns & recommendations
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAiInsights(false)}
                className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                title="Close panel"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            
            {(user as any)?.subscription_plan === 'pro' && (
              <div className="flex items-center space-x-2 text-xs text-orange-400">
                <Crown className="h-4 w-4" />
                <span>Pro Feature Active</span>
              </div>
            )}
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {(user as any)?.subscription_plan === 'pro' ? (
              <div>
                {aiInsightsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-orange-400 mx-auto mb-3" />
                      <p className="text-slate-400">Generating AI insights...</p>
                    </div>
                  </div>
                ) : aiInsights.summary ? (
                  <div>
                    <div className="mb-4 p-4 bg-slate-700/30 rounded-lg">
                      <h3 className="text-sm font-semibold text-orange-400 mb-2 flex items-center">
                        <Brain className="h-4 w-4 mr-2" />
                        Analysis Summary
                      </h3>
                      <div className="text-white whitespace-pre-line text-sm leading-relaxed">
                        {aiInsights.summary}
                      </div>
                    </div>
                    
                    {/* Long-term Recommendations */}
                    {/* The original longTermRecommendations state and useEffect are removed */}
                    {/* The new aiInsights.recommendations is used here */}
                    {aiInsights.recommendations.length > 0 ? (
                      <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <h3 className="text-sm font-semibold text-green-400 mb-3 flex items-center">
                          <Archive className="h-4 w-4 mr-2" />
                          Long-term Memory Suggestions
                        </h3>
                        <div className="space-y-3">
                          {aiInsights.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start justify-between p-3 bg-slate-700/30 rounded-lg">
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">{rec.note.title}</p>
                                <p className="text-slate-400 text-xs mt-1">{rec.reason}</p>
                              </div>
                              <button
                                onClick={() => moveToLongTerm(rec.note.id)}
                                className="ml-3 px-3 py-1 bg-green-500 text-white text-xs rounded-md hover:bg-green-600 transition-colors flex-shrink-0"
                                title="Move to Long-term Memory"
                              >
                                Move
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    
                    <div className="text-xs text-slate-500 text-center mt-4">
                      <p>Insights are automatically refreshed once every 24 hours.</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Sparkles className="h-12 w-12 text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-400">No sufficient notes for analysis.</p>
                    <p className="text-slate-500 text-sm mt-2">Add more thoughts to get AI insights</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mb-6">
                  <div className="relative inline-block">
                    <Crown className="h-16 w-16 text-orange-400 mx-auto" />
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                      <Sparkles className="h-3 w-3 text-white" />
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">Unlock AI Insights</h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  Get personalized insights, patterns, and recommendations from your short-term thoughts with advanced AI analysis.
                </p>
                <div className="space-y-3">
                  <Link to="/pricing">
                    <button 
                      className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg font-semibold transition-colors hover:bg-orange-600"
                    >
                      Upgrade to Pro
                    </button>
                  </Link>
                  <div className="text-xs text-slate-500 space-y-1">
                    <p>✨ Smart pattern recognition</p>
                    <p>🧠 Knowledge gap analysis</p>
                    <p>📊 Personalized recommendations</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for mobile when panel is open */}
      {showAiInsights && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setShowAiInsights(false)}
        />
      )}
    </div>
  );
});