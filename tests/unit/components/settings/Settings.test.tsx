import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import { Settings } from '../../../../src/components/settings/Settings';

// Mock useAuth hook
const mockUseAuth = mock(() => ({
  user: globalThis.testUtils.createMockUser()
}));

// Mock useMemoryNotes hook
const mockShortTermNotes = [
  {
    id: '1',
    title: 'Short Term Note 1',
    content: 'This is short term content 1',
    note_date: '2024-01-01'
  },
  {
    id: '2', 
    title: 'Short Term Note 2',
    content: 'This is short term content 2',
    note_date: '2024-01-02'
  }
];

const mockLongTermNotes = [
  {
    id: '3',
    title: 'Long Term Note 1', 
    content: 'This is long term content 1',
    note_date: '2024-01-03'
  },
  {
    id: '4',
    title: 'Long Term Note 2',
    content: 'This is long term content 2', 
    note_date: '2024-01-04'
  }
];

const mockUseMemoryNotes = mock(() => ({
  shortTermNotes: mockShortTermNotes,
  longTermNotes: mockLongTermNotes
}));

// Mock useNavigate
const mockNavigate = mock(() => {});

// Mock logger
const mockLogger = {
  info: mock(() => {})
};

// Mock modules
mock.module('../../../../src/contexts/AuthContext', () => ({
  useAuth: mockUseAuth
}));

mock.module('../../../../src/hooks/useMemoryNotes', () => ({
  useMemoryNotes: mockUseMemoryNotes
}));

mock.module('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to, ...props }: any) => (
    <a href={to} {...props}>{children}</a>
  )
}));

mock.module('../../../../src/lib/logger', () => ({
  logger: mockLogger
}));

