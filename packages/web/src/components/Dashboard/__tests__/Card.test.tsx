/**
 * Tests for Card Component
 * Coverage: Variants, padding, click handlers, loading state
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Card } from '../Card';

describe('Card', () => {
  describe('Rendering', () => {
    it('should render card', () => {
      render(<Card>Content</Card>);
      expect(screen.getByTestId('card')).toBeInTheDocument();
    });

    it('should render children content', () => {
      render(<Card>Test Content</Card>);
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should render title when provided', () => {
      render(<Card title="Card Title">Content</Card>);
      expect(screen.getByText('Card Title')).toBeInTheDocument();
    });

    it('should render subtitle when provided', () => {
      render(<Card title="Title" subtitle="Subtitle">Content</Card>);
      expect(screen.getByText('Subtitle')).toBeInTheDocument();
    });

    it('should render header actions', () => {
      render(
        <Card headerActions={<button>Action</button>}>Content</Card>
      );
      expect(screen.getByText('Action')).toBeInTheDocument();
    });

    it('should render footer', () => {
      render(<Card footer={<div>Footer Content</div>}>Content</Card>);
      expect(screen.getByText('Footer Content')).toBeInTheDocument();
    });

    it('should not render header when no title, subtitle, or actions', () => {
      render(<Card>Content</Card>);
      expect(screen.queryByTestId('card-header')).not.toBeInTheDocument();
    });

    it('should not render footer when not provided', () => {
      render(<Card>Content</Card>);
      expect(screen.queryByTestId('card-footer')).not.toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should apply default variant', () => {
      render(<Card>Content</Card>);
      expect(screen.getByTestId('card')).toHaveClass('card-default');
    });

    it('should apply bordered variant', () => {
      render(<Card variant="bordered">Content</Card>);
      expect(screen.getByTestId('card')).toHaveClass('card-bordered');
    });

    it('should apply elevated variant', () => {
      render(<Card variant="elevated">Content</Card>);
      expect(screen.getByTestId('card')).toHaveClass('card-elevated');
    });

    it('should apply flat variant', () => {
      render(<Card variant="flat">Content</Card>);
      expect(screen.getByTestId('card')).toHaveClass('card-flat');
    });
  });

  describe('Padding', () => {
    it('should apply medium padding by default', () => {
      render(<Card>Content</Card>);
      expect(screen.getByTestId('card')).toHaveClass('card-padding-md');
    });

    it('should apply no padding', () => {
      render(<Card padding="none">Content</Card>);
      expect(screen.getByTestId('card')).toHaveClass('card-padding-none');
    });

    it('should apply small padding', () => {
      render(<Card padding="sm">Content</Card>);
      expect(screen.getByTestId('card')).toHaveClass('card-padding-sm');
    });

    it('should apply large padding', () => {
      render(<Card padding="lg">Content</Card>);
      expect(screen.getByTestId('card')).toHaveClass('card-padding-lg');
    });
  });

  describe('Click Handler', () => {
    it('should call onClick when card is clicked', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();

      render(<Card onClick={onClick}>Content</Card>);

      await user.click(screen.getByTestId('card'));
      expect(onClick).toHaveBeenCalled();
    });

    it('should have clickable class when onClick is provided', () => {
      render(<Card onClick={jest.fn()}>Content</Card>);
      expect(screen.getByTestId('card')).toHaveClass('card-clickable');
    });

    it('should have button role when clickable', () => {
      render(<Card onClick={jest.fn()}>Content</Card>);
      expect(screen.getByTestId('card')).toHaveAttribute('role', 'button');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();

      render(<Card onClick={onClick}>Content</Card>);

      const card = screen.getByTestId('card');
      card.focus();
      await user.keyboard('{Enter}');

      expect(onClick).toHaveBeenCalled();
    });

    it('should trigger onClick on space key', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();

      render(<Card onClick={onClick}>Content</Card>);

      const card = screen.getByTestId('card');
      card.focus();
      await user.keyboard(' ');

      expect(onClick).toHaveBeenCalled();
    });

    it('should have tabIndex when clickable', () => {
      render(<Card onClick={jest.fn()}>Content</Card>);
      expect(screen.getByTestId('card')).toHaveAttribute('tabIndex', '0');
    });

    it('should not have tabIndex when not clickable', () => {
      render(<Card>Content</Card>);
      expect(screen.getByTestId('card')).not.toHaveAttribute('tabIndex');
    });

    it('should not call onClick when loading', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();

      render(<Card onClick={onClick} isLoading>Content</Card>);

      await user.click(screen.getByTestId('card'));
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should show loading state', () => {
      render(<Card isLoading>Content</Card>);
      expect(screen.getByTestId('card-loading')).toBeInTheDocument();
    });

    it('should hide content when loading', () => {
      render(<Card isLoading>Content</Card>);
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });

    it('should show spinner when loading', () => {
      render(<Card isLoading>Content</Card>);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should have loading class', () => {
      render(<Card isLoading>Content</Card>);
      expect(screen.getByTestId('card')).toHaveClass('card-loading');
    });

    it('should show content when not loading', () => {
      render(<Card isLoading={false}>Content</Card>);
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.queryByTestId('card-loading')).not.toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      render(<Card className="custom-card">Content</Card>);
      expect(screen.getByTestId('card')).toHaveClass('custom-card');
    });

    it('should preserve base classes', () => {
      render(<Card className="custom-card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('card');
      expect(card).toHaveClass('custom-card');
    });
  });

  describe('Custom Test ID', () => {
    it('should use custom test ID', () => {
      render(<Card data-testid="my-card">Content</Card>);
      expect(screen.getByTestId('my-card')).toBeInTheDocument();
    });

    it('should apply custom test ID to nested elements', () => {
      render(
        <Card data-testid="my-card" title="Title">
          Content
        </Card>
      );
      expect(screen.getByTestId('my-card-title')).toBeInTheDocument();
    });
  });

  describe('Header Structure', () => {
    it('should render header with title and actions', () => {
      render(
        <Card
          title="Title"
          headerActions={<button>Action</button>}
        >
          Content
        </Card>
      );

      const header = screen.getByTestId('card-header');
      expect(header).toBeInTheDocument();
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
    });

    it('should render header with title and subtitle', () => {
      render(
        <Card title="Title" subtitle="Subtitle">
          Content
        </Card>
      );

      expect(screen.getByTestId('card-title')).toHaveTextContent('Title');
      expect(screen.getByTestId('card-subtitle')).toHaveTextContent('Subtitle');
    });
  });

  describe('Body Structure', () => {
    it('should always render body', () => {
      render(<Card>Content</Card>);
      expect(screen.getByTestId('card-body')).toBeInTheDocument();
    });

    it('should contain content in body', () => {
      render(<Card>Test Content</Card>);
      const body = screen.getByTestId('card-body');
      expect(body).toHaveTextContent('Test Content');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes when clickable', () => {
      render(<Card onClick={jest.fn()}>Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('role', 'button');
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('should not have button role when not clickable', () => {
      render(<Card>Content</Card>);
      expect(screen.getByTestId('card')).not.toHaveAttribute('role');
    });
  });
});
