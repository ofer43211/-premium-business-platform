/**
 * Firestore Testing Utilities
 * Helpers for testing Firebase Functions with emulator
 */
import * as admin from 'firebase-admin';
import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';

let testEnv: RulesTestEnvironment | null = null;

/**
 * Initialize test environment with emulator
 */
export async function setupTestEnvironment(projectId: string = 'test-project') {
  if (testEnv) {
    return testEnv;
  }

  testEnv = await initializeTestEnvironment({
    projectId,
    firestore: {
      host: 'localhost',
      port: 8080,
    },
  });

  return testEnv;
}

/**
 * Clean up test environment
 */
export async function teardownTestEnvironment() {
  if (testEnv) {
    await testEnv.cleanup();
    testEnv = null;
  }
}

/**
 * Clear all Firestore data
 */
export async function clearFirestoreData() {
  if (testEnv) {
    await testEnv.clearFirestore();
  }
}

/**
 * Get authenticated Firestore context
 */
export function getAuthenticatedContext(userId: string, claims?: Record<string, any>) {
  if (!testEnv) {
    throw new Error('Test environment not initialized');
  }

  return testEnv.authenticatedContext(userId, claims);
}

/**
 * Get unauthenticated Firestore context
 */
export function getUnauthenticatedContext() {
  if (!testEnv) {
    throw new Error('Test environment not initialized');
  }

  return testEnv.unauthenticatedContext();
}

/**
 * Create test document
 */
export async function createTestDocument(
  collection: string,
  docId: string,
  data: any,
  userId: string = 'test-user'
) {
  const context = getAuthenticatedContext(userId);
  const firestore = context.firestore();
  await firestore.collection(collection).doc(docId).set(data);
}

/**
 * Assert security rules
 */
export async function assertAllows(promise: Promise<any>) {
  await promise;
}

export async function assertDenies(promise: Promise<any>) {
  try {
    await promise;
    throw new Error('Expected operation to be denied, but it was allowed');
  } catch (error: any) {
    if (error.code !== 'permission-denied' && !error.message.includes('denied')) {
      throw error;
    }
  }
}

/**
 * Mock Firestore admin for unit tests
 */
export function createMockFirestore() {
  const data = new Map<string, any>();

  return {
    collection: (path: string) => ({
      doc: (id: string) => ({
        get: jest.fn().mockResolvedValue({
          exists: data.has(`${path}/${id}`),
          data: () => data.get(`${path}/${id}`),
          id,
        }),
        set: jest.fn().mockImplementation((docData: any) => {
          data.set(`${path}/${id}`, docData);
          return Promise.resolve();
        }),
        update: jest.fn().mockImplementation((updates: any) => {
          const existing = data.get(`${path}/${id}`) || {};
          data.set(`${path}/${id}`, { ...existing, ...updates });
          return Promise.resolve();
        }),
        delete: jest.fn().mockImplementation(() => {
          data.delete(`${path}/${id}`);
          return Promise.resolve();
        }),
      }),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        docs: Array.from(data.entries())
          .filter(([key]) => key.startsWith(path))
          .map(([key, value]) => ({
            data: () => value,
            id: key.split('/').pop(),
          })),
      }),
    }),
  };
}
