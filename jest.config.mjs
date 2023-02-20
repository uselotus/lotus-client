/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  clearMocks: true,
  coverageDirectory: 'coverage',
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  moduleFileExtensions: ['js', 'jsx', 'mjs', 'ts'],
  testEnvironment: 'jsdom',
  preset: 'ts-jest',
  testEnvironmentOptions: { resources: 'usable' },
  testMatch: ['<rootDir>/__tests__/index.test.ts'],
  setupFiles: ['<rootDir>/.jest/setEnvVars.js'],
}
