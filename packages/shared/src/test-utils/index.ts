/**
 * Shared Testing Utilities
 * Common helpers for testing across all packages
 */

/**
 * Create mock user for testing
 */
export function createMockUser(overrides?: Partial<{
  id: string;
  email: string;
  name: string;
  subscriptionStatus: string;
  language: string;
}>) {
  return {
    id: 'test-user-123',
    email: 'test@example.com',
    name: 'Test User',
    subscriptionStatus: 'active',
    language: 'en',
    ...overrides,
  };
}

/**
 * Create mock subscription for testing
 */
export function createMockSubscription(overrides?: Partial<{
  id: string;
  planId: string;
  status: string;
  currentPeriodEnd: number;
}>) {
  return {
    id: 'sub_123',
    planId: 'price_pro',
    status: 'active',
    currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    ...overrides,
  };
}

/**
 * Create mock conversation for testing
 */
export function createMockConversation(overrides?: Partial<{
  id: string;
  userId: string;
  messages: Array<{ role: string; content: string }>;
  language: string;
}>) {
  return {
    id: 'conv_123',
    userId: 'test-user-123',
    messages: [],
    language: 'en',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  throw new Error('Timeout waiting for condition');
}

/**
 * Create mock Stripe event
 */
export function createMockStripeEvent(type: string, data: any) {
  return {
    id: `evt_${Date.now()}`,
    type,
    data: {
      object: data,
    },
    created: Math.floor(Date.now() / 1000),
    livemode: false,
  };
}

/**
 * Mock Firebase Timestamp
 */
export function createMockTimestamp(date: Date = new Date()) {
  return {
    toDate: () => date,
    toMillis: () => date.getTime(),
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: (date.getTime() % 1000) * 1000000,
  };
}

/**
 * Test helpers for RTL languages
 */
export const RTL_LANGUAGES = ['he', 'ar', 'fa', 'ur'];

export function isRTL(language: string): boolean {
  return RTL_LANGUAGES.includes(language);
}

/**
 * Generate test data
 */
export class TestDataGenerator {
  static randomString(length: number = 10): string {
    return Math.random().toString(36).substring(2, 2 + length);
  }

  static randomEmail(): string {
    return `test.${this.randomString()}@example.com`;
  }

  static randomUserId(): string {
    return `user_${this.randomString()}`;
  }

  static randomAmount(): number {
    return Math.floor(Math.random() * 10000) + 100; // Between 100 and 10100
  }
}

/**
 * Mock delay for testing loading states
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Assert exhaustive type checking
 */
export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${value}`);
}
