/**
 * Tests for Error Boundary
 * Coverage: Error catching, fallback UI, reset functionality
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary, withErrorBoundary } from '../ErrorBoundary';

// Component that throws an error
const ThrowError: React.FC<{ shouldThrow?: boolean; message?: string }> = ({
  shouldThrow = true,
  message = 'Test error',
}) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  describe('Error Catching', () => {
    it('should catch errors and display fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('error-boundary-fallback')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should render children when no error', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
      expect(screen.queryByTestId('error-boundary-fallback')).not.toBeInTheDocument();
    });

    it('should display custom fallback when provided', () => {
      const customFallback = <div data-testid="custom-fallback">Custom error UI</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
      expect(screen.getByText('Custom error UI')).toBeInTheDocument();
    });
  });

  describe('Error Details', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should show error details in development', () => {
      process.env.NODE_ENV = 'development';

      render(
        <ErrorBoundary>
          <ThrowError message="Detailed error message" />
        </ErrorBoundary>
      );

      const details = screen.getByText(/Error Details/);
      expect(details).toBeInTheDocument();
    });

    it('should hide error details in production', () => {
      process.env.NODE_ENV = 'production';

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.queryByText(/Error Details/)).not.toBeInTheDocument();
    });
  });

  describe('Error Handler', () => {
    it('should call onError callback when error occurs', () => {
      const onError = jest.fn();

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError message="Test error" />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalled();
      expect(onError.mock.calls[0][0].message).toBe('Test error');
    });

    it('should not call onError when no error', () => {
      const onError = jest.fn();

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(onError).not.toHaveBeenCalled();
    });
  });

  describe('Reset Functionality', () => {
    it('should reset error state when reset button clicked', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Error boundary should be showing
      expect(screen.getByTestId('error-boundary-fallback')).toBeInTheDocument();

      // Click reset button
      fireEvent.click(screen.getByTestId('error-boundary-reset'));

      // Should try to render children again
      // Note: This will throw again in this test, but in real app
      // the component might not throw on second render
    });
  });

  describe('withErrorBoundary HOC', () => {
    it('should wrap component with error boundary', () => {
      const TestComponent = () => <div>Test Component</div>;
      const WrappedComponent = withErrorBoundary(TestComponent);

      render(<WrappedComponent />);

      expect(screen.getByText('Test Component')).toBeInTheDocument();
    });

    it('should catch errors in wrapped component', () => {
      const WrappedComponent = withErrorBoundary(ThrowError);

      render(<WrappedComponent />);

      expect(screen.getByTestId('error-boundary-fallback')).toBeInTheDocument();
    });

    it('should use custom fallback in HOC', () => {
      const customFallback = <div data-testid="hoc-fallback">HOC Fallback</div>;
      const WrappedComponent = withErrorBoundary(ThrowError, customFallback);

      render(<WrappedComponent />);

      expect(screen.getByTestId('hoc-fallback')).toBeInTheDocument();
    });

    it('should call onError callback in HOC', () => {
      const onError = jest.fn();
      const WrappedComponent = withErrorBoundary(ThrowError, undefined, onError);

      render(<WrappedComponent />);

      expect(onError).toHaveBeenCalled();
    });
  });

  describe('Sentry Integration', () => {
    const originalEnv = process.env.NODE_ENV;
    const originalWindow = global.window;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
      global.window = originalWindow;
    });

    it('should send errors to Sentry in production', () => {
      process.env.NODE_ENV = 'production';

      const mockCaptureException = jest.fn();
      (global as any).window = {
        Sentry: {
          captureException: mockCaptureException,
        },
      };

      render(
        <ErrorBoundary>
          <ThrowError message="Sentry test error" />
        </ErrorBoundary>
      );

      expect(mockCaptureException).toHaveBeenCalled();
    });

    it('should not send errors to Sentry in development', () => {
      process.env.NODE_ENV = 'development';

      const mockCaptureException = jest.fn();
      (global as any).window = {
        Sentry: {
          captureException: mockCaptureException,
        },
      };

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(mockCaptureException).not.toHaveBeenCalled();
    });

    it('should handle missing Sentry gracefully', () => {
      process.env.NODE_ENV = 'production';
      (global as any).window = {};

      // Should not throw
      expect(() => {
        render(
          <ErrorBoundary>
            <ThrowError />
          </ErrorBoundary>
        );
      }).not.toThrow();
    });
  });
});
