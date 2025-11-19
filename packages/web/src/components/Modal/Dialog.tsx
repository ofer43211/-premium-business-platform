/**
 * Dialog Component
 * Modal with header, body, and footer structure
 */
import React from 'react';
import { Modal, ModalProps } from './Modal';

export interface DialogProps extends Omit<ModalProps, 'children'> {
  /** Dialog title */
  title?: React.ReactNode;
  /** Dialog content */
  children: React.ReactNode;
  /** Footer content (usually buttons) */
  footer?: React.ReactNode;
  /** Show close button */
  showCloseButton?: boolean;
  /** Hide header */
  hideHeader?: boolean;
  /** Hide footer */
  hideFooter?: boolean;
}

export function Dialog({
  title,
  children,
  footer,
  showCloseButton = true,
  hideHeader = false,
  hideFooter = false,
  onClose,
  ...modalProps
}: DialogProps) {
  return (
    <Modal onClose={onClose} {...modalProps}>
      {!hideHeader && (title || showCloseButton) && (
        <div className="dialog-header" data-testid="dialog-header">
          {title && (
            <h2 className="dialog-title" data-testid="dialog-title">
              {title}
            </h2>
          )}
          {showCloseButton && (
            <button
              onClick={onClose}
              className="dialog-close"
              aria-label="Close dialog"
              data-testid="dialog-close"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      )}

      <div className="dialog-body" data-testid="dialog-body">
        {children}
      </div>

      {!hideFooter && footer && (
        <div className="dialog-footer" data-testid="dialog-footer">
          {footer}
        </div>
      )}
    </Modal>
  );
}
