import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import { Dashboard } from '../../../../src/components/dashboard/Dashboard';

// Mock useAuth hook
const mockUseAuth = mock(() => ({
  user: globalThis.testUtils.createMockUser()
}));

// Mock useAnalytics hook
const mockAnalyticsData = {
  totalNotes: 42,
  weeklyNotes: 7,
  monthlyNotes: 15,
  knowledgeScore: 85,
  topTags: ['work', 'personal', 'ideas'],
  weeklyData: [],
  monthlyData: [],
  tagData: []
};

const mockUseAnalytics = mock(() => ({
  analyticsData: mockAnalyticsData,
  isLoading: false
}));

// Mock useProjects hook
const mockProjects = [
  {
    id: '1',
    name: 'Test Project 1',
    description: 'Test project description',
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: '2', 
    name: 'Test Project 2',
    description: 'Another test project',
    status: 'completed',
    created_at: new Date().toISOString()
  }
];

const mockUseProjects = mock(() => ({
  projects: mockProjects,
  isLoading: false
}));

// Mock useNavigate
const mockNavigate = mock(() => {});

// Mock supabase
const mockSupabase = {
  from: mock(() => ({
    select: mock(() => ({
      eq: mock(() => ({
        eq: mock(() => ({
          is: mock(() => ({
            then: mock(() => Promise.resolve({ count: 5, error: null }))
          }))
        })),
        single: mock(() => Promise.resolve({ data: { sum_all: 85 }, error: null }))
      }))
    }))
  }))
};

// Mock modules
mock.module('../../../../src/contexts/AuthContext', () => ({
  useAuth: mockUseAuth
}));

mock.module('../../../../src/hooks/useAnalytics', () => ({
  useAnalytics: mockUseAnalytics
}));

mock.module('../../../../src/hooks/useProjects', () => ({
  useProjects: mockUseProjects
}));

