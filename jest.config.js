module.exports = {
  verbose: true,
  collectCoverageFrom: ['**/src/components/*.js', '**/src/*.js'],
  testMatch: ['<rootDir>/test/components/*.js', '<rootDir>/test/util/*.js'],
  setupFilesAfterEnv: ['<rootDir>/test/setup/testSetup.js'],
  moduleDirectories: ['node_modules', 'src'],
  globals: {
    __DEV__: true,
  },
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 90,
      lines: 95,
      statements: 95,
    },
  },
};
