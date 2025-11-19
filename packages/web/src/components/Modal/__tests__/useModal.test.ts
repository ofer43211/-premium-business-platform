/**
 * Tests for useModal Hook
 * Coverage: Open, close, toggle functionality
 */
import { renderHook, act } from '@testing-library/react';
import { useModal } from '../useModal';

describe('useModal', () => {
  describe('Initialization', () => {
    it('should initialize as closed by default', () => {
      const { result } = renderHook(() => useModal());

      expect(result.current.isOpen).toBe(false);
    });

    it('should initialize with custom initial state', () => {
      const { result } = renderHook(() => useModal(true));

      expect(result.current.isOpen).toBe(true);
    });
  });

  describe('open', () => {
    it('should open modal', () => {
      const { result } = renderHook(() => useModal());

      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.open();
      });

      expect(result.current.isOpen).toBe(true);
    });

    it('should stay open if already open', () => {
      const { result } = renderHook(() => useModal(true));

      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.open();
      });

      expect(result.current.isOpen).toBe(true);
    });
  });

  describe('close', () => {
    it('should close modal', () => {
      const { result } = renderHook(() => useModal(true));

      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.close();
      });

      expect(result.current.isOpen).toBe(false);
    });

    it('should stay closed if already closed', () => {
      const { result } = renderHook(() => useModal(false));

      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.close();
      });

      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('toggle', () => {
    it('should toggle from closed to open', () => {
      const { result } = renderHook(() => useModal(false));

      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.toggle();
      });

      expect(result.current.isOpen).toBe(true);
    });

    it('should toggle from open to closed', () => {
      const { result } = renderHook(() => useModal(true));

      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.toggle();
      });

      expect(result.current.isOpen).toBe(false);
    });

    it('should toggle multiple times', () => {
      const { result } = renderHook(() => useModal());

      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.toggle();
      });
      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.toggle();
      });
      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.toggle();
      });
      expect(result.current.isOpen).toBe(true);
    });
  });

  describe('Function Stability', () => {
    it('should maintain function references across renders', () => {
      const { result, rerender } = renderHook(() => useModal());

      const initialOpen = result.current.open;
      const initialClose = result.current.close;
      const initialToggle = result.current.toggle;

      rerender();

      expect(result.current.open).toBe(initialOpen);
      expect(result.current.close).toBe(initialClose);
      expect(result.current.toggle).toBe(initialToggle);
    });
  });

  describe('Integration', () => {
    it('should work with multiple operations', () => {
      const { result } = renderHook(() => useModal());

      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.open();
      });
      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.open(); // Should stay open
      });
      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.close();
      });
      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.toggle();
      });
      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.toggle();
      });
      expect(result.current.isOpen).toBe(false);
    });
  });
});
