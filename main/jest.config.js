module.exports = {
  name: 'main',
  displayName: 'main',
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
};