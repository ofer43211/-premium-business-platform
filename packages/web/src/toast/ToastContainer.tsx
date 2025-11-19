/**
 * Toast Container Component
 * Manages and displays all active toasts
 */
import React from 'react';
import { useToast } from './useToast';
import { Toast } from './Toast';
import type { ToastPosition } from './types';

interface ToastContainerProps {
  position?: ToastPosition;
  maxToasts?: number;
}

export function ToastContainer({
  position = 'top-right',
  maxToasts = 5,
}: ToastContainerProps) {
  const { toasts, removeToast } = useToast();

  // Limit number of visible toasts
  const visibleToasts = toasts.slice(-maxToasts);

  if (visibleToasts.length === 0) {
    return null;
  }

  return (
    <div
      className={`toast-container toast-container-${position}`}
      data-testid="toast-container"
      aria-live="polite"
      aria-atomic="false"
    >
      {visibleToasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
}
