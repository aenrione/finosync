"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";

import {
  ensureOk,
  fetchJsonWithAuth,
  fetchWithAuth,
  getErrorMessage,
} from "@/utils/api";
import { Account } from "@/types/account";
import { loadSnapshot, saveSnapshot } from "@/utils/offline-cache";
import { useStore } from "@/utils/store";

type AccountsContextType = {
  accountsData: Account[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  isStale: boolean;
  lastUpdated: string | null;
  refreshData: () => Promise<void>;
  createAccount: (account: Partial<Account>) => Promise<void>;
  deleteAccount: (accountId: string) => Promise<void>;
};

const AccountsContext = createContext<AccountsContextType | undefined>(
  undefined,
);

export function AccountsProvider({ children }: { children: React.ReactNode }) {
  const [accountsData, setAccountsData] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const baseCurrency = useStore((s) => s.baseCurrency);
  const cacheKey = `accounts:${baseCurrency}`;
  const hasDataRef = useRef(false);

  useEffect(() => {
    hasDataRef.current = accountsData.length > 0;
  }, [accountsData.length]);

  const fetchAccountss = useCallback(
    async (options?: { refresh?: boolean }) => {
      const hasLocalData = hasDataRef.current;

      try {
        if (hasLocalData || options?.refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const data = await fetchJsonWithAuth<Account[]>(
          `/accounts?currency=${baseCurrency}`,
        );

        setAccountsData(data);
        setError(null);
        setIsStale(false);
        const snapshot = await saveSnapshot(cacheKey, data);
        setLastUpdated(snapshot.updatedAt);
      } catch (err) {
        console.error("Error fetching accounts:", err);
        setError(getErrorMessage(err));
        if (hasLocalData) {
          setIsStale(true);
        } else {
          const snapshot = await loadSnapshot<Account[]>(cacheKey);
          if (snapshot) {
            setAccountsData(snapshot.value);
            setLastUpdated(snapshot.updatedAt);
            setIsStale(true);
          }
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [baseCurrency, cacheKey],
  );

  const createAccount = useCallback(
    async (account: Partial<Account>) => {
      try {
        setLoading(true);
        await fetchJsonWithAuth<Account>("/accounts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(account),
        });
        await fetchAccountss();
      } catch (err) {
        console.error("Error creating account:", err);
        setError(getErrorMessage(err, "Failed to create account"));
      } finally {
        setLoading(false);
      }
    },
    [fetchAccountss],
  );

  const deleteAccount = useCallback(
    async (accountId: string) => {
      try {
        setLoading(true);
        const response = await fetchWithAuth(`/accounts/${accountId}`, {
          method: "DELETE",
        });
        await ensureOk(response);
        await fetchAccountss();
      } catch (err) {
        console.error("Error deleting account:", err);
        setError(getErrorMessage(err, "Failed to delete account"));
      } finally {
        setLoading(false);
      }
    },
    [fetchAccountss],
  );

  useEffect(() => {
    let active = true;

    const restoreAndFetch = async () => {
      const hadData = hasDataRef.current;
      const snapshot = await loadSnapshot<Account[]>(cacheKey);

      if (active && snapshot) {
        setAccountsData(snapshot.value);
        setLastUpdated(snapshot.updatedAt);
        if (!hadData) {
          setIsStale(true);
        }
        setLoading(false);
      }

      if (active) {
        await fetchAccountss();
      }
    };

    restoreAndFetch();

    return () => {
      active = false;
    };
  }, [cacheKey, fetchAccountss]);

  const contextValue = useMemo(
    () => ({
      accountsData,
      loading,
      refreshing,
      error,
      isStale,
      lastUpdated,
      refreshData: () => fetchAccountss({ refresh: true }),
      createAccount,
      deleteAccount,
    }),
    [
      accountsData,
      loading,
      refreshing,
      error,
      isStale,
      lastUpdated,
      fetchAccountss,
      createAccount,
      deleteAccount,
    ],
  );

  return (
    <AccountsContext.Provider value={contextValue}>
      {children}
    </AccountsContext.Provider>
  );
}

export function useAccounts(): AccountsContextType {
  const context = useContext(AccountsContext);
  if (context === undefined) {
    throw new Error("useAccounts must be used within a AccountsProvider");
  }
  return context;
}
