/**
 * Tests for StatsCard Component
 * Coverage: Stats display, trend indicators, variants
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StatsCard } from '../StatsCard';

describe('StatsCard', () => {
  describe('Rendering', () => {
    it('should render stats card', () => {
      render(<StatsCard title="Revenue" value="$12,345" />);
      expect(screen.getByTestId('stats-card')).toBeInTheDocument();
    });

    it('should render title', () => {
      render(<StatsCard title="Total Users" value="1,234" />);
      expect(screen.getByText('Total Users')).toBeInTheDocument();
    });

    it('should render value', () => {
      render(<StatsCard title="Revenue" value="$12,345" />);
      expect(screen.getByText('$12,345')).toBeInTheDocument();
    });

    it('should render numeric value', () => {
      render(<StatsCard title="Count" value={42} />);
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should render icon when provided', () => {
      render(<StatsCard title="Revenue" value="$12,345" icon={<span>💰</span>} />);
      expect(screen.getByText('💰')).toBeInTheDocument();
    });
  });

  describe('Change Indicator', () => {
    it('should render positive change', () => {
      render(<StatsCard title="Revenue" value="$12,345" change={15.5} />);
      const change = screen.getByTestId('stats-card-change');
      expect(change).toHaveTextContent('15.5%');
      expect(change).toHaveClass('stats-card-change-up');
    });

    it('should render negative change', () => {
      render(<StatsCard title="Revenue" value="$12,345" change={-8.2} />);
      const change = screen.getByTestId('stats-card-change');
      expect(change).toHaveTextContent('8.2%');
      expect(change).toHaveClass('stats-card-change-down');
    });

    it('should render zero change as neutral', () => {
      render(<StatsCard title="Revenue" value="$12,345" change={0} />);
      const change = screen.getByTestId('stats-card-change');
      expect(change).toHaveClass('stats-card-change-neutral');
    });

    it('should render change label', () => {
      render(<StatsCard title="Revenue" value="$12,345" change={15.5} changeLabel="vs last month" />);
      expect(screen.getByText('vs last month')).toBeInTheDocument();
    });

    it('should not render change when not provided', () => {
      render(<StatsCard title="Revenue" value="$12,345" />);
      expect(screen.queryByTestId('stats-card-change')).not.toBeInTheDocument();
    });

    it('should not render change label when change is undefined', () => {
      render(<StatsCard title="Revenue" value="$12,345" changeLabel="vs last month" />);
      expect(screen.queryByTestId('stats-card-change-label')).not.toBeInTheDocument();
    });

    it('should show up arrow for positive change', () => {
      render(<StatsCard title="Revenue" value="$12,345" change={10} />);
      expect(screen.getByTestId('stats-card-change')).toHaveTextContent('↑');
    });

    it('should show down arrow for negative change', () => {
      render(<StatsCard title="Revenue" value="$12,345" change={-10} />);
      expect(screen.getByTestId('stats-card-change')).toHaveTextContent('↓');
    });

    it('should show neutral arrow for zero change', () => {
      render(<StatsCard title="Revenue" value="$12,345" change={0} />);
      expect(screen.getByTestId('stats-card-change')).toHaveTextContent('→');
    });
  });

  describe('Trend Override', () => {
    it('should use explicit trend over calculated trend', () => {
      render(<StatsCard title="Revenue" value="$12,345" change={15} trend="down" />);
      const change = screen.getByTestId('stats-card-change');
      expect(change).toHaveClass('stats-card-change-down');
      expect(change).toHaveTextContent('↓');
    });

    it('should apply neutral trend when specified', () => {
      render(<StatsCard title="Revenue" value="$12,345" change={15} trend="neutral" />);
      const change = screen.getByTestId('stats-card-change');
      expect(change).toHaveClass('stats-card-change-neutral');
    });
  });

  describe('Variants', () => {
    it('should apply default variant', () => {
      render(<StatsCard title="Revenue" value="$12,345" />);
      expect(screen.getByTestId('stats-card')).toHaveClass('stats-card-default');
    });

    it('should apply primary variant', () => {
      render(<StatsCard title="Revenue" value="$12,345" variant="primary" />);
      expect(screen.getByTestId('stats-card')).toHaveClass('stats-card-primary');
    });

    it('should apply success variant', () => {
      render(<StatsCard title="Revenue" value="$12,345" variant="success" />);
      expect(screen.getByTestId('stats-card')).toHaveClass('stats-card-success');
    });

    it('should apply warning variant', () => {
      render(<StatsCard title="Revenue" value="$12,345" variant="warning" />);
      expect(screen.getByTestId('stats-card')).toHaveClass('stats-card-warning');
    });

    it('should apply danger variant', () => {
      render(<StatsCard title="Revenue" value="$12,345" variant="danger" />);
      expect(screen.getByTestId('stats-card')).toHaveClass('stats-card-danger');
    });
  });

  describe('Loading State', () => {
    it('should show loading state', () => {
      render(<StatsCard title="Revenue" value="$12,345" isLoading />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should hide content when loading', () => {
      render(<StatsCard title="Revenue" value="$12,345" isLoading />);
      expect(screen.queryByText('$12,345')).not.toBeInTheDocument();
    });
  });

  describe('Click Handler', () => {
    it('should call onClick when clicked', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();

      render(<StatsCard title="Revenue" value="$12,345" onClick={onClick} />);

      await user.click(screen.getByTestId('stats-card'));
      expect(onClick).toHaveBeenCalled();
    });

    it('should not be clickable when onClick is not provided', () => {
      render(<StatsCard title="Revenue" value="$12,345" />);
      expect(screen.getByTestId('stats-card')).not.toHaveAttribute('role', 'button');
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      render(<StatsCard title="Revenue" value="$12,345" className="custom-stats" />);
      expect(screen.getByTestId('stats-card')).toHaveClass('custom-stats');
    });
  });

  describe('Accessibility', () => {
    it('should have proper structure', () => {
      render(<StatsCard title="Revenue" value="$12,345" change={15} />);
      expect(screen.getByTestId('stats-card-title')).toBeInTheDocument();
      expect(screen.getByTestId('stats-card-value')).toBeInTheDocument();
      expect(screen.getByTestId('stats-card-change')).toBeInTheDocument();
    });
  });

  describe('Formatting', () => {
    it('should handle large numbers', () => {
      render(<StatsCard title="Revenue" value={1234567890} />);
      expect(screen.getByText('1234567890')).toBeInTheDocument();
    });

    it('should handle decimal changes', () => {
      render(<StatsCard title="Revenue" value="$12,345" change={15.678} />);
      expect(screen.getByTestId('stats-card-change')).toHaveTextContent('15.678%');
    });

    it('should display absolute value for negative changes', () => {
      render(<StatsCard title="Revenue" value="$12,345" change={-25.5} />);
      expect(screen.getByTestId('stats-card-change')).toHaveTextContent('25.5%');
    });
  });
});
