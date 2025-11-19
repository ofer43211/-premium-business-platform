/**
 * Tests for ConfirmDialog Component
 * Coverage: Confirmation flow, variants, loading state
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from '../ConfirmDialog';

describe('ConfirmDialog', () => {
  describe('Basic Rendering', () => {
    it('should render confirm dialog', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={jest.fn()}
          onConfirm={jest.fn()}
          message="Are you sure?"
        />
      );

      expect(screen.getByTestId('confirm-dialog-message')).toHaveTextContent(
        'Are you sure?'
      );
    });

    it('should render default title', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={jest.fn()}
          onConfirm={jest.fn()}
          message="Are you sure?"
        />
      );

      expect(screen.getByTestId('dialog-title')).toHaveTextContent('Confirm Action');
    });

    it('should render custom title', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={jest.fn()}
          onConfirm={jest.fn()}
          message="Are you sure?"
          title="Delete Item?"
        />
      );

      expect(screen.getByTestId('dialog-title')).toHaveTextContent('Delete Item?');
    });

    it('should accept React node as message', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={jest.fn()}
          onConfirm={jest.fn()}
          message={
            <div>
              <strong>Warning:</strong> This action cannot be undone.
            </div>
          }
        />
      );

      expect(screen.getByText('Warning:')).toBeInTheDocument();
      expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should render confirm and cancel buttons', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={jest.fn()}
          onConfirm={jest.fn()}
          message="Are you sure?"
        />
      );

      expect(screen.getByTestId('confirm-cancel')).toHaveTextContent('Cancel');
      expect(screen.getByTestId('confirm-confirm')).toHaveTextContent('Confirm');
    });

    it('should render custom button text', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={jest.fn()}
          onConfirm={jest.fn()}
          message="Delete this item?"
          confirmText="Delete"
          cancelText="Keep It"
        />
      );

      expect(screen.getByTestId('confirm-cancel')).toHaveTextContent('Keep It');
      expect(screen.getByTestId('confirm-confirm')).toHaveTextContent('Delete');
    });

    it('should call onConfirm when confirm button is clicked', async () => {
      const user = userEvent.setup();
      const onConfirm = jest.fn();

      render(
        <ConfirmDialog
          isOpen={true}
          onClose={jest.fn()}
          onConfirm={onConfirm}
          message="Are you sure?"
        />
      );

      await user.click(screen.getByTestId('confirm-confirm'));

      expect(onConfirm).toHaveBeenCalled();
    });

    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();

      render(
        <ConfirmDialog
          isOpen={true}
          onClose={onClose}
          onConfirm={jest.fn()}
          message="Are you sure?"
        />
      );

      await user.click(screen.getByTestId('confirm-cancel'));

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Button Variants', () => {
    it('should use primary variant by default', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={jest.fn()}
          onConfirm={jest.fn()}
          message="Are you sure?"
        />
      );

      const confirmButton = screen.getByTestId('confirm-confirm');
      expect(confirmButton).toHaveClass('button-primary');
    });

    it('should use danger variant when specified', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={jest.fn()}
          onConfirm={jest.fn()}
          message="Delete this item?"
          confirmVariant="danger"
        />
      );

      const confirmButton = screen.getByTestId('confirm-confirm');
      expect(confirmButton).toHaveClass('button-danger');
    });

    it('should use secondary variant for cancel button', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={jest.fn()}
          onConfirm={jest.fn()}
          message="Are you sure?"
        />
      );

      const cancelButton = screen.getByTestId('confirm-cancel');
      expect(cancelButton).toHaveClass('button-secondary');
    });
  });

  describe('Loading State', () => {
    it('should show loading state on confirm button', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={jest.fn()}
          onConfirm={jest.fn()}
          message="Are you sure?"
          isLoading={true}
        />
      );

      const confirmButton = screen.getByTestId('confirm-confirm');
      expect(confirmButton).toHaveClass('button-loading');
      expect(screen.getByTestId('button-spinner')).toBeInTheDocument();
    });

    it('should disable both buttons when loading', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={jest.fn()}
          onConfirm={jest.fn()}
          message="Are you sure?"
          isLoading={true}
        />
      );

      expect(screen.getByTestId('confirm-cancel')).toBeDisabled();
      expect(screen.getByTestId('confirm-confirm')).toBeDisabled();
    });

    it('should not disable buttons when not loading', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={jest.fn()}
          onConfirm={jest.fn()}
          message="Are you sure?"
          isLoading={false}
        />
      );

      expect(screen.getByTestId('confirm-cancel')).not.toBeDisabled();
      expect(screen.getByTestId('confirm-confirm')).not.toBeDisabled();
    });
  });

  describe('Use Cases', () => {
    it('should work for delete confirmation', async () => {
      const user = userEvent.setup();
      const onDelete = jest.fn();

      render(
        <ConfirmDialog
          isOpen={true}
          onClose={jest.fn()}
          onConfirm={onDelete}
          title="Delete Item"
          message="Are you sure you want to delete this item? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          confirmVariant="danger"
        />
      );

      expect(screen.getByText('Delete Item')).toBeInTheDocument();
      expect(screen.getByText(/cannot be undone/)).toBeInTheDocument();

      await user.click(screen.getByText('Delete'));

      expect(onDelete).toHaveBeenCalled();
    });

    it('should work for save confirmation', async () => {
      const user = userEvent.setup();
      const onSave = jest.fn();

      render(
        <ConfirmDialog
          isOpen={true}
          onClose={jest.fn()}
          onConfirm={onSave}
          title="Save Changes"
          message="Do you want to save your changes?"
          confirmText="Save"
          cancelText="Discard"
          confirmVariant="primary"
        />
      );

      await user.click(screen.getByText('Save'));

      expect(onSave).toHaveBeenCalled();
    });

    it('should work for logout confirmation', async () => {
      const user = userEvent.setup();
      const onLogout = jest.fn();

      render(
        <ConfirmDialog
          isOpen={true}
          onClose={jest.fn()}
          onConfirm={onLogout}
          title="Log Out"
          message="Are you sure you want to log out?"
          confirmText="Log Out"
          cancelText="Stay"
        />
      );

      await user.click(screen.getByText('Log Out'));

      expect(onLogout).toHaveBeenCalled();
    });
  });

  describe('Modal Props', () => {
    it('should pass size prop', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={jest.fn()}
          onConfirm={jest.fn()}
          message="Are you sure?"
          size="sm"
        />
      );

      expect(screen.getByTestId('modal')).toHaveClass('modal-sm');
    });

    it('should close on ESC by default', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();

      render(
        <ConfirmDialog
          isOpen={true}
          onClose={onClose}
          onConfirm={jest.fn()}
          message="Are you sure?"
        />
      );

      await user.keyboard('{Escape}');

      expect(onClose).toHaveBeenCalled();
    });
  });
});
