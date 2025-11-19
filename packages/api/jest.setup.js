/**
 * Jest Setup for API Package
 */

// Mock Firebase Admin
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn(),
    applicationDefault: jest.fn(),
  },
  firestore: jest.fn(() => ({
    collection: jest.fn(),
    doc: jest.fn(),
  })),
  auth: jest.fn(() => ({
    verifyIdToken: jest.fn(),
    createUser: jest.fn(),
  })),
}));

// Mock Firebase Functions
jest.mock('firebase-functions', () => ({
  https: {
    onRequest: jest.fn((handler) => handler),
    onCall: jest.fn((handler) => handler),
  },
  firestore: {
    document: jest.fn(() => ({
      onCreate: jest.fn(),
      onUpdate: jest.fn(),
      onDelete: jest.fn(),
    })),
  },
  pubsub: {
    schedule: jest.fn(() => ({
      onRun: jest.fn(),
    })),
  },
  config: jest.fn(() => ({})),
}));

// Set test environment variables
process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_mock';
process.env.OPENAI_API_KEY = 'sk-mock-openai-key';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
