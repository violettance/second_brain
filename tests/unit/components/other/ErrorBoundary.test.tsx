import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ErrorBoundary } from '../../../../src/components/ErrorBoundary';

// Mock dependencies
const mockLogger = {
  error: mock(() => {})
};

const mockDatadogRum = {
  addError: mock(() => {})
};

// Mock modules
mock.module('../../../../src/lib/logger', () => ({
  logger: mockLogger
}));

mock.module('@datadog/browser-rum', () => ({
  datadogRum: mockDatadogRum
}));

// Mock location.reload
const mockReload = mock(() => {});
Object.defineProperty(globalThis, 'location', {
  value: { reload: mockReload },
  writable: true
});

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Reset mocks
    mockLogger.error.mockClear();
    mockDatadogRum.addError.mockClear();
    mockReload.mockClear();
  });

  afterEach(() => {
    // Clean up DOM after each test
    cleanup();
  });

  describe('Normal rendering', () => {
    it('should render children when there is no error', () => {
      render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should render children when child component does not throw', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('should catch errors and render error UI', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = mock(() => {});

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Should render error UI
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Try refreshing the page. If the problem persists, please contact support.')).toBeInTheDocument();
      expect(screen.getByText('Refresh')).toBeInTheDocument();

      // Restore console.error
      console.error = originalError;
    });

    it('should log error to logger', () => {
      const originalError = console.error;
      console.error = mock(() => {});

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Should call logger.error
      expect(mockLogger.error).toHaveBeenCalledWith(
        'ReactErrorBoundary',
        expect.objectContaining({
          message: 'Test error',
          stack: expect.any(String),
          info: expect.any(Object)
        })
      );

      console.error = originalError;
    });

    it('should send error to Datadog RUM', () => {
      const originalError = console.error;
      console.error = mock(() => {});

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Should call datadogRum.addError
      expect(mockDatadogRum.addError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          source: 'react-error-boundary',
          componentStack: expect.any(String),
          errorBoundary: 'ErrorBoundary'
        })
      );

      console.error = originalError;
    });
  });

  describe('Error UI interactions', () => {
    it('should call location.reload when refresh button is clicked', () => {
      const originalError = console.error;
      console.error = mock(() => {});

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);

      expect(mockReload).toHaveBeenCalled();

      console.error = originalError;
    });
  });

  describe('getDerivedStateFromError', () => {
    it('should return hasError: true when called', () => {
      const result = ErrorBoundary.getDerivedStateFromError(new Error('Test'));
      expect(result).toEqual({ hasError: true });
    });
  });
});
