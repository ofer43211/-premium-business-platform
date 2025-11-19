# Testing Guide

ברוכים הבאים למדריך הבדיקות המקיף של הפלטפורמה! 🧪

## תוכן עניינים

- [סקירה כללית](#overview)
- [הגדרה ראשונית](#setup)
- [הרצת טסטים](#running-tests)
- [כתיבת טסטים](#writing-tests)
- [דוגמאות](#examples)
- [Coverage ודרישות](#coverage-requirements)
- [CI/CD](#cicd)
- [Best Practices](#best-practices)

## Overview

הפרויקט משתמש במספר כלי testing מובילים:

- **Jest**: Unit וIntegration tests
- **React Testing Library**: Component tests (Web)
- **React Native Testing Library**: Component tests (Mobile)
- **Playwright**: E2E tests
- **Firebase Emulators**: Backend testing
- **MSW**: API mocking

### ארכיטקטורת הטסטים

```
├── packages/
│   ├── web/               # React 18 Frontend
│   │   ├── src/
│   │   │   └── components/
│   │   │       └── __tests__/     # Component tests
│   │   └── jest.config.js
│   ├── mobile/            # React Native
│   │   ├── src/
│   │   │   └── __tests__/
│   │   └── jest.config.js
│   ├── api/               # Firebase Functions
│   │   ├── src/
│   │   │   └── functions/
│   │   │       └── __tests__/     # Function tests
│   │   └── jest.config.js
│   ├── shared/            # Shared utilities
│   │   └── src/
│   │       └── test-utils/        # Test helpers
│   └── e2e/               # End-to-End tests
│       └── tests/
└── jest.config.js         # Root configuration
```

## Setup

### התקנת Dependencies

```bash
npm install
```

### הגדרת Firebase Emulators

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Start emulators
npm run firebase:emulators
```

### משתני סביבה לטסטים

צור קובץ `.env.test`:

```env
# Stripe Test Keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...

# OpenAI Test Key
OPENAI_API_KEY=sk-test-...

# Firebase Emulator
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
```

## Running Tests

### הרצת כל הטסטים

```bash
npm test
```

### לפי Package

```bash
# Web package
npm run test:web

# Mobile package
npm run test:mobile

# API package
npm run test:api

# Shared utilities
npm run test:shared
```

### Watch Mode

```bash
npm run test:watch
```

### עם Coverage

```bash
npm run test:coverage
```

### E2E Tests

```bash
# Web E2E
npm run test:e2e:web

# With UI
npm run test:e2e:ui

# Specific browser
npx playwright test --project=chromium

# RTL testing (Hebrew)
npx playwright test --project=chromium-rtl
```

### Firebase Functions עם Emulator

```bash
npm run firebase:emulators:test
```

## Writing Tests

### Unit Tests - Component (React)

```typescript
// packages/web/src/components/MyComponent.tsx
import React from 'react';

export const MyComponent = ({ title }: { title: string }) => {
  return <h1>{title}</h1>;
};

// packages/web/src/components/__tests__/MyComponent.test.tsx
import { render, screen } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('should render title', () => {
    render(<MyComponent title="Hello" />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Integration Tests - Firebase Function

```typescript
// packages/api/src/functions/myFunction.ts
import * as functions from 'firebase-functions';

export const myFunction = functions.https.onCall(async (data, context) => {
  // Implementation
});

// packages/api/src/functions/__tests__/myFunction.test.ts
import { myFunction } from '../myFunction';

describe('myFunction', () => {
  it('should process data correctly', async () => {
    const result = await myFunction({ input: 'test' }, {} as any);
    expect(result).toEqual({ output: 'processed' });
  });
});
```

### E2E Tests - User Flow

```typescript
// packages/e2e/tests/signup.spec.ts
import { test, expect } from '@playwright/test';

test('user can sign up and subscribe', async ({ page }) => {
  // Navigate to signup
  await page.goto('/signup');

  // Fill form
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'SecurePass123!');
  await page.click('button[type="submit"]');

  // Should be logged in
  await expect(page).toHaveURL('/dashboard');

  // Navigate to pricing
  await page.click('text=Upgrade');

  // Subscribe to plan
  await page.click('[data-testid="subscribe-pro"]');

  // Verify subscription
  await expect(page.getByText('Pro Plan')).toBeVisible();
});
```

### RTL Testing (Hebrew/Arabic)

```typescript
// packages/web/src/components/__tests__/LanguageSwitcher.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('should switch to Hebrew and set RTL', async () => {
  const user = userEvent.setup();
  render(<LanguageSwitcher />);

  await user.selectOption(screen.getByRole('combobox'), 'he');

  expect(document.documentElement.dir).toBe('rtl');
  expect(document.documentElement.lang).toBe('he');
});
```

## Examples

### Testing Stripe Webhooks

```typescript
import { StripeWebhookHandler } from '../handler';
import { createMockStripeEvent } from '@premium-platform/shared/test-utils';

test('should handle subscription created', async () => {
  const handler = new StripeWebhookHandler(mockDb);

  const event = createMockStripeEvent('customer.subscription.created', {
    id: 'sub_123',
    customer: 'cus_123',
    status: 'active',
    metadata: { userId: 'user_123' },
  });

  const result = await handler.handleWebhook(event);

  expect(result.success).toBe(true);
  expect(mockDb.collection).toHaveBeenCalledWith('users');
});
```

### Testing AI Chatbot

```typescript
import { AIChatbotService } from '../service';

test('should send message and get response', async () => {
  const service = new AIChatbotService('test-key', mockDb);

  mockOpenAI.chat.completions.create.mockResolvedValue({
    choices: [{ message: { content: 'Hello!' } }],
    usage: { total_tokens: 50 },
  });

  const response = await service.sendMessage(
    'conv_123',
    'user_123',
    'Hi'
  );

  expect(response.message).toBe('Hello!');
  expect(response.tokensUsed).toBe(50);
});
```

### Testing with Firebase Emulator

```typescript
import { setupTestEnvironment, clearFirestoreData } from '../test-utils/firestore';

beforeAll(async () => {
  await setupTestEnvironment();
});

afterEach(async () => {
  await clearFirestoreData();
});

test('should enforce security rules', async () => {
  const userContext = getAuthenticatedContext('user_123');
  const otherContext = getAuthenticatedContext('user_456');

  // User can read their own data
  await assertAllows(
    userContext.firestore().collection('users').doc('user_123').get()
  );

  // User cannot read other user's data
  await assertDenies(
    userContext.firestore().collection('users').doc('user_456').get()
  );
});
```

## Coverage Requirements

### דרישות Minimum Coverage

| Package | Statements | Branches | Functions | Lines |
|---------|-----------|----------|-----------|-------|
| **api** | 70% | 65% | 70% | 70% |
| **web** | 70% | 65% | 70% | 70% |
| **mobile** | 55% | 50% | 55% | 55% |
| **shared** | 80% | 75% | 80% | 80% |
| **Overall** | **75%** | **70%** | **75%** | **75%** |

### Critical Paths - Higher Requirements

#### Billing/Stripe (95% coverage)
```javascript
// packages/api/jest.config.js
coverageThresholds: {
  './src/functions/billing/**/*.ts': {
    statements: 95,
    branches: 90,
    functions: 95,
    lines: 95,
  },
}
```

#### Authentication/Security (90% coverage)
```javascript
'./src/components/auth/**/*.tsx': {
  statements: 90,
  branches: 85,
  functions: 90,
  lines: 90,
}
```

#### AI Chatbot (80% coverage)
```javascript
'./src/functions/ai-chatbot/**/*.ts': {
  statements: 80,
  branches: 75,
  functions: 80,
  lines: 80,
}
```

### צפייה ב-Coverage Report

```bash
# Generate report
npm run test:coverage

# Open HTML report
open coverage/lcov-report/index.html
```

## CI/CD

### GitHub Actions Workflow

הפרויקט משתמש ב-GitHub Actions לבדיקות אוטומטיות:

```yaml
# .github/workflows/test.yml
name: Test & Coverage

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:coverage
```

### דרישות Pass/Fail

PR לא יאושר אם:
- ✗ Coverage מתחת לסף המינימלי
- ✗ Linting errors
- ✗ Type errors
- ✗ Failing tests
- ✗ E2E tests fail

### סטטוס Checks

- ✓ Unit tests passed
- ✓ Integration tests passed
- ✓ E2E tests passed
- ✓ Coverage thresholds met
- ✓ Security audit passed

## Best Practices

### ✅ DO

1. **כתוב טסטים לפני קוד (TDD)**
   ```typescript
   // Write test first
   test('should calculate total', () => {
     expect(calculateTotal([1, 2, 3])).toBe(6);
   });

   // Then implement
   function calculateTotal(items: number[]) {
     return items.reduce((sum, item) => sum + item, 0);
   }
   ```

2. **השתמש ב-Descriptive Test Names**
   ```typescript
   // ✅ Good
   test('should display error when payment fails', ...)

   // ❌ Bad
   test('test payment', ...)
   ```

3. **בדוק Edge Cases**
   ```typescript
   describe('Input validation', () => {
     it('should handle empty string', ...)
     it('should handle very long strings', ...)
     it('should handle special characters', ...)
     it('should handle null/undefined', ...)
   });
   ```

4. **Mock חיצוניים (APIs, DB)**
   ```typescript
   jest.mock('stripe');
   jest.mock('openai');
   jest.mock('firebase-admin');
   ```

5. **בדוק Accessibility**
   ```typescript
   expect(button).toHaveAttribute('aria-label');
   expect(input).toHaveAccessibleName();
   ```

### ❌ DON'T

1. **אל תבדוק implementation details**
   ```typescript
   // ❌ Bad - testing implementation
   expect(component.state.count).toBe(1);

   // ✅ Good - testing behavior
   expect(screen.getByText('Count: 1')).toBeInTheDocument();
   ```

2. **אל תשתמש ב-snapshots יותר מדי**
   - Snapshots נוטים להישבר בקלות
   - קשה לזהות שינויים משמעותיים
   - השתמש בהם רק לדברים סטטיים

3. **אל תדלג על cleanup**
   ```typescript
   afterEach(() => {
     jest.clearAllMocks();
     cleanup();
   });
   ```

4. **אל תבדוק third-party libraries**
   - React Testing Library עובד? אל תבדוק את זה
   - Stripe SDK עובד? אל תבדוק את זה
   - בדוק רק את הקוד שלך

### Testing Pyramid

```
        /\
       /  \
      / E2E \          10% - Critical user flows
     /------\
    /        \
   /Integration\       30% - Component integration, API calls
  /------------\
 /              \
/   Unit Tests   \     60% - Business logic, utilities
/----------------\
```

## Common Issues

### Issue: Timeout בטסטים

```typescript
// ✅ Solution: Increase timeout for slow operations
test('should process large file', async () => {
  // ...
}, 30000); // 30 second timeout
```

### Issue: Flaky E2E Tests

```typescript
// ✅ Solution: Wait for elements properly
await page.waitForSelector('[data-testid="result"]');
await expect(page.getByTestId('result')).toBeVisible();

// Don't use arbitrary waits
// ❌ await page.waitForTimeout(1000);
```

### Issue: Firebase Emulator Connection

```bash
# ✅ Solution: Ensure emulators are running
npm run firebase:emulators

# In separate terminal
npm run test:api
```

### Issue: Memory Leaks בטסטים

```typescript
// ✅ Solution: Clean up subscriptions and listeners
afterEach(() => {
  cleanup();
  jest.clearAllTimers();
  jest.clearAllMocks();
});
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Playwright](https://playwright.dev/)
- [Firebase Testing](https://firebase.google.com/docs/rules/unit-tests)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Support

שאלות? בעיות?
- פתח issue ב-GitHub
- שאל בצ'אט הפיתוח
- בדוק את הדוקומנטציה

---

**Happy Testing! 🚀**

זכור: טסטים טובים = קוד טוב יותר = מוצר טוב יותר!
