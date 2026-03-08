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
