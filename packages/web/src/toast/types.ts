/**
 * Toast Notification Types
 */

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
  action?: ToastAction;
  dismissible?: boolean;
}

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  variant?: ToastVariant;
  duration?: number;
  action?: ToastAction;
  dismissible?: boolean;
  position?: ToastPosition;
}

export interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string, options?: ToastOptions) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
  success: (message: string, options?: Omit<ToastOptions, 'variant'>) => string;
  error: (message: string, options?: Omit<ToastOptions, 'variant'>) => string;
  warning: (message: string, options?: Omit<ToastOptions, 'variant'>) => string;
  info: (message: string, options?: Omit<ToastOptions, 'variant'>) => string;
}
