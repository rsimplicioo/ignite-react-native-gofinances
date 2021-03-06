module.exports = {
  preset: "jest-expo",
  testPathIgnorePatterns: [
    "/node_modules",
    "/android",
    "/ios"
  ],
  setupFilesAfterEnv: [
    "jest-styled-components"
  ],
  setupFiles: ["./setupFile.js"],
  moduleDirectories: ["node_modules", "src"],
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.tsx",
    "!src/**/*.spec.tsx"
  ],
  coverageReporters: [
    "lcov"
  ]
}