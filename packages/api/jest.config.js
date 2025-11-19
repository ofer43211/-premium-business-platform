/**
 * Jest Configuration for API Package (Firebase Functions)
 */
module.exports = {
  displayName: 'api',
  testEnvironment: 'node',
  rootDir: './',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        module: 'commonjs',
      },
    }],
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],
  coverageThresholds: {
    global: {
      statements: 70,
      branches: 65,
      functions: 70,
      lines: 70,
    },
    // Critical backend logic requires highest coverage
    './src/functions/billing/**/*.ts': {
      statements: 95,
      branches: 90,
      functions: 95,
      lines: 95,
    },
    './src/functions/stripe-webhooks/**/*.ts': {
      statements: 95,
      branches: 90,
      functions: 95,
      lines: 95,
    },
    './src/security/**/*.ts': {
      statements: 90,
      branches: 85,
      functions: 90,
      lines: 90,
    },
    './src/functions/ai-chatbot/**/*.ts': {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
    './src/functions/ab-testing/**/*.ts': {
      statements: 85,
      branches: 80,
      functions: 85,
      lines: 85,
    },
  },
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/*.test.ts',
  ],
  // Timeout for Firebase emulator tests
  testTimeout: 10000,
};
