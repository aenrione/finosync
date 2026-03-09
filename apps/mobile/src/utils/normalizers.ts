import { ShoppingItem, ShoppingList } from "@/types/shopping";
import { Transaction } from "@/types/transaction";
import { parseNumericAmount } from "@/utils/currency";

export const normalizeTransaction = (transaction: any): Transaction => ({
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

export const normalizeTransactions = (transactions: any[] = []) => {
  return transactions.map(normalizeTransaction);
};

export const normalizeShoppingItem = (item: any): ShoppingItem => ({
  ...item,
  price: parseNumericAmount(item.price) ?? 0,
  transaction: item.transaction
    ? normalizeTransaction(item.transaction)
    : undefined,
});

export const normalizeShoppingList = (shoppingList: any): ShoppingList => ({
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

export const normalizeShoppingLists = (shoppingLists: any[] = []) =>
  shoppingLists.map(normalizeShoppingList);
