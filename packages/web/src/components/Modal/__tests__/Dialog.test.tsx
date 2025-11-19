/**
 * Tests for Dialog Component
 * Coverage: Header, body, footer, close button
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dialog } from '../Dialog';

describe('Dialog', () => {
  describe('Basic Rendering', () => {
    it('should render dialog with content', () => {
      render(
        <Dialog isOpen={true} onClose={jest.fn()}>
          <p>Dialog content</p>
        </Dialog>
      );

      expect(screen.getByTestId('dialog-body')).toBeInTheDocument();
      expect(screen.getByText('Dialog content')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(
        <Dialog isOpen={false} onClose={jest.fn()}>
          <p>Dialog content</p>
        </Dialog>
      );

      expect(screen.queryByTestId('dialog-body')).not.toBeInTheDocument();
    });
  });

  describe('Header', () => {
    it('should render title in header', () => {
      render(
        <Dialog isOpen={true} onClose={jest.fn()} title="My Dialog">
          <p>Content</p>
        </Dialog>
      );

      expect(screen.getByTestId('dialog-title')).toHaveTextContent('My Dialog');
    });

    it('should render close button by default', () => {
      render(
        <Dialog isOpen={true} onClose={jest.fn()} title="My Dialog">
          <p>Content</p>
        </Dialog>
      );

      expect(screen.getByTestId('dialog-close')).toBeInTheDocument();
    });

    it('should hide close button when showCloseButton is false', () => {
      render(
        <Dialog
          isOpen={true}
          onClose={jest.fn()}
          title="My Dialog"
          showCloseButton={false}
        >
          <p>Content</p>
        </Dialog>
      );

      expect(screen.queryByTestId('dialog-close')).not.toBeInTheDocument();
    });

    it('should render header when only close button is shown', () => {
      render(
        <Dialog isOpen={true} onClose={jest.fn()} showCloseButton={true}>
          <p>Content</p>
        </Dialog>
      );

      expect(screen.getByTestId('dialog-header')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-close')).toBeInTheDocument();
    });

    it('should hide header when hideHeader is true', () => {
      render(
        <Dialog isOpen={true} onClose={jest.fn()} title="My Dialog" hideHeader>
          <p>Content</p>
        </Dialog>
      );

      expect(screen.queryByTestId('dialog-header')).not.toBeInTheDocument();
    });

    it('should not render header when no title and no close button', () => {
      render(
        <Dialog isOpen={true} onClose={jest.fn()} showCloseButton={false}>
          <p>Content</p>
        </Dialog>
      );

      expect(screen.queryByTestId('dialog-header')).not.toBeInTheDocument();
    });

    it('should accept React node as title', () => {
      render(
        <Dialog
          isOpen={true}
          onClose={jest.fn()}
          title={
            <div>
              <span>Custom</span> Title
            </div>
          }
        >
          <p>Content</p>
        </Dialog>
      );

      expect(screen.getByText('Custom')).toBeInTheDocument();
      expect(screen.getByText('Title')).toBeInTheDocument();
    });
  });

  describe('Body', () => {
    it('should always render body', () => {
      render(
        <Dialog isOpen={true} onClose={jest.fn()}>
          <p>Body content</p>
        </Dialog>
      );

      expect(screen.getByTestId('dialog-body')).toBeInTheDocument();
      expect(screen.getByText('Body content')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <Dialog isOpen={true} onClose={jest.fn()}>
          <p>First paragraph</p>
          <p>Second paragraph</p>
          <button>Action</button>
        </Dialog>
      );

      expect(screen.getByText('First paragraph')).toBeInTheDocument();
      expect(screen.getByText('Second paragraph')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
    });
  });

  describe('Footer', () => {
    it('should render footer when provided', () => {
      render(
        <Dialog
          isOpen={true}
          onClose={jest.fn()}
          footer={<button>Save</button>}
        >
          <p>Content</p>
        </Dialog>
      );

      expect(screen.getByTestId('dialog-footer')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('should not render footer when not provided', () => {
      render(
        <Dialog isOpen={true} onClose={jest.fn()}>
          <p>Content</p>
        </Dialog>
      );

      expect(screen.queryByTestId('dialog-footer')).not.toBeInTheDocument();
    });

    it('should hide footer when hideFooter is true', () => {
      render(
        <Dialog
          isOpen={true}
          onClose={jest.fn()}
          footer={<button>Save</button>}
          hideFooter
        >
          <p>Content</p>
        </Dialog>
      );

      expect(screen.queryByTestId('dialog-footer')).not.toBeInTheDocument();
    });

    it('should render multiple buttons in footer', () => {
      render(
        <Dialog
          isOpen={true}
          onClose={jest.fn()}
          footer={
            <>
              <button>Cancel</button>
              <button>Save</button>
            </>
          }
        >
          <p>Content</p>
        </Dialog>
      );

      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });
  });

  describe('Close Button', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();

      render(
        <Dialog isOpen={true} onClose={onClose} title="My Dialog">
          <p>Content</p>
        </Dialog>
      );

      await user.click(screen.getByTestId('dialog-close'));

      expect(onClose).toHaveBeenCalled();
    });

    it('should have aria-label on close button', () => {
      render(
        <Dialog isOpen={true} onClose={jest.fn()} title="My Dialog">
          <p>Content</p>
        </Dialog>
      );

      expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();
    });
  });

  describe('Modal Props', () => {
    it('should pass size prop to Modal', () => {
      render(
        <Dialog isOpen={true} onClose={jest.fn()} size="lg">
          <p>Content</p>
        </Dialog>
      );

      expect(screen.getByTestId('modal')).toHaveClass('modal-lg');
    });

    it('should pass closeOnEsc prop to Modal', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();

      render(
        <Dialog isOpen={true} onClose={onClose} closeOnEsc={false}>
          <p>Content</p>
        </Dialog>
      );

      await user.keyboard('{Escape}');

      expect(onClose).not.toHaveBeenCalled();
    });

    it('should pass closeOnOverlayClick prop to Modal', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();

      render(
        <Dialog isOpen={true} onClose={onClose} closeOnOverlayClick={false}>
          <p>Content</p>
        </Dialog>
      );

      const overlay = screen.getByTestId('modal-overlay');
      await user.click(overlay);

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Complete Dialog', () => {
    it('should render all parts together', () => {
      render(
        <Dialog
          isOpen={true}
          onClose={jest.fn()}
          title="Complete Dialog"
          footer={
            <>
              <button>Cancel</button>
              <button>Save</button>
            </>
          }
        >
          <p>This is the body content</p>
        </Dialog>
      );

      expect(screen.getByTestId('dialog-header')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-title')).toHaveTextContent('Complete Dialog');
      expect(screen.getByTestId('dialog-close')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-body')).toBeInTheDocument();
      expect(screen.getByText('This is the body content')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-footer')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });
  });
});
