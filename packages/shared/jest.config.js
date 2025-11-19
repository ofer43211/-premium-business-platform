/**
 * Jest Configuration for Shared Package
 */
module.exports = {
  displayName: 'shared',
  testEnvironment: 'node',
  rootDir: './',
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
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
  },
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/*.test.ts',
  ],
};
