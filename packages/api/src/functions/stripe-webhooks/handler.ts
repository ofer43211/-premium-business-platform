/**
 * Stripe Webhook Handler
 * Handles Stripe webhook events for subscription lifecycle
 */
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export interface SubscriptionData {
  subscriptionId: string;
  customerId: string;
  status: string;
  planId: string;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
}

export class StripeWebhookHandler {
  private db: admin.firestore.Firestore;

  constructor(db?: admin.firestore.Firestore) {
    this.db = db || admin.firestore();
  }

  /**
   * Verify Stripe webhook signature
   */
  verifyWebhookSignature(
    payload: string | Buffer,
    signature: string,
    secret: string
  ): Stripe.Event {
    return stripe.webhooks.constructEvent(payload, signature, secret);
  }

  /**
   * Handle customer.subscription.created event
   */
  async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    const userId = subscription.metadata.userId;
    if (!userId) {
      throw new Error('Missing userId in subscription metadata');
    }

    const subscriptionData: SubscriptionData = {
      subscriptionId: subscription.id,
      customerId: subscription.customer as string,
      status: subscription.status,
      planId: subscription.items.data[0]?.price.id || '',
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    };

    await this.db
      .collection('users')
      .doc(userId)
      .collection('billing')
      .doc('subscription')
      .set(subscriptionData, { merge: true });

    // Update user's subscription status
    await this.db.collection('users').doc(userId).update({
      subscriptionStatus: subscription.status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  /**
   * Handle customer.subscription.updated event
   */
  async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    const userId = subscription.metadata.userId;
    if (!userId) {
      throw new Error('Missing userId in subscription metadata');
    }

    const subscriptionData: SubscriptionData = {
      subscriptionId: subscription.id,
      customerId: subscription.customer as string,
      status: subscription.status,
      planId: subscription.items.data[0]?.price.id || '',
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    };

    await this.db
      .collection('users')
      .doc(userId)
      .collection('billing')
      .doc('subscription')
      .set(subscriptionData, { merge: true });

    await this.db.collection('users').doc(userId).update({
      subscriptionStatus: subscription.status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  /**
   * Handle customer.subscription.deleted event
   */
  async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const userId = subscription.metadata.userId;
    if (!userId) {
      throw new Error('Missing userId in subscription metadata');
    }

    await this.db.collection('users').doc(userId).update({
      subscriptionStatus: 'canceled',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await this.db
      .collection('users')
      .doc(userId)
      .collection('billing')
      .doc('subscription')
      .update({
        status: 'canceled',
        canceledAt: admin.firestore.FieldValue.serverTimestamp(),
      });
  }

  /**
   * Handle invoice.payment_succeeded event
   */
  async handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    const userId = invoice.metadata?.userId;
    if (!userId) {
      // Try to get userId from subscription
      if (typeof invoice.subscription === 'string') {
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
        const userIdFromSub = subscription.metadata.userId;
        if (userIdFromSub) {
          await this.recordPayment(userIdFromSub, invoice, 'succeeded');
          return;
        }
      }
      throw new Error('Missing userId in invoice metadata');
    }

    await this.recordPayment(userId, invoice, 'succeeded');
  }

  /**
   * Handle invoice.payment_failed event
   */
  async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const userId = invoice.metadata?.userId;
    if (!userId) {
      throw new Error('Missing userId in invoice metadata');
    }

    await this.recordPayment(userId, invoice, 'failed');

    // Update subscription status to past_due
    await this.db.collection('users').doc(userId).update({
      subscriptionStatus: 'past_due',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  /**
   * Record payment in Firestore
   */
  private async recordPayment(
    userId: string,
    invoice: Stripe.Invoice,
    status: 'succeeded' | 'failed'
  ): Promise<void> {
    await this.db
      .collection('users')
      .doc(userId)
      .collection('billing')
      .doc('payments')
      .collection('history')
      .doc(invoice.id)
      .set({
        invoiceId: invoice.id,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        periodStart: invoice.period_start,
        periodEnd: invoice.period_end,
      });
  }

  /**
   * Main webhook handler
   */
  async handleWebhook(event: Stripe.Event): Promise<{ success: boolean; message: string }> {
    try {
      switch (event.type) {
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        default:
          return { success: true, message: `Unhandled event type: ${event.type}` };
      }

      return { success: true, message: `Successfully handled ${event.type}` };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Webhook handler error: ${message}`);
    }
  }
}
