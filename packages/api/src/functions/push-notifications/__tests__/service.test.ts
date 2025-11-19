/**
 * Tests for Push Notification Service
 * Coverage: Token management, notification dispatch, scheduling
 */
import { PushNotificationService, DeviceToken, NotificationPayload } from '../service';
import * as admin from 'firebase-admin';

describe('PushNotificationService', () => {
  let service: PushNotificationService;
  let mockMessaging: any;
  let mockDb: any;

  beforeEach(() => {
    // Mock messaging
    mockMessaging = {
      sendEachForMulticast: jest.fn(),
      send: jest.fn(),
      subscribeToTopic: jest.fn(),
      unsubscribeFromTopic: jest.fn(),
    };

    // Mock Firestore
    const mockSet = jest.fn().mockResolvedValue({});
    const mockDelete = jest.fn().mockResolvedValue({});
    const mockUpdate = jest.fn().mockResolvedValue({});
    const mockAdd = jest.fn().mockResolvedValue({ id: 'notif_123' });
    const mockGet = jest.fn();
    const mockWhere = jest.fn();
    const mockLimit = jest.fn();

    mockLimit.mockReturnValue({ get: mockGet });
    mockWhere.mockImplementation(() => ({ where: mockWhere, limit: mockLimit, get: mockGet }));

    const mockDoc = jest.fn().mockReturnValue({
      set: mockSet,
      delete: mockDelete,
      update: mockUpdate,
      get: mockGet,
      ref: { update: mockUpdate },
    });

    const mockCollection = jest.fn().mockReturnValue({
      doc: mockDoc,
      add: mockAdd,
      get: mockGet,
      where: mockWhere,
    });

    mockDb = {
      collection: mockCollection,
    };

    service = new PushNotificationService(mockMessaging, mockDb);
  });

  describe('Token Management', () => {
    it('should register device token', async () => {
      await service.registerToken(
        'user_123',
        'fcm_token_abc',
        'ios',
        'device_1'
      );

      expect(mockDb.collection).toHaveBeenCalledWith('users');
    });

    it('should reject invalid token registration', async () => {
      await expect(
        service.registerToken('', 'token', 'ios', 'device_1')
      ).rejects.toThrow('userId, token, and deviceId are required');

      await expect(
        service.registerToken('user_123', '', 'ios', 'device_1')
      ).rejects.toThrow('userId, token, and deviceId are required');

      await expect(
        service.registerToken('user_123', 'token', 'ios', '')
      ).rejects.toThrow('userId, token, and deviceId are required');
    });

    it('should unregister device token', async () => {
      await service.unregisterToken('user_123', 'device_1');

      expect(mockDb.collection).toHaveBeenCalledWith('users');
    });

    it('should get user tokens', async () => {
      const mockTokens: DeviceToken[] = [
        {
          token: 'token_1',
          platform: 'ios',
          deviceId: 'device_1',
          createdAt: Date.now(),
          lastUsed: Date.now(),
        },
        {
          token: 'token_2',
          platform: 'android',
          deviceId: 'device_2',
          createdAt: Date.now(),
          lastUsed: Date.now(),
        },
      ];

      const mockGet = jest.fn().mockResolvedValue({
        docs: mockTokens.map(token => ({
          data: () => token,
        })),
      });

      mockDb.collection = jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            get: mockGet,
          }),
        }),
      });

      const tokens = await service.getUserTokens('user_123');

      expect(tokens).toHaveLength(2);
      expect(tokens[0].platform).toBe('ios');
      expect(tokens[1].platform).toBe('android');
    });
  });

  describe('Send Notifications', () => {
    const mockNotification: NotificationPayload = {
      title: 'Test Notification',
      body: 'This is a test',
      data: { action: 'open_app' },
    };

    const mockTokens: DeviceToken[] = [
      {
        token: 'token_1',
        platform: 'ios',
        deviceId: 'device_1',
        createdAt: Date.now(),
        lastUsed: Date.now(),
      },
      {
        token: 'token_2',
        platform: 'android',
        deviceId: 'device_2',
        createdAt: Date.now(),
        lastUsed: Date.now(),
      },
    ];

    beforeEach(() => {
      // Mock getUserTokens
      jest.spyOn(service as any, 'getUserTokens').mockResolvedValue(mockTokens);
    });

    it('should send notification to user', async () => {
      mockMessaging.sendEachForMulticast.mockResolvedValue({
        successCount: 2,
        failureCount: 0,
        responses: [{ success: true }, { success: true }],
      });

      const result = await service.sendToUser({
        userId: 'user_123',
        notification: mockNotification,
      });

      expect(result.success).toBe(2);
      expect(result.failure).toBe(0);
      expect(mockMessaging.sendEachForMulticast).toHaveBeenCalledWith(
        expect.objectContaining({
          tokens: ['token_1', 'token_2'],
          notification: expect.objectContaining({
            title: 'Test Notification',
            body: 'This is a test',
          }),
        })
      );
    });

    it('should handle user with no tokens', async () => {
      jest.spyOn(service as any, 'getUserTokens').mockResolvedValue([]);

      const result = await service.sendToUser({
        userId: 'user_no_tokens',
        notification: mockNotification,
      });

      expect(result.success).toBe(0);
      expect(result.failure).toBe(0);
      expect(mockMessaging.sendEachForMulticast).not.toHaveBeenCalled();
    });

    it('should handle partial failures', async () => {
      mockMessaging.sendEachForMulticast.mockResolvedValue({
        successCount: 1,
        failureCount: 1,
        responses: [
          { success: true },
          {
            success: false,
            error: { code: 'messaging/invalid-registration-token' },
          },
        ],
      });

      const result = await service.sendToUser({
        userId: 'user_123',
        notification: mockNotification,
      });

      expect(result.success).toBe(1);
      expect(result.failure).toBe(1);
      expect(result.errors).toHaveLength(1);
    });

    it('should include notification options', async () => {
      mockMessaging.sendEachForMulticast.mockResolvedValue({
        successCount: 2,
        failureCount: 0,
        responses: [{ success: true }, { success: true }],
      });

      await service.sendToUser({
        userId: 'user_123',
        notification: mockNotification,
        options: {
          priority: 'high',
          sound: 'custom.mp3',
          badge: 5,
          clickAction: 'https://example.com/action',
        },
      });

      expect(mockMessaging.sendEachForMulticast).toHaveBeenCalledWith(
        expect.objectContaining({
          android: expect.objectContaining({
            priority: 'high',
            notification: expect.objectContaining({
              sound: 'custom.mp3',
            }),
          }),
          apns: expect.objectContaining({
            payload: expect.objectContaining({
              aps: expect.objectContaining({
                badge: 5,
                sound: 'custom.mp3',
              }),
            }),
          }),
        })
      );
    });

    it('should handle messaging errors', async () => {
      mockMessaging.sendEachForMulticast.mockRejectedValue(
        new Error('Network error')
      );

      await expect(
        service.sendToUser({
          userId: 'user_123',
          notification: mockNotification,
        })
      ).rejects.toThrow('Failed to send notification');
    });

    it('should send to multiple users', async () => {
      mockMessaging.sendEachForMulticast.mockResolvedValue({
        successCount: 2,
        failureCount: 0,
        responses: [{ success: true }, { success: true }],
      });

      const result = await service.sendToUsers(
        ['user_1', 'user_2', 'user_3'],
        mockNotification
      );

      expect(result.totalSuccess).toBeGreaterThan(0);
      expect(result.results.size).toBe(3);
    });
  });

  describe('Scheduled Notifications', () => {
    const mockNotification: NotificationPayload = {
      title: 'Scheduled Notification',
      body: 'This is scheduled',
    };

    it('should schedule notification', async () => {
      const futureTime = Date.now() + 3600000; // 1 hour from now

      const notificationId = await service.scheduleNotification(
        'user_123',
        mockNotification,
        futureTime
      );

      expect(notificationId).toBe('notif_123');
    });

    it('should reject past scheduled time', async () => {
      const pastTime = Date.now() - 3600000; // 1 hour ago

      await expect(
        service.scheduleNotification('user_123', mockNotification, pastTime)
      ).rejects.toThrow('Scheduled time must be in the future');
    });

    it('should cancel scheduled notification', async () => {
      await service.cancelScheduledNotification('notif_123');

      expect(mockDb.collection).toHaveBeenCalledWith('scheduledNotifications');
    });

    it('should process scheduled notifications', async () => {
      const now = Date.now();
      const scheduledNotifications = [
        {
          id: 'notif_1',
          data: () => ({
            id: 'notif_1',
            userId: 'user_1',
            notification: { title: 'Test 1', body: 'Body 1' },
            scheduledFor: now - 1000,
            status: 'pending',
            createdAt: now - 3600000,
          }),
          ref: {
            update: jest.fn().mockResolvedValue({}),
          },
        },
        {
          id: 'notif_2',
          data: () => ({
            id: 'notif_2',
            userId: 'user_2',
            notification: { title: 'Test 2', body: 'Body 2' },
            scheduledFor: now - 2000,
            status: 'pending',
            createdAt: now - 3600000,
          }),
          ref: {
            update: jest.fn().mockResolvedValue({}),
          },
        },
      ];

      const mockGet = jest.fn().mockResolvedValue({
        docs: scheduledNotifications,
      });

      const mockWhere = jest.fn();
      mockWhere.mockImplementation(() => ({
        where: mockWhere,
        limit: jest.fn().mockReturnValue({ get: mockGet }),
      }));

      mockDb.collection = jest.fn().mockReturnValue({
        where: mockWhere,
      });

      // Mock sendToUser
      jest.spyOn(service, 'sendToUser').mockResolvedValue({
        success: 1,
        failure: 0,
      });

      const result = await service.processScheduledNotifications();

      expect(result.processed).toBe(2);
      expect(result.sent).toBe(2);
      expect(result.failed).toBe(0);
    });

    it('should handle failures in scheduled notifications', async () => {
      const now = Date.now();
      const scheduledNotification = {
        id: 'notif_1',
        data: () => ({
          id: 'notif_1',
          userId: 'user_1',
          notification: { title: 'Test', body: 'Body' },
          scheduledFor: now - 1000,
          status: 'pending',
          createdAt: now - 3600000,
        }),
        ref: {
          update: jest.fn().mockResolvedValue({}),
        },
      };

      const mockGet = jest.fn().mockResolvedValue({
        docs: [scheduledNotification],
      });

      const mockWhere = jest.fn();
      mockWhere.mockImplementation(() => ({
        where: mockWhere,
        limit: jest.fn().mockReturnValue({ get: mockGet }),
      }));

      mockDb.collection = jest.fn().mockReturnValue({
        where: mockWhere,
      });

      // Mock sendToUser to fail
      jest.spyOn(service, 'sendToUser').mockRejectedValue(new Error('Send failed'));

      const result = await service.processScheduledNotifications();

      expect(result.processed).toBe(1);
      expect(result.sent).toBe(0);
      expect(result.failed).toBe(1);
    });
  });

  describe('Topic Management', () => {
    const mockNotification: NotificationPayload = {
      title: 'Topic Notification',
      body: 'Sent to topic',
    };

    it('should send to topic', async () => {
      mockMessaging.send.mockResolvedValue('message_123');

      const messageId = await service.sendToTopic('news', mockNotification);

      expect(messageId).toBe('message_123');
      expect(mockMessaging.send).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: 'news',
          notification: expect.objectContaining({
            title: 'Topic Notification',
          }),
        })
      );
    });

    it('should subscribe user to topic', async () => {
      const mockTokens: DeviceToken[] = [
        {
          token: 'token_1',
          platform: 'ios',
          deviceId: 'device_1',
          createdAt: Date.now(),
          lastUsed: Date.now(),
        },
      ];

      jest.spyOn(service as any, 'getUserTokens').mockResolvedValue(mockTokens);
      mockMessaging.subscribeToTopic.mockResolvedValue({});

      await service.subscribeToTopic('user_123', 'news');

      expect(mockMessaging.subscribeToTopic).toHaveBeenCalledWith(
        ['token_1'],
        'news'
      );
    });

    it('should reject subscription with no tokens', async () => {
      jest.spyOn(service as any, 'getUserTokens').mockResolvedValue([]);

      await expect(
        service.subscribeToTopic('user_123', 'news')
      ).rejects.toThrow('No device tokens found');
    });

    it('should unsubscribe user from topic', async () => {
      const mockTokens: DeviceToken[] = [
        {
          token: 'token_1',
          platform: 'ios',
          deviceId: 'device_1',
          createdAt: Date.now(),
          lastUsed: Date.now(),
        },
      ];

      jest.spyOn(service as any, 'getUserTokens').mockResolvedValue(mockTokens);
      mockMessaging.unsubscribeFromTopic.mockResolvedValue({});

      await service.unsubscribeFromTopic('user_123', 'news');

      expect(mockMessaging.unsubscribeFromTopic).toHaveBeenCalledWith(
        ['token_1'],
        'news'
      );
    });

    it('should handle unsubscribe with no tokens gracefully', async () => {
      jest.spyOn(service as any, 'getUserTokens').mockResolvedValue([]);

      await expect(
        service.unsubscribeFromTopic('user_123', 'news')
      ).resolves.not.toThrow();

      expect(mockMessaging.unsubscribeFromTopic).not.toHaveBeenCalled();
    });
  });
});
