import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import { StatsCard } from '../../../../src/components/dashboard/StatsCard';
import { TrendingUp } from 'lucide-react';

describe('StatsCard', () => {
  beforeEach(() => {
    // Reset any previous state
  });

  afterEach(() => {
    // Clean up DOM after each test
    cleanup();
  });

  describe('Rendering', () => {
    it('should render title correctly', () => {
      render(
        <StatsCard
          title="Total Notes"
          value="42"
          change="+12%"
          icon={TrendingUp}
          iconColor="#10b981"
        />
      );

      expect(screen.getByText('Total Notes')).toBeInTheDocument();
    });

    it('should render value as string', () => {
      render(
        <StatsCard
          title="Total Notes"
          value="42"
          change="+12%"
          icon={TrendingUp}
          iconColor="#10b981"
        />
      );

      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should render value as number', () => {
      render(
        <StatsCard
          title="Total Notes"
          value={42}
          change="+12%"
          icon={TrendingUp}
          iconColor="#10b981"
        />
      );

      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should render change correctly', () => {
      render(
        <StatsCard
          title="Total Notes"
          value="42"
          change="+12%"
          icon={TrendingUp}
          iconColor="#10b981"
        />
      );

      expect(screen.getByText('+12%')).toBeInTheDocument();
    });
  });

  describe('Icon rendering', () => {
    it('should render icon', () => {
      render(
        <StatsCard
          title="Total Notes"
          value="42"
          change="+12%"
          icon={TrendingUp}
          iconColor="#10b981"
        />
      );

      const icon = document.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('class');
    });

    it('should render icon container', () => {
      render(
        <StatsCard
          title="Total Notes"
          value="42"
          change="+12%"
          icon={TrendingUp}
          iconColor="#10b981"
        />
      );

      const iconContainer = document.querySelector('[style*="background-color"]');
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveAttribute('style');
      expect(iconContainer?.getAttribute('style')).toContain('background-color');
    });
  });

  describe('Styling and structure', () => {
    it('should have correct CSS classes for main container', () => {
      render(
        <StatsCard
          title="Total Notes"
          value="42"
          change="+12%"
          icon={TrendingUp}
          iconColor="#10b981"
        />
      );

      const container = document.querySelector('.bg-slate-800\\/50');
      expect(container).toBeInTheDocument();
      expect(container).toHaveAttribute('class');
      expect(container?.getAttribute('class')).toContain('bg-slate-800/50');
      expect(container?.getAttribute('class')).toContain('backdrop-blur-sm');
    });

    it('should have responsive text classes', () => {
      render(
        <StatsCard
          title="Total Notes"
          value="42"
          change="+12%"
          icon={TrendingUp}
          iconColor="#10b981"
        />
      );

      const title = screen.getByText('Total Notes');
      expect(title.getAttribute('class')).toContain('text-xs');
      expect(title.getAttribute('class')).toContain('lg:text-sm');

      const value = screen.getByText('42');
      expect(value.getAttribute('class')).toContain('text-xl');
      expect(value.getAttribute('class')).toContain('lg:text-3xl');
    });
  });

  describe('Layout structure', () => {
    it('should have correct semantic structure', () => {
      render(
        <StatsCard
          title="Total Notes"
          value="42"
          change="+12%"
          icon={TrendingUp}
          iconColor="#10b981"
        />
      );

      // Should have header section with title and icon
      const headerSection = screen.getByText('Total Notes').parentElement;
      expect(headerSection).toHaveClass('flex', 'items-center', 'justify-between');

      // Should have content section with value and change
      const valueElement = screen.getByText('42');
      const changeElement = screen.getByText('+12%');

      // Value and change should be in the same container
      expect(valueElement.parentElement).toContainElement(changeElement);
    });
  });
});
