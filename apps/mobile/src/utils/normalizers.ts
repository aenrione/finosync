import {
  ShoppingBudgetAllocation,
  ShoppingItem,
  ShoppingList,
} from "@/types/shopping";
import { Transaction } from "@/types/transaction";
import { parseNumericAmount } from "@/utils/currency";

type RawTransaction = Omit<Transaction, "amount"> & {
  amount: string | number;
} & Record<string, unknown>;

type RawShoppingItem = Omit<ShoppingItem, "price" | "transaction"> & {
  price: string | number;
  transaction?: RawTransaction;
} & Record<string, unknown>;

type RawShoppingList = Omit<
  ShoppingList,
  "total_budget" | "total" | "items" | "budget_allocation"
> & {
  total_budget: string | number;
  total: string | number;
  items?: RawShoppingItem[];
  budget_allocation?: Omit<
    ShoppingBudgetAllocation,
    "planned_amount" | "rollover_in"
  > & {
    planned_amount: string | number;
    rollover_in: string | number;
  };
} & Record<string, unknown>;

export const normalizeTransaction = (transaction: RawTransaction): Transaction => ({
  ...transaction,
  id: transaction.id,
  account_id: transaction.account_id ?? undefined,
  transaction_category_id:
    transaction.transaction_category_id ??
    transaction.category?.id ??
    undefined,
  amount: parseNumericAmount(transaction.amount) ?? 0,
  formatted_amount: transaction.formatted_amount,
});

export const normalizeTransactions = (transactions: RawTransaction[] = []) => {
  return transactions.map(normalizeTransaction);
};

export const normalizeShoppingItem = (item: RawShoppingItem): ShoppingItem => ({
  ...item,
  price: parseNumericAmount(item.price) ?? 0,
  transaction: item.transaction
    ? normalizeTransaction(item.transaction)
    : undefined,
});

export const normalizeShoppingList = (shoppingList: RawShoppingList): ShoppingList => ({
  ...shoppingList,
  total_budget: parseNumericAmount(shoppingList.total_budget) ?? 0,
  total: parseNumericAmount(shoppingList.total) ?? 0,
  budget_allocation: shoppingList.budget_allocation
    ? {
        ...shoppingList.budget_allocation,
        planned_amount:
          parseNumericAmount(shoppingList.budget_allocation.planned_amount) ??
          0,
        rollover_in:
          parseNumericAmount(shoppingList.budget_allocation.rollover_in) ?? 0,
      }
    : undefined,
  items: Array.isArray(shoppingList.items)
    ? shoppingList.items.map(normalizeShoppingItem)
    : [],
});

export const normalizeShoppingLists = (shoppingLists: RawShoppingList[] = []) =>
  shoppingLists.map(normalizeShoppingList);
