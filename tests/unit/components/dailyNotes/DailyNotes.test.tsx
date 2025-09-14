import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { DailyNotes } from '../../../../src/components/dailyNotes/DailyNotes';

// Mock useDailyNotes hook
const mockNotes = [
  {
    id: '1',
    title: 'Test Note 1',
    content: 'This is test note 1',
    note_date: '2024-01-01',
    memory_type: 'short-term',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Test Note 2', 
    content: 'This is test note 2',
    note_date: '2024-01-02',
    memory_type: 'long-term',
    created_at: new Date().toISOString()
  }
];

const mockUseDailyNotes = mock(() => ({
  notes: mockNotes,
  refetch: mock(() => Promise.resolve())
}));

// Mock child components
mock.module('../../../../src/components/dailyNotes/Calendar', () => ({
  Calendar: ({ selectedDate, onDateSelect, onNewNote, notes }: any) => (
    <div data-testid="calendar-component">
      <div>Calendar for {selectedDate.toDateString()}</div>
      <button onClick={() => onDateSelect(new Date())}>Select Date</button>
      <button onClick={onNewNote}>New Note from Calendar</button>
      <div>Notes count: {notes.length}</div>
    </div>
  )
}));

mock.module('../../../../src/components/dailyNotes/NoteEditor', () => ({
  NoteEditor: ({ selectedDate, existingNote, defaultMemoryType, onClose, onSave }: any) => (
    <div data-testid="note-editor-modal">
      <div>Note Editor</div>
      <div>Selected Date: {selectedDate.toDateString()}</div>
      <div>Existing Note: {existingNote ? existingNote.title : 'None'}</div>
      <div>Default Memory Type: {defaultMemoryType || 'None'}</div>
      <button onClick={onClose}>Close Editor</button>
      <button onClick={onSave}>Save Note</button>
    </div>
  )
}));

mock.module('../../../../src/components/dailyNotes/NotesList', () => ({
  NotesList: ({ selectedDate, onEditNote, onDirectEdit, notes, onRefresh }: any) => (
    <div data-testid="notes-list">
      <div>Notes List</div>
      <div>Selected Date: {selectedDate ? selectedDate.toDateString() : 'All dates'}</div>
      <div>Notes count: {notes.length}</div>
      <button onClick={() => onEditNote(notes[0])}>Preview First Note</button>
      <button onClick={() => onDirectEdit(notes[0])}>Edit First Note</button>
      <button onClick={onRefresh}>Refresh Notes</button>
    </div>
  )
}));

mock.module('../../../../src/components/dailyNotes/NotePreviewModal', () => ({
  NotePreviewModal: ({ note, onClose, onEdit }: any) => (
    <div data-testid="note-preview-modal">
      <div>Note Preview</div>
      <div>Note Title: {note.title}</div>
      <button onClick={onClose}>Close Preview</button>
      <button onClick={onEdit}>Edit Note</button>
    </div>
  )
}));

// Mock modules
mock.module('../../../../src/hooks/useDailyNotes', () => ({
  useDailyNotes: mockUseDailyNotes
}));

