"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";

import { Transaction } from "@/types/transaction";
import { fetchWithAuth } from "@/utils/api";
import { normalizeTransactions } from "@/utils/normalizers";
import { useStore } from "@/utils/store";

type TransactionsContextType = {
  transactionsData: Transaction[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  currentPage: number;
  refreshData: () => Promise<void>;
  loadMore: () => Promise<void>;
  createTransaction: (data: TransactionFormData) => Promise<Transaction>;
  updateTransaction: (
    id: number,
    data: Partial<TransactionFormData>,
  ) => Promise<Transaction>;
  deleteTransaction: (id: number) => Promise<void>;
  // Account filtering functions
  fetchTransactionsByAccount: (
    accountId: number,
    page?: number,
    isRefresh?: boolean,
  ) => Promise<Transaction[]>;
  clearAccountFilter: () => void;
  isAccountFiltered: boolean;
  currentAccountId: number | null;
};

type TransactionFormData = {
  description: string;
  amount: number;
  transaction_date: string;
  account_id: number;
  transaction_category_id?: number;
  comment?: string;
};

type PaginationMeta = {
  count: number;
  page: number;
  items: number;
  pages: number;
  last: number;
  from: number;
  to: number;
  prev: number | null;
  next: number | null;
};

const TransactionsContext = createContext<TransactionsContextType | undefined>(
  undefined,
);

export function TransactionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [transactionsData, setTransactionsData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(
    null,
  );
  const [currentAccountId, setCurrentAccountId] = useState<number | null>(null);

  const ITEMS_PER_PAGE = 7;
  const baseCurrency = useStore((s) => s.baseCurrency);

  const fetchTransactions = useCallback(
    async (page: number = 1, isRefresh: boolean = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else if (page === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        setError(null);

        const res = await fetchWithAuth(
          `/transactions?currency=${baseCurrency}&page=${page}&limit=${ITEMS_PER_PAGE}`,
        );

        // Check if response is ok
        if (!res.ok) {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await res.json();
            throw new Error(
              errorData.error || `HTTP ${res.status}: ${res.statusText}`,
            );
          } else {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }
        }

        // Check content type before parsing JSON
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Invalid response format: expected JSON");
        }

        const responseData = await res.json();

        // Handle the response structure - data could be an array or have meta
        let transactions: Transaction[] = [];
        let meta: PaginationMeta | null = null;

        if (Array.isArray(responseData)) {
          // Direct array response
          transactions = normalizeTransactions(responseData);
        } else if (responseData && typeof responseData === "object") {
          // Response with metadata
          transactions = Array.isArray(responseData.data)
            ? normalizeTransactions(responseData.data)
            : [];
          meta = responseData.meta || null;
        }

        // Set pagination metadata
        if (meta) {
          setPaginationMeta(meta);
          setHasMore(meta.page < meta.pages);
        } else {
          // Fallback: if no metadata, assume we have more if we got a full page
          setHasMore(transactions.length === ITEMS_PER_PAGE);
        }

        if (page === 1 || isRefresh) {
          // First page or refresh - replace all data
          setTransactionsData(transactions);
          setCurrentPage(1);
        } else {
          // Load more - append to existing data
          setTransactionsData((prev) => [...prev, ...transactions]);
          setCurrentPage(page);
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        if (page === 1) {
          setTransactionsData([]);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [baseCurrency],
  );

  const fetchTransactionsByAccount = useCallback(
    async (
      accountId: number,
      page: number = 1,
      isRefresh: boolean = false,
    ): Promise<Transaction[]> => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else if (page === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        setError(null);
        setCurrentAccountId(accountId);

        const res = await fetchWithAuth(
          `/transactions?currency=${baseCurrency}&account_id=${accountId}&page=${page}&limit=${ITEMS_PER_PAGE}`,
        );

        // Check if response is ok
        if (!res.ok) {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await res.json();
            throw new Error(
              errorData.error || `HTTP ${res.status}: ${res.statusText}`,
            );
          } else {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }
        }

        // Check content type before parsing JSON
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Invalid response format: expected JSON");
        }

        const responseData = await res.json();

        // Handle the response structure - data could be an array or have meta
        let transactions: Transaction[] = [];
        let meta: PaginationMeta | null = null;

        if (Array.isArray(responseData)) {
          // Direct array response
          transactions = normalizeTransactions(responseData);
        } else if (responseData && typeof responseData === "object") {
          // Response with metadata
          transactions = Array.isArray(responseData.data)
            ? normalizeTransactions(responseData.data)
            : [];
          meta = responseData.meta || null;
        }

        // Set pagination metadata
        if (meta) {
          setPaginationMeta(meta);
          setHasMore(meta.page < meta.pages);
        } else {
          // Fallback: if no metadata, assume we have more if we got a full page
          setHasMore(transactions.length === ITEMS_PER_PAGE);
        }

        if (page === 1 || isRefresh) {
          // First page or refresh - replace all data
          setTransactionsData(transactions);
          setCurrentPage(1);
        } else {
          // Load more - append to existing data
          setTransactionsData((prev) => [...prev, ...transactions]);
          setCurrentPage(page);
        }

        setError(null);
        return transactions;
      } catch (err) {
        console.error("Error fetching transactions by account:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        if (page === 1) {
          setTransactionsData([]);
        }
        return [];
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [baseCurrency],
  );

  const clearAccountFilter = useCallback(() => {
    setCurrentAccountId(null);
    fetchTransactions(1, true);
  }, [fetchTransactions]);

  const refreshData = useCallback(async () => {
    if (currentAccountId) {
      await fetchTransactionsByAccount(currentAccountId, 1, true);
    } else {
      await fetchTransactions(1, true);
    }
  }, [fetchTransactions, fetchTransactionsByAccount, currentAccountId]);

  const loadMore = useCallback(async () => {
    if (hasMore && !loadingMore) {
      if (currentAccountId) {
        await fetchTransactionsByAccount(
          currentAccountId,
          currentPage + 1,
          false,
        );
      } else {
        await fetchTransactions(currentPage + 1, false);
      }
    }
  }, [
    hasMore,
    loadingMore,
    currentPage,
    fetchTransactions,
    fetchTransactionsByAccount,
    currentAccountId,
  ]);

  const createTransaction = useCallback(
    async (formData: TransactionFormData): Promise<Transaction> => {
      const response = await fetchWithAuth("/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create transaction");
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Invalid response format: expected JSON");
      }

      const newTransaction = await response.json();
      // Refresh data to show the new transaction
      await refreshData();
      return newTransaction;
    },
    [refreshData],
  );

  const updateTransaction = useCallback(
    async (
      id: number,
      formData: Partial<TransactionFormData>,
    ): Promise<Transaction> => {
      const response = await fetchWithAuth(`/transactions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update transaction");
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Invalid response format: expected JSON");
      }

      const updatedTransaction = await response.json();
      // Refresh data to show the updated transaction
      await refreshData();
      return updatedTransaction;
    },
    [refreshData],
  );

  const deleteTransaction = useCallback(
    async (id: number): Promise<void> => {
      const response = await fetchWithAuth(`/transactions/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete transaction");
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }

      // Refresh data to remove the deleted transaction
      await refreshData();
    },
    [refreshData],
  );

  useEffect(() => {
    fetchTransactions(1, false);
  }, [fetchTransactions]);

  const contextValue = useMemo(
    () => ({
      transactionsData,
      loading,
      error,
      refreshing,
      loadingMore,
      hasMore,
      currentPage,
      refreshData,
      loadMore,
      createTransaction,
      updateTransaction,
      deleteTransaction,
      fetchTransactionsByAccount,
      clearAccountFilter,
      isAccountFiltered: currentAccountId !== null,
      currentAccountId,
    }),
    [
      transactionsData,
      loading,
      error,
      refreshing,
      loadingMore,
      hasMore,
      currentPage,
      refreshData,
      loadMore,
      createTransaction,
      updateTransaction,
      deleteTransaction,
      fetchTransactionsByAccount,
      clearAccountFilter,
      currentAccountId,
    ],
  );

  return (
    <TransactionsContext.Provider value={contextValue}>
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactions(): TransactionsContextType {
  const context = useContext(TransactionsContext);
  if (context === undefined) {
    throw new Error(
      "useTransactions must be used within a TransactionsProvider",
    );
  }
  return context;
}
