/**
 * Firestore Security Rules Tests
 * CRITICAL: Tests that verify data access control and authorization
 *
 * Run with: npm run test:security-rules
 * Requires: Firebase Emulator running
 */
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertSucceeds,
  assertFails,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Firestore Security Rules', () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    // Load security rules
    const rulesPath = resolve(__dirname, '../../firestore.rules');
    const rules = readFileSync(rulesPath, 'utf8');

    testEnv = await initializeTestEnvironment({
      projectId: 'test-security-rules',
      firestore: {
        rules,
        host: 'localhost',
        port: 8080,
      },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  describe('User Data Access', () => {
    it('should allow users to read their own data', async () => {
      const userId = 'user_123';
      const context = testEnv.authenticatedContext(userId);

      // Create user document
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('users').doc(userId).set({
          email: 'test@example.com',
          name: 'Test User',
        });
      });

      // User can read their own data
      await assertSucceeds(
        context.firestore().collection('users').doc(userId).get()
      );
    });

    it('should prevent users from reading other users data', async () => {
      const user1 = 'user_123';
      const user2 = 'user_456';

      // Create user2 document
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('users').doc(user2).set({
          email: 'user2@example.com',
          name: 'User 2',
        });
      });

      // User1 tries to read User2's data
      const context = testEnv.authenticatedContext(user1);
      await assertFails(
        context.firestore().collection('users').doc(user2).get()
      );
    });

    it('should allow users to create their own profile', async () => {
      const userId = 'user_new';
      const context = testEnv.authenticatedContext(userId);

      await assertSucceeds(
        context.firestore().collection('users').doc(userId).set({
          email: 'new@example.com',
          name: 'New User',
          createdAt: Date.now(),
        })
      );
    });

    it('should allow users to update their own data', async () => {
      const userId = 'user_123';

      // Create initial document
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('users').doc(userId).set({
          email: 'test@example.com',
          name: 'Test User',
        });
      });

      const context = testEnv.authenticatedContext(userId);

      await assertSucceeds(
        context.firestore().collection('users').doc(userId).update({
          name: 'Updated Name',
        })
      );
    });

    it('should prevent users from deleting themselves', async () => {
      const userId = 'user_123';

      // Create user
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('users').doc(userId).set({
          email: 'test@example.com',
        });
      });

      const context = testEnv.authenticatedContext(userId);

      await assertFails(
        context.firestore().collection('users').doc(userId).delete()
      );
    });

    it('should prevent unauthenticated access', async () => {
      const context = testEnv.unauthenticatedContext();

      await assertFails(
        context.firestore().collection('users').doc('any_user').get()
      );
    });
  });

  describe('Private User Data', () => {
    it('should allow users to read their private data', async () => {
      const userId = 'user_123';

      // Create private data
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context
          .firestore()
          .collection('users')
          .doc(userId)
          .collection('private')
          .doc('settings')
          .set({
            notifications: true,
            theme: 'dark',
          });
      });

      const context = testEnv.authenticatedContext(userId);

      await assertSucceeds(
        context
          .firestore()
          .collection('users')
          .doc(userId)
          .collection('private')
          .doc('settings')
          .get()
      );
    });

    it('should prevent access to other users private data', async () => {
      const user1 = 'user_123';
      const user2 = 'user_456';

      // Create user2's private data
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context
          .firestore()
          .collection('users')
          .doc(user2)
          .collection('private')
          .doc('settings')
          .set({ secret: 'data' });
      });

      const context = testEnv.authenticatedContext(user1);

      await assertFails(
        context
          .firestore()
          .collection('users')
          .doc(user2)
          .collection('private')
          .doc('settings')
          .get()
      );
    });
  });

  describe('Billing Data', () => {
    it('should allow users to read their billing data', async () => {
      const userId = 'user_123';

      // Create billing data
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context
          .firestore()
          .collection('users')
          .doc(userId)
          .collection('billing')
          .doc('subscription')
          .set({
            status: 'active',
            planId: 'pro',
          });
      });

      const context = testEnv.authenticatedContext(userId);

      await assertSucceeds(
        context
          .firestore()
          .collection('users')
          .doc(userId)
          .collection('billing')
          .doc('subscription')
          .get()
      );
    });

    it('should prevent users from writing billing data', async () => {
      const userId = 'user_123';
      const context = testEnv.authenticatedContext(userId);

      // Users cannot write billing data (only server can)
      await assertFails(
        context
          .firestore()
          .collection('users')
          .doc(userId)
          .collection('billing')
          .doc('subscription')
          .set({
            status: 'active',
          })
      );
    });
  });

  describe('Chatbot Conversations', () => {
    it('should allow users with active subscription to create conversations', async () => {
      const userId = 'user_premium';

      // Create user with active subscription
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('users').doc(userId).set({
          email: 'premium@example.com',
          subscriptionStatus: 'active',
        });
      });

      const context = testEnv.authenticatedContext(userId);

      await assertSucceeds(
        context.firestore().collection('conversations').add({
          userId,
          messages: [],
          createdAt: Date.now(),
        })
      );
    });

    it('should prevent users without subscription from creating conversations', async () => {
      const userId = 'user_free';

      // Create user without active subscription
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('users').doc(userId).set({
          email: 'free@example.com',
          subscriptionStatus: 'inactive',
        });
      });

      const context = testEnv.authenticatedContext(userId);

      await assertFails(
        context.firestore().collection('conversations').add({
          userId,
          messages: [],
          createdAt: Date.now(),
        })
      );
    });

    it('should allow users to read their own conversations', async () => {
      const userId = 'user_123';
      const conversationId = 'conv_123';

      // Create conversation
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context
          .firestore()
          .collection('conversations')
          .doc(conversationId)
          .set({
            userId,
            messages: [],
            createdAt: Date.now(),
          });
      });

      const context = testEnv.authenticatedContext(userId);

      await assertSucceeds(
        context.firestore().collection('conversations').doc(conversationId).get()
      );
    });

    it('should prevent users from reading other users conversations', async () => {
      const user1 = 'user_123';
      const user2 = 'user_456';
      const conversationId = 'conv_123';

      // Create user2's conversation
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context
          .firestore()
          .collection('conversations')
          .doc(conversationId)
          .set({
            userId: user2,
            messages: [],
            createdAt: Date.now(),
          });
      });

      const context = testEnv.authenticatedContext(user1);

      await assertFails(
        context.firestore().collection('conversations').doc(conversationId).get()
      );
    });

    it('should allow users to update their conversations', async () => {
      const userId = 'user_123';
      const conversationId = 'conv_123';

      // Create conversation
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context
          .firestore()
          .collection('conversations')
          .doc(conversationId)
          .set({
            userId,
            messages: [],
            createdAt: Date.now(),
          });
      });

      const context = testEnv.authenticatedContext(userId);

      await assertSucceeds(
        context.firestore().collection('conversations').doc(conversationId).update({
          messages: [{ role: 'user', content: 'Hello' }],
        })
      );
    });

    it('should allow users to delete their conversations', async () => {
      const userId = 'user_123';
      const conversationId = 'conv_123';

      // Create conversation
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context
          .firestore()
          .collection('conversations')
          .doc(conversationId)
          .set({
            userId,
            messages: [],
            createdAt: Date.now(),
          });
      });

      const context = testEnv.authenticatedContext(userId);

      await assertSucceeds(
        context.firestore().collection('conversations').doc(conversationId).delete()
      );
    });
  });

  describe('A/B Test Assignments', () => {
    it('should allow users to read their A/B test assignments', async () => {
      const userId = 'user_123';
      const testId = 'test_abc';

      // Create assignment
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context
          .firestore()
          .collection('abTests')
          .doc(testId)
          .collection('assignments')
          .doc(userId)
          .set({
            variantId: 'variant_a',
            assignedAt: Date.now(),
          });
      });

      const context = testEnv.authenticatedContext(userId);

      await assertSucceeds(
        context
          .firestore()
          .collection('abTests')
          .doc(testId)
          .collection('assignments')
          .doc(userId)
          .get()
      );
    });

    it('should prevent users from writing A/B test assignments', async () => {
      const userId = 'user_123';
      const testId = 'test_abc';
      const context = testEnv.authenticatedContext(userId);

      // Only server can assign variants
      await assertFails(
        context
          .firestore()
          .collection('abTests')
          .doc(testId)
          .collection('assignments')
          .doc(userId)
          .set({
            variantId: 'variant_a',
            assignedAt: Date.now(),
          })
      );
    });
  });

  describe('Default Deny', () => {
    it('should deny access to unspecified collections', async () => {
      const userId = 'user_123';
      const context = testEnv.authenticatedContext(userId);

      // Random collection should be denied
      await assertFails(
        context.firestore().collection('randomCollection').doc('doc').get()
      );

      await assertFails(
        context.firestore().collection('randomCollection').doc('doc').set({ data: 'test' })
      );
    });

    it('should deny all access for unauthenticated users', async () => {
      const context = testEnv.unauthenticatedContext();

      await assertFails(context.firestore().collection('users').doc('any').get());
      await assertFails(context.firestore().collection('conversations').doc('any').get());
      await assertFails(context.firestore().collection('abTests').doc('any').get());
    });
  });
});
