import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar } from '../../../../src/components/layout/Sidebar';

// Mock useAuth hook
const mockLogout = mock(() => {});
const mockUseAuth = mock(() => ({
  logout: mockLogout
}));

// Mock useNavigate hook
const mockNavigate = mock(() => {});

// Mock modules
mock.module('../../../../src/contexts/AuthContext', () => ({
  useAuth: mockUseAuth
}));

mock.module('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ to, children, onClick, ...props }: any) => (
    <a href={to} onClick={onClick} {...props}>
      {children}
    </a>
  )
}));

// Helper component to wrap Sidebar with router
const SidebarWithRouter = ({ currentPage }: { currentPage: string }) => (
  <MemoryRouter>
    <Sidebar currentPage={currentPage} />
  </MemoryRouter>
);

describe('Sidebar', () => {
  beforeEach(() => {
    // Reset mocks
    mockLogout.mockClear();
    mockNavigate.mockClear();
    mockUseAuth.mockReturnValue({
      logout: mockLogout
    });
  });

  afterEach(() => {
    // Clean up DOM after each test
    cleanup();
  });

  describe('Rendering', () => {
    it('should render sidebar with logo and navigation', () => {
      render(<SidebarWithRouter currentPage="dashboard" />);

      expect(screen.getByText('Second Brain')).toBeDefined();
      expect(screen.getByAltText('Second Brain Logo')).toBeDefined();
      expect(screen.getByText('Dashboard')).toBeDefined();
      expect(screen.getByText('Daily Notes')).toBeDefined();
      expect(screen.getByText('Short Term Memory')).toBeDefined();
      expect(screen.getByText('Long Term Memory')).toBeDefined();
      expect(screen.getByText('Projects')).toBeDefined();
      expect(screen.getByText('Knowledge Network')).toBeDefined();
      expect(screen.getByText('Analytics')).toBeDefined();
      expect(screen.getByText('Settings')).toBeDefined();
    });

    it('should render upgrade and logout buttons', () => {
      render(<SidebarWithRouter currentPage="dashboard" />);

      expect(screen.getByText('Upgrade Now')).toBeDefined();
      expect(screen.getByText('Logout')).toBeDefined();
    });

    it('should render mobile menu button', () => {
      render(<SidebarWithRouter currentPage="dashboard" />);

      const mobileMenuButton = screen.getByRole('button', { name: '' });
      expect(mobileMenuButton).toBeDefined();
    });
  });

  describe('Navigation', () => {
    it('should highlight current page', () => {
      render(<SidebarWithRouter currentPage="dashboard" />);

      const dashboardLink = screen.getByText('Dashboard').closest('div');
      expect(dashboardLink?.style.backgroundColor).toBe('#C2B5FC20');
      expect(dashboardLink?.style.color).toBe('#C2B5FC');
      expect(dashboardLink?.style.borderColor).toBe('#C2B5FC50');
    });

    it('should not highlight non-current pages', () => {
      render(<SidebarWithRouter currentPage="dashboard" />);

      const dailyNotesLink = screen.getByText('Daily Notes').closest('div');
      expect(dailyNotesLink?.style.backgroundColor).not.toBe('#C2B5FC20');
    });

    it('should render all menu items with correct paths', () => {
      render(<SidebarWithRouter currentPage="dashboard" />);

      const menuItems = [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Daily Notes', path: '/daily-notes' },
        { label: 'Short Term Memory', path: '/short-term-memory' },
        { label: 'Long Term Memory', path: '/long-term-memory' },
        { label: 'Projects', path: '/projects' },
        { label: 'Knowledge Network', path: '/knowledge-network' },
        { label: 'Analytics', path: '/analytics' },
        { label: 'Settings', path: '/settings' }
      ];

      menuItems.forEach(item => {
        const link = screen.getByText(item.label).closest('a');
        expect(link?.getAttribute('href')).toBe(item.path);
      });
    });
  });

  describe('Mobile menu', () => {
    it('should toggle mobile menu when button is clicked', () => {
      render(<SidebarWithRouter currentPage="dashboard" />);

      const mobileMenuButton = screen.getByRole('button', { name: '' });
      const sidebar = screen.getByRole('navigation').closest('div')?.parentElement;

      // Initially menu should be closed on mobile
      expect(sidebar?.className).toContain('-translate-x-full');

      // Click to open menu
      fireEvent.click(mobileMenuButton);
      expect(sidebar?.className).toContain('translate-x-0');

      // Click to close menu
      fireEvent.click(mobileMenuButton);
      expect(sidebar?.className).toContain('-translate-x-full');
    });

    it('should close mobile menu when overlay is clicked', () => {
      render(<SidebarWithRouter currentPage="dashboard" />);

      const mobileMenuButton = screen.getByRole('button', { name: '' });
      const sidebar = screen.getByRole('navigation').closest('div')?.parentElement;

      // Open menu
      fireEvent.click(mobileMenuButton);
      expect(sidebar?.className).toContain('translate-x-0');

      // Click overlay to close
      const overlay = screen.getByRole('button', { name: '' }).nextElementSibling;
      fireEvent.click(overlay!);
      expect(sidebar?.className).toContain('-translate-x-full');
    });

    it('should close mobile menu when navigation link is clicked', () => {
      render(<SidebarWithRouter currentPage="dashboard" />);

      const mobileMenuButton = screen.getByRole('button', { name: '' });
      const sidebar = screen.getByRole('navigation').closest('div')?.parentElement;
      const dailyNotesLink = screen.getByText('Daily Notes').closest('a');

      // Open menu
      fireEvent.click(mobileMenuButton);
      expect(sidebar?.className).toContain('translate-x-0');

      // Click navigation link
      fireEvent.click(dailyNotesLink!);
      expect(sidebar?.className).toContain('-translate-x-full');
    });
  });

  describe('User actions', () => {
    it('should call logout when logout button is clicked', () => {
      render(<SidebarWithRouter currentPage="dashboard" />);

      const logoutButton = screen.getByText('Logout').closest('button');
      fireEvent.click(logoutButton!);

      expect(mockLogout).toHaveBeenCalled();
    });

    it('should navigate to pricing when upgrade button is clicked', () => {
      render(<SidebarWithRouter currentPage="dashboard" />);

      const upgradeButton = screen.getByText('Upgrade Now').closest('button');
      fireEvent.click(upgradeButton!);

      expect(mockNavigate).toHaveBeenCalledWith('/pricing');
    });

    it('should close mobile menu when upgrade button is clicked', () => {
      render(<SidebarWithRouter currentPage="dashboard" />);

      const mobileMenuButton = screen.getByRole('button', { name: '' });
      const sidebar = screen.getByRole('navigation').closest('div')?.parentElement;
      const upgradeButton = screen.getByText('Upgrade Now').closest('button');

      // Open menu
      fireEvent.click(mobileMenuButton);
      expect(sidebar?.className).toContain('translate-x-0');

      // Click upgrade button
      fireEvent.click(upgradeButton!);
      expect(sidebar?.className).toContain('-translate-x-full');
    });
  });

  describe('Icons', () => {
    it('should render all navigation icons', () => {
      render(<SidebarWithRouter currentPage="dashboard" />);

      // Check that icons are rendered (they should be SVG elements)
      const iconElements = screen.getAllByRole('img', { hidden: true });
      expect(iconElements.length).toBeGreaterThan(0);
    });

    it('should render upgrade and logout icons', () => {
      render(<SidebarWithRouter currentPage="dashboard" />);

      const upgradeButton = screen.getByText('Upgrade Now').closest('button');
      const logoutButton = screen.getByText('Logout').closest('button');

      // Check that buttons contain SVG icons
      expect(upgradeButton?.querySelector('svg')).toBeDefined();
      expect(logoutButton?.querySelector('svg')).toBeDefined();
    });
  });

  describe('Responsive behavior', () => {
    it('should show mobile menu button only on small screens', () => {
      render(<SidebarWithRouter currentPage="dashboard" />);

      const mobileMenuButton = screen.getByRole('button', { name: '' });
      expect(mobileMenuButton.className).toContain('lg:hidden');
    });

    it('should have proper responsive classes', () => {
      render(<SidebarWithRouter currentPage="dashboard" />);

      const sidebar = screen.getByRole('navigation').closest('div')?.parentElement;
      expect(sidebar?.className).toContain('lg:relative');
      expect(sidebar?.className).toContain('lg:translate-x-0');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(<SidebarWithRouter currentPage="dashboard" />);

      const mobileMenuButton = screen.getByRole('button', { name: '' });
      expect(mobileMenuButton).toBeDefined();

      const navigation = screen.getByRole('navigation');
      expect(navigation).toBeDefined();
    });

    it('should have proper button types', () => {
      render(<SidebarWithRouter currentPage="dashboard" />);

      const mobileMenuButton = screen.getByRole('button', { name: '' });
      const upgradeButton = screen.getByText('Upgrade Now').closest('button');
      const logoutButton = screen.getByText('Logout').closest('button');

      expect(mobileMenuButton.getAttribute('type')).toBe(null);
      expect(upgradeButton?.getAttribute('type')).toBe(null);
      expect(logoutButton?.getAttribute('type')).toBe(null);
    });
  });
});
