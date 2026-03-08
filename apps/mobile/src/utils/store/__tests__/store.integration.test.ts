import { useStore } from "../index"

jest.mock("../session-store", () => ({
  getToken: jest.fn(),
  setToken: jest.fn(),
  deleteToken: jest.fn(),
}))

describe("Combined Store Integration", () => {
  beforeEach(() => {
    useStore.setState({
      user: null,
      isVisible: true,
      currentAccount: undefined,
      currentTransaction: undefined,
      currentCategory: undefined,
      router: null,
      url: "http://localhost:2999",
    })
  })

  test("all slices are accessible from the same store", () => {
    const state = useStore.getState()

    // UserSlice
    expect(state).toHaveProperty("user")
    expect(state).toHaveProperty("setUser")
    expect(state).toHaveProperty("isVisible")
    expect(state).toHaveProperty("toggleVisibility")
    expect(state).toHaveProperty("logout")

    // ConfigSlice
    expect(state).toHaveProperty("url")
    expect(state).toHaveProperty("setUrl")

    // RouterSlice
    expect(state).toHaveProperty("router")
    expect(state).toHaveProperty("setRouter")
    expect(state).toHaveProperty("navigate")

    // AccountSlice
    expect(state).toHaveProperty("currentAccount")
    expect(state).toHaveProperty("setCurrentAccount")

    // TransactionSlice
    expect(state).toHaveProperty("currentTransaction")
    expect(state).toHaveProperty("setCurrentTransaction")

    // CategorySlice
    expect(state).toHaveProperty("currentCategory")
    expect(state).toHaveProperty("setCurrentCategory")
  })

  test("setting router allows other slices to navigate", () => {
    const mockRouter = { push: jest.fn(), replace: jest.fn(), navigate: jest.fn(), back: jest.fn() }
    useStore.getState().setRouter(mockRouter as any)

    useStore.getState().setCurrentAccount({
      id: "1",
      account_name: "Test",
      account_type: "local",
      code: "USD",
    })

    expect(mockRouter.push).toHaveBeenCalledWith("/(app)/add-account")
  })

  test("navigate function uses router when set", () => {
    const mockRouter = { push: jest.fn(), replace: jest.fn(), navigate: jest.fn(), back: jest.fn() }
    useStore.getState().setRouter(mockRouter as any)

    useStore.getState().navigate("/test-path" as any)

    expect(mockRouter.push).toHaveBeenCalledWith("/test-path")
  })

  test("navigate warns when router is not set", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {})

    useStore.getState().navigate("/test-path" as any)

    expect(warnSpy).toHaveBeenCalledWith("Router is not initialized.")
    warnSpy.mockRestore()
  })

  test("logout flow clears user and navigates to sign-in", () => {
    const { deleteToken } = require("../session-store")
    const mockRouter = { push: jest.fn(), replace: jest.fn(), navigate: jest.fn(), back: jest.fn() }
    const mockUser = { id: 1, name: "Test", email: "test@test.com" } as any

    useStore.setState({ user: mockUser, router: mockRouter as any })

    useStore.getState().logout()

    expect(useStore.getState().user).toBeNull()
    expect(deleteToken).toHaveBeenCalled()
    expect(mockRouter.push).toHaveBeenCalledWith("/(auth)/sign-in")
  })
})
