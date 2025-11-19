/**
 * Tests for Toast Container
 * Coverage: Toast rendering, positioning, max toasts
 */
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { ToastProvider } from '../ToastContext';
import { ToastContainer } from '../ToastContainer';
import { useToast } from '../useToast';

// Test component that can add toasts
function TestComponent() {
  const toast = useToast();

  return (
    <>
      <button onClick={() => toast.success('Success message')}>Add Success</button>
      <button onClick={() => toast.error('Error message')}>Add Error</button>
      <button onClick={() => toast.info('Info message')}>Add Info</button>
    </>
  );
}

describe('ToastContainer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('should not render when no toasts', () => {
      render(
        <ToastProvider>
          <ToastContainer />
        </ToastProvider>
      );

      expect(screen.queryByTestId('toast-container')).not.toBeInTheDocument();
    });

    it('should render container when toasts exist', () => {
      render(
        <ToastProvider>
          <TestComponent />
          <ToastContainer />
        </ToastProvider>
      );

      const addButton = screen.getByText('Add Success');
      act(() => {
        addButton.click();
      });

      expect(screen.getByTestId('toast-container')).toBeInTheDocument();
    });

    it('should render all toasts', () => {
      render(
        <ToastProvider>
          <TestComponent />
          <ToastContainer />
        </ToastProvider>
      );

      act(() => {
        screen.getByText('Add Success').click();
        screen.getByText('Add Error').click();
        screen.getByText('Add Info').click();
      });

      const messages = screen.getAllByTestId(/^toast-toast-/);
      expect(messages).toHaveLength(3);
    });
  });

  describe('Positioning', () => {
    it('should apply default position top-right', () => {
      render(
        <ToastProvider>
          <TestComponent />
          <ToastContainer />
        </ToastProvider>
      );

      act(() => {
        screen.getByText('Add Success').click();
      });

      const container = screen.getByTestId('toast-container');
      expect(container).toHaveClass('toast-container-top-right');
    });

    it('should apply custom position', () => {
      render(
        <ToastProvider>
          <TestComponent />
          <ToastContainer position="bottom-left" />
        </ToastProvider>
      );

      act(() => {
        screen.getByText('Add Success').click();
      });

      const container = screen.getByTestId('toast-container');
      expect(container).toHaveClass('toast-container-bottom-left');
    });

    it('should support all positions', () => {
      const positions = [
        'top-left',
        'top-center',
        'top-right',
        'bottom-left',
        'bottom-center',
        'bottom-right',
      ] as const;

      positions.forEach((position) => {
        const { unmount } = render(
          <ToastProvider>
            <TestComponent />
            <ToastContainer position={position} />
          </ToastProvider>
        );

        act(() => {
          screen.getByText('Add Success').click();
        });

        const container = screen.getByTestId('toast-container');
        expect(container).toHaveClass(`toast-container-${position}`);

        unmount();
      });
    });
  });

  describe('Max Toasts', () => {
    it('should limit number of visible toasts', () => {
      render(
        <ToastProvider>
          <TestComponent />
          <ToastContainer maxToasts={2} />
        </ToastProvider>
      );

      act(() => {
        screen.getByText('Add Success').click();
        screen.getByText('Add Error').click();
        screen.getByText('Add Info').click();
      });

      const toasts = screen.getAllByRole('alert');
      expect(toasts).toHaveLength(2);
    });

    it('should show most recent toasts when exceeding max', () => {
      render(
        <ToastProvider>
          <TestComponent />
          <ToastContainer maxToasts={2} />
        </ToastProvider>
      );

      act(() => {
        screen.getByText('Add Success').click(); // Will be hidden
        screen.getByText('Add Error').click(); // Visible
        screen.getByText('Add Info').click(); // Visible
      });

      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.getByText('Info message')).toBeInTheDocument();
      expect(screen.queryByText('Success message')).not.toBeInTheDocument();
    });

    it('should use default max toasts of 5', () => {
      render(
        <ToastProvider>
          <TestComponent />
          <ToastContainer />
        </ToastProvider>
      );

      // Add 6 toasts
      act(() => {
        for (let i = 0; i < 6; i++) {
          screen.getByText('Add Info').click();
        }
      });

      const toasts = screen.getAllByRole('alert');
      expect(toasts).toHaveLength(5);
    });
  });

  describe('Accessibility', () => {
    it('should have aria-live polite', () => {
      render(
        <ToastProvider>
          <TestComponent />
          <ToastContainer />
        </ToastProvider>
      );

      act(() => {
        screen.getByText('Add Success').click();
      });

      const container = screen.getByTestId('toast-container');
      expect(container).toHaveAttribute('aria-live', 'polite');
    });

    it('should have aria-atomic false', () => {
      render(
        <ToastProvider>
          <TestComponent />
          <ToastContainer />
        </ToastProvider>
      );

      act(() => {
        screen.getByText('Add Success').click();
      });

      const container = screen.getByTestId('toast-container');
      expect(container).toHaveAttribute('aria-atomic', 'false');
    });
  });

  describe('Integration', () => {
    it('should update when toasts are added and removed', () => {
      const { rerender } = render(
        <ToastProvider>
          <TestComponent />
          <ToastContainer />
        </ToastProvider>
      );

      // Add toast
      act(() => {
        screen.getByText('Add Success').click();
      });

      expect(screen.getByTestId('toast-container')).toBeInTheDocument();

      // Auto-dismiss after duration
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      rerender(
        <ToastProvider>
          <TestComponent />
          <ToastContainer />
        </ToastProvider>
      );

      expect(screen.queryByTestId('toast-container')).not.toBeInTheDocument();
    });
  });
});
