export default {
  clearMocks: true,
  coverageDirectory: 'coverage',
  moduleFileExtensions: ['js', 'jsx', 'mjs'],
  testEnvironment: 'jsdom',
  testEnvironmentOptions: { resources: 'usable' },
  testRegex: '(/tests/.*|(\\.|/)(test|spec))\\.(mjs?|jsx?|js?|tsx?|ts?)$',
}
