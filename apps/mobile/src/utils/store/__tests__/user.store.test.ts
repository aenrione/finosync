import { useStore } from "../index"

// Mock deleteToken
jest.mock("../session-store", () => ({
  getToken: jest.fn(),
  setToken: jest.fn(),
  deleteToken: jest.fn(),
}))

describe("UserSlice", () => {
  beforeEach(() => {
    // Reset store to initial state
    useStore.setState({
      user: null,
      isVisible: true,
      router: null,
    })
  })

  test("initial state has null user and isVisible true", () => {
    const state = useStore.getState()
    expect(state.user).toBeNull()
    expect(state.isVisible).toBe(true)
  })

  test("setUser updates user in store", () => {
    const mockUser = { id: 1, name: "Test User", email: "test@test.com" } as any

    useStore.getState().setUser(mockUser)

    expect(useStore.getState().user).toEqual(mockUser)
  })

  test("toggleVisibility flips isVisible from true to false", () => {
    expect(useStore.getState().isVisible).toBe(true)

    useStore.getState().toggleVisibility()

    expect(useStore.getState().isVisible).toBe(false)
  })

  test("toggleVisibility flips isVisible from false to true", () => {
    useStore.setState({ isVisible: false })

    useStore.getState().toggleVisibility()

    expect(useStore.getState().isVisible).toBe(true)
  })

  test("logout clears user and calls deleteToken", () => {
    const { deleteToken } = require("../session-store")
    const mockUser = { id: 1, name: "Test User", email: "test@test.com" } as any
    useStore.setState({ user: mockUser })

    useStore.getState().logout()

    expect(useStore.getState().user).toBeNull()
    expect(deleteToken).toHaveBeenCalled()
  })

  test("logout navigates to sign-in when router is set", () => {
    const mockRouter = { push: jest.fn(), replace: jest.fn(), navigate: jest.fn(), back: jest.fn() }
    useStore.setState({ router: mockRouter as any })

    useStore.getState().logout()

    expect(mockRouter.push).toHaveBeenCalledWith("/(auth)/sign-in")
  })

  test("logout does not throw when router is null", () => {
    useStore.setState({ router: null })

    expect(() => useStore.getState().logout()).not.toThrow()
  })
})
