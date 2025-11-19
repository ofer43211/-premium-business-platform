/**
 * Tests for Stripe Webhook Handler
 * Coverage: All webhook events, error handling, Firestore updates
 */
import { StripeWebhookHandler, SubscriptionData } from '../handler';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    webhooks: {
      constructEvent: jest.fn(),
    },
    subscriptions: {
      retrieve: jest.fn(),
    },
  }));
});

describe('StripeWebhookHandler', () => {
  let handler: StripeWebhookHandler;
  let mockDb: any;
  let mockCollection: jest.Mock;
  let mockDoc: jest.Mock;
  let mockSet: jest.Mock;
  let mockUpdate: jest.Mock;

  beforeEach(() => {
    // Setup Firestore mocks
    mockSet = jest.fn().mockResolvedValue({});
    mockUpdate = jest.fn().mockResolvedValue({});
    mockDoc = jest.fn().mockReturnValue({
      set: mockSet,
      update: mockUpdate,
      collection: jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnValue({
          set: mockSet,
          update: mockUpdate,
          collection: jest.fn().mockReturnValue({
            doc: jest.fn().mockReturnValue({
              set: mockSet,
            }),
          }),
        }),
      }),
    });
    mockCollection = jest.fn().mockReturnValue({
      doc: mockDoc,
    });

    mockDb = {
      collection: mockCollection,
    } as any;

    handler = new StripeWebhookHandler(mockDb);
  });

  describe('Subscription Created', () => {
    it('should handle subscription created event', async () => {
      const mockSubscription: Partial<Stripe.Subscription> = {
        id: 'sub_123',
        customer: 'cus_123',
        status: 'active',
        metadata: { userId: 'user_123' },
        items: {
          data: [
            {
              price: { id: 'price_123' },
            } as Stripe.SubscriptionItem,
          ],
        } as Stripe.ApiList<Stripe.SubscriptionItem>,
        current_period_end: 1234567890,
        cancel_at_period_end: false,
      };

      await handler.handleSubscriptionCreated(mockSubscription as Stripe.Subscription);

      expect(mockCollection).toHaveBeenCalledWith('users');
      expect(mockDoc).toHaveBeenCalledWith('user_123');
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          subscriptionId: 'sub_123',
          customerId: 'cus_123',
          status: 'active',
          planId: 'price_123',
        }),
        { merge: true }
      );
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          subscriptionStatus: 'active',
        })
      );
    });

    it('should throw error if userId is missing in metadata', async () => {
      const mockSubscription: Partial<Stripe.Subscription> = {
        id: 'sub_123',
        metadata: {},
      };

      await expect(
        handler.handleSubscriptionCreated(mockSubscription as Stripe.Subscription)
      ).rejects.toThrow('Missing userId in subscription metadata');
    });

    it('should handle subscription with no price items', async () => {
      const mockSubscription: Partial<Stripe.Subscription> = {
        id: 'sub_123',
        customer: 'cus_123',
        status: 'active',
        metadata: { userId: 'user_123' },
        items: {
          data: [],
        } as Stripe.ApiList<Stripe.SubscriptionItem>,
        current_period_end: 1234567890,
        cancel_at_period_end: false,
      };

      await handler.handleSubscriptionCreated(mockSubscription as Stripe.Subscription);

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          planId: '',
        }),
        { merge: true }
      );
    });
  });

  describe('Subscription Updated', () => {
    it('should handle subscription updated event', async () => {
      const mockSubscription: Partial<Stripe.Subscription> = {
        id: 'sub_123',
        customer: 'cus_123',
        status: 'past_due',
        metadata: { userId: 'user_123' },
        items: {
          data: [
            {
              price: { id: 'price_123' },
            } as Stripe.SubscriptionItem,
          ],
        } as Stripe.ApiList<Stripe.SubscriptionItem>,
        current_period_end: 1234567890,
        cancel_at_period_end: false,
      };

      await handler.handleSubscriptionUpdated(mockSubscription as Stripe.Subscription);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          subscriptionStatus: 'past_due',
        })
      );
    });

    it('should handle subscription with cancel_at_period_end set', async () => {
      const mockSubscription: Partial<Stripe.Subscription> = {
        id: 'sub_123',
        customer: 'cus_123',
        status: 'active',
        metadata: { userId: 'user_123' },
        items: {
          data: [
            {
              price: { id: 'price_123' },
            } as Stripe.SubscriptionItem,
          ],
        } as Stripe.ApiList<Stripe.SubscriptionItem>,
        current_period_end: 1234567890,
        cancel_at_period_end: true,
      };

      await handler.handleSubscriptionUpdated(mockSubscription as Stripe.Subscription);

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          cancelAtPeriodEnd: true,
        }),
        { merge: true }
      );
    });
  });

  describe('Subscription Deleted', () => {
    it('should handle subscription deleted event', async () => {
      const mockSubscription: Partial<Stripe.Subscription> = {
        id: 'sub_123',
        metadata: { userId: 'user_123' },
      };

      await handler.handleSubscriptionDeleted(mockSubscription as Stripe.Subscription);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          subscriptionStatus: 'canceled',
        })
      );
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'canceled',
        })
      );
    });
  });

  describe('Payment Succeeded', () => {
    it('should handle payment succeeded event', async () => {
      const mockInvoice: Partial<Stripe.Invoice> = {
        id: 'inv_123',
        metadata: { userId: 'user_123' },
        amount_paid: 1999,
        currency: 'usd',
        period_start: 1234567890,
        period_end: 1234567890,
      };

      await handler.handlePaymentSucceeded(mockInvoice as Stripe.Invoice);

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          invoiceId: 'inv_123',
          amount: 1999,
          currency: 'usd',
          status: 'succeeded',
        })
      );
    });

    it('should retrieve subscription metadata if userId missing from invoice', async () => {
      const Stripe = require('stripe');
      const mockStripeInstance = new Stripe();
      mockStripeInstance.subscriptions.retrieve.mockResolvedValue({
        metadata: { userId: 'user_123' },
      });

      const mockInvoice: Partial<Stripe.Invoice> = {
        id: 'inv_123',
        subscription: 'sub_123',
        metadata: {},
        amount_paid: 1999,
        currency: 'usd',
        period_start: 1234567890,
        period_end: 1234567890,
      };

      await handler.handlePaymentSucceeded(mockInvoice as Stripe.Invoice);

      expect(mockStripeInstance.subscriptions.retrieve).toHaveBeenCalledWith('sub_123');
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'succeeded',
        })
      );
    });

    it('should throw error if userId cannot be found', async () => {
      const mockInvoice: Partial<Stripe.Invoice> = {
        id: 'inv_123',
        metadata: {},
      };

      await expect(
        handler.handlePaymentSucceeded(mockInvoice as Stripe.Invoice)
      ).rejects.toThrow('Missing userId in invoice metadata');
    });
  });

  describe('Payment Failed', () => {
    it('should handle payment failed event', async () => {
      const mockInvoice: Partial<Stripe.Invoice> = {
        id: 'inv_123',
        metadata: { userId: 'user_123' },
        amount_paid: 1999,
        currency: 'usd',
        period_start: 1234567890,
        period_end: 1234567890,
      };

      await handler.handlePaymentFailed(mockInvoice as Stripe.Invoice);

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'failed',
        })
      );
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          subscriptionStatus: 'past_due',
        })
      );
    });
  });

  describe('Main Webhook Handler', () => {
    it('should route events to correct handlers', async () => {
      const mockEvent: Partial<Stripe.Event> = {
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_123',
            customer: 'cus_123',
            status: 'active',
            metadata: { userId: 'user_123' },
            items: { data: [{ price: { id: 'price_123' } }] },
            current_period_end: 1234567890,
            cancel_at_period_end: false,
          } as Stripe.Subscription,
        },
      };

      const result = await handler.handleWebhook(mockEvent as Stripe.Event);

      expect(result.success).toBe(true);
      expect(result.message).toContain('customer.subscription.created');
    });

    it('should handle unhandled event types gracefully', async () => {
      const mockEvent: Partial<Stripe.Event> = {
        type: 'customer.created' as any,
        data: { object: {} as any },
      };

      const result = await handler.handleWebhook(mockEvent as Stripe.Event);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Unhandled event type');
    });

    it('should throw error on handler failure', async () => {
      const mockEvent: Partial<Stripe.Event> = {
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_123',
            metadata: {}, // Missing userId
          } as Stripe.Subscription,
        },
      };

      await expect(handler.handleWebhook(mockEvent as Stripe.Event)).rejects.toThrow(
        'Webhook handler error'
      );
    });

    it('should handle all supported event types', async () => {
      const eventTypes = [
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'invoice.payment_succeeded',
        'invoice.payment_failed',
      ];

      for (const eventType of eventTypes) {
        const mockEvent: Partial<Stripe.Event> = {
          type: eventType as any,
          data: {
            object: {
              id: 'test_123',
              metadata: { userId: 'user_123' },
              customer: 'cus_123',
              status: 'active',
              items: { data: [{ price: { id: 'price_123' } }] },
              current_period_end: 1234567890,
              cancel_at_period_end: false,
              amount_paid: 1999,
              currency: 'usd',
              period_start: 1234567890,
              period_end: 1234567890,
            } as any,
          },
        };

        const result = await handler.handleWebhook(mockEvent as Stripe.Event);
        expect(result.success).toBe(true);
      }
    });
  });

  describe('Webhook Signature Verification', () => {
    it('should verify webhook signature', () => {
      const Stripe = require('stripe');
      const mockStripeInstance = new Stripe();
      const mockEvent = { type: 'test' };
      mockStripeInstance.webhooks.constructEvent.mockReturnValue(mockEvent);

      const result = handler.verifyWebhookSignature(
        'payload',
        'signature',
        'secret'
      );

      expect(mockStripeInstance.webhooks.constructEvent).toHaveBeenCalledWith(
        'payload',
        'signature',
        'secret'
      );
      expect(result).toEqual(mockEvent);
    });
  });
});
