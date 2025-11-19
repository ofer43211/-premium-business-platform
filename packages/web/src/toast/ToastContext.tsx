/**
 * Toast Context and Provider
 * Manages toast notifications state
 */
import React, { createContext, useState, useCallback, useRef } from 'react';
import type {
  Toast,
  ToastOptions,
  ToastContextValue,
  ToastPosition,
} from './types';

export const ToastContext = createContext<ToastContextValue | undefined>(undefined);

interface ToastProviderProps {
  children: React.ReactNode;
  position?: ToastPosition;
  defaultDuration?: number;
}

export function ToastProvider({
  children,
  position = 'top-right',
  defaultDuration = 5000,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));

    // Clear timer if exists
    const timer = toastTimers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      toastTimers.current.delete(id);
    }
  }, []);

  const addToast = useCallback(
    (message: string, options?: ToastOptions): string => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const duration = options?.duration ?? defaultDuration;

      const toast: Toast = {
        id,
        message,
        variant: options?.variant || 'info',
        duration,
        action: options?.action,
        dismissible: options?.dismissible !== false,
      };

      setToasts((prev) => [...prev, toast]);

      // Auto-dismiss after duration (unless duration is 0)
      if (duration > 0) {
        const timer = setTimeout(() => {
          removeToast(id);
        }, duration);
        toastTimers.current.set(id, timer);
      }

      return id;
    },
    [defaultDuration, removeToast]
  );

  const clearAll = useCallback(() => {
    // Clear all timers
    toastTimers.current.forEach((timer) => clearTimeout(timer));
    toastTimers.current.clear();
    setToasts([]);
  }, []);

  const success = useCallback(
    (message: string, options?: Omit<ToastOptions, 'variant'>) =>
      addToast(message, { ...options, variant: 'success' }),
    [addToast]
  );

  const error = useCallback(
    (message: string, options?: Omit<ToastOptions, 'variant'>) =>
      addToast(message, { ...options, variant: 'error' }),
    [addToast]
  );

  const warning = useCallback(
    (message: string, options?: Omit<ToastOptions, 'variant'>) =>
      addToast(message, { ...options, variant: 'warning' }),
    [addToast]
  );

  const info = useCallback(
    (message: string, options?: Omit<ToastOptions, 'variant'>) =>
      addToast(message, { ...options, variant: 'info' }),
    [addToast]
  );

  const value: ToastContextValue = {
    toasts,
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}
