/**
 * useToast Hook
 * Custom hook for displaying toast notifications
 */
import { useContext } from 'react';
import { ToastContext } from './ToastContext';
import type { ToastContextValue } from './types';

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}