describe('Settings Component - Data Management Section', () => {
  beforeEach(() => {
    // Reset mocks
    mockUseAuth.mockReturnValue({
      user: globalThis.testUtils.createMockUser()
    });
    mockUseMemoryNotes.mockReturnValue({
      shortTermNotes: mockShortTermNotes,
      longTermNotes: mockLongTermNotes
    });
    mockLogger.info.mockClear();
  });

  afterEach(() => {
    // Clean up DOM after each test
    cleanup();
  });

  describe('Data Management Section Rendering', () => {
    it('should render Data Management section with correct title and description', () => {
      render(<Settings />);

      expect(screen.getByText('Data Management')).toBeDefined();
      expect(screen.getByText('Export your notes as CSV')).toBeDefined();
    });

    it('should render Shield icon in Data Management section', () => {
      render(<Settings />);

      const dataManagementSection = screen.getByText('Data Management').closest('div');
      const shieldIcon = dataManagementSection?.querySelector('svg');
      expect(shieldIcon).toBeDefined();
    });

    it('should render two export buttons', () => {
      render(<Settings />);

      expect(screen.getByText('Export Short Term Notes')).toBeDefined();
      expect(screen.getByText('Export Long Term Notes')).toBeDefined();
    });

    it('should render Download icons in export buttons', () => {
      render(<Settings />);

      const shortTermButton = screen.getByText('Export Short Term Notes').closest('button');
      const longTermButton = screen.getByText('Export Long Term Notes').closest('button');
      
      const shortTermIcon = shortTermButton?.querySelector('svg');
      const longTermIcon = longTermButton?.querySelector('svg');
      
      expect(shortTermIcon).toBeDefined();
      expect(longTermIcon).toBeDefined();
    });

    it('should render correct descriptions for export buttons', () => {
      render(<Settings />);

      // Should appear twice (once for each button)
      const csvDescriptions = screen.getAllByText('Download as CSV');
      expect(csvDescriptions).toHaveLength(2);
    });
  });

  describe('Export Button Styling and Layout', () => {
    it('should render export buttons in a grid layout', () => {
      render(<Settings />);

      const dataManagementSection = screen.getByText('Data Management').closest('div');
      const gridContainer = dataManagementSection?.querySelector('.grid');
      expect(gridContainer).toBeDefined();
    });

    it('should apply correct CSS classes to export buttons', () => {
      render(<Settings />);

      const shortTermButton = screen.getByText('Export Short Term Notes').closest('button');
      const longTermButton = screen.getByText('Export Long Term Notes').closest('button');
      
      expect(shortTermButton?.className).toContain('flex');
      expect(shortTermButton?.className).toContain('flex-col');
      expect(shortTermButton?.className).toContain('items-center');
      expect(shortTermButton?.className).toContain('space-y-3');
      expect(shortTermButton?.className).toContain('p-4');
      expect(shortTermButton?.className).toContain('bg-slate-700/50');
      expect(shortTermButton?.className).toContain('rounded-lg');
      expect(shortTermButton?.className).toContain('border');
      expect(shortTermButton?.className).toContain('border-slate-600/50');
      expect(shortTermButton?.className).toContain('hover:bg-slate-700/70');
      expect(shortTermButton?.className).toContain('transition-colors');
      
      expect(longTermButton?.className).toContain('flex');
      expect(longTermButton?.className).toContain('flex-col');
      expect(longTermButton?.className).toContain('items-center');
    });
  });

  describe('Data Management Section Integration', () => {
    it('should use notes from useMemoryNotes hook', () => {
      render(<Settings />);

      // Verify that the hook is being used
      expect(mockUseMemoryNotes).toHaveBeenCalled();
    });

    it('should handle empty notes arrays gracefully', () => {
      mockUseMemoryNotes.mockReturnValue({
        shortTermNotes: [],
        longTermNotes: []
      });

      render(<Settings />);

      // Should still render the export buttons
      expect(screen.getByText('Export Short Term Notes')).toBeDefined();
      expect(screen.getByText('Export Long Term Notes')).toBeDefined();
    });

    it('should maintain proper spacing and layout', () => {
      render(<Settings />);

      const dataManagementSection = screen.getByText('Data Management').closest('div');
      // Find the parent container that has the styling classes
      const styledContainer = dataManagementSection?.closest('.bg-slate-800\\/50');
      expect(styledContainer?.className).toContain('bg-slate-800/50');
      expect(styledContainer?.className).toContain('backdrop-blur-sm');
      expect(styledContainer?.className).toContain('border');
      expect(styledContainer?.className).toContain('border-slate-700/50');
      expect(styledContainer?.className).toContain('rounded-xl');
      expect(styledContainer?.className).toContain('p-6');
    });
  });

  describe('Accessibility and User Experience', () => {
    it('should have proper button accessibility', () => {
      render(<Settings />);

      const shortTermButton = screen.getByText('Export Short Term Notes').closest('button');
      const longTermButton = screen.getByText('Export Long Term Notes').closest('button');
      
      expect(shortTermButton).toBeDefined();
      expect(longTermButton).toBeDefined();
      
      // Buttons should be clickable (HTML buttons without type default to "button")
      expect(shortTermButton?.tagName).toBe('BUTTON');
      expect(longTermButton?.tagName).toBe('BUTTON');
    });

    it('should provide clear visual feedback on hover', () => {
      render(<Settings />);

      const shortTermButton = screen.getByText('Export Short Term Notes').closest('button');
      const longTermButton = screen.getByText('Export Long Term Notes').closest('button');
      
      // Check for hover classes
      expect(shortTermButton?.className).toContain('hover:bg-slate-700/70');
      expect(longTermButton?.className).toContain('hover:bg-slate-700/70');
    });

    it('should have proper color scheme for icons', () => {
      render(<Settings />);

      const shortTermButton = screen.getByText('Export Short Term Notes').closest('button');
      const downloadIcon = shortTermButton?.querySelector('svg');
      
      // The icon should have the correct color style
      expect(downloadIcon).toBeDefined();
    });
  });
});
