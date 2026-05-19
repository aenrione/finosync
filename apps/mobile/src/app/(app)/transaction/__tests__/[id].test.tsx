import React from "react";
import { Alert } from "react-native";
import { fireEvent, render } from "@testing-library/react-native";
import { router, useLocalSearchParams } from "expo-router";

import TransactionDetailsScreen from "../[id]";
import { Transaction } from "@/types/transaction";
import { Account } from "@/types/account";

// ---- Mocks ----

const mockDeleteTransaction = jest.fn();
const mockUpdateTransaction = jest.fn();
const mockSetCurrentTransaction = jest.fn();

let mockTransactions: Transaction[] = [];
let mockAccounts: Account[] = [];

jest.mock("@/context/transactions.context", () => ({
  useTransactions: () => ({
    transactionsData: mockTransactions,
    deleteTransaction: mockDeleteTransaction,
    updateTransaction: mockUpdateTransaction,
  }),
}));

jest.mock("@/context/categories.context", () => ({
  useCategories: () => ({ categoriesData: [] }),
}));

jest.mock("@/context/accounts.context", () => ({
  useAccounts: () => ({ accountsData: mockAccounts }),
}));

// useStore is consumed via selectors: useStore(state => state.isVisible) and
// useStore(state => state.setCurrentTransaction). Mock as a selector-aware fn.
jest.mock("@/utils/store", () => ({
  useStore: (selector: (s: any) => any) =>
    selector({
      isVisible: true,
      setCurrentTransaction: mockSetCurrentTransaction,
    }),
}));

// Presentational stubs so we can match buttons by their visible label.
jest.mock("@/components/screen-header", () => {
  const r = require("react");
  return {
    __esModule: true,
    default: ({ title }: { title: string }) =>
      r.createElement("ScreenHeader", { title }),
  };
});

jest.mock("@/components/ui/icon", () => {
  const r = require("react");
  return {
    __esModule: true,
    default: ({ name }: { name: string }) =>
      r.createElement("Icon", { name }),
  };
});

jest.mock("@/components/ui/text", () => {
  const r = require("react");
  const { Text: RNText } = require("react-native");
  return {
    Text: ({ children, ...rest }: any) =>
      r.createElement(RNText, rest, children),
  };
});

// ---- Helpers ----

const buildTransaction = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: 42,
  amount: -1500,
  currency: "CLP",
  description: "Coffee",
  post_date: "2026-03-09",
  transaction_date: "2026-03-09",
  transaction_type: "purchase",
  created_at: "2026-03-09T12:00:00Z",
  updated_at: "2026-03-09T12:00:00Z",
  account_id: 1,
  ignore: false,
  ...overrides,
});

const buildAccount = (overrides: Partial<Account> = {}): Account => ({
  id: 1,
  account_name: "My Wallet",
  account_type: "local",
  code: "CLP",
  currency: "CLP",
  editable: true,
  ...overrides,
});

// Press the Alert button matching `label` by invoking its onPress directly.
const pressAlertButton = (label: string) => {
  const spy = Alert.alert as unknown as jest.Mock;
  const lastCall = spy.mock.calls[spy.mock.calls.length - 1];
  const buttons = lastCall?.[2] as
    | Array<{ text: string; onPress?: () => void | Promise<void> }>
    | undefined;
  const button = buttons?.find((b) => b.text === label);
  if (!button?.onPress) {
    throw new Error(`Alert button "${label}" has no onPress`);
  }
  return button.onPress();
};

// ---- Setup ----

beforeEach(() => {
  jest.spyOn(Alert, "alert").mockImplementation(() => {});
  (useLocalSearchParams as jest.Mock).mockReturnValue({ id: "42" });
  mockTransactions = [buildTransaction()];
  mockAccounts = [buildAccount()];
});

// ---- Tests ----

