import { useStore } from "../index"
import { Account } from "@/types/account"

describe("AccountSlice", () => {
  const mockAccount: Account = {
    id: "1",
    account_name: "Savings",
    account_type: "local",
    code: "USD",
    balance: "1000",
  }

  beforeEach(() => {
    useStore.setState({
      currentAccount: undefined,
      router: null,
    })
  })

  test("initial currentAccount is undefined", () => {
    expect(useStore.getState().currentAccount).toBeUndefined()
  })

  test("setCurrentAccount updates currentAccount", () => {
    useStore.getState().setCurrentAccount(mockAccount)

    expect(useStore.getState().currentAccount).toEqual(mockAccount)
  })

  test("setCurrentAccount navigates to add-account when router is set", () => {
    const mockRouter = { push: jest.fn() }
    useStore.setState({ router: mockRouter as any })

    useStore.getState().setCurrentAccount(mockAccount)

    expect(mockRouter.push).toHaveBeenCalledWith("/(app)/add-account")
  })

  test("setCurrentAccount does not throw when router is null", () => {
    expect(() => useStore.getState().setCurrentAccount(mockAccount)).not.toThrow()
  })
})
