import React, { useRef, useEffect, useState } from 'react';
import { X, Edit3, Clock, Brain, Calendar, Tag, Sparkles, Loader2, Crown } from 'lucide-react';
import { DailyNote } from '../../types/database';
import { NoteRenderer } from './NoteRenderer';
import { useAuth } from '../../contexts/AuthContext';
import { generateMermaidFromNote } from '../../lib/aiProxy';
import { supabase } from '../../lib/supabase';
import { logger } from '../../lib/logger';
import { PaywallModal } from '../analytics/PaywallModal'; // Assuming this exists

interface NotePreviewModalProps {
  note: DailyNote;
  onClose: () => void;
  onEdit: () => void;
  updateNote: (noteId: string, updates: {
    title?: string;
    content?: string;
    tags?: string[];
    references?: any[];
    memory_type?: 'short-term' | 'long-term';
  }) => Promise<DailyNote | undefined>;
  refetchNotes: () => void;
}

export const NotePreviewModal: React.FC<NotePreviewModalProps> = ({ note, onClose, onEdit, updateNote, refetchNotes }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(3);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const isProUser = (user as any)?.subscription_plan === 'pro';

  const handleGenerateDiagramClick = () => {
    if (!isProUser) {
      setShowPaywall(true);
      return;
    }
    handleGenerateDiagram();
  };
  
  const handleGenerateDiagram = async () => {
    if (!note || !note.content) return;

    setIsGenerating(true);
    try {
      logger.info('Starting diagram generation', { noteTitle: note.title });
      const mermaidCode = await generateMermaidFromNote(note.title, note.content);
      logger.debug('Generated Mermaid code', { mermaidCode });
      
      if (mermaidCode) {
        const { data, error } = await supabase
          .from(note.memory_type === 'long-term' ? 'long_term_notes' : 'short_term_notes')
          .update({ generated_mermaid: mermaidCode })
          .eq('id', note.id)
          .select()
          .single();

        if (error) throw error;
        
        if (data) {
          logger.info('Successfully saved diagram to database');
          const updatedNote = data as DailyNote;
          onUpdateNote(updatedNote); // Update parent state immediately
          refetchNotes(); // Refetch list to ensure consistency
        }
      } else {
        logger.warn('No Mermaid code generated');
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'SERVICE_OVERLOADED') {
        logger.error('Mermaid generation overloaded', { error: error.message });
        alert('AI diagram service is overloaded. Please try again shortly.');
      } else {
        logger.error("Failed to generate or save Mermaid diagram", { error: error.message });
        alert('Failed to generate diagram. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if paywall is open
      if (showPaywall) return;
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, showPaywall]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showPaywall) {
          setShowPaywall(false);
          return;
        }
        if (showFullscreen) {
          setShowFullscreen(false);
          setZoomLevel(3); // Reset zoom when closing
          setPanOffset({ x: 0, y: 0 });
        } else {
          onClose();
        }
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose, showFullscreen, showPaywall]);
  
  // Reset zoom and pan when fullscreen opens
  useEffect(() => {
    if (showFullscreen) {
      setZoomLevel(3);
      setPanOffset({ x: 0, y: 0 });
      setIsDragging(false);
    }
  }, [showFullscreen]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString.replace(/-/g, '/')); // More robust date parsing
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
  
    if (date.getTime() === today.getTime()) return 'Today';
    if (date.getTime() === yesterday.getTime()) return 'Yesterday';
  
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  };

  const hasDiagram = !!note.generated_mermaid;

  return (
    <>
      <div className="fixed inset-0 bg-black/50  z-50 flex items-center justify-center p-4">
        <div 
          ref={modalRef}
          className="bg-surface border border-ink rounded-2xl w-full max-w-6xl max-h-modal overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-ink flex-shrink-0">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="p-2 rounded-lg" style={{ 
                background: note.memory_type === 'short-term' ? 'var(--color-brand-yellow)' : 'var(--color-brand-primary)'
              }}>
                {note.memory_type === 'short-term' ? (
                  <Clock className="h-5 w-5 text-ink" />
                ) : (
                  <Brain className="h-5 w-5 text-ink" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-ink truncate">{note.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-muted mt-1">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDate(note.note_date)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {note.memory_type === 'short-term' ? (
                      <>
                        <Clock className="h-3.5 w-3.5 text-brand-yellow-ink" />
                        <span className="text-brand-yellow-ink">Short-term</span>
                      </>
                    ) : (
                      <>
                        <Brain className="h-3.5 w-3.5" style={{ color: 'var(--color-brand-primary)' }} />
                        <span style={{ color: 'var(--color-brand-primary)' }}>Long-term</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
                         <div className="flex items-center space-x-3">
               {/* Diagram Actions Area - Only for Long-term notes */}
               {note.memory_type === 'long-term' && (
                 <>
                   {hasDiagram ? (
                     <div className="relative group">
                       <button className="p-2 rounded transition-colors text-muted hover:text-muted">
                         <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                           <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                         </svg>
                       </button>
                       <div className="absolute top-full right-0 mt-2 px-3 py-2 bg-surface border border-ink rounded-lg text-sm text-ink opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg max-w-xs">
                         Smart diagram ready. Edit note to regenerate.
                       </div>
                     </div>
                   ) : (
                     <button
                       onClick={handleGenerateDiagramClick}
                       disabled={isGenerating}
                       className="flex items-center space-x-2 px-3 py-2 bg-surface-muted border border-ink rounded-lg transition-colors text-sm text-muted hover:text-muted"
                     >
                         {isGenerating ? (
                           <>
                             <Loader2 className="h-4 w-4 animate-spin text-brand-purple-deep" />
                             <span>Generating...</span>
                           </>
                         ) : (
                           <>
                             <span>Generate Smart Diagram</span>
                             <Crown className="h-3 w-3 text-brand-yellow-ink" />
                           </>
                         )}
                     </button>
                   )}
                 </>
               )}

               {/* Standard Actions */}
               <button
                 onClick={onEdit}
                 className="flex items-center space-x-2 px-4 py-2 bg-surface-muted hover:bg-surface-muted text-ink rounded-lg transition-colors text-sm"
               >
                 <Edit3 className="h-4 w-4" />
                 <span>Edit</span>
               </button>
               <button
                 onClick={onClose}
                 className="p-2 hover:bg-surface-muted rounded-lg transition-colors"
               >
                 <X className="h-5 w-5 text-muted" />
               </button>
             </div>
          </div>

          {/* Content */}
          {hasDiagram ? (
            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-px bg-surface-muted">
              {/* Left Column: Note Details */}
              <div className="overflow-y-auto p-6 bg-surface">
              {/* Tags */}
              {note.tags && note.tags.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <Tag className="h-4 w-4 text-muted" />
                    <span className="text-sm font-medium text-muted">Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {note.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center text-sm px-3 py-1 rounded-full border"
                        style={{ 
                          backgroundColor: note.memory_type === 'short-term' 
                            ? 'color-mix(in srgb, var(--color-brand-yellow) 20%, transparent)'
                            : 'color-mix(in srgb, var(--color-brand-purple) 20%, transparent)',
                          color: note.memory_type === 'short-term' ? 'var(--color-brand-yellow)' : 'var(--color-brand-primary)',
                          borderColor: note.memory_type === 'short-term' 
                            ? 'color-mix(in srgb, var(--color-brand-yellow) 30%, transparent)'
                            : 'color-mix(in srgb, var(--color-brand-purple) 30%, transparent)'
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
                <div className="text-ink text-lg leading-loose whitespace-pre-wrap prose prose-invert prose-lg max-w-none prose-headings:text-ink prose-p:text-ink prose-li:text-ink prose-strong:text-ink">
                  {note.content ? (
                    <NoteRenderer content={note.content} />
                  ) : (
                    <div className="text-muted italic text-center py-8">
                      This note has no content yet.
                    </div>
                  )}
                </div>
              </div>

              </div>

              {/* Right Column: Mermaid Diagram */}
              <div className="overflow-y-auto p-6 bg-canvas">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-ink flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-brand-purple-deep" />
                    Smart Diagram
                  </h2>
                  <button
                    onClick={() => setShowFullscreen(true)}
                    className="p-2 hover:bg-surface-muted rounded-lg text-muted hover:text-ink transition-colors group"
                    title="Enlarge diagram"
                  >
                    <svg className="h-4 w-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 9l6 6m0-6l-6 6" />
                    </svg>
                  </button>
                </div>
                <div className="bg-surface p-4 rounded-lg border border-ink">
                  <NoteRenderer content={`\`\`\`mermaid\n${note.generated_mermaid}\n\`\`\``} />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6 bg-surface">
              {/* Tags */}
              {note.tags && note.tags.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <Tag className="h-4 w-4 text-muted" />
                    <span className="text-sm font-medium text-muted">Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {note.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center text-sm px-3 py-1 rounded-full border"
                        style={{ 
                          backgroundColor: note.memory_type === 'short-term' 
                            ? 'color-mix(in srgb, var(--color-brand-yellow) 20%, transparent)'
                            : 'color-mix(in srgb, var(--color-brand-purple) 20%, transparent)',
                          color: note.memory_type === 'short-term' ? 'var(--color-brand-yellow)' : 'var(--color-brand-primary)',
                          borderColor: note.memory_type === 'short-term' 
                            ? 'color-mix(in srgb, var(--color-brand-yellow) 30%, transparent)'
                            : 'color-mix(in srgb, var(--color-brand-purple) 30%, transparent)'
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
                <div className="text-ink text-lg leading-loose whitespace-pre-wrap prose prose-invert prose-lg max-w-none prose-headings:text-ink prose-p:text-ink prose-li:text-ink prose-strong:text-ink">
                  {note.content ? (
                    <NoteRenderer content={note.content} />
                  ) : (
                    <div className="text-muted italic text-center py-8">
                      This note has no content yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-ink px-6 py-4 flex-shrink-0">
            <div className="flex items-center justify-between text-xs text-muted">
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
       
       {/* Fullscreen Diagram with Zoom */}
       {showFullscreen && note.generated_mermaid && (
         <div 
           className="fixed inset-0 bg-black/50  z-[60] flex items-center justify-center"
           onClick={() => {
             setShowFullscreen(false);
             setZoomLevel(3);
             setPanOffset({ x: 0, y: 0 });
           }}
         >
           <div 
             className="relative bg-surface rounded-lg w-modal h-modal overflow-hidden"
             onClick={(e) => e.stopPropagation()}
             onMouseDown={(e) => e.stopPropagation()}
             onPointerDown={(e) => e.stopPropagation()}
           >
             {/* Top Right - Close Button */}
             <div className="absolute top-4 right-4 z-10">
               <button
                 onClick={() => {
                   setShowFullscreen(false);
                   setZoomLevel(3);
                   setPanOffset({ x: 0, y: 0 });
                 }}
                 className="p-3 bg-surface-muted  hover:bg-surface-muted rounded-lg transition-colors"
               >
                 <X className="h-6 w-6 text-muted" />
               </button>
             </div>

             {/* Bottom Right - Zoom Controls */}
             <div className="absolute bottom-4 right-4 z-10">
               <div className="flex items-center space-x-1 bg-surface-muted  rounded-lg p-1">
                 <button
                   onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.2))}
                   className="p-2 hover:bg-surface-muted rounded text-muted hover:text-ink transition-colors"
                   title="Zoom Out"
                 >
                   <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                   </svg>
                 </button>
                 <button
                   onClick={() => setZoomLevel(Math.min(5, zoomLevel + 0.3))}
                   className="p-2 hover:bg-surface-muted rounded text-muted hover:text-ink transition-colors"
                   title="Zoom In"
                 >
                   <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                   </svg>
                 </button>
               </div>
             </div>

             
             {/* Diagram Content */}
             <div 
               className="w-full h-full overflow-hidden flex items-center justify-center p-8 cursor-move"
               onClick={(e) => e.stopPropagation()}
               onMouseDown={(e) => {
                 e.stopPropagation();
                 setIsDragging(true);
                 setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
               }}
               onMouseMove={(e) => {
                 if (isDragging) {
                   setPanOffset({
                     x: e.clientX - dragStart.x,
                     y: e.clientY - dragStart.y
                   });
                 }
               }}
               onMouseUp={() => setIsDragging(false)}
               onMouseLeave={() => setIsDragging(false)}
               style={{
                 cursor: isDragging ? 'grabbing' : 'grab'
               }}
             >
               <div
                 style={{
                   transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
                   transformOrigin: 'center center',
                   transition: isDragging ? 'none' : 'transform 0.2s ease'
                 }}
               >
                 <NoteRenderer content={`\`\`\`mermaid\n${note.generated_mermaid}\n\`\`\``} />
               </div>
             </div>
           </div>
         </div>
       )}
       
       {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
     </>
   );
};
