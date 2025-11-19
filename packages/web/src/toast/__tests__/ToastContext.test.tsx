/**
 * Tests for Toast Context and Provider
 * Coverage: Toast creation, removal, auto-dismiss, variants
 */
import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ToastProvider } from '../ToastContext';
import { useToast } from '../useToast';

// Wrapper for hooks
function wrapper({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}

describe('ToastContext', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('addToast', () => {
    it('should add a toast', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.addToast('Test message');
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].message).toBe('Test message');
    });

    it('should add toast with default variant info', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.addToast('Test message');
      });

      expect(result.current.toasts[0].variant).toBe('info');
    });

    it('should add toast with custom variant', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.addToast('Success message', { variant: 'success' });
      });

      expect(result.current.toasts[0].variant).toBe('success');
    });

    it('should add multiple toasts', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.addToast('Message 1');
        result.current.addToast('Message 2');
        result.current.addToast('Message 3');
      });

      expect(result.current.toasts).toHaveLength(3);
    });

    it('should generate unique IDs for each toast', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      let id1: string, id2: string;

      act(() => {
        id1 = result.current.addToast('Message 1');
        id2 = result.current.addToast('Message 2');
      });

      expect(id1).not.toBe(id2);
    });

    it('should return toast ID', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      let id: string;

      act(() => {
        id = result.current.addToast('Test');
      });

      expect(id).toBeTruthy();
      expect(result.current.toasts[0].id).toBe(id);
    });
  });

  describe('removeToast', () => {
    it('should remove a toast by ID', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      let id: string;

      act(() => {
        id = result.current.addToast('Test');
      });

      expect(result.current.toasts).toHaveLength(1);

      act(() => {
        result.current.removeToast(id);
      });

      expect(result.current.toasts).toHaveLength(0);
    });

    it('should remove only the specified toast', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      let id1: string, id2: string;

      act(() => {
        id1 = result.current.addToast('Message 1');
        id2 = result.current.addToast('Message 2');
      });

      act(() => {
        result.current.removeToast(id1);
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].message).toBe('Message 2');
    });
  });

  describe('clearAll', () => {
    it('should remove all toasts', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.addToast('Message 1');
        result.current.addToast('Message 2');
        result.current.addToast('Message 3');
      });

      expect(result.current.toasts).toHaveLength(3);

      act(() => {
        result.current.clearAll();
      });

      expect(result.current.toasts).toHaveLength(0);
    });

    it('should clear all timers', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.addToast('Message 1', { duration: 1000 });
        result.current.addToast('Message 2', { duration: 2000 });
      });

      act(() => {
        result.current.clearAll();
      });

      // Run all timers
      act(() => {
        jest.runAllTimers();
      });

      // Toasts should stay cleared (timers were cancelled)
      expect(result.current.toasts).toHaveLength(0);
    });
  });

  describe('Auto-dismiss', () => {
    it('should auto-dismiss toast after default duration', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.addToast('Test');
      });

      expect(result.current.toasts).toHaveLength(1);

      // Fast-forward default duration (5000ms)
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(result.current.toasts).toHaveLength(0);
    });

    it('should auto-dismiss toast after custom duration', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.addToast('Test', { duration: 2000 });
      });

      // Not dismissed yet
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(result.current.toasts).toHaveLength(1);

      // Now dismissed
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(result.current.toasts).toHaveLength(0);
    });

    it('should not auto-dismiss when duration is 0', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.addToast('Test', { duration: 0 });
      });

      act(() => {
        jest.runAllTimers();
      });

      expect(result.current.toasts).toHaveLength(1);
    });
  });

  describe('Variant helpers', () => {
    it('should add success toast', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.success('Success message');
      });

      expect(result.current.toasts[0].variant).toBe('success');
      expect(result.current.toasts[0].message).toBe('Success message');
    });

    it('should add error toast', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.error('Error message');
      });

      expect(result.current.toasts[0].variant).toBe('error');
      expect(result.current.toasts[0].message).toBe('Error message');
    });

    it('should add warning toast', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.warning('Warning message');
      });

      expect(result.current.toasts[0].variant).toBe('warning');
      expect(result.current.toasts[0].message).toBe('Warning message');
    });

    it('should add info toast', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.info('Info message');
      });

      expect(result.current.toasts[0].variant).toBe('info');
      expect(result.current.toasts[0].message).toBe('Info message');
    });

    it('should accept options in variant helpers', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.success('Success', { duration: 3000 });
      });

      expect(result.current.toasts[0].duration).toBe(3000);
    });
  });

  describe('Toast options', () => {
    it('should add toast with action', () => {
      const { result } = renderHook(() => useToast(), { wrapper });
      const action = { label: 'Undo', onClick: jest.fn() };

      act(() => {
        result.current.addToast('Test', { action });
      });

      expect(result.current.toasts[0].action).toEqual(action);
    });

    it('should make toast dismissible by default', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.addToast('Test');
      });

      expect(result.current.toasts[0].dismissible).toBe(true);
    });

    it('should allow non-dismissible toasts', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.addToast('Test', { dismissible: false });
      });

      expect(result.current.toasts[0].dismissible).toBe(false);
    });
  });

  describe('Custom provider props', () => {
    it('should use custom default duration', () => {
      function customWrapper({ children }: { children: React.ReactNode }) {
        return <ToastProvider defaultDuration={1000}>{children}</ToastProvider>;
      }

      const { result } = renderHook(() => useToast(), { wrapper: customWrapper });

      act(() => {
        result.current.addToast('Test');
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.toasts).toHaveLength(0);
    });
  });
});

describe('useToast', () => {
  it('should throw error when used outside ToastProvider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      renderHook(() => useToast());
    }).toThrow('useToast must be used within a ToastProvider');

    console.error = originalError;
  });
});
