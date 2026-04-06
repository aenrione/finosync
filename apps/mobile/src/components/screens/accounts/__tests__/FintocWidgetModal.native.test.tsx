import React from "react"
import { render } from "@testing-library/react-native"

const MOCK_API_URL = process.env.EXPO_PUBLIC_API_URL ?? ""

// Mock react-native-webview
const MockWebView = jest.fn((_props: any) => null)
jest.mock("react-native-webview", () => ({
  __esModule: true,
  default: (props: any) => {
    MockWebView(props)
    return null
  },
  WebView: (props: any) => {
    MockWebView(props)
    return null
  },
}))

// Mock react-native-safe-area-context
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}))

// Mock @/components/ui/text to avoid NativeWind bridge dependency
jest.mock("@/components/ui/text", () => ({
  Text: ({ children }: any) => children,
}))

// Mock the Modal component to avoid native bridge (NativeDeviceInfo, etc.)
// Using require("react") instead of JSX to avoid babel NativeWind transform issues
jest.mock("react-native/Libraries/Modal/Modal", () => {
  const r = require("react")
  function MockModal({ children, visible }: any) {
    return visible ? r.createElement(r.Fragment, null, children) : null
  }
  MockModal.displayName = "Modal"
  return {
    __esModule: true,
    default: MockModal,
  }
})

import FintocWidgetModal from "../FintocWidgetModal.native"

describe("FintocWidgetModal (native)", () => {
  beforeEach(() => {
    MockWebView.mockClear()
  })

  it("includes webhook_url query param in WebView URL", () => {
    render(
      <FintocWidgetModal visible={true} onSuccess={jest.fn()} onExit={jest.fn()} />
    )

    const call = MockWebView.mock.calls[0]?.[0]
    const uri: string = call?.source?.uri ?? ""

    expect(uri).toContain(
      `webhook_url=${encodeURIComponent(`${MOCK_API_URL}/webhooks/fintoc`)}`
    )
  })

  it("includes public_key in WebView URL", () => {
    render(
      <FintocWidgetModal visible={true} onSuccess={jest.fn()} onExit={jest.fn()} />
    )

    const call = MockWebView.mock.calls[0]?.[0]
    const uri: string = call?.source?.uri ?? ""

    expect(uri).toContain("public_key=pk_test_abc123")
  })

  it("includes product and holder_type in WebView URL", () => {
    render(
      <FintocWidgetModal visible={true} onSuccess={jest.fn()} onExit={jest.fn()} />
    )

    const call = MockWebView.mock.calls[0]?.[0]
    const uri: string = call?.source?.uri ?? ""

    expect(uri).toContain("product=movements")
    expect(uri).toContain("holder_type=individual")
    expect(uri).toContain("country=cl")
  })
})
