'use strict';

// Lightweight stub for react-native-css-interop/src/runtime/jsx-runtime.
// This module is injected by the NativeWind/babel transform as the JSX
// factory. In a Jest environment it would trigger the native Appearance
// bridge (via appearance-observables.ts), which is not available without a
// running device. We replace it with plain React so tests can render
// components without a native bridge.
const React = require('react');

module.exports = {
  jsx: React.createElement,
  jsxs: React.createElement,
  Fragment: React.Fragment,
};