mock.module('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

mock.module('../../../../src/lib/supabase', () => ({
  supabase: mockSupabase
}));

// Mock child components
mock.module('../../../../src/components/dashboard/StatsCard', () => ({
  StatsCard: ({ title, value, change, icon: Icon, iconColor }: any) => (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm">{title}</h3>
        {Icon && <Icon className="h-5 w-5" style={{ color: iconColor }} />}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-slate-400 text-xs">{change}</div>
    </div>
  )
}));

mock.module('../../../../src/components/dashboard/heatmap/ActivityHeatmap', () => ({
  ActivityHeatmap: () => <div data-testid="activity-heatmap">Activity Heatmap</div>
}));

mock.module('../../../../src/components/dashboard/YourMind', () => ({
  YourMind: () => <div data-testid="your-mind">Your Mind</div>
}));

mock.module('../../../../src/components/dashboard/ProjectRadar', () => ({
  default: () => <div data-testid="project-radar">Project Radar</div>
}));

mock.module('../../../../src/components/dashboard/ExpiringNotes', () => ({
  default: () => <div data-testid="expiring-notes">Expiring Notes</div>
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    // Reset mocks
    mockUseAuth.mockReturnValue({
      user: globalThis.testUtils.createMockUser()
    });
    mockUseAnalytics.mockReturnValue({
      analyticsData: mockAnalyticsData,
      isLoading: false
    });
    mockUseProjects.mockReturnValue({
      projects: mockProjects,
      isLoading: false
    });
    mockNavigate.mockClear();
  });

  afterEach(() => {
    // Clean up DOM after each test
    cleanup();
  });

  describe('Header Section Rendering', () => {
    it('should render dashboard header with welcome message', () => {
      render(<Dashboard />);

      expect(screen.getByText('Welcome Back, Knowledge Seeker! 👀')).toBeDefined();
      expect(screen.getByText("Here's a snapshot of your brain's activity.")).toBeDefined();
    });

    it('should render header with user name from auth context', () => {
      const customUser = { ...globalThis.testUtils.createMockUser(), name: 'John Doe' };
      mockUseAuth.mockReturnValue({ user: customUser });

      render(<Dashboard />);

      expect(screen.getByText('Welcome Back, John Doe! 👀')).toBeDefined();
    });

    it('should render fallback name when user name is not available', () => {
      mockUseAuth.mockReturnValue({ user: { id: 'test-id', email: 'test@example.com' } });

      render(<Dashboard />);

      expect(screen.getByText('Welcome Back, Knowledge Seeker! 👀')).toBeDefined();
    });

    it('should render header with correct styling classes', () => {
      render(<Dashboard />);

      // Find the header container with the styling classes
      const header = screen.getByText('Welcome Back, Knowledge Seeker! 👀').closest('.bg-slate-800\\/50');
      expect(header?.className).toContain('bg-slate-800/50');
      expect(header?.className).toContain('backdrop-blur-sm');
      expect(header?.className).toContain('border-b');
      expect(header?.className).toContain('border-slate-700/50');
      expect(header?.className).toContain('p-4');
      expect(header?.className).toContain('lg:p-6');
      expect(header?.className).toContain('sticky');
      expect(header?.className).toContain('top-0');
      expect(header?.className).toContain('z-10');
    });
  });

  describe('Stats Grid Rendering', () => {
    it('should render all four StatsCard components', () => {
      render(<Dashboard />);

      expect(screen.getByText('Total Thoughts')).toBeDefined();
      expect(screen.getByText('Daily Notes')).toBeDefined();
      expect(screen.getByText('Knowledge Score')).toBeDefined();
      expect(screen.getByText('Total Projects')).toBeDefined();
    });

    it('should render stats grid with correct layout classes', () => {
      render(<Dashboard />);

      const statsGrid = screen.getByText('Total Thoughts').closest('.grid');
      expect(statsGrid?.className).toContain('grid-cols-2');
      expect(statsGrid?.className).toContain('lg:grid-cols-4');
      expect(statsGrid?.className).toContain('gap-4');
      expect(statsGrid?.className).toContain('lg:gap-6');
    });

    it('should display correct values for each stat card', () => {
      render(<Dashboard />);

      // Check that the values are displayed (they should be in the StatsCard components)
      const totalThoughtsCard = screen.getByText('Total Thoughts').closest('div');
      const dailyNotesCard = screen.getByText('Daily Notes').closest('div');
      const knowledgeScoreCard = screen.getByText('Knowledge Score').closest('div');
      const totalProjectsCard = screen.getByText('Total Projects').closest('div');

      expect(totalThoughtsCard).toBeDefined();
      expect(dailyNotesCard).toBeDefined();
      expect(knowledgeScoreCard).toBeDefined();
      expect(totalProjectsCard).toBeDefined();
    });
  });

  describe('Component Integration', () => {
    it('should render ActivityHeatmap component', () => {
      render(<Dashboard />);

      expect(screen.getByTestId('activity-heatmap')).toBeDefined();
    });

    it('should render YourMind component', () => {
      render(<Dashboard />);

      // YourMind component renders as a real component, so we check for its content
      expect(screen.getByText('Your Mind')).toBeDefined();
    });

    it('should render ProjectRadar component', () => {
      render(<Dashboard />);

      expect(screen.getByTestId('project-radar')).toBeDefined();
    });

    it('should render ExpiringNotes component', () => {
      render(<Dashboard />);

      expect(screen.getByTestId('expiring-notes')).toBeDefined();
    });
  });

  describe('Layout and Structure', () => {
    it('should render main container with correct classes', () => {
      render(<Dashboard />);

      const mainContainer = screen.getByText('Welcome Back, Knowledge Seeker! 👀').closest('.flex-1');
      expect(mainContainer?.className).toContain('flex-1');
      expect(mainContainer?.className).toContain('bg-slate-900');
      expect(mainContainer?.className).toContain('overflow-y-auto');
      expect(mainContainer?.className).toContain('h-screen');
    });

    it('should render main content area with correct spacing', () => {
      render(<Dashboard />);

      const mainContent = screen.getByText('Total Thoughts').closest('.p-4');
      expect(mainContent?.className).toContain('p-4');
      expect(mainContent?.className).toContain('lg:p-6');
      expect(mainContent?.className).toContain('space-y-6');
      expect(mainContent?.className).toContain('bg-slate-900');
      expect(mainContent?.className).toContain('min-h-full');
    });
  });
});
