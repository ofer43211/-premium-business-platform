/**
 * Modal Component
 * Base modal with overlay, focus trap, and animations
 */
import React, { useEffect, useRef, useCallback } from 'react';
import { Portal } from './Portal';

export interface ModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Modal content */
  children: React.ReactNode;
  /** Size of modal */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Close on overlay click */
  closeOnOverlayClick?: boolean;
  /** Close on ESC key */
  closeOnEsc?: boolean;
  /** Initial focus element ref */
  initialFocusRef?: React.RefObject<HTMLElement>;
  /** Return focus on close */
  returnFocusOnClose?: boolean;
  /** Custom className */
  className?: string;
  /** Z-index */
  zIndex?: number;
}

export function Modal({
  isOpen,
  onClose,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  initialFocusRef,
  returnFocusOnClose = true,
  className = '',
  zIndex = 1000,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEsc, onClose]);

  // Handle focus management
  useEffect(() => {
    if (!isOpen) return;

    // Store previous focus
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Set initial focus
    const timer = setTimeout(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else if (modalRef.current) {
        const firstFocusable = modalRef.current.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
      }
    }, 0);

    return () => {
      clearTimeout(timer);
      // Return focus on close
      if (returnFocusOnClose && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, initialFocusRef, returnFocusOnClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Handle overlay click
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (closeOnOverlayClick && e.target === e.currentTarget) {
        onClose();
      }
    },
    [closeOnOverlayClick, onClose]
  );

  // Focus trap
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  }, []);

  if (!isOpen) return null;

  return (
    <Portal>
      <div
        className="modal-overlay"
        onClick={handleOverlayClick}
        style={{ zIndex }}
        data-testid="modal-overlay"
        aria-modal="true"
        role="dialog"
      >
        <div
          ref={modalRef}
          className={`modal modal-${size} ${className}`}
          onKeyDown={handleKeyDown}
          data-testid="modal"
        >
          {children}
        </div>
      </div>
    </Portal>
  );
}
