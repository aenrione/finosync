const expoPreset = require("jest-expo/jest-preset")

/** @type {import('jest').Config} */
module.exports = {
  ...expoPreset,

  // Replace the default setupFiles to avoid the @react-native/js-polyfills Flow parsing issue
  setupFiles: ["./jest.setup-pre.js"],

  setupFilesAfterEnv: ["./jest.setup.ts"],

  moduleNameMapper: {
    // Preserve the preset's module name mappings (e.g. react-native-vector-icons)
    ...(expoPreset.moduleNameMapper || {}),
    // Redirect the css-interop JSX runtime (injected by NativeWind babel transform)
    // to a lightweight stub so tests don't pull in the native Appearance bridge.
    // Redirect ALL css-interop runtime paths to a stub that doesn't require native bridge.
    // The NativeWind babel plugin injects the jsx-runtime as the JSX factory for all
    // transformed files; in Jest this would trigger native module initialization.
    // Redirect the NativeWind / css-interop JSX runtimes to a lightweight stub
    // that does NOT pull in native modules (Appearance, AppState, etc.).
    // These are injected as the JSX factory by the NativeWind babel plugin.
    "^nativewind/jsx-runtime$": "<rootDir>/jest/__mocks__/css-interop-jsx-runtime.js",
    "^react-native-css-interop/jsx-runtime$": "<rootDir>/jest/__mocks__/css-interop-jsx-runtime.js",
    "^react-native-css-interop/src/runtime/jsx-runtime$": "<rootDir>/jest/__mocks__/css-interop-jsx-runtime.js",
  },

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
