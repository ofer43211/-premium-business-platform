# Premium Business Platform 🚀

Complete enterprise SaaS platform with AI chatbot, multi-language support (Hebrew RTL), A/B testing, push notifications, and Stripe billing. Built with React 18, Firebase, and React Native.

[![Tests](https://github.com/ofer43211/-premium-business-platform/actions/workflows/test.yml/badge.svg)](https://github.com/ofer43211/-premium-business-platform/actions/workflows/test.yml)
[![Coverage](https://img.shields.io/badge/coverage-75%25-brightgreen)](./coverage)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

## ✨ Features

### 🎯 Core Features
- **AI-Powered Chatbot** - GPT-4 integration with context-aware conversations
- **Multi-Language Support** - English, Hebrew (RTL), Arabic with i18next
- **A/B Testing Framework** - Built-in experimentation with statistical analysis
- **Push Notifications** - FCM integration for web and mobile
- **Subscription Management** - Stripe integration with webhook handling
- **Real-time Database** - Firebase Firestore with security rules

### 🌍 Internationalization
- Full RTL (Right-to-Left) support for Hebrew and Arabic
- Dynamic language switching
- Localized date/time formatting
- Currency localization

### 📱 Multi-Platform
- **Web**: React 18 with modern hooks
- **Mobile**: React Native (iOS + Android)
- **Backend**: Firebase Cloud Functions

### 🔒 Security
- Firestore security rules with comprehensive testing
- JWT authentication
- Role-based access control (RBAC)
- Payment data encryption
- OWASP Top 10 protection

## 🏗️ Architecture

```
├── packages/
│   ├── web/                    # React 18 Web App
│   │   ├── src/
│   │   │   ├── components/    # UI Components
│   │   │   ├── hooks/         # Custom hooks
│   │   │   └── services/      # API clients
│   │   └── jest.config.js
│   │
│   ├── mobile/                # React Native App
│   │   ├── src/
│   │   │   ├── components/   # Native components
│   │   │   └── services/     # Mobile services
│   │   └── jest.config.js
│   │
│   ├── api/                   # Firebase Functions
│   │   ├── src/
│   │   │   └── functions/
│   │   │       ├── stripe-webhooks/    # Payment processing
│   │   │       ├── ai-chatbot/         # AI service
│   │   │       ├── ab-testing/         # Experiments
│   │   │       └── push-notifications/ # FCM
│   │   └── jest.config.js
│   │
│   ├── shared/                # Shared utilities
│   │   ├── src/
│   │   │   ├── test-utils/   # Test helpers
│   │   │   └── validators/   # Schemas
│   │   └── jest.config.js
│   │
│   └── e2e/                   # End-to-end tests
│       ├── tests/
│       └── playwright.config.ts
│
├── firebase.json              # Firebase config
├── firestore.rules            # Security rules
├── jest.config.js             # Root Jest config
└── .github/workflows/         # CI/CD
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Firebase CLI
- Stripe account (test mode)
- OpenAI API key

### Installation

```bash
# Clone repository
git clone https://github.com/ofer43211/-premium-business-platform.git
cd -premium-business-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your keys
```

### Environment Variables

```env
# Firebase
FIREBASE_API_KEY=your_api_key
FIREBASE_PROJECT_ID=your_project_id

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# OpenAI
OPENAI_API_KEY=sk-...

# Firebase Emulator (for testing)
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
```

### Development

```bash
# Start Firebase Emulators
npm run firebase:emulators

# Run web app (in another terminal)
cd packages/web
npm run dev

# Run mobile app
cd packages/mobile
npm run ios    # or npm run android
```

## 🧪 Testing

We maintain **75% overall test coverage** with higher requirements for critical paths.

### Run Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Package-specific
npm run test:web
npm run test:mobile
npm run test:api
npm run test:shared

# E2E tests
npm run test:e2e
npm run test:e2e:ui      # With Playwright UI

# Security rules
npm run firebase:emulators:test
```

### Coverage Requirements

| Package | Statements | Branches | Functions | Lines |
|---------|-----------|----------|-----------|-------|
| Billing/Stripe | 95% | 90% | 95% | 95% |
| Auth/Security | 90% | 85% | 90% | 90% |
| AI Chatbot | 80% | 75% | 80% | 80% |
| A/B Testing | 85% | 80% | 85% | 85% |
| Web Components | 70% | 65% | 70% | 70% |
| Mobile | 55% | 50% | 55% | 55% |
| **Overall** | **75%** | **70%** | **75%** | **75%** |

### Test Documentation

- 📖 [Testing Guide](./TESTING.md) - Comprehensive testing documentation
- 📊 [Coverage Analysis](./TEST_COVERAGE_ANALYSIS.md) - Detailed analysis and recommendations

## 📦 Key Dependencies

### Web
- React 18.2
- React Testing Library
- i18next (internationalization)
- Stripe.js
- Firebase SDK

### Mobile
- React Native 0.73
- React Native Firebase
- React Native Testing Library
- Detox (E2E)

### Backend
- Firebase Functions
- Firebase Admin SDK
- Stripe Node SDK
- OpenAI SDK

### Testing
- Jest 29
- Playwright
- @firebase/rules-unit-testing
- MSW (Mock Service Worker)

## 🔧 Scripts

```bash
# Development
npm run dev                    # Start all services
npm run firebase:emulators     # Start Firebase emulators

# Testing
npm test                       # Run all tests
npm run test:coverage          # Generate coverage
npm run test:e2e               # E2E tests
npm run test:security-rules    # Security rules tests

# Linting
npm run lint                   # Lint all packages
npm run lint:fix               # Fix linting issues
npm run type-check             # TypeScript check

# CI/CD
npm run test:ci                # CI test suite
npm run precommit              # Pre-commit checks
```

## 📁 Sample Test Examples

### Unit Test (React Component)
```typescript
// packages/web/src/components/__tests__/SubscriptionManager.test.tsx
test('should display subscription plans', () => {
  render(<SubscriptionManager plans={mockPlans} />);
  expect(screen.getByTestId('plan-basic')).toBeInTheDocument();
  expect(screen.getByTestId('plan-pro')).toBeInTheDocument();
});
```

### Integration Test (Firebase Function)
```typescript
// packages/api/src/functions/__tests__/stripe-webhooks.test.ts
test('should handle subscription created event', async () => {
  const event = createMockStripeEvent('customer.subscription.created', {...});
  const result = await handler.handleWebhook(event);
  expect(result.success).toBe(true);
});
```

### E2E Test (User Flow)
```typescript
// packages/e2e/tests/billing.spec.ts
test('complete subscription flow', async ({ page }) => {
  await page.goto('/pricing');
  await page.click('[data-testid="subscribe-pro"]');
  await fillPaymentDetails(page);
  await expect(page.getByText('Subscription Active')).toBeVisible();
});
```

### Security Rules Test
```typescript
// __tests__/security-rules/firestore.test.ts
test('should prevent unauthorized access', async () => {
  const context = testEnv.authenticatedContext('user_123');
  await assertFails(
    context.firestore().collection('users').doc('user_456').get()
  );
});
```

## 🌐 Deployment

### Firebase

```bash
# Deploy functions
firebase deploy --only functions

# Deploy hosting
firebase deploy --only hosting

# Deploy everything
firebase deploy
```

### CI/CD Pipeline

GitHub Actions automatically:
- Runs all tests on PR
- Checks coverage thresholds
- Runs security audit
- Executes E2E tests
- Deploys to staging on merge

## 📊 Project Status

✅ **Testing Infrastructure Complete**
- Jest configuration for all packages
- Firebase Emulator setup
- Playwright E2E framework
- CI/CD pipeline
- Coverage reporting

📝 **Sample Implementations**
- ✅ Stripe webhook handler with tests
- ✅ AI Chatbot service with tests
- ✅ A/B Testing framework with tests
- ✅ Push Notifications with tests
- ✅ React components with tests
- ✅ Security rules with tests
- ✅ E2E critical flows

🚧 **In Progress**
- Full application implementation
- Additional E2E coverage
- Performance optimization
- Load testing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for your changes
4. Ensure all tests pass (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines

- Write tests for all new features
- Maintain test coverage above thresholds
- Follow ESLint rules
- Write meaningful commit messages
- Update documentation

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details

## 🙏 Acknowledgments

- React team for React 18
- Firebase team for amazing platform
- Stripe for payment infrastructure
- OpenAI for GPT-4 API
- Testing Library maintainers
- Playwright team

## 📞 Support

- 📧 Email: support@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/ofer43211/-premium-business-platform/issues)
- 📖 Docs: [Testing Guide](./TESTING.md)

---

**Made with ❤️ by the Premium Platform Team**

*Last updated: 2025-11-19*
