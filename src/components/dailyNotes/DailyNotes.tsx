import React, { useState } from 'react';
import { Calendar } from './Calendar';
import { NoteEditor } from './NoteEditor';
import { NotesList } from './NotesList';
import { CalendarDays, List, Plus, Menu } from 'lucide-react';

export const DailyNotes: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [showEditor, setShowEditor] = useState(false);

  return (
    <div className="flex-1 bg-slate-900 overflow-y-auto h-screen">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 p-4 lg:p-6 sticky top-0 z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Daily Notes</h1>
            <p className="text-slate-400 text-sm lg:text-base">
              Capture your thoughts, ideas, and reflections
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
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
              onClick={() => setShowEditor(true)}
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
      <div className="p-4 lg:p-6 space-y-6 bg-slate-900 min-h-full">
        {view === 'calendar' ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="xl:col-span-2">
              <Calendar 
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                onNewNote={() => setShowEditor(true)}
              />
            </div>
            
            {/* Notes for Selected Date */}
            <div>
              <NotesList 
                selectedDate={selectedDate}
                onEditNote={() => setShowEditor(true)}
              />
            </div>
          </div>
        ) : (
          <NotesList 
            selectedDate={null}
            onEditNote={() => setShowEditor(true)}
          />
        )}
        
        {/* Note Editor Modal */}
        {showEditor && (
          <NoteEditor
            selectedDate={selectedDate}
            onClose={() => setShowEditor(false)}
            onSave={() => setShowEditor(false)}
          />
        )}
        
        {/* Extra padding at bottom */}
        <div className="h-8"></div>
      </div>
    </div>
  );
};