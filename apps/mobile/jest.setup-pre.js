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

const NATIVE_ANIMATED_MOCK = {
  startOperationBatch: jest.fn(),
  finishOperationBatch: jest.fn(),
  createAnimatedNode: jest.fn(),
  getValue: jest.fn(),
  startListeningToAnimatedNodeValue: jest.fn(),
  stopListeningToAnimatedNodeValue: jest.fn(),
  connectAnimatedNodes: jest.fn(),
  disconnectAnimatedNodes: jest.fn(),
  startAnimatingNode: jest.fn(),
  stopAnimation: jest.fn(),
  setAnimatedNodeValue: jest.fn(),
  setAnimatedNodeOffset: jest.fn(),
  flattenAnimatedNodeOffset: jest.fn(),
  extractAnimatedNodeOffset: jest.fn(),
  connectAnimatedNodeToView: jest.fn(),
  disconnectAnimatedNodeFromView: jest.fn(),
  restoreDefaultValues: jest.fn(),
  dropAnimatedNode: jest.fn(),
  addAnimatedEventToView: jest.fn(),
  removeAnimatedEventFromView: jest.fn(),
  addListener: jest.fn(),
  removeListeners: jest.fn(),
};

const KEYBOARD_OBSERVER_MOCK = {
  addListener: jest.fn(),
  removeListeners: jest.fn(),
};

const LINKING_MANAGER_MOCK = {
  addListener: jest.fn(),
  removeListeners: jest.fn(),
  openURL: jest.fn(() => Promise.resolve()),
  canOpenURL: jest.fn(() => Promise.resolve(false)),
  openSettings: jest.fn(() => Promise.resolve()),
  getInitialURL: jest.fn(() => Promise.resolve(null)),
};

TurboModuleRegistry.get = (name) => {
  if (name === 'PlatformConstants') return PLATFORM_CONSTANTS_MOCK;
  if (name === 'NativeAnimatedTurboModule') return NATIVE_ANIMATED_MOCK;
  if (name === 'NativeAnimatedModule') return NATIVE_ANIMATED_MOCK;
  if (name === 'KeyboardObserver') return KEYBOARD_OBSERVER_MOCK;
  if (name === 'LinkingManager') return LINKING_MANAGER_MOCK;
  try { return originalGet(name); } catch { return null; }
};

const NATIVE_MODULE_MOCKS = {
  PlatformConstants: PLATFORM_CONSTANTS_MOCK,
  KeyboardObserver: KEYBOARD_OBSERVER_MOCK,
  LinkingManager: LINKING_MANAGER_MOCK,
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
  DeviceInfo: {
    getConstants: () => ({
      Dimensions: {
        window: { width: 375, height: 812, scale: 2, fontScale: 1 },
        screen: { width: 375, height: 812, scale: 2, fontScale: 1 },
      },
    }),
  },
  UIManager: {
    getConstants: () => ({}),
    getConstantsForViewManager: jest.fn(() => ({})),
    getViewManagerConfig: jest.fn(() => null),
    lazilyLoadView: jest.fn(() => ({})),
    createView: jest.fn(),
    updateView: jest.fn(),
    manageChildren: jest.fn(),
    setChildren: jest.fn(),
    removeSubviews: jest.fn(),
    measure: jest.fn(),
    measureInWindow: jest.fn(),
    measureLayout: jest.fn(),
    dispatchViewManagerCommand: jest.fn(),
    configureNextLayoutAnimation: jest.fn(),
    sendAccessibilityEvent: jest.fn(),
    showPopupMenu: jest.fn(),
    dismissPopupMenu: jest.fn(),
  },
};

TurboModuleRegistry.getEnforcing = (name) => {
  if (NATIVE_MODULE_MOCKS[name]) return NATIVE_MODULE_MOCKS[name];
  try { return originalGetEnforcing(name); } catch {
    // Return a stub instead of throwing so the test env doesn't crash
    return null;
  }
};
