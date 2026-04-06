import React from "react"
import { render, waitFor, act } from "@testing-library/react-native"

// Mock fetchJsonWithAuth
const mockFetchJsonWithAuth = jest.fn()
jest.mock("@/utils/api", () => ({
  fetchJsonWithAuth: (...args: any[]) => mockFetchJsonWithAuth(...args),
}))

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

// Mock Modal so children are rendered in test env (native Modal uses portals)
jest.mock("react-native/Libraries/Modal/Modal", () => {
  const r = require("react")
  function MockModal({ children, visible }: any) {
    return visible ? r.createElement(r.Fragment, null, children) : null
  }
  MockModal.displayName = "Modal"
  return { __esModule: true, default: MockModal }
})

// Mock @/components/ui/text
jest.mock("@/components/ui/text", () => ({
  Text: ({ children }: { children: React.ReactNode }) => children,
}))

import FintocWidgetModal from "../FintocWidgetModal.native"

describe("FintocWidgetModal (native)", () => {
  beforeEach(() => {
    MockWebView.mockClear()
    mockFetchJsonWithAuth.mockResolvedValue({ widget_token: "li_test_sec_abc" })
  })

  it("fetches widget_token from backend when visible", async () => {
    render(<FintocWidgetModal visible={true} onSuccess={jest.fn()} onExit={jest.fn()} />)

    await waitFor(() => {
      expect(mockFetchJsonWithAuth).toHaveBeenCalledWith(
        "/fintoc/link_intent",
        { method: "POST" }
      )
    })
  })

  it("includes widget_token in WebView URL", async () => {
    render(<FintocWidgetModal visible={true} onSuccess={jest.fn()} onExit={jest.fn()} />)

    await waitFor(() => {
      const call = MockWebView.mock.calls.find((c: any[]) => c[0]?.source?.uri)
      expect(call).toBeTruthy()
      const uri: string = call[0].source.uri
      expect(uri).toContain(`widget_token=${encodeURIComponent("li_test_sec_abc")}`)
    })
  })

  it("includes public_key and holder_type in WebView URL", async () => {
    render(<FintocWidgetModal visible={true} onSuccess={jest.fn()} onExit={jest.fn()} />)

    await waitFor(() => {
      const call = MockWebView.mock.calls.find((c: any[]) => c[0]?.source?.uri)
      expect(call).toBeTruthy()
      const uri: string = call[0].source.uri
      expect(uri).toContain("holder_type=individual")
      expect(uri).toContain("country=cl")
    })
  })

  it("does not include product or webhook_url (widgetToken flow)", async () => {
    render(<FintocWidgetModal visible={true} onSuccess={jest.fn()} onExit={jest.fn()} />)

    await waitFor(() => {
      const call = MockWebView.mock.calls.find((c: any[]) => c[0]?.source?.uri)
      expect(call).toBeTruthy()
      const uri: string = call[0].source.uri
      expect(uri).not.toContain("product=")
      expect(uri).not.toContain("webhook_url=")
    })
  })
})
