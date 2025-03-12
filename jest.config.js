module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  setupFilesAfterEnv: ["<rootDir>/tests/setupTests.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.stories.{ts,tsx}",
    "!src/**/index.{ts,tsx}",
  ],
};
