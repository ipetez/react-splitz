module.exports = {
  verbose: true,
  collectCoverageFrom: ['**/src/components/*.js', '**/src/*.js'],
  testMatch: ['<rootDir>/test/components/*.js', '<rootDir>/test/util/*.js'],
  setupTestFrameworkScriptFile: '<rootDir>/test/setup/testSetup.js',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 90,
      lines: 95,
      statements: 95,
    },
  },
};
