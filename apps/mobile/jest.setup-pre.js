/**
 * Pre-setup file for Jest.
 *
 * This replaces the default react-native/jest/setup.js which fails to parse
 * @react-native/js-polyfills Flow types via jest.requireActual().
 * We replicate the essential parts of the RN setup without the problematic polyfill import.
 */

'use strict';

global.IS_REACT_ACT_ENVIRONMENT = true;
global.IS_REACT_NATIVE_TEST_ENVIRONMENT = true;

// Default env vars for web-widget tests
process.env.EXPO_PUBLIC_FINTOC_PUBLIC_KEY = process.env.EXPO_PUBLIC_FINTOC_PUBLIC_KEY || "pk_test_abc123";
process.env.EXPO_PUBLIC_API_URL = process.env.EXPO_PUBLIC_API_URL || "https://api.example.com";

// Provide window global (RN jest env doesn't include jsdom)
if (typeof window === 'undefined') {
  globalThis.window = global;
  globalThis.window.navigator = {};
}

Object.defineProperties(global, {
  __DEV__: {
    configurable: true,
    enumerable: true,
    get: () => true,
  },
});

// Mock ErrorUtils which would normally come from the polyfill
global.ErrorUtils = {
  setGlobalHandler: jest.fn(),
  getGlobalHandler: jest.fn(),
  reportError: jest.fn(),
  reportFatalError: jest.fn(),
};

// Provide a minimal BatchedBridge config so TurboModuleRegistry doesn't throw
// when react-native modules (e.g. Appearance) are imported in the test env.
// This is normally provided by the native runtime; the jest-expo preset setup
// file would set it up, but we replaced that file to avoid polyfill issues.
global.__fbBatchedBridgeConfig = {
  remoteModuleConfig: [],
  localModulesConfig: [],
};

// Mock TurboModuleRegistry so native modules (PlatformConstants, etc.) don't
// throw when required in the Jest environment.
const TurboModuleRegistry = require('react-native/Libraries/TurboModule/TurboModuleRegistry');
const originalGet = TurboModuleRegistry.get.bind(TurboModuleRegistry);
const originalGetEnforcing = TurboModuleRegistry.getEnforcing.bind(TurboModuleRegistry);

const PLATFORM_CONSTANTS_MOCK = {
  getConstants: () => ({
    isTesting: true,
    reactNativeVersion: { major: 0, minor: 79, patch: 0 },
    osVersion: '18.0',
    systemName: 'iOS',
    interfaceIdiom: 'phone',
    forceTouchAvailable: false,
  }),
};

TurboModuleRegistry.get = (name) => {
  if (name === 'PlatformConstants') return PLATFORM_CONSTANTS_MOCK;
  try { return originalGet(name); } catch { return null; }
};

const NATIVE_MODULE_MOCKS = {
  PlatformConstants: PLATFORM_CONSTANTS_MOCK,
  AppState: {
    getConstants: () => ({ initialAppState: 'active' }),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    getCurrentAppState: jest.fn(),
  },
  Appearance: {
    getConstants: () => ({ colorScheme: null }),
    addListener: jest.fn(),
    removeListeners: jest.fn(),
  },
};

TurboModuleRegistry.getEnforcing = (name) => {
  if (NATIVE_MODULE_MOCKS[name]) return NATIVE_MODULE_MOCKS[name];
  try { return originalGetEnforcing(name); } catch {
    // Return a stub instead of throwing so the test env doesn't crash
    return null;
  }
};
