/**
 * Tests for Button Component
 * Coverage: Variants, sizes, states, icons, accessibility
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

describe('Button', () => {
  describe('Basic Rendering', () => {
    it('should render button', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByTestId('button')).toBeInTheDocument();
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('should have type button by default', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByTestId('button')).toHaveAttribute('type', 'button');
    });

    it('should accept custom type', () => {
      render(<Button type="submit">Submit</Button>);
      expect(screen.getByTestId('button')).toHaveAttribute('type', 'submit');
    });

    it('should apply custom className', () => {
      render(<Button className="custom-class">Click</Button>);
      expect(screen.getByTestId('button')).toHaveClass('custom-class');
    });
  });

  describe('Variants', () => {
    it('should have primary variant by default', () => {
      render(<Button>Click</Button>);
      expect(screen.getByTestId('button')).toHaveClass('button-primary');
    });

    it('should apply secondary variant', () => {
      render(<Button variant="secondary">Click</Button>);
      expect(screen.getByTestId('button')).toHaveClass('button-secondary');
    });

    it('should apply outline variant', () => {
      render(<Button variant="outline">Click</Button>);
      expect(screen.getByTestId('button')).toHaveClass('button-outline');
    });

    it('should apply ghost variant', () => {
      render(<Button variant="ghost">Click</Button>);
      expect(screen.getByTestId('button')).toHaveClass('button-ghost');
    });

    it('should apply danger variant', () => {
      render(<Button variant="danger">Click</Button>);
      expect(screen.getByTestId('button')).toHaveClass('button-danger');
    });
  });

  describe('Sizes', () => {
    it('should have md size by default', () => {
      render(<Button>Click</Button>);
      expect(screen.getByTestId('button')).toHaveClass('button-md');
    });

    it('should apply sm size', () => {
      render(<Button size="sm">Click</Button>);
      expect(screen.getByTestId('button')).toHaveClass('button-sm');
    });

    it('should apply lg size', () => {
      render(<Button size="lg">Click</Button>);
      expect(screen.getByTestId('button')).toHaveClass('button-lg');
    });
  });

  describe('States', () => {
    it('should be enabled by default', () => {
      render(<Button>Click</Button>);
      expect(screen.getByTestId('button')).not.toBeDisabled();
    });

    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Click</Button>);
      expect(screen.getByTestId('button')).toBeDisabled();
    });

    it('should show loading state', () => {
      render(<Button isLoading>Click</Button>);
      expect(screen.getByTestId('button-spinner')).toBeInTheDocument();
      expect(screen.getByTestId('button')).toHaveClass('button-loading');
    });

    it('should be disabled when loading', () => {
      render(<Button isLoading>Click</Button>);
      expect(screen.getByTestId('button')).toBeDisabled();
    });

    it('should show loadingText when loading', () => {
      render(
        <Button isLoading loadingText="Saving...">
          Save
        </Button>
      );
      expect(screen.getByText('Saving...')).toBeInTheDocument();
      expect(screen.queryByText('Save')).not.toBeInTheDocument();
    });

    it('should show original text when loading without loadingText', () => {
      render(<Button isLoading>Save</Button>);
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('should have aria-busy when loading', () => {
      render(<Button isLoading>Click</Button>);
      expect(screen.getByTestId('button')).toHaveAttribute('aria-busy', 'true');
    });

    it('should not have aria-busy when not loading', () => {
      render(<Button>Click</Button>);
      expect(screen.getByTestId('button')).toHaveAttribute('aria-busy', 'false');
    });
  });

  describe('Full Width', () => {
    it('should not be full width by default', () => {
      render(<Button>Click</Button>);
      expect(screen.getByTestId('button')).not.toHaveClass('button-full-width');
    });

    it('should apply full width class', () => {
      render(<Button fullWidth>Click</Button>);
      expect(screen.getByTestId('button')).toHaveClass('button-full-width');
    });
  });

  describe('Icons', () => {
    const TestIcon = () => <span>Icon</span>;

    it('should render left icon', () => {
      render(<Button leftIcon={<TestIcon />}>Click</Button>);
      expect(screen.getByTestId('button-left-icon')).toBeInTheDocument();
    });

    it('should render right icon', () => {
      render(<Button rightIcon={<TestIcon />}>Click</Button>);
      expect(screen.getByTestId('button-right-icon')).toBeInTheDocument();
    });

    it('should render both icons', () => {
      render(
        <Button leftIcon={<TestIcon />} rightIcon={<TestIcon />}>
          Click
        </Button>
      );
      expect(screen.getByTestId('button-left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('button-right-icon')).toBeInTheDocument();
    });

    it('should not show icons when loading', () => {
      render(
        <Button isLoading leftIcon={<TestIcon />} rightIcon={<TestIcon />}>
          Click
        </Button>
      );
      expect(screen.queryByTestId('button-left-icon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('button-right-icon')).not.toBeInTheDocument();
    });

    it('should render icon only button', () => {
      render(<Button iconOnly>X</Button>);
      expect(screen.getByTestId('button')).toHaveClass('button-icon-only');
    });

    it('should not render text wrapper for icon only button', () => {
      const { container } = render(<Button iconOnly>X</Button>);
      expect(container.querySelector('.button-text')).not.toBeInTheDocument();
    });
  });

  describe('Click Handling', () => {
    it('should call onClick when clicked', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();

      render(<Button onClick={onClick}>Click</Button>);

      await user.click(screen.getByTestId('button'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();

      render(
        <Button onClick={onClick} disabled>
          Click
        </Button>
      );

      await user.click(screen.getByTestId('button'));
      expect(onClick).not.toHaveBeenCalled();
    });

    it('should not call onClick when loading', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();

      render(
        <Button onClick={onClick} isLoading>
          Click
        </Button>
      );

      await user.click(screen.getByTestId('button'));
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('Forward Ref', () => {
    it('should forward ref to button element', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Click</Button>);

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.tagName).toBe('BUTTON');
    });

    it('should allow calling focus on ref', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Click</Button>);

      ref.current?.focus();
      expect(ref.current).toHaveFocus();
    });
  });

  describe('HTML Attributes', () => {
    it('should accept aria-label', () => {
      render(<Button aria-label="Close dialog">X</Button>);
      expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();
    });

    it('should accept data attributes', () => {
      render(<Button data-testid="custom-button">Click</Button>);
      expect(screen.getByTestId('custom-button')).toBeInTheDocument();
    });

    it('should accept id attribute', () => {
      render(<Button id="submit-button">Submit</Button>);
      expect(screen.getByTestId('button')).toHaveAttribute('id', 'submit-button');
    });

    it('should accept name attribute', () => {
      render(<Button name="action">Submit</Button>);
      expect(screen.getByTestId('button')).toHaveAttribute('name', 'action');
    });
  });

  describe('Accessibility', () => {
    it('should have button role', () => {
      render(<Button>Click</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();

      render(<Button onClick={onClick}>Click</Button>);

      const button = screen.getByTestId('button');
      button.focus();
      await user.keyboard('{Enter}');

      expect(onClick).toHaveBeenCalled();
    });

    it('should have aria-hidden on spinner', () => {
      render(<Button isLoading>Click</Button>);
      const spinner = screen.getByTestId('button-spinner');
      expect(spinner).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Combined Props', () => {
    it('should apply multiple classes correctly', () => {
      render(
        <Button variant="secondary" size="lg" fullWidth className="custom">
          Click
        </Button>
      );

      const button = screen.getByTestId('button');
      expect(button).toHaveClass('button-secondary');
      expect(button).toHaveClass('button-lg');
      expect(button).toHaveClass('button-full-width');
      expect(button).toHaveClass('custom');
    });

    it('should handle all states together', () => {
      render(
        <Button
          variant="primary"
          size="sm"
          isLoading
          fullWidth
          loadingText="Loading..."
        >
          Submit
        </Button>
      );

      const button = screen.getByTestId('button');
      expect(button).toHaveClass('button-primary');
      expect(button).toHaveClass('button-sm');
      expect(button).toHaveClass('button-full-width');
      expect(button).toHaveClass('button-loading');
      expect(button).toBeDisabled();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });
});
