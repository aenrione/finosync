"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";

import { fetchWithAuth } from "@/utils/api";
import { colors } from "@/lib/colors";
import { parseNumericAmount, getCurrencyMeta } from "@/utils/currency";
import { useStore } from "@/utils/store";

type ChartData = {
  name: string;
  amount: number;
  color: string;
  legendFontSize: number;
  legendFontColor: string;
};

type BalanceData = {
  month: string;
  income: number;
  expenses: number;
  net: number;
};

type AccountBalanceData = {
  id: number;
  name: string;
  currency: string;
  account_type: string;
  balance: number;
  data: number[];
  labels: string[];
  color: string;
};

type CurrencyOverview = {
  currency: string;
  income: number;
  expenses: number;
  net: number;
  flag: string;
  color: string;
};

type ChartsContextType = {
  expenseData: ChartData[];
  incomeData: ChartData[];
  balanceData: BalanceData[];
  accountBalances: AccountBalanceData[];
  currencyOverview: CurrencyOverview[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  baseCurrency: string;
  selectedAccount: number;
  timeRange: string;
  showIncome: boolean;
  setSelectedAccount: (accountId: number) => void;
  setTimeRange: (range: string) => void;
  setShowIncome: (show: boolean) => void;
  refreshData: () => Promise<void>;
  fetchChartData: (params?: {
    currency?: string;
    accountId?: number;
    timeRange?: string;
    type?: "expense" | "income";
  }) => Promise<void>;
  avgIncome: number;
  avgExpenses: number;
  avgSavings: number;
};

const ChartsContext = createContext<ChartsContextType | undefined>(undefined);

export function ChartsProvider({ children }: { children: React.ReactNode }) {
  const [expenseData, setExpenseData] = useState<ChartData[]>([]);
  const [incomeData, setIncomeData] = useState<ChartData[]>([]);
  const [balanceData, setBalanceData] = useState<BalanceData[]>([]);
  const [accountBalances, setAccountBalances] = useState<AccountBalanceData[]>(
    [],
  );
  const [currencyOverview, setCurrencyOverview] = useState<CurrencyOverview[]>(
    [],
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const baseCurrency = useStore((s) => s.baseCurrency);
  const [selectedAccount, setSelectedAccount] = useState<number>(0);
  const [timeRange, setTimeRange] = useState<string>("6M");
  const [showIncome, setShowIncome] = useState<boolean>(false);
  const [avgIncome, setAvgIncome] = useState<number>(0);
  const [avgExpenses, setAvgExpenses] = useState<number>(0);
  const [avgSavings, setAvgSavings] = useState<number>(0);

  const generateChartColors = (count: number): string[] => {
    const palette = [
      colors.error,
      colors.warning,
      colors.chart.purple,
      colors.savings,
      colors.success,
      colors.chart.amber,
      colors.chart.red,
      colors.chart.blue,
      colors.chart.green,
      colors.primary,
    ];
    return palette.slice(0, count);
  };

  const fetchChartData = useCallback(
    async (params?: {
      currency?: string;
      accountId?: number;
      timeRange?: string;
      type?: "expense" | "income";
    }) => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams();
        if (params?.currency) queryParams.append("currency", params.currency);
        if (params?.accountId)
          queryParams.append("account_id", params.accountId.toString());
        if (params?.timeRange)
          queryParams.append("time_range", params.timeRange);
        if (params?.type) queryParams.append("type", params.type);

        const res = await fetchWithAuth(
          `/charts/data?${queryParams.toString()}`,
        );

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();

        if (params?.type === "expense" || !params?.type) {
          const palette = generateChartColors(data.expenses?.length || 0);
          const expenseChartData = (data.expenses || []).map(
            (item: any, index: number) => ({
              name: item.category_name || item.name,
              amount: parseNumericAmount(item.amount) ?? 0,
              color: palette[index],
              legendFontSize: 12,
              legendFontColor: colors.neutral[700],
            }),
          );
          setExpenseData(expenseChartData);
        }

        if (params?.type === "income" || !params?.type) {
          const palette = generateChartColors(data.income?.length || 0);
          const incomeChartData = (data.income || []).map(
            (item: any, index: number) => ({
              name: item.category_name || item.name,
              amount: parseNumericAmount(item.amount) ?? 0,
              color: palette[index],
              legendFontSize: 12,
              legendFontColor: colors.neutral[700],
            }),
          );
          setIncomeData(incomeChartData);
        }

        if (data.balance) {
          setBalanceData(data.balance);
        }
        if (data.avgIncome !== undefined)
          setAvgIncome(parseNumericAmount(data.avgIncome) ?? 0);
        if (data.avgExpenses !== undefined)
          setAvgExpenses(parseNumericAmount(data.avgExpenses) ?? 0);
        if (data.avgSavings !== undefined)
          setAvgSavings(parseNumericAmount(data.avgSavings) ?? 0);

        if (data.account_balances) {
          setAccountBalances(data.account_balances);
        }

        if (data.currency_overview) {
          const overview = data.currency_overview.map((item: any) => ({
            currency: item.currency,
            income: parseNumericAmount(item.income) ?? 0,
            expenses: parseNumericAmount(item.expenses) ?? 0,
            net: parseNumericAmount(item.net) ?? 0,
            flag: getCurrencyMeta(item.currency).flag,
            color: colors.primary,
          }));
          setCurrencyOverview(overview);
        }
      } catch (err) {
        console.error("Error fetching chart data:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const refreshData = useCallback(async () => {
    setRefreshing(true);
    await fetchChartData({
      currency: baseCurrency,
      accountId: selectedAccount,
      timeRange,
    });
    setRefreshing(false);
  }, [fetchChartData, baseCurrency, selectedAccount, timeRange]);

  useEffect(() => {
    fetchChartData({
      currency: baseCurrency,
      accountId: selectedAccount,
      timeRange,
    });
  }, [fetchChartData, baseCurrency, selectedAccount, timeRange]);

  const contextValue = useMemo(
    () => ({
      expenseData,
      incomeData,
      balanceData,
      accountBalances,
      currencyOverview,
      loading,
      error,
      refreshing,
      baseCurrency,
      selectedAccount,
      timeRange,
      showIncome,
      setSelectedAccount,
      setTimeRange,
      setShowIncome,
      refreshData,
      fetchChartData,
      avgIncome,
      avgExpenses,
      avgSavings,
    }),
    [
      expenseData,
      incomeData,
      balanceData,
      accountBalances,
      currencyOverview,
      loading,
      error,
      refreshing,
      baseCurrency,
      selectedAccount,
      timeRange,
      showIncome,
      refreshData,
      fetchChartData,
      avgIncome,
      avgExpenses,
      avgSavings,
    ],
  );

  return (
    <ChartsContext.Provider value={contextValue}>
      {children}
    </ChartsContext.Provider>
  );
}

export function useCharts(): ChartsContextType {
  const context = useContext(ChartsContext);
  if (context === undefined) {
    throw new Error("useCharts must be used within a ChartsProvider");
  }
  return context;
}
