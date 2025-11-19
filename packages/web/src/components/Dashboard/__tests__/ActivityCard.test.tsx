/**
 * Tests for ActivityCard Component
 * Coverage: Activity list, view all, empty state
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActivityCard, ActivityItem } from '../ActivityCard';

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    title: 'User registered',
    description: 'New user john@example.com signed up',
    timestamp: '2 hours ago',
    type: 'success',
    icon: '✓',
  },
  {
    id: '2',
    title: 'Payment received',
    description: 'Received $500 from customer',
    timestamp: '3 hours ago',
    type: 'info',
    user: { name: 'Jane Doe', avatar: 'https://example.com/avatar.jpg' },
  },
  {
    id: '3',
    title: 'Error occurred',
    description: 'Database connection failed',
    timestamp: '5 hours ago',
    type: 'error',
    icon: '⚠️',
  },
];

describe('ActivityCard', () => {
  describe('Rendering', () => {
    it('should render activity card', () => {
      render(<ActivityCard activities={mockActivities} />);
      expect(screen.getByTestId('activity-card')).toBeInTheDocument();
    });

    it('should render default title', () => {
      render(<ActivityCard activities={mockActivities} />);
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });

    it('should render custom title', () => {
      render(<ActivityCard title="System Logs" activities={mockActivities} />);
      expect(screen.getByText('System Logs')).toBeInTheDocument();
    });

    it('should render all activities', () => {
      render(<ActivityCard activities={mockActivities} />);
      expect(screen.getByText('User registered')).toBeInTheDocument();
      expect(screen.getByText('Payment received')).toBeInTheDocument();
      expect(screen.getByText('Error occurred')).toBeInTheDocument();
    });

    it('should render activity list', () => {
      render(<ActivityCard activities={mockActivities} />);
      expect(screen.getByTestId('activity-card-list')).toBeInTheDocument();
    });
  });

  describe('Activity Items', () => {
    it('should render activity title', () => {
      render(<ActivityCard activities={mockActivities} />);
      expect(screen.getByText('User registered')).toBeInTheDocument();
    });

    it('should render activity description', () => {
      render(<ActivityCard activities={mockActivities} />);
      expect(screen.getByText('New user john@example.com signed up')).toBeInTheDocument();
    });

    it('should render activity timestamp', () => {
      render(<ActivityCard activities={mockActivities} />);
      expect(screen.getByText('2 hours ago')).toBeInTheDocument();
    });

    it('should render activity icon', () => {
      render(<ActivityCard activities={mockActivities} />);
      expect(screen.getByText('✓')).toBeInTheDocument();
      expect(screen.getByText('⚠️')).toBeInTheDocument();
    });

    it('should render user name when provided', () => {
      render(<ActivityCard activities={mockActivities} />);
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    it('should render user avatar when provided', () => {
      render(<ActivityCard activities={mockActivities} />);
      const avatar = screen.getByAltText('Jane Doe');
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });

    it('should apply type classes', () => {
      render(<ActivityCard activities={mockActivities} />);
      const successItem = screen.getByTestId('activity-card-item-0');
      expect(successItem).toHaveClass('activity-item-success');
    });
  });

  describe('Max Items', () => {
    it('should limit displayed activities', () => {
      render(<ActivityCard activities={mockActivities} maxItems={2} />);
      expect(screen.getByText('User registered')).toBeInTheDocument();
      expect(screen.getByText('Payment received')).toBeInTheDocument();
      expect(screen.queryByText('Error occurred')).not.toBeInTheDocument();
    });

    it('should show all activities by default', () => {
      render(<ActivityCard activities={mockActivities} maxItems={10} />);
      expect(screen.getByText('User registered')).toBeInTheDocument();
      expect(screen.getByText('Payment received')).toBeInTheDocument();
      expect(screen.getByText('Error occurred')).toBeInTheDocument();
    });
  });

  describe('View All', () => {
    it('should render view all button when hasMore', () => {
      render(<ActivityCard activities={mockActivities} maxItems={2} />);
      expect(screen.getByText(/View All/)).toBeInTheDocument();
    });

    it('should show total count in view all button', () => {
      render(<ActivityCard activities={mockActivities} maxItems={2} />);
      expect(screen.getByText('View All (3)')).toBeInTheDocument();
    });

    it('should call onViewAll when clicked', async () => {
      const user = userEvent.setup();
      const onViewAll = jest.fn();

      render(<ActivityCard activities={mockActivities} maxItems={2} onViewAll={onViewAll} />);

      await user.click(screen.getByText(/View All/));
      expect(onViewAll).toHaveBeenCalled();
    });

    it('should not render view all when showViewAll is false', () => {
      render(<ActivityCard activities={mockActivities} maxItems={2} showViewAll={false} />);
      expect(screen.queryByText(/View All/)).not.toBeInTheDocument();
    });

    it('should render view all with onViewAll even without hasMore', () => {
      render(<ActivityCard activities={mockActivities} maxItems={10} onViewAll={jest.fn()} />);
      expect(screen.getByText('View All')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should render empty state when no activities', () => {
      render(<ActivityCard activities={[]} />);
      expect(screen.getByTestId('activity-card-empty')).toBeInTheDocument();
    });

    it('should show default empty message', () => {
      render(<ActivityCard activities={[]} />);
      expect(screen.getByText('No recent activity')).toBeInTheDocument();
    });

    it('should show custom empty message', () => {
      render(<ActivityCard activities={[]} emptyMessage="No logs available" />);
      expect(screen.getByText('No logs available')).toBeInTheDocument();
    });

    it('should not render view all when empty', () => {
      render(<ActivityCard activities={[]} />);
      expect(screen.queryByText(/View All/)).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading state', () => {
      render(<ActivityCard activities={mockActivities} isLoading />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should hide activities when loading', () => {
      render(<ActivityCard activities={mockActivities} isLoading />);
      expect(screen.queryByText('User registered')).not.toBeInTheDocument();
    });
  });

  describe('Click Handlers', () => {
    it('should call activity onClick when clicked', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();

      const activities: ActivityItem[] = [
        { ...mockActivities[0], onClick },
      ];

      render(<ActivityCard activities={activities} />);

      await user.click(screen.getByText('User registered'));
      expect(onClick).toHaveBeenCalled();
    });

    it('should have clickable class when onClick provided', () => {
      const activities: ActivityItem[] = [
        { ...mockActivities[0], onClick: jest.fn() },
      ];

      render(<ActivityCard activities={activities} />);

      const item = screen.getByTestId('activity-card-item-0');
      expect(item).toHaveClass('activity-item-clickable');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();

      const activities: ActivityItem[] = [
        { ...mockActivities[0], onClick },
      ];

      render(<ActivityCard activities={activities} />);

      const item = screen.getByTestId('activity-card-item-0');
      item.focus();
      await user.keyboard('{Enter}');

      expect(onClick).toHaveBeenCalled();
    });

    it('should not be clickable without onClick', () => {
      render(<ActivityCard activities={mockActivities} />);
      const item = screen.getByTestId('activity-card-item-0');
      expect(item).not.toHaveClass('activity-item-clickable');
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      render(<ActivityCard activities={mockActivities} className="custom-activity" />);
      expect(screen.getByTestId('activity-card')).toHaveClass('custom-activity');
    });
  });

  describe('Accessibility', () => {
    it('should have button role for clickable items', () => {
      const activities: ActivityItem[] = [
        { ...mockActivities[0], onClick: jest.fn() },
      ];

      render(<ActivityCard activities={activities} />);

      const item = screen.getByTestId('activity-card-item-0');
      expect(item).toHaveAttribute('role', 'button');
      expect(item).toHaveAttribute('tabIndex', '0');
    });

    it('should not have button role for non-clickable items', () => {
      render(<ActivityCard activities={mockActivities} />);
      const item = screen.getByTestId('activity-card-item-0');
      expect(item).not.toHaveAttribute('role');
    });
  });
});
