/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.js"],
  verbose: true,
  moduleNameMapper: {
    "^better-sqlite3$": "<rootDir>/test-helpers/better-sqlite3-mock.js",
  },
  forceExit: true,
};
