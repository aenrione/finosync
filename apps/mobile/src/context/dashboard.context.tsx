import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from "react";

import { fetchJsonWithAuth, getErrorMessage } from "@/utils/api";
import { Account } from "@/types/account";
import { Transaction } from "@/types/transaction";
import { loadSnapshot, saveSnapshot } from "@/utils/offline-cache";
import { normalizeTransactions } from "@/utils/normalizers";
import { useStore } from "@/utils/store";

type SpendingPeriod = {
  total_spent?: string | number;
  total_earned?: string | number;
};

type DashboardData = {
  accounts?: Account[];
  recent_transactions?: Transaction[];
  balances?: {
    currency: string;
    label?: string;
    symbol?: string;
    balance: string | number;
    changePct?: number;
  }[];
  spending_insights?: {
    this_month?: SpendingPeriod;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

type DashboardContextType = {
  dashboard: DashboardData | null;
  accounts: Account[] | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  isStale: boolean;
  lastUpdated: string | null;
  refresh: () => Promise<void>;
};

const DashboardContext = createContext<DashboardContextType | null>(null);

type DashboardProviderProps = {
  children: ReactNode;
};

export function DashboardProvider({ children }: DashboardProviderProps) {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const baseCurrency = useStore((s) => s.baseCurrency);
  const cacheKey = `dashboard:${baseCurrency}`;
  const hasDataRef = useRef(false);

  useEffect(() => {
    hasDataRef.current = Boolean(dashboard);
  }, [dashboard]);

  const fetchDashboard = useCallback(
    async (options?: { refresh?: boolean }) => {
      const hasLocalData = hasDataRef.current;

      if (hasLocalData || options?.refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const data = await fetchJsonWithAuth<DashboardData>(
          `/dashboard?currency=${baseCurrency}`,
        );
        if (Array.isArray(data?.recent_transactions)) {
          data.recent_transactions = normalizeTransactions(
            data.recent_transactions,
          );
        }
        setDashboard(data);
        setIsStale(false);
        const snapshot = await saveSnapshot(cacheKey, data);
        setLastUpdated(snapshot.updatedAt);
      } catch (err) {
        setError(getErrorMessage(err));
        if (hasLocalData) {
          setIsStale(true);
        } else {
          const snapshot = await loadSnapshot<DashboardData>(cacheKey);
          if (snapshot) {
            setDashboard(snapshot.value);
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

  useEffect(() => {
    let active = true;

    const restoreAndFetch = async () => {
      const hadData = hasDataRef.current;
      const snapshot = await loadSnapshot<DashboardData>(cacheKey);

      if (active && snapshot) {
        setDashboard(snapshot.value);
        setLastUpdated(snapshot.updatedAt);
        if (!hadData) {
          setIsStale(true);
        }
        setLoading(false);
      }

      if (active) {
        await fetchDashboard();
      }
    };

    restoreAndFetch();

    return () => {
      active = false;
    };
  }, [cacheKey, fetchDashboard]);

  return (
    <DashboardContext.Provider
      value={{
        dashboard,
        loading,
        refreshing,
        error,
        isStale,
        lastUpdated,
        refresh: () => fetchDashboard({ refresh: true }),
        accounts: dashboard?.accounts ?? null,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
