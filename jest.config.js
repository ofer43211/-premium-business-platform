/**
 * Root Jest Configuration
 * Defines shared settings for all packages
 */
module.exports = {
  projects: [
    '<rootDir>/packages/web',
    '<rootDir>/packages/mobile',
    '<rootDir>/packages/api',
    '<rootDir>/packages/shared',
  ],
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: [
    'packages/*/src/**/*.{ts,tsx,js,jsx}',
    '!packages/*/src/**/*.d.ts',
    '!packages/*/src/**/*.stories.{ts,tsx}',
    '!packages/*/src/**/__tests__/**',
    '!packages/*/src/**/__mocks__/**',
  ],
  coverageThresholds: {
    global: {
      statements: 75,
      branches: 70,
      functions: 75,
      lines: 75,
    },
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/lib/',
  ],
};
