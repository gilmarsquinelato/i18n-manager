module.exports = {
  name: 'renderer',
  displayName: 'renderer',
  rootDir: './',
  testEnvironment: 'jsdom',
  testMatch: [
    '**/__tests__/*.+(ts|tsx|js)',
  ],
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js'
  ],
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/$1'
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  setupTestFrameworkScriptFile: './jest.setup.ts',
};