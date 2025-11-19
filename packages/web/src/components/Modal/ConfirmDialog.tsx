/**
 * Confirm Dialog Component
 * Pre-configured dialog for confirmations (delete, etc.)
 */
import React from 'react';
import { Dialog, DialogProps } from './Dialog';
import { Button } from '../Button';

export interface ConfirmDialogProps extends Omit<DialogProps, 'children' | 'footer'> {
  /** Confirmation message */
  message: React.ReactNode;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Confirm button variant */
  confirmVariant?: 'primary' | 'danger';
  /** Callback when confirmed */
  onConfirm: () => void;
  /** Loading state */
  isLoading?: boolean;
}

export function ConfirmDialog({
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  onConfirm,
  onClose,
  isLoading = false,
  title = 'Confirm Action',
  ...dialogProps
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog
      title={title}
      onClose={onClose}
      footer={
        <div className="confirm-dialog-actions" data-testid="confirm-dialog-actions">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            data-testid="confirm-cancel"
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={handleConfirm}
            isLoading={isLoading}
            data-testid="confirm-confirm"
          >
            {confirmText}
          </Button>
        </div>
      }
      {...dialogProps}
    >
      <div className="confirm-dialog-message" data-testid="confirm-dialog-message">
        {message}
      </div>
    </Dialog>
  );
}
