/**
 * Push Notifications Service
 * Handles FCM token management and notification dispatch
 */
import * as admin from 'firebase-admin';

export interface NotificationPayload {
  title: string;
  body: string;
  imageUrl?: string;
  data?: Record<string, string>;
}

export interface NotificationOptions {
  priority?: 'high' | 'normal';
  sound?: string;
  badge?: number;
  clickAction?: string;
  tag?: string;
  color?: string;
}

export interface SendNotificationRequest {
  userId: string;
  notification: NotificationPayload;
  options?: NotificationOptions;
}

export interface ScheduledNotification {
  id: string;
  userId: string;
  notification: NotificationPayload;
  scheduledFor: number;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  createdAt: number;
}

export interface DeviceToken {
  token: string;
  platform: 'ios' | 'android' | 'web';
  deviceId: string;
  createdAt: number;
  lastUsed: number;
}

export class PushNotificationService {
  private db: admin.firestore.Firestore;
  private messaging: admin.messaging.Messaging;

  constructor(
    messaging?: admin.messaging.Messaging,
    db?: admin.firestore.Firestore
  ) {
    this.messaging = messaging || admin.messaging();
    this.db = db || admin.firestore();
  }

  /**
   * Register device token for user
   */
  async registerToken(
    userId: string,
    token: string,
    platform: DeviceToken['platform'],
    deviceId: string
  ): Promise<void> {
    if (!userId || !token || !deviceId) {
      throw new Error('userId, token, and deviceId are required');
    }

    const now = Date.now();
    const deviceToken: DeviceToken = {
      token,
      platform,
      deviceId,
      createdAt: now,
      lastUsed: now,
    };

    await this.db
      .collection('users')
      .doc(userId)
      .collection('deviceTokens')
      .doc(deviceId)
      .set(deviceToken, { merge: true });
  }

  /**
   * Remove device token
   */
  async unregisterToken(userId: string, deviceId: string): Promise<void> {
    await this.db
      .collection('users')
      .doc(userId)
      .collection('deviceTokens')
      .doc(deviceId)
      .delete();
  }

  /**
   * Get all device tokens for user
   */
  async getUserTokens(userId: string): Promise<DeviceToken[]> {
    const snapshot = await this.db
      .collection('users')
      .doc(userId)
      .collection('deviceTokens')
      .get();

    return snapshot.docs.map(doc => doc.data() as DeviceToken);
  }

  /**
   * Send notification to single user
   */
  async sendToUser(request: SendNotificationRequest): Promise<{
    success: number;
    failure: number;
    errors?: string[];
  }> {
    const { userId, notification, options } = request;

    // Get user's device tokens
    const tokens = await this.getUserTokens(userId);

    if (tokens.length === 0) {
      return { success: 0, failure: 0 };
    }

    // Prepare message
    const message: admin.messaging.MulticastMessage = {
      tokens: tokens.map(t => t.token),
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl,
      },
      data: notification.data,
      android: options?.priority === 'high' ? {
        priority: 'high',
        notification: {
          sound: options.sound || 'default',
          tag: options.tag,
          color: options.color,
          clickAction: options.clickAction,
        },
      } : undefined,
      apns: {
        payload: {
          aps: {
            badge: options?.badge,
            sound: options?.sound || 'default',
          },
        },
      },
      webpush: options?.clickAction ? {
        fcmOptions: {
          link: options.clickAction,
        },
      } : undefined,
    };

