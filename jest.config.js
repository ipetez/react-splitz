module.exports = {
  verbose: true,
  collectCoverageFrom: ['**/src/components/*.js', '**/src/*.js'],
  testMatch: ['<rootDir>/test/components/*.js', '<rootDir>/test/*.js'],
  setupTestFrameworkScriptFile: '<rootDir>/test/setup/testSetup.js',
};
