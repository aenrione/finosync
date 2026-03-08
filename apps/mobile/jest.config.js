const expoPreset = require("jest-expo/jest-preset")

/** @type {import('jest').Config} */
module.exports = {
  ...expoPreset,

  // Replace the default setupFiles to avoid the @react-native/js-polyfills Flow parsing issue
  setupFiles: ["./jest.setup-pre.js"],

  setupFilesAfterEnv: ["./jest.setup.ts"],

  transformIgnorePatterns: [
    "node_modules/(?!(.pnpm/.*node_modules/)?((jest-)?react-native|@react-native(-community)?|@react-native/.*|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|zustand|@testing-library))",
  ],

  // Exclude pre-existing broken component test (NativeWind JSX transform requires native bridge)
  testPathIgnorePatterns: [
    "/node_modules/",
    "src/components/__tests__/StyledText-test.js",
  ],

  collectCoverageFrom: [
    "src/utils/**/*.{ts,tsx}",
    "src/services/**/*.{ts,tsx}",
    "src/context/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/utils/mock/**",
  ],
}