describe("TransactionDetailsScreen", () => {
  describe("when the transaction is not found", () => {
    it("renders the not-found state and returns on Go Back", () => {
      mockTransactions = [];
      const { getByText } = render(<TransactionDetailsScreen />);

      expect(getByText("Transaction Not Found")).toBeTruthy();
      fireEvent.press(getByText("Go Back"));
      expect(router.back).toHaveBeenCalled();
    });
  });

  describe("with a local (editable) account", () => {
    it("renders Edit, Exclude, and Delete buttons", () => {
      const { getByText } = render(<TransactionDetailsScreen />);
      expect(getByText("Edit")).toBeTruthy();
      expect(getByText("Exclude")).toBeTruthy();
      expect(getByText("Delete")).toBeTruthy();
    });

    it("navigates to edit when Edit is pressed", () => {
      const { getByText } = render(<TransactionDetailsScreen />);
      fireEvent.press(getByText("Edit"));
      expect(mockSetCurrentTransaction).toHaveBeenCalledWith(
        expect.objectContaining({ id: 42 }),
      );
    });

    it("calls updateTransaction with ignore=true when Exclude is confirmed", async () => {
      mockUpdateTransaction.mockResolvedValueOnce({});
      const { getByText } = render(<TransactionDetailsScreen />);

      fireEvent.press(getByText("Exclude"));
      await pressAlertButton("Confirm");

      expect(mockUpdateTransaction).toHaveBeenCalledWith(42, { ignore: true });
    });

    it("shows an Alert when updateTransaction fails", async () => {
      mockUpdateTransaction.mockRejectedValueOnce(new Error("boom"));
      const { getByText } = render(<TransactionDetailsScreen />);

      fireEvent.press(getByText("Exclude"));
      await pressAlertButton("Confirm");

      expect(Alert.alert).toHaveBeenLastCalledWith("Update failed", "boom");
    });

    it("calls deleteTransaction and navigates back when Delete is confirmed", async () => {
      mockDeleteTransaction.mockResolvedValueOnce(undefined);
      const { getByText } = render(<TransactionDetailsScreen />);

      fireEvent.press(getByText("Delete"));
      await pressAlertButton("Delete");

      expect(mockDeleteTransaction).toHaveBeenCalledWith(42);
      expect(router.back).toHaveBeenCalled();
    });

    it("shows an Alert and does not navigate back when delete fails", async () => {
      mockDeleteTransaction.mockRejectedValueOnce(new Error("nope"));
      (router.back as jest.Mock).mockClear();
      const { getByText } = render(<TransactionDetailsScreen />);

      fireEvent.press(getByText("Delete"));
      await pressAlertButton("Delete");

      expect(Alert.alert).toHaveBeenLastCalledWith("Delete failed", "nope");
      expect(router.back).not.toHaveBeenCalled();
    });
  });

  describe("when the transaction is excluded (ignore=true)", () => {
    beforeEach(() => {
      mockTransactions = [buildTransaction({ ignore: true })];
    });

    it("renders Include instead of Exclude", () => {
      const { getByText, queryByText } = render(<TransactionDetailsScreen />);
      expect(getByText("Include")).toBeTruthy();
      expect(queryByText("Exclude")).toBeNull();
    });

    it("calls updateTransaction with ignore=false when Include is confirmed", async () => {
      mockUpdateTransaction.mockResolvedValueOnce({});
      const { getByText } = render(<TransactionDetailsScreen />);

      fireEvent.press(getByText("Include"));
      await pressAlertButton("Confirm");

      expect(mockUpdateTransaction).toHaveBeenCalledWith(42, { ignore: false });
    });
  });

  describe.each([
    ["fintoc" as const],
    ["buda" as const],
    ["fintual" as const],
  ])("with a non-local (%s) account", (accountType) => {
    beforeEach(() => {
      mockAccounts = [buildAccount({ account_type: accountType, editable: false })];
    });

    it("hides Edit and Delete but keeps Exclude visible", () => {
      const { queryByText, getByText } = render(<TransactionDetailsScreen />);

      expect(queryByText("Edit")).toBeNull();
      expect(queryByText("Delete")).toBeNull();
      expect(getByText("Exclude")).toBeTruthy();
    });

    it("still allows toggling ignore via Exclude", async () => {
      mockUpdateTransaction.mockResolvedValueOnce({});
      const { getByText } = render(<TransactionDetailsScreen />);

      fireEvent.press(getByText("Exclude"));
      await pressAlertButton("Confirm");

      expect(mockUpdateTransaction).toHaveBeenCalledWith(42, { ignore: true });
    });
  });
});