describe('DailyNotes Component', () => {
  beforeEach(() => {
    // Reset mocks
    mockUseDailyNotes.mockReturnValue({
      notes: mockNotes,
      refetch: mock(() => Promise.resolve())
    });
  });

  afterEach(() => {
    // Clean up DOM after each test
    cleanup();
  });

  describe('Header Section Rendering', () => {
    it('should render daily notes header with title and description', () => {
      render(<DailyNotes />);

      expect(screen.getByText('Daily Notes')).toBeDefined();
      expect(screen.getByText('Capture your thoughts, ideas, and reflections')).toBeDefined();
    });

    it('should render view toggle buttons', () => {
      render(<DailyNotes />);

      // Check for Calendar button text (there are multiple Calendar texts)
      const calendarElements = screen.getAllByText('Calendar');
      expect(calendarElements.length).toBeGreaterThan(0);
      expect(screen.getByText('List')).toBeDefined();
    });

    it('should render new note button', () => {
      render(<DailyNotes />);

      expect(screen.getByText('New Note')).toBeDefined();
    });

    it('should render header with correct styling classes', () => {
      render(<DailyNotes />);

      const header = screen.getByText('Daily Notes').closest('.bg-slate-800\\/50');
      expect(header?.className).toContain('bg-slate-800/50');
      expect(header?.className).toContain('backdrop-blur-sm');
      expect(header?.className).toContain('border-b');
      expect(header?.className).toContain('border-slate-700/50');
      expect(header?.className).toContain('p-4');
      expect(header?.className).toContain('sticky');
      expect(header?.className).toContain('top-0');
      expect(header?.className).toContain('z-10');
    });
  });

  describe('View Toggle Functionality', () => {
    it('should start with calendar view by default', () => {
      render(<DailyNotes />);

      // Calendar view should be active - check for the active styling
      // Find the Calendar button in the view toggle (not the sidebar header)
      const calendarButtons = screen.getAllByText('Calendar');
      const calendarButton = calendarButtons.find(btn => 
        btn.closest('button')?.className.includes('flex items-center space-x-2 px-3 py-2')
      )?.closest('button');
      expect(calendarButton?.getAttribute('style')).toContain('background: #C2B5FC');
    });

    it('should switch to list view when list button is clicked', () => {
      render(<DailyNotes />);

      const listButton = screen.getByText('List').closest('button');
      fireEvent.click(listButton!);

      // List view should be active
      expect(listButton?.getAttribute('style')).toContain('background: #C2B5FC');
      
      // Calendar view should be inactive
      const calendarButtons = screen.getAllByText('Calendar');
      const calendarButton = calendarButtons.find(btn => 
        btn.closest('button')?.className.includes('flex items-center space-x-2 px-3 py-2')
      )?.closest('button');
      expect(calendarButton?.className).toContain('text-slate-400');
    });

    it('should switch back to calendar view when calendar button is clicked', () => {
      render(<DailyNotes />);

      // First switch to list view
      const listButton = screen.getByText('List').closest('button');
      fireEvent.click(listButton!);

      // Then switch back to calendar view
      const calendarButtons = screen.getAllByText('Calendar');
      const calendarButton = calendarButtons.find(btn => 
        btn.closest('button')?.className.includes('flex items-center space-x-2 px-3 py-2')
      )?.closest('button');
      fireEvent.click(calendarButton!);

      // Calendar view should be active
      expect(calendarButton?.getAttribute('style')).toContain('background: #C2B5FC');
    });
  });

  describe('New Note Button', () => {
    it('should open note editor when new note button is clicked', () => {
      render(<DailyNotes />);

      const newNoteButton = screen.getByText('New Note').closest('button');
      fireEvent.click(newNoteButton!);

      expect(screen.getByTestId('note-editor-modal')).toBeDefined();
    });

    it('should render new note button with correct styling', () => {
      render(<DailyNotes />);

      const newNoteButton = screen.getByText('New Note').closest('button');
      expect(newNoteButton?.className).toContain('flex');
      expect(newNoteButton?.className).toContain('items-center');
      expect(newNoteButton?.className).toContain('justify-center');
      expect(newNoteButton?.className).toContain('space-x-2');
      expect(newNoteButton?.className).toContain('px-4');
      expect(newNoteButton?.className).toContain('py-2');
      expect(newNoteButton?.className).toContain('text-slate-900');
      expect(newNoteButton?.className).toContain('rounded-lg');
      expect(newNoteButton?.className).toContain('font-semibold');
    });
  });

  describe('Calendar View Layout', () => {
    it('should render calendar view by default', () => {
      render(<DailyNotes />);

      expect(screen.getByTestId('calendar-component')).toBeDefined();
      expect(screen.getByTestId('notes-list')).toBeDefined();
    });

    it('should render notes list in calendar view', () => {
      render(<DailyNotes />);

      const notesList = screen.getByTestId('notes-list');
      expect(notesList).toBeDefined();
    });

    it('should render calendar component in sidebar', () => {
      render(<DailyNotes />);

      const calendar = screen.getByTestId('calendar-component');
      expect(calendar).toBeDefined();
    });
  });

  describe('List View Layout', () => {
    it('should render list view when list button is clicked', () => {
      render(<DailyNotes />);

      const listButton = screen.getByText('List').closest('button');
      fireEvent.click(listButton!);

      expect(screen.getByTestId('notes-list')).toBeDefined();
    });

    it('should not render calendar component in list view', () => {
      render(<DailyNotes />);

      const listButton = screen.getByText('List').closest('button');
      fireEvent.click(listButton!);

      // Calendar should not be visible in list view
      expect(screen.queryByTestId('calendar-component')).toBeNull();
    });
  });

  describe('Component Integration', () => {
    it('should render all child components correctly', () => {
      render(<DailyNotes />);

      expect(screen.getByTestId('notes-list')).toBeDefined();
      expect(screen.getByTestId('calendar-component')).toBeDefined();
    });

    it('should pass correct props to NotesList component', () => {
      render(<DailyNotes />);

      const notesList = screen.getByTestId('notes-list');
      expect(notesList).toBeDefined();
      
      // Check that notes are passed correctly - use getAllByText since there are multiple
      const notesCountElements = screen.getAllByText('Notes count: 2');
      expect(notesCountElements).toHaveLength(2); // One in NotesList, one in Calendar
    });

    it('should pass correct props to Calendar component', () => {
      render(<DailyNotes />);

      const calendar = screen.getByTestId('calendar-component');
      expect(calendar).toBeDefined();
      
      // Check that notes are passed to calendar - use getAllByText since there are multiple
      const notesCountElements = screen.getAllByText('Notes count: 2');
      expect(notesCountElements).toHaveLength(2); // One in NotesList, one in Calendar
    });
  });

  describe('Layout and Structure', () => {
    it('should render main container with correct classes', () => {
      render(<DailyNotes />);

      const mainContainer = screen.getByText('Daily Notes').closest('.flex-1');
      expect(mainContainer?.className).toContain('flex-1');
      expect(mainContainer?.className).toContain('bg-slate-900');
      expect(mainContainer?.className).toContain('overflow-hidden');
      expect(mainContainer?.className).toContain('h-screen');
      expect(mainContainer?.className).toContain('flex');
      expect(mainContainer?.className).toContain('flex-col');
    });

    it('should render main content area with correct structure', () => {
      render(<DailyNotes />);

      // Find the main content container that has overflow-hidden
      const mainContent = screen.getByTestId('notes-list').closest('.flex-1.overflow-hidden');
      expect(mainContent?.className).toContain('flex-1');
      expect(mainContent?.className).toContain('overflow-hidden');
    });
  });
});
