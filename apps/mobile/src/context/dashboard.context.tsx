import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";

import { fetchWithAuth } from "@/utils/api";
import { Account } from "@/types/account";
import { normalizeTransactions } from "@/utils/normalizers";
import { useStore } from "@/utils/store";

import { useAccounts } from "./accounts.context";

type DashboardData = any; // Replace with a more specific type if available

type DashboardContextType = {
  dashboard: DashboardData | null;
  accounts: Account[] | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

const DashboardContext = createContext<DashboardContextType | null>(null);

type DashboardProviderProps = {
  children: ReactNode;
};

export function DashboardProvider({ children }: DashboardProviderProps) {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { accountsData: accounts } = useAccounts();
  const baseCurrency = useStore((s) => s.baseCurrency);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithAuth(`/dashboard?currency=${baseCurrency}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: DashboardData = await res.json();
      if (Array.isArray(data?.recent_transactions)) {
        data.recent_transactions = normalizeTransactions(
          data.recent_transactions,
        );
      }
      setDashboard(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unknown error");
      }
    } finally {
      setLoading(false);
    }
  }, [baseCurrency]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard, accounts]);

  return (
    <DashboardContext.Provider
      value={{
        dashboard,
        loading,
        error,
        refresh: fetchDashboard,
        accounts: dashboard?.accounts,
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
