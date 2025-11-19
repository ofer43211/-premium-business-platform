/**
 * Toast Component
 * Individual toast notification
 */
import React, { useEffect, useState } from 'react';
import type { Toast as ToastType } from './types';

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = () => {
    setIsExiting(true);
    // Wait for animation before removing
    setTimeout(() => {
      onDismiss(toast.id);
    }, 300);
  };

  // Icons for different variants
  const icons = {
    success: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm-2 15l-5-5 1.41-1.41L8 12.17l7.59-7.59L17 6l-9 9z"
          fill="currentColor"
        />
      </svg>
    ),
    error: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 15H9v-2h2v2zm0-4H9V5h2v6z"
          fill="currentColor"
        />
      </svg>
    ),
    warning: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M1 17h18L10 1 1 17zm10-2H9v-2h2v2zm0-4H9V7h2v4z"
          fill="currentColor"
        />
      </svg>
    ),
    info: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 15H9V9h2v6zm0-8H9V5h2v2z"
          fill="currentColor"
        />
      </svg>
    ),
  };

  return (
    <div
      className={`toast toast-${toast.variant} ${isExiting ? 'toast-exit' : ''}`}
      role="alert"
      aria-live={toast.variant === 'error' ? 'assertive' : 'polite'}
      data-testid={`toast-${toast.id}`}
    >
      <div className="toast-content">
        <div className="toast-icon" data-testid={`toast-icon-${toast.variant}`}>
          {icons[toast.variant]}
        </div>

        <div className="toast-message" data-testid="toast-message">
          {toast.message}
        </div>

        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="toast-action"
            data-testid="toast-action"
          >
            {toast.action.label}
          </button>
        )}

        {toast.dismissible && (
          <button
            onClick={handleDismiss}
            className="toast-dismiss"
            aria-label="Dismiss notification"
            data-testid="toast-dismiss"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z"
                fill="currentColor"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
