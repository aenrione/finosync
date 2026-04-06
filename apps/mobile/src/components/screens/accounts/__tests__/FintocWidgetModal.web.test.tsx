import React from "react"
import { render, waitFor } from "@testing-library/react-native"
import FintocWidgetModal from "../FintocWidgetModal.web"

const MOCK_API_URL = "https://api.example.com"

// Mock @fintoc/fintoc-js
const mockOpen = jest.fn()
const mockDestroy = jest.fn()
const mockCreate = jest.fn(() => ({ open: mockOpen, destroy: mockDestroy }))

jest.mock("@fintoc/fintoc-js", () => ({
  getFintoc: jest.fn(() =>
    Promise.resolve({ create: mockCreate })
  ),
}))

// Mock @/components/ui/text to avoid NativeWind bridge dependency
jest.mock("@/components/ui/text", () => ({
  Text: ({ children }: { children: React.ReactNode }) => children,
}))

describe("FintocWidgetModal (web)", () => {
  beforeEach(() => {
    // Restore the getFintoc mock after clearAllMocks (called by global beforeEach)
    const { getFintoc } = require("@fintoc/fintoc-js")
    ;(getFintoc as jest.Mock).mockImplementation(() =>
      Promise.resolve({ create: mockCreate })
    )
    mockCreate.mockImplementation(() => ({ open: mockOpen, destroy: mockDestroy }))
  })

  it("passes webhookUrl derived from EXPO_PUBLIC_API_URL to Fintoc.create", async () => {
    const onSuccess = jest.fn()
    const onExit = jest.fn()

    render(<FintocWidgetModal visible={true} onSuccess={onSuccess} onExit={onExit} />)

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          webhookUrl: `${MOCK_API_URL}/webhooks/fintoc`,
        })
      )
    })
  })

  it("passes publicKey from env to Fintoc.create", async () => {
    const onSuccess = jest.fn()
    const onExit = jest.fn()

    render(<FintocWidgetModal visible={true} onSuccess={onSuccess} onExit={onExit} />)

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          publicKey: "pk_test_abc123",
        })
      )
    })
  })

  it("passes product movements and country cl", async () => {
    const onSuccess = jest.fn()
    const onExit = jest.fn()

    render(<FintocWidgetModal visible={true} onSuccess={onSuccess} onExit={onExit} />)

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          product: "movements",
          holderType: "individual",
          country: "cl",
        })
      )
    })
  })
})
