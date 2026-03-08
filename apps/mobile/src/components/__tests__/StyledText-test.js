import renderer from "react-test-renderer"
import * as React from "react"

// Skipped: NativeWind/react-native-css-interop requires native bridge setup
// which is incompatible with the current jest-expo + RN 0.79 test environment.
// This will be re-enabled when component testing infrastructure is added.
it.skip("renders correctly", () => {
  const { MonoText } = require("../theme/StyledText")
  const tree = renderer.create(<MonoText>Snapshot test!</MonoText>).toJSON()

  expect(tree).toMatchSnapshot()
})