    try {
      const response = await this.messaging.sendEachForMulticast(message);

      // Handle failed tokens
      const failedTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx].token);

          // Remove invalid tokens
          if (
            resp.error?.code === 'messaging/invalid-registration-token' ||
            resp.error?.code === 'messaging/registration-token-not-registered'
          ) {
            this.unregisterToken(userId, tokens[idx].deviceId).catch(err =>
              console.error('Failed to remove invalid token:', err)
            );
          }
        }
      });

      // Log notification
      await this.logNotification(
        userId,
        notification,
        response.successCount,
        response.failureCount
      );

      return {
        success: response.successCount,
        failure: response.failureCount,
        errors: failedTokens,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to send notification: ${errorMessage}`);
    }
  }

  /**
   * Send notification to multiple users
   */
  async sendToUsers(
    userIds: string[],
    notification: NotificationPayload,
    options?: NotificationOptions
  ): Promise<{
    totalSuccess: number;
    totalFailure: number;
    results: Map<string, { success: number; failure: number }>;
  }> {
    const results = new Map<string, { success: number; failure: number }>();
    let totalSuccess = 0;
    let totalFailure = 0;

    // Send to each user (consider batching for large lists)
    await Promise.all(
      userIds.map(async userId => {
        try {
          const result = await this.sendToUser({
            userId,
            notification,
            options,
          });
          results.set(userId, result);
          totalSuccess += result.success;
          totalFailure += result.failure;
        } catch (error) {
          results.set(userId, { success: 0, failure: 1 });
          totalFailure++;
        }
      })
    );

    return { totalSuccess, totalFailure, results };
  }

  /**
   * Schedule notification for later delivery
   */
  async scheduleNotification(
    userId: string,
    notification: NotificationPayload,
    scheduledFor: number,
    options?: NotificationOptions
  ): Promise<string> {
    if (scheduledFor <= Date.now()) {
      throw new Error('Scheduled time must be in the future');
    }

    const scheduled: Omit<ScheduledNotification, 'id'> = {
      userId,
      notification,
      scheduledFor,
      status: 'pending',
      createdAt: Date.now(),
    };

    const docRef = await this.db.collection('scheduledNotifications').add(scheduled);
    return docRef.id;
  }

  /**
   * Cancel scheduled notification
   */
  async cancelScheduledNotification(notificationId: string): Promise<void> {
    await this.db
      .collection('scheduledNotifications')
      .doc(notificationId)
      .update({
        status: 'cancelled',
      });
  }

  /**
   * Process scheduled notifications (called by cron job)
   */
  async processScheduledNotifications(): Promise<{
    processed: number;
    sent: number;
    failed: number;
  }> {
    const now = Date.now();

    // Get pending notifications that are due
    const snapshot = await this.db
      .collection('scheduledNotifications')
      .where('status', '==', 'pending')
      .where('scheduledFor', '<=', now)
      .limit(100) // Process in batches
      .get();

    let processed = 0;
    let sent = 0;
    let failed = 0;

    await Promise.all(
      snapshot.docs.map(async doc => {
        const notification = doc.data() as ScheduledNotification;
        processed++;

        try {
          await this.sendToUser({
            userId: notification.userId,
            notification: notification.notification,
          });

          await doc.ref.update({ status: 'sent' });
          sent++;
        } catch (error) {
          await doc.ref.update({ status: 'failed' });
          failed++;
        }
      })
    );

    return { processed, sent, failed };
  }

  /**
   * Send notification to topic subscribers
   */
  async sendToTopic(
    topic: string,
    notification: NotificationPayload,
    options?: NotificationOptions
  ): Promise<string> {
    const message: admin.messaging.Message = {
      topic,
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl,
      },
      data: notification.data,
      android: options?.priority === 'high' ? {
        priority: 'high',
        notification: {
          sound: options.sound || 'default',
          tag: options.tag,
          color: options.color,
          clickAction: options.clickAction,
        },
      } : undefined,
      apns: {
        payload: {
          aps: {
            badge: options?.badge,
            sound: options?.sound || 'default',
          },
        },
      },
    };

    try {
      const messageId = await this.messaging.send(message);
      return messageId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to send to topic: ${errorMessage}`);
    }
  }

  /**
   * Subscribe user to topic
   */
  async subscribeToTopic(
    userId: string,
    topic: string
  ): Promise<void> {
    const tokens = await this.getUserTokens(userId);

    if (tokens.length === 0) {
      throw new Error('No device tokens found for user');
    }

    await this.messaging.subscribeToTopic(
      tokens.map(t => t.token),
      topic
    );

    // Log subscription
    await this.db
      .collection('users')
      .doc(userId)
      .collection('topicSubscriptions')
      .doc(topic)
      .set({
        topic,
        subscribedAt: Date.now(),
      });
  }

  /**
   * Unsubscribe user from topic
   */
  async unsubscribeFromTopic(
    userId: string,
    topic: string
  ): Promise<void> {
    const tokens = await this.getUserTokens(userId);

    if (tokens.length > 0) {
      await this.messaging.unsubscribeFromTopic(
        tokens.map(t => t.token),
        topic
      );
    }

    await this.db
      .collection('users')
      .doc(userId)
      .collection('topicSubscriptions')
      .doc(topic)
      .delete();
  }

  /**
   * Log notification for analytics
   */
  private async logNotification(
    userId: string,
    notification: NotificationPayload,
    successCount: number,
    failureCount: number
  ): Promise<void> {
    await this.db.collection('notificationLogs').add({
      userId,
      title: notification.title,
      successCount,
      failureCount,
      timestamp: Date.now(),
    });
  }
}
