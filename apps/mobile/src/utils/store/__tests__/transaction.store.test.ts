import { useStore } from "../index";
import { Transaction } from "@/types/transaction";

describe("TransactionSlice", () => {
  const mockTransaction: Transaction = {
    id: 1,
    amount: -50,
    currency: "USD",
    description: "Coffee",
    post_date: "2024-01-15",
    transaction_date: "2024-01-15",
    transaction_type: "debit",
    created_at: "2024-01-15",
    updated_at: "2024-01-15",
  };

  beforeEach(() => {
    useStore.setState({
      currentTransaction: undefined,
      router: null,
    });
  });

  test("initial currentTransaction is undefined", () => {
    expect(useStore.getState().currentTransaction).toBeUndefined();
  });

  test("setCurrentTransaction updates currentTransaction", () => {
    useStore.getState().setCurrentTransaction(mockTransaction);

    expect(useStore.getState().currentTransaction).toEqual(mockTransaction);
  });

  test("setCurrentTransaction navigates to the protected add-transaction route when router is set", () => {
    const mockRouter = { push: jest.fn() };
    useStore.setState({ router: mockRouter as any });

    useStore.getState().setCurrentTransaction(mockTransaction);

    expect(mockRouter.push).toHaveBeenCalledWith("/(app)/add-transaction");
  });

  test("setCurrentTransaction does not throw when router is null", () => {
    expect(() =>
      useStore.getState().setCurrentTransaction(mockTransaction),
    ).not.toThrow();
  });
});
