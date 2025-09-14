import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import { RecentNotes } from '../../../../src/components/dashboard/RecentNotes';
import { Note } from '../../../../src/types';

// Mock data for testing
const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Test Note 1',
    content: 'This is a test note content',
    category: 'work',
    color: '#10b981',
    connections: 5,
    createdAt: '2024-01-15',
    user_id: 'user1',
    tags: ['test'],
    note_date: '2024-01-15',
    memory_type: 'short-term'
  },
  {
    id: '2',
    title: 'Test Note 2',
    content: 'Another test note',
    category: 'personal',
    color: '#f59e0b',
    connections: 2,
    createdAt: '2024-01-14',
    user_id: 'user1',
    tags: ['personal'],
    note_date: '2024-01-14',
    memory_type: 'short-term'
  }
];

describe('RecentNotes', () => {
  beforeEach(() => {
    // Reset any previous state
  });

  afterEach(() => {
    // Clean up DOM after each test
    cleanup();
  });

  describe('Rendering with notes', () => {
    it('should render component title', () => {
      render(<RecentNotes notes={mockNotes} />);

      expect(screen.getByText('Recent Notes')).toBeInTheDocument();
    });

    it('should render search input', () => {
      render(<RecentNotes notes={mockNotes} />);

      const searchInput = screen.getByPlaceholderText('Search notes...');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput.getAttribute('type')).toBe('text');
    });

    it('should render filter button', () => {
      render(<RecentNotes notes={mockNotes} />);

      const filterButton = document.querySelector('button');
      expect(filterButton).toBeInTheDocument();
    });

    it('should render all notes', () => {
      render(<RecentNotes notes={mockNotes} />);

      expect(screen.getByText('Test Note 1')).toBeInTheDocument();
      expect(screen.getByText('Test Note 2')).toBeInTheDocument();
    });

    it('should render note titles correctly', () => {
      render(<RecentNotes notes={mockNotes} />);

      mockNotes.forEach(note => {
        expect(screen.getByText(note.title)).toBeInTheDocument();
      });
    });

    it('should render note categories', () => {
      render(<RecentNotes notes={mockNotes} />);

      expect(screen.getByText('work')).toBeInTheDocument();
      expect(screen.getByText('personal')).toBeInTheDocument();
    });

    it('should render connection counts', () => {
      render(<RecentNotes notes={mockNotes} />);

      expect(screen.getByText('5 connections')).toBeInTheDocument();
      expect(screen.getByText('2 connections')).toBeInTheDocument();
    });

    it('should render creation dates', () => {
      render(<RecentNotes notes={mockNotes} />);

      expect(screen.getByText('2024-01-15')).toBeInTheDocument();
      expect(screen.getByText('2024-01-14')).toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    it('should render empty state when no notes provided', () => {
      render(<RecentNotes notes={[]} />);

      expect(screen.getByText('Recent Notes')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search notes...')).toBeInTheDocument();

      // Should not render any note items
      const noteItems = document.querySelectorAll('[class*="bg-slate-700/50"]');
      expect(noteItems.length).toBe(0);
    });
  });

  describe('Styling and structure', () => {
    it('should have correct main container classes', () => {
      render(<RecentNotes notes={mockNotes} />);

      const container = document.querySelector('.bg-slate-800\\/50');
      expect(container).toBeInTheDocument();
      expect(container?.getAttribute('class')).toContain('backdrop-blur-sm');
      expect(container?.getAttribute('class')).toContain('rounded-xl');
    });

    it('should have responsive header layout', () => {
      render(<RecentNotes notes={mockNotes} />);

      const header = screen.getByText('Recent Notes').parentElement;
      expect(header?.getAttribute('class')).toContain('flex-col');
      expect(header?.getAttribute('class')).toContain('lg:flex-row');
    });

    it('should render note items with hover effects', () => {
      render(<RecentNotes notes={mockNotes} />);

      const noteItems = document.querySelectorAll('[class*="hover:bg-slate-700/70"]');
      expect(noteItems.length).toBe(mockNotes.length);
    });
  });

  describe('Icons', () => {
    it('should render search icon', () => {
      render(<RecentNotes notes={mockNotes} />);

      const searchIcon = document.querySelector('svg');
      expect(searchIcon).toBeInTheDocument();
    });

    it('should render filter icon', () => {
      render(<RecentNotes notes={mockNotes} />);

      const filterIcon = document.querySelectorAll('svg')[1];
      expect(filterIcon).toBeInTheDocument();
    });

    it('should render link icons for each note', () => {
      render(<RecentNotes notes={mockNotes} />);

      const linkIcons = document.querySelectorAll('svg');
      // Search icon + filter icon + link icons for each note
      expect(linkIcons.length).toBe(2 + mockNotes.length);
    });
  });

  describe('Data display', () => {
    it('should display category with correct styling', () => {
      render(<RecentNotes notes={mockNotes} />);

      // Find category elements by their specific styling
      const categories = document.querySelectorAll('[style*="background-color"]');
      expect(categories.length).toBe(mockNotes.length);

      categories.forEach((category, index) => {
        expect(category.textContent).toBe(mockNotes[index].category);
        expect(category.getAttribute('style')).toContain(mockNotes[index].color);
      });
    });

    it('should display connection information', () => {
      render(<RecentNotes notes={mockNotes} />);

      mockNotes.forEach(note => {
        const connectionText = `${note.connections} connections`;
        expect(screen.getByText(connectionText)).toBeInTheDocument();
      });
    });
  });
});
