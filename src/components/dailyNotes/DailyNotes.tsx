import React, { useState } from 'react';
import { Calendar } from './Calendar';
import { NoteEditor } from './NoteEditor';
import { NotesList } from './NotesList';
import { NotePreviewModal } from './NotePreviewModal';
import { CalendarDays, List, Plus, Menu, Clock, Brain, X } from 'lucide-react';
import { DailyNote } from '../../types/database';
import { useDailyNotes } from '../../hooks/useDailyNotes';

export const DailyNotes: React.FC = React.memo(() => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingNote, setEditingNote] = useState<DailyNote | undefined>(undefined);
  const [previewNote, setPreviewNote] = useState<DailyNote | undefined>(undefined);
  const [defaultMemoryType, setDefaultMemoryType] = useState<'short-term' | 'long-term'>('short-term');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Get all notes (not filtered by date for calendar view) and selected date notes
  const allNotesHook = useDailyNotes();
  const selectedDateHook = useDailyNotes(selectedDate);
  const { notes: allNotes, refetch: refetchAll, updateNote: updateNoteAll, deleteNote: deleteNoteAll } = allNotesHook;
  const { notes: selectedDateNotes, refetch: refetchSelected, updateNote: updateNoteSelected, deleteNote: deleteNoteSelected } = selectedDateHook;

  const handlePreviewNote = (note: DailyNote) => {
    setPreviewNote(note);
    setShowPreview(true);
  };

  const handleEditNote = (note?: DailyNote, memoryType?: 'short-term' | 'long-term') => {
    setEditingNote(note);
    setShowEditor(true);
    // Store default memory type for new notes
    if (!note && memoryType) {
      setDefaultMemoryType(memoryType);
    }
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewNote(undefined);
  };

  const handleEditFromPreview = () => {
    if (previewNote) {
      setEditingNote(previewNote);
      setShowEditor(true);
      setShowPreview(false);
      setPreviewNote(undefined);
    }
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setEditingNote(undefined);
    setDefaultMemoryType('short-term');
    // Refresh notes after saving
    refetchAll();
    refetchSelected();
  };

  return (
    <div className="flex-1 bg-slate-900 overflow-hidden h-screen flex flex-col">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="pl-12 lg:pl-0">
            <h1 className="text-2xl font-bold text-white">Daily Notes</h1>
            <p className="text-slate-400 text-sm">
              Capture your thoughts, ideas, and reflections
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {/* View Toggle */}
            <div className="flex items-center bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => setView('calendar')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all text-sm ${
                  view === 'calendar'
                    ? 'text-slate-900'
                    : 'text-slate-400 hover:text-white'
                }`}
                style={view === 'calendar' ? { background: '#C2B5FC' } : {}}
              >
                <CalendarDays className="h-4 w-4" />
                <span className="hidden sm:inline">Calendar</span>
              </button>
              <button
                onClick={() => setView('list')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all text-sm ${
                  view === 'list'
                    ? 'text-slate-900'
                    : 'text-slate-400 hover:text-white'
                }`}
                style={view === 'list' ? { background: '#C2B5FC' } : {}}
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
            
            {/* New Note Button */}
            <button
              onClick={() => handleEditNote()}
              className="flex items-center justify-center space-x-2 px-4 py-2 text-slate-900 rounded-lg font-semibold transition-colors text-sm hover:opacity-90"
              style={{ background: '#C2B5FC' }}
            >
              <Plus className="h-4 w-4" />
              <span>New Note</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {view === 'calendar' ? (
          <div className="flex h-full">
            {/* Sidebar Toggle (Mobile) */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden fixed bottom-4 right-4 z-30 p-3 bg-slate-700 hover:bg-slate-600 rounded-full shadow-lg"
            >
              <CalendarDays className="h-5 w-5 text-white" />
            </button>
            
            {/* Backdrop for mobile sidebar */}
            {sidebarOpen && (
              <div 
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden fixed inset-0 bg-black/60 z-10 transition-opacity duration-300"
                aria-hidden="true"
              ></div>
            )}
            
            {/* Notes Panel - Now on the left */}
            <div className="flex-1 overflow-y-auto p-4">
              <NotesList 
                selectedDate={selectedDate}
                onEditNote={handlePreviewNote}
                onDirectEdit={handleEditNote}
                notes={selectedDateNotes}
                onRefresh={async () => { await refetchSelected(); await refetchAll(); }}
                updateNoteOverride={updateNoteSelected}
                deleteNoteOverride={deleteNoteSelected}
              />
            </div>
            
            {/* Calendar Sidebar - Now on the right */}
            <div 
              className={`transform transition-transform duration-300 ease-in-out ${
                sidebarOpen ? 'translate-x-0' : 'translate-x-full'
              } lg:translate-x-0 w-screen max-w-sm lg:w-80 lg:max-w-xs bg-slate-800/80 backdrop-blur-md border-l border-slate-700/50 p-4 overflow-y-auto fixed lg:relative inset-y-0 right-0 z-20`}
            >
              <div className="sticky top-0">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-white">Calendar</h2>
                  <button 
                    className="lg:hidden p-2 hover:bg-slate-700 rounded-md"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <X className="h-5 w-5 text-slate-400" />
                  </button>
                </div>
                
                {/* Calendar Component */}
                <Calendar 
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  onNewNote={() => handleEditNote()}
                  notes={allNotes}
                />
                
                {/* Memory Type Filters */}
                <div className="mt-4 border-t border-slate-700/50 pt-4">
                  <h3 className="text-sm font-medium text-slate-300 mb-3">Quick Actions</h3>
                  <div className="flex flex-col space-y-2">
                    <button 
                      onClick={() => handleEditNote(undefined, 'short-term')}
                      className="flex items-center space-x-2 px-3 py-2 bg-orange-500/20 text-orange-400 rounded-md border border-orange-500/30 hover:bg-orange-500/30 transition-colors"
                    >
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">New Short Term Note</span>
                    </button>
                    <button 
                      onClick={() => handleEditNote(undefined, 'long-term')}
                      className="flex items-center space-x-2 px-3 py-2 rounded-md border border-purple-500/30 text-purple-400 hover:opacity-80 transition-colors" 
                      style={{ backgroundColor: 'rgba(194, 181, 252, 0.2)' }}
                    >
                      <Brain className="h-4 w-4" />
                      <span className="text-sm">New Long Term Note</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 overflow-y-auto h-full">
            <NotesList 
              selectedDate={null}
              onEditNote={handlePreviewNote}
              onDirectEdit={handleEditNote}
              notes={allNotes}
              onRefresh={refetchAll}
              updateNoteOverride={updateNoteAll}
              deleteNoteOverride={deleteNoteAll}
            />
          </div>
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
            selectedDate={selectedDate}
            existingNote={editingNote}
            defaultMemoryType={editingNote ? undefined : defaultMemoryType}
            onClose={handleCloseEditor}
            onSave={handleCloseEditor}
          />
        )}
      </div>
    </div>
  );
});