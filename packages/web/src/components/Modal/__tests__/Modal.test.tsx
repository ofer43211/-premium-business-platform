/**
 * Tests for Modal Component
 * Coverage: Open/close, focus trap, ESC, overlay click, sizes
 */
import React, { useRef } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '../Modal';

describe('Modal', () => {
  beforeEach(() => {
    // Reset body overflow
    document.body.style.overflow = '';
  });

  describe('Rendering', () => {
    it('should not render when closed', () => {
      render(
        <Modal isOpen={false} onClose={jest.fn()}>
          <div>Content</div>
        </Modal>
      );

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('should render when open', () => {
      render(
        <Modal isOpen={true} onClose={jest.fn()}>
          <div>Content</div>
        </Modal>
      );

      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should render overlay', () => {
      render(
        <Modal isOpen={true} onClose={jest.fn()}>
          <div>Content</div>
        </Modal>
      );

      expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(
        <Modal isOpen={true} onClose={jest.fn()} className="custom-modal">
          <div>Content</div>
        </Modal>
      );

      expect(screen.getByTestId('modal')).toHaveClass('custom-modal');
    });
  });

  describe('Sizes', () => {
    it('should have md size by default', () => {
      render(
        <Modal isOpen={true} onClose={jest.fn()}>
          <div>Content</div>
        </Modal>
      );

      expect(screen.getByTestId('modal')).toHaveClass('modal-md');
    });

    it('should apply sm size', () => {
      render(
        <Modal isOpen={true} onClose={jest.fn()} size="sm">
          <div>Content</div>
        </Modal>
      );

      expect(screen.getByTestId('modal')).toHaveClass('modal-sm');
    });

    it('should apply lg size', () => {
      render(
        <Modal isOpen={true} onClose={jest.fn()} size="lg">
          <div>Content</div>
        </Modal>
      );

      expect(screen.getByTestId('modal')).toHaveClass('modal-lg');
    });

    it('should apply xl size', () => {
      render(
        <Modal isOpen={true} onClose={jest.fn()} size="xl">
          <div>Content</div>
        </Modal>
      );

      expect(screen.getByTestId('modal')).toHaveClass('modal-xl');
    });

    it('should apply full size', () => {
      render(
        <Modal isOpen={true} onClose={jest.fn()} size="full">
          <div>Content</div>
        </Modal>
      );

      expect(screen.getByTestId('modal')).toHaveClass('modal-full');
    });
  });

  describe('Close Behavior', () => {
    it('should call onClose when ESC is pressed', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();

      render(
        <Modal isOpen={true} onClose={onClose}>
          <div>Content</div>
        </Modal>
      );

      await user.keyboard('{Escape}');

      expect(onClose).toHaveBeenCalled();
    });

    it('should not close on ESC when closeOnEsc is false', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();

      render(
        <Modal isOpen={true} onClose={onClose} closeOnEsc={false}>
          <div>Content</div>
        </Modal>
      );

      await user.keyboard('{Escape}');

      expect(onClose).not.toHaveBeenCalled();
    });

    it('should call onClose when overlay is clicked', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();

      render(
        <Modal isOpen={true} onClose={onClose}>
          <div>Content</div>
        </Modal>
      );

      const overlay = screen.getByTestId('modal-overlay');
      await user.click(overlay);

      expect(onClose).toHaveBeenCalled();
    });

    it('should not close when modal content is clicked', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();

      render(
        <Modal isOpen={true} onClose={onClose}>
          <div>Content</div>
        </Modal>
      );

      const modal = screen.getByTestId('modal');
      await user.click(modal);

      expect(onClose).not.toHaveBeenCalled();
    });

    it('should not close on overlay click when closeOnOverlayClick is false', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();

      render(
        <Modal isOpen={true} onClose={onClose} closeOnOverlayClick={false}>
          <div>Content</div>
        </Modal>
      );

      const overlay = screen.getByTestId('modal-overlay');
      await user.click(overlay);

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Focus Management', () => {
    it('should focus first focusable element on open', async () => {
      render(
        <Modal isOpen={true} onClose={jest.fn()}>
          <button>First Button</button>
          <button>Second Button</button>
        </Modal>
      );

      await waitFor(() => {
        expect(screen.getByText('First Button')).toHaveFocus();
      });
    });

    it('should focus initialFocusRef element when provided', async () => {
      function TestComponent() {
        const buttonRef = useRef<HTMLButtonElement>(null);

        return (
          <Modal isOpen={true} onClose={jest.fn()} initialFocusRef={buttonRef}>
            <button>First</button>
            <button ref={buttonRef}>Second (Focus me)</button>
          </Modal>
        );
      }

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByText('Second (Focus me)')).toHaveFocus();
      });
    });

    it('should return focus to previous element on close', async () => {
      function TestComponent() {
        const [isOpen, setIsOpen] = React.useState(false);

        return (
          <>
            <button onClick={() => setIsOpen(true)}>Open Modal</button>
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
              <button onClick={() => setIsOpen(false)}>Close</button>
            </Modal>
          </>
        );
      }

      const user = userEvent.setup();
      render(<TestComponent />);

      const openButton = screen.getByText('Open Modal');

      // Focus and click open button
      openButton.focus();
      await user.click(openButton);

      // Modal should be open
      expect(screen.getByText('Close')).toBeInTheDocument();

      // Close modal
      await user.click(screen.getByText('Close'));

      // Focus should return to open button
      await waitFor(() => {
        expect(openButton).toHaveFocus();
      });
    });

    it('should not return focus when returnFocusOnClose is false', async () => {
      function TestComponent() {
        const [isOpen, setIsOpen] = React.useState(false);

        return (
          <>
            <button onClick={() => setIsOpen(true)}>Open Modal</button>
            <Modal
              isOpen={isOpen}
              onClose={() => setIsOpen(false)}
              returnFocusOnClose={false}
            >
              <button onClick={() => setIsOpen(false)}>Close</button>
            </Modal>
          </>
        );
      }

      const user = userEvent.setup();
      render(<TestComponent />);

      const openButton = screen.getByText('Open Modal');

      openButton.focus();
      await user.click(openButton);
      await user.click(screen.getByText('Close'));

      // Focus should NOT return
      expect(openButton).not.toHaveFocus();
    });
  });

  describe('Focus Trap', () => {
    it('should trap focus within modal', async () => {
      const user = userEvent.setup();

      render(
        <Modal isOpen={true} onClose={jest.fn()}>
          <button>First</button>
          <button>Second</button>
          <button>Third</button>
        </Modal>
      );

      await waitFor(() => {
        expect(screen.getByText('First')).toHaveFocus();
      });

      // Tab through elements
      await user.tab();
      expect(screen.getByText('Second')).toHaveFocus();

      await user.tab();
      expect(screen.getByText('Third')).toHaveFocus();

      // Tab from last element should go back to first
      await user.tab();
      expect(screen.getByText('First')).toHaveFocus();
    });

    it('should trap focus backwards with Shift+Tab', async () => {
      const user = userEvent.setup();

      render(
        <Modal isOpen={true} onClose={jest.fn()}>
          <button>First</button>
          <button>Second</button>
          <button>Third</button>
        </Modal>
      );

      await waitFor(() => {
        expect(screen.getByText('First')).toHaveFocus();
      });

      // Shift+Tab from first element should go to last
      await user.tab({ shift: true });
      expect(screen.getByText('Third')).toHaveFocus();

      await user.tab({ shift: true });
      expect(screen.getByText('Second')).toHaveFocus();
    });
  });

  describe('Body Scroll Lock', () => {
    it('should lock body scroll when open', () => {
      const { rerender } = render(
        <Modal isOpen={false} onClose={jest.fn()}>
          <div>Content</div>
        </Modal>
      );

      expect(document.body.style.overflow).toBe('');

      rerender(
        <Modal isOpen={true} onClose={jest.fn()}>
          <div>Content</div>
        </Modal>
      );

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body scroll when closed', () => {
      const { rerender } = render(
        <Modal isOpen={true} onClose={jest.fn()}>
          <div>Content</div>
        </Modal>
      );

      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <Modal isOpen={false} onClose={jest.fn()}>
          <div>Content</div>
        </Modal>
      );

      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('Z-Index', () => {
    it('should have default z-index', () => {
      render(
        <Modal isOpen={true} onClose={jest.fn()}>
          <div>Content</div>
        </Modal>
      );

      const overlay = screen.getByTestId('modal-overlay');
      expect(overlay).toHaveStyle({ zIndex: 1000 });
    });

    it('should accept custom z-index', () => {
      render(
        <Modal isOpen={true} onClose={jest.fn()} zIndex={2000}>
          <div>Content</div>
        </Modal>
      );

      const overlay = screen.getByTestId('modal-overlay');
      expect(overlay).toHaveStyle({ zIndex: 2000 });
    });
  });

  describe('Accessibility', () => {
    it('should have role dialog', () => {
      render(
        <Modal isOpen={true} onClose={jest.fn()}>
          <div>Content</div>
        </Modal>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have aria-modal', () => {
      render(
        <Modal isOpen={true} onClose={jest.fn()}>
          <div>Content</div>
        </Modal>
      );

      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });
  });
});
