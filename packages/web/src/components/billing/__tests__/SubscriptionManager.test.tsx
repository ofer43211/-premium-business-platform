/**
 * Tests for SubscriptionManager Component
 * Coverage: Subscription lifecycle, error handling, user interactions
 */
import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SubscriptionManager, SubscriptionPlan } from '../SubscriptionManager';

describe('SubscriptionManager', () => {
  const mockPlans: SubscriptionPlan[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: 9.99,
      currency: 'USD',
      interval: 'month',
      features: ['Feature 1', 'Feature 2'],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 19.99,
      currency: 'USD',
      interval: 'month',
      features: ['Feature 1', 'Feature 2', 'Feature 3'],
    },
  ];

  const mockCallbacks = {
    onSubscribe: jest.fn(),
    onCancel: jest.fn(),
    onUpdatePaymentMethod: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.confirm
    global.confirm = jest.fn(() => true);
  });

  describe('Rendering', () => {
    it('should render available plans', () => {
      render(
        <SubscriptionManager
          availablePlans={mockPlans}
          {...mockCallbacks}
        />
      );

      expect(screen.getByTestId('available-plans')).toBeInTheDocument();
      expect(screen.getByTestId('plan-basic')).toBeInTheDocument();
      expect(screen.getByTestId('plan-pro')).toBeInTheDocument();
    });

    it('should render current plan when provided', () => {
      render(
        <SubscriptionManager
          currentPlan={mockPlans[0]}
          availablePlans={mockPlans}
          {...mockCallbacks}
        />
      );

      const currentPlan = screen.getByTestId('current-plan');
      expect(currentPlan).toBeInTheDocument();
      expect(within(currentPlan).getByText(/Basic/)).toBeInTheDocument();
    });

    it('should display plan features', () => {
      render(
        <SubscriptionManager
          availablePlans={mockPlans}
          {...mockCallbacks}
        />
      );

      const proPlan = screen.getByTestId('plan-pro');
      expect(within(proPlan).getByText('Feature 1')).toBeInTheDocument();
      expect(within(proPlan).getByText('Feature 3')).toBeInTheDocument();
    });
  });

  describe('Subscription Actions', () => {
    it('should call onSubscribe when subscribe button is clicked', async () => {
      const user = userEvent.setup();
      mockCallbacks.onSubscribe.mockResolvedValue(undefined);

      render(
        <SubscriptionManager
          availablePlans={mockPlans}
          {...mockCallbacks}
        />
      );

      const subscribeBtn = screen.getByTestId('subscribe-pro');
      await user.click(subscribeBtn);

      await waitFor(() => {
        expect(mockCallbacks.onSubscribe).toHaveBeenCalledWith('pro');
      });
    });

    it('should disable buttons while loading', async () => {
      const user = userEvent.setup();
      let resolveSubscribe: () => void;
      mockCallbacks.onSubscribe.mockImplementation(
        () => new Promise(resolve => { resolveSubscribe = resolve as () => void; })
      );

      render(
        <SubscriptionManager
          availablePlans={mockPlans}
          {...mockCallbacks}
        />
      );

      const subscribeBtn = screen.getByTestId('subscribe-basic');
      await user.click(subscribeBtn);

      expect(subscribeBtn).toBeDisabled();

      resolveSubscribe!();
      await waitFor(() => {
        expect(subscribeBtn).not.toBeDisabled();
      });
    });

    it('should display error when subscription fails', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Payment method required';
      mockCallbacks.onSubscribe.mockRejectedValue(new Error(errorMessage));

      render(
        <SubscriptionManager
          availablePlans={mockPlans}
          {...mockCallbacks}
        />
      );

      await user.click(screen.getByTestId('subscribe-basic'));

      await waitFor(() => {
        const errorElement = screen.getByTestId('error-message');
        expect(errorElement).toHaveTextContent(errorMessage);
        expect(errorElement).toHaveAttribute('role', 'alert');
      });
    });

    it('should disable subscribe button for current plan', () => {
      render(
        <SubscriptionManager
          currentPlan={mockPlans[0]}
          availablePlans={mockPlans}
          {...mockCallbacks}
        />
      );

      const currentPlanBtn = screen.getByTestId('subscribe-basic');
      expect(currentPlanBtn).toBeDisabled();
      expect(currentPlanBtn).toHaveTextContent('Current Plan');
    });
  });

  describe('Cancellation Flow', () => {
    it('should call onCancel when cancel button is clicked and confirmed', async () => {
      const user = userEvent.setup();
      mockCallbacks.onCancel.mockResolvedValue(undefined);

      render(
        <SubscriptionManager
          currentPlan={mockPlans[0]}
          availablePlans={mockPlans}
          {...mockCallbacks}
        />
      );

      const cancelBtn = screen.getByTestId('cancel-subscription-btn');
      await user.click(cancelBtn);

      expect(global.confirm).toHaveBeenCalledWith(
        'Are you sure you want to cancel your subscription?'
      );
      await waitFor(() => {
        expect(mockCallbacks.onCancel).toHaveBeenCalled();
      });
    });

    it('should not cancel when user declines confirmation', async () => {
      const user = userEvent.setup();
      global.confirm = jest.fn(() => false);

      render(
        <SubscriptionManager
          currentPlan={mockPlans[0]}
          availablePlans={mockPlans}
          {...mockCallbacks}
        />
      );

      await user.click(screen.getByTestId('cancel-subscription-btn'));

      expect(mockCallbacks.onCancel).not.toHaveBeenCalled();
    });

    it('should display error when cancellation fails', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Cancellation failed';
      mockCallbacks.onCancel.mockRejectedValue(new Error(errorMessage));

      render(
        <SubscriptionManager
          currentPlan={mockPlans[0]}
          availablePlans={mockPlans}
          {...mockCallbacks}
        />
      );

      await user.click(screen.getByTestId('cancel-subscription-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent(errorMessage);
      });
    });
  });

  describe('Payment Method Update', () => {
    it('should call onUpdatePaymentMethod when update button is clicked', async () => {
      const user = userEvent.setup();
      mockCallbacks.onUpdatePaymentMethod.mockResolvedValue(undefined);

      render(
        <SubscriptionManager
          currentPlan={mockPlans[0]}
          availablePlans={mockPlans}
          {...mockCallbacks}
        />
      );

      await user.click(screen.getByTestId('update-payment-btn'));

      await waitFor(() => {
        expect(mockCallbacks.onUpdatePaymentMethod).toHaveBeenCalled();
      });
    });

    it('should display error when payment method update fails', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Update failed';
      mockCallbacks.onUpdatePaymentMethod.mockRejectedValue(new Error(errorMessage));

      render(
        <SubscriptionManager
          currentPlan={mockPlans[0]}
          availablePlans={mockPlans}
          {...mockCallbacks}
        />
      );

      await user.click(screen.getByTestId('update-payment-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent(errorMessage);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle non-Error objects in catch blocks', async () => {
      const user = userEvent.setup();
      mockCallbacks.onSubscribe.mockRejectedValue('string error');

      render(
        <SubscriptionManager
          availablePlans={mockPlans}
          {...mockCallbacks}
        />
      );

      await user.click(screen.getByTestId('subscribe-basic'));

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Subscription failed');
      });
    });

    it('should clear previous errors when performing new action', async () => {
      const user = userEvent.setup();
      mockCallbacks.onSubscribe
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce(undefined);

      render(
        <SubscriptionManager
          availablePlans={mockPlans}
          {...mockCallbacks}
        />
      );

      const subscribeBtn = screen.getByTestId('subscribe-basic');

      // First attempt - should show error
      await user.click(subscribeBtn);
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      // Second attempt - error should be cleared
      await user.click(subscribeBtn);
      await waitFor(() => {
        expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
      });
    });
  });
});
