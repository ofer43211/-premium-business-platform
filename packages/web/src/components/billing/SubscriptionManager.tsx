/**
 * Subscription Manager Component
 * Handles user subscription management and billing
 */
import React, { useState } from 'react';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
}

export interface SubscriptionManagerProps {
  currentPlan?: SubscriptionPlan;
  availablePlans: SubscriptionPlan[];
  onSubscribe: (planId: string) => Promise<void>;
  onCancel: () => Promise<void>;
  onUpdatePaymentMethod: () => Promise<void>;
}

export const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({
  currentPlan,
  availablePlans,
  onSubscribe,
  onCancel,
  onUpdatePaymentMethod,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    try {
      setLoading(true);
      setError(null);
      await onSubscribe(planId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Subscription failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onCancel();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cancellation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePaymentMethod = async () => {
    try {
      setLoading(true);
      setError(null);
      await onUpdatePaymentMethod();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="subscription-manager" data-testid="subscription-manager">
      {error && (
        <div className="error-message" role="alert" data-testid="error-message">
          {error}
        </div>
      )}

      {currentPlan && (
        <div className="current-plan" data-testid="current-plan">
          <h2>Current Plan: {currentPlan.name}</h2>
          <p>
            {currentPlan.price} {currentPlan.currency} / {currentPlan.interval}
          </p>
          <div className="actions">
            <button
              onClick={handleUpdatePaymentMethod}
              disabled={loading}
              data-testid="update-payment-btn"
            >
              Update Payment Method
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="cancel-btn"
              data-testid="cancel-subscription-btn"
            >
              Cancel Subscription
            </button>
          </div>
        </div>
      )}

      <div className="available-plans" data-testid="available-plans">
        <h2>Available Plans</h2>
        {availablePlans.map((plan) => (
          <div
            key={plan.id}
            className="plan-card"
            data-testid={`plan-${plan.id}`}
          >
            <h3>{plan.name}</h3>
            <p className="price">
              {plan.price} {plan.currency} / {plan.interval}
            </p>
            <ul>
              {plan.features.map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={loading || currentPlan?.id === plan.id}
              data-testid={`subscribe-${plan.id}`}
            >
              {currentPlan?.id === plan.id ? 'Current Plan' : 'Subscribe'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
