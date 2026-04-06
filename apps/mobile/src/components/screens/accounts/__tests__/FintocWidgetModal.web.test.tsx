import React from "react"
import { render, waitFor } from "@testing-library/react-native"
import FintocWidgetModal from "../FintocWidgetModal.web"

// Mock @fintoc/fintoc-js
const mockOpen = jest.fn()
const mockDestroy = jest.fn()
const mockCreate = jest.fn(() => ({ open: mockOpen, destroy: mockDestroy }))

jest.mock("@fintoc/fintoc-js", () => ({
  getFintoc: jest.fn(() =>
    Promise.resolve({ create: mockCreate })
  ),
}))

// Mock fetchJsonWithAuth
const mockFetchJsonWithAuth = jest.fn()
jest.mock("@/utils/api", () => ({
  fetchJsonWithAuth: (...args: any[]) => mockFetchJsonWithAuth(...args),
}))

// Mock @/components/ui/text
jest.mock("@/components/ui/text", () => ({
  Text: ({ children }: { children: React.ReactNode }) => children,
}))


describe("FintocWidgetModal (web)", () => {
  beforeEach(() => {
    mockFetchJsonWithAuth.mockResolvedValue({ widget_token: "li_test_sec_abc" })
    // Restore the getFintoc mock after clearAllMocks
    const { getFintoc } = require("@fintoc/fintoc-js")
    ;(getFintoc as jest.Mock).mockImplementation(() =>
      Promise.resolve({ create: mockCreate })
    )
    mockCreate.mockImplementation(() => ({ open: mockOpen, destroy: mockDestroy }))
  })

  it("fetches widget_token from backend before opening widget", async () => {
    render(<FintocWidgetModal visible={true} onSuccess={jest.fn()} onExit={jest.fn()} />)

    await waitFor(() => {
      expect(mockFetchJsonWithAuth).toHaveBeenCalledWith(
        "/fintoc/link_intent",
        { method: "POST" }
      )
    })
  })

  it("passes widgetToken from backend to Fintoc.create", async () => {
    render(<FintocWidgetModal visible={true} onSuccess={jest.fn()} onExit={jest.fn()} />)

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          widgetToken: "li_test_sec_abc",
        })
      )
    })
  })

  it("passes publicKey and holderType to Fintoc.create", async () => {
    render(<FintocWidgetModal visible={true} onSuccess={jest.fn()} onExit={jest.fn()} />)

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          publicKey: expect.any(String),
          holderType: "individual",
          country: "cl",
        })
      )
    })
  })

  it("does not pass product or webhookUrl (widgetToken flow)", async () => {
    render(<FintocWidgetModal visible={true} onSuccess={jest.fn()} onExit={jest.fn()} />)

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalled()
      const callArgs = mockCreate.mock.calls[0][0]
      expect(callArgs).not.toHaveProperty("product")
      expect(callArgs).not.toHaveProperty("webhookUrl")
    })
  })

  it("opens the widget after fetching token", async () => {
    render(<FintocWidgetModal visible={true} onSuccess={jest.fn()} onExit={jest.fn()} />)

    await waitFor(() => {
      expect(mockOpen).toHaveBeenCalled()
    })
  })
})
