module.exports = {
  name: 'common',
  displayName: 'common',
  rootDir: './',
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/*.+(ts|tsx|js)',
  ],
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  globals: {
    'ts-jest': {
      tsConfigFile: '<rootDir>/tsconfig.jest.json',
    },
  },
};