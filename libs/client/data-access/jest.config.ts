import type { Config } from 'jest';

const config: Config = {
  displayName: 'data-access',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/client/data-access',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$|jwt-decode)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@full-stack-todo/client/util$': '<rootDir>/../util/src',
    '^@full-stack-todo/(.*)$': '<rootDir>/../../../$1/src',
    '^jwt-decode$': '<rootDir>/src/__mocks__/jwt-decode.ts',
  },
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
};

export default config;




