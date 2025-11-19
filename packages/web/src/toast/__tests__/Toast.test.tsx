/**
 * Tests for Toast Component
 * Coverage: Rendering, variants, actions, dismissal
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toast } from '../Toast';
import type { Toast as ToastType } from '../types';

describe('Toast Component', () => {
  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    mockOnDismiss.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const createToast = (overrides?: Partial<ToastType>): ToastType => ({
    id: 'test-toast-1',
    message: 'Test message',
    variant: 'info',
    duration: 5000,
    dismissible: true,
    ...overrides,
  });

  describe('Rendering', () => {
    it('should render toast message', () => {
      const toast = createToast({ message: 'Hello World' });
      render(<Toast toast={toast} onDismiss={mockOnDismiss} />);

      expect(screen.getByTestId('toast-message')).toHaveTextContent('Hello World');
    });

    it('should render with correct variant class', () => {
      const toast = createToast({ variant: 'success' });
      render(<Toast toast={toast} onDismiss={mockOnDismiss} />);

      const toastElement = screen.getByTestId(`toast-${toast.id}`);
      expect(toastElement).toHaveClass('toast-success');
    });

    it('should render success icon for success variant', () => {
      const toast = createToast({ variant: 'success' });
      render(<Toast toast={toast} onDismiss={mockOnDismiss} />);

      expect(screen.getByTestId('toast-icon-success')).toBeInTheDocument();
    });

    it('should render error icon for error variant', () => {
      const toast = createToast({ variant: 'error' });
      render(<Toast toast={toast} onDismiss={mockOnDismiss} />);

      expect(screen.getByTestId('toast-icon-error')).toBeInTheDocument();
    });

    it('should render warning icon for warning variant', () => {
      const toast = createToast({ variant: 'warning' });
      render(<Toast toast={toast} onDismiss={mockOnDismiss} />);

      expect(screen.getByTestId('toast-icon-warning')).toBeInTheDocument();
    });

    it('should render info icon for info variant', () => {
      const toast = createToast({ variant: 'info' });
      render(<Toast toast={toast} onDismiss={mockOnDismiss} />);

      expect(screen.getByTestId('toast-icon-info')).toBeInTheDocument();
    });
  });

  describe('Dismissal', () => {
    it('should render dismiss button when dismissible', () => {
      const toast = createToast({ dismissible: true });
      render(<Toast toast={toast} onDismiss={mockOnDismiss} />);

      expect(screen.getByTestId('toast-dismiss')).toBeInTheDocument();
    });

    it('should not render dismiss button when not dismissible', () => {
      const toast = createToast({ dismissible: false });
      render(<Toast toast={toast} onDismiss={mockOnDismiss} />);

      expect(screen.queryByTestId('toast-dismiss')).not.toBeInTheDocument();
    });

    it('should call onDismiss after animation when dismiss button is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      const toast = createToast();
      render(<Toast toast={toast} onDismiss={mockOnDismiss} />);

      const dismissButton = screen.getByTestId('toast-dismiss');
      await user.click(dismissButton);

      // Wait for animation (300ms)
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(mockOnDismiss).toHaveBeenCalledWith(toast.id);
    });

    it('should add exit class when dismissing', async () => {
      const user = userEvent.setup({ delay: null });
      const toast = createToast();
      render(<Toast toast={toast} onDismiss={mockOnDismiss} />);

      const toastElement = screen.getByTestId(`toast-${toast.id}`);
      expect(toastElement).not.toHaveClass('toast-exit');

      const dismissButton = screen.getByTestId('toast-dismiss');
      await user.click(dismissButton);

      expect(toastElement).toHaveClass('toast-exit');
    });
  });

  describe('Action Button', () => {
    it('should render action button when action is provided', () => {
      const action = {
        label: 'Undo',
        onClick: jest.fn(),
      };
      const toast = createToast({ action });
      render(<Toast toast={toast} onDismiss={mockOnDismiss} />);

      expect(screen.getByTestId('toast-action')).toBeInTheDocument();
      expect(screen.getByText('Undo')).toBeInTheDocument();
    });

    it('should not render action button when action is not provided', () => {
      const toast = createToast({ action: undefined });
      render(<Toast toast={toast} onDismiss={mockOnDismiss} />);

      expect(screen.queryByTestId('toast-action')).not.toBeInTheDocument();
    });

    it('should call action onClick when action button is clicked', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();
      const action = { label: 'Retry', onClick };
      const toast = createToast({ action });

      render(<Toast toast={toast} onDismiss={mockOnDismiss} />);

      const actionButton = screen.getByTestId('toast-action');
      await user.click(actionButton);

      expect(onClick).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have role alert', () => {
      const toast = createToast();
      render(<Toast toast={toast} onDismiss={mockOnDismiss} />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should have aria-live polite for non-error toasts', () => {
      const toast = createToast({ variant: 'success' });
      render(<Toast toast={toast} onDismiss={mockOnDismiss} />);

      const toastElement = screen.getByRole('alert');
      expect(toastElement).toHaveAttribute('aria-live', 'polite');
    });

    it('should have aria-live assertive for error toasts', () => {
      const toast = createToast({ variant: 'error' });
      render(<Toast toast={toast} onDismiss={mockOnDismiss} />);

      const toastElement = screen.getByRole('alert');
      expect(toastElement).toHaveAttribute('aria-live', 'assertive');
    });

    it('should have aria-label on dismiss button', () => {
      const toast = createToast();
      render(<Toast toast={toast} onDismiss={mockOnDismiss} />);

      const dismissButton = screen.getByTestId('toast-dismiss');
      expect(dismissButton).toHaveAttribute('aria-label', 'Dismiss notification');
    });

    it('should have aria-hidden on icons', () => {
      const toast = createToast();
      render(<Toast toast={toast} onDismiss={mockOnDismiss} />);

      const icon = screen.getByTestId('toast-icon-info').querySelector('svg');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Variants', () => {
    it('should render all variants correctly', () => {
      const variants = ['success', 'error', 'warning', 'info'] as const;

      variants.forEach((variant) => {
        const toast = createToast({ variant, id: `toast-${variant}` });
        const { container } = render(<Toast toast={toast} onDismiss={mockOnDismiss} />);

        expect(container.querySelector(`.toast-${variant}`)).toBeInTheDocument();
      });
    });
  });
});
