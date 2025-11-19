/**
 * Jest Configuration for Mobile Package (React Native)
 */
module.exports = {
  displayName: 'mobile',
  preset: 'react-native',
  rootDir: './',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
      },
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-native-firebase|@react-navigation)/)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],
  coverageThresholds: {
    global: {
      statements: 55,
      branches: 50,
      functions: 55,
      lines: 55,
    },
    // Critical mobile flows
    './src/services/push-notifications/**/*.{ts,tsx}': {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
    './src/services/auth/**/*.{ts,tsx}': {
      statements: 90,
      branches: 85,
      functions: 90,
      lines: 90,
    },
  },
  testMatch: [
    '**/__tests__/**/*.(test|spec).(ts|tsx)',
    '**/*.(test|spec).(ts|tsx)',
  ],
};
