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

import { fetchJsonWithAuth, getErrorMessage } from "@/utils/api";
import { colors } from "@/lib/colors";
import { loadSnapshot, saveSnapshot } from "@/utils/offline-cache";
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
  month?: string;
  week?: string;
  income: number;
  expenses: number;
  net: number;
  currency?: string;
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
  isStale: boolean;
  lastUpdated: string | null;
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

type RawCategoryAmount = {
  category_name?: string;
  name?: string;
  amount: string | number;
};
type RawBalanceItem = {
  month?: string;
  week?: string;
  income: string | number;
  expenses: string | number;
  net: string | number;
  currency?: string;
};
type RawAccountBalance = {
  id: number;
  name: string;
  currency: string;
  account_type: string;
  balance: string | number;
  data: (string | number | null | undefined)[];
  labels: string[];
  color: string;
};
type RawCurrencyOverview = {
  currency: string;
  income: string | number;
  expenses: string | number;
  net: string | number;
};

type ChartsApiResponse = {
  expenses?: RawCategoryAmount[];
  income?: RawCategoryAmount[];
  balance?: RawBalanceItem[];
  account_balances?: RawAccountBalance[];
  currency_overview?: RawCurrencyOverview[];
  avgIncome?: string | number;
  avgExpenses?: string | number;
  avgSavings?: string | number;
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
  const [isStale, setIsStale] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const baseCurrency = useStore((s) => s.baseCurrency);
  const [selectedAccount, setSelectedAccount] = useState<number>(0);
  const [timeRange, setTimeRange] = useState<string>("6M");
  const [showIncome, setShowIncome] = useState<boolean>(false);
  const [avgIncome, setAvgIncome] = useState<number>(0);
  const [avgExpenses, setAvgExpenses] = useState<number>(0);
  const [avgSavings, setAvgSavings] = useState<number>(0);
  const cacheKey = `charts:${baseCurrency}:${selectedAccount}:${timeRange}`;
  const hasDataRef = useRef(false);

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

  useEffect(() => {
    hasDataRef.current =
      expenseData.length > 0 ||
      incomeData.length > 0 ||
      balanceData.length > 0 ||
      accountBalances.length > 0 ||
      currencyOverview.length > 0;
  }, [
    accountBalances.length,
    balanceData.length,
    currencyOverview.length,
    expenseData.length,
    incomeData.length,
  ]);

  const fetchChartData = useCallback(
    async (params?: {
      currency?: string;
      accountId?: number;
      timeRange?: string;
      type?: "expense" | "income";
      refresh?: boolean;
    }) => {
      const nextCurrency = params?.currency ?? baseCurrency;
      const nextAccountId = params?.accountId ?? selectedAccount;
      const nextTimeRange = params?.timeRange ?? timeRange;
      const nextCacheKey = `charts:${nextCurrency}:${nextAccountId}:${nextTimeRange}`;
      const hasLocalData = hasDataRef.current;

      try {
        if (hasLocalData || params?.refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const queryParams = new URLSearchParams();
        if (nextCurrency) queryParams.append("currency", nextCurrency);
        if (nextAccountId)
          queryParams.append("account_id", nextAccountId.toString());
        if (nextTimeRange) queryParams.append("time_range", nextTimeRange);
        if (params?.type) queryParams.append("type", params.type);

        const data = await fetchJsonWithAuth<ChartsApiResponse>(
          `/charts/data?${queryParams.toString()}`,
        );

        if (params?.type === "expense" || !params?.type) {
          const palette = generateChartColors(data.expenses?.length || 0);
          const expenseChartData = (data.expenses || []).map(
            (item: RawCategoryAmount, index: number) => ({
              name: item.category_name || item.name || "",
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
            (item: RawCategoryAmount, index: number) => ({
              name: item.category_name || item.name || "",
              amount: parseNumericAmount(item.amount) ?? 0,
              color: palette[index],
              legendFontSize: 12,
              legendFontColor: colors.neutral[700],
            }),
          );
          setIncomeData(incomeChartData);
        }

        if (data.balance) {
          const normalizedBalanceData = (data.balance || []).map(
            (item: RawBalanceItem) => ({
              month: item.month,
              week: item.week,
              income: parseNumericAmount(item.income) ?? 0,
              expenses: parseNumericAmount(item.expenses) ?? 0,
              net: parseNumericAmount(item.net) ?? 0,
              currency: item.currency,
            }),
          );

          setBalanceData(normalizedBalanceData);
        }
        if (data.avgIncome !== undefined)
          setAvgIncome(parseNumericAmount(data.avgIncome) ?? 0);
        if (data.avgExpenses !== undefined)
          setAvgExpenses(parseNumericAmount(data.avgExpenses) ?? 0);
        if (data.avgSavings !== undefined)
          setAvgSavings(parseNumericAmount(data.avgSavings) ?? 0);

        if (data.account_balances) {
          const normalizedAccountBalances = (data.account_balances || []).map(
            (item: RawAccountBalance) => ({
              id: item.id,
              name: item.name,
              currency: item.currency,
              account_type: item.account_type,
              balance: parseNumericAmount(item.balance) ?? 0,
              data: (item.data || []).map(
                (value: string | number | null | undefined) =>
                  parseNumericAmount(value) ?? 0,
              ),
              labels: item.labels || [],
              color: item.color,
            }),
          );

          setAccountBalances(normalizedAccountBalances);
        }

        if (data.currency_overview) {
          const overview = data.currency_overview.map((item: RawCurrencyOverview) => ({
            currency: item.currency,
            income: parseNumericAmount(item.income) ?? 0,
            expenses: parseNumericAmount(item.expenses) ?? 0,
            net: parseNumericAmount(item.net) ?? 0,
            flag: getCurrencyMeta(item.currency).flag,
            color: colors.primary,
          }));
          setCurrencyOverview(overview);
        }
        setIsStale(false);
        const snapshot = await saveSnapshot(nextCacheKey, data);
        setLastUpdated(snapshot.updatedAt);
      } catch (err) {
        console.error("Error fetching chart data:", err);
        setError(getErrorMessage(err));
        if (hasLocalData) {
          setIsStale(true);
        } else {
          const snapshot = await loadSnapshot<ChartsApiResponse>(nextCacheKey);
          if (snapshot) {
            hydrateChartState(snapshot.value);
            setLastUpdated(snapshot.updatedAt);
            setIsStale(true);
          }
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [baseCurrency, selectedAccount, timeRange],
  );

  const hydrateChartState = useCallback((data: ChartsApiResponse | undefined) => {
    const paletteExpenses = generateChartColors(data?.expenses?.length || 0);
    const paletteIncome = generateChartColors(data?.income?.length || 0);

    setExpenseData(
      (data?.expenses || []).map((item: RawCategoryAmount, index: number) => ({
        name: item.category_name || item.name || "",
        amount: parseNumericAmount(item.amount) ?? 0,
        color: paletteExpenses[index],
        legendFontSize: 12,
        legendFontColor: colors.neutral[700],
      })),
    );

    setIncomeData(
      (data?.income || []).map((item: RawCategoryAmount, index: number) => ({
        name: item.category_name || item.name || "",
        amount: parseNumericAmount(item.amount) ?? 0,
        color: paletteIncome[index],
        legendFontSize: 12,
        legendFontColor: colors.neutral[700],
      })),
    );

    setBalanceData(
      (data?.balance || []).map((item: RawBalanceItem) => ({
        month: item.month,
        week: item.week,
        income: parseNumericAmount(item.income) ?? 0,
        expenses: parseNumericAmount(item.expenses) ?? 0,
        net: parseNumericAmount(item.net) ?? 0,
        currency: item.currency,
      })),
    );

    setAvgIncome(parseNumericAmount(data?.avgIncome) ?? 0);
    setAvgExpenses(parseNumericAmount(data?.avgExpenses) ?? 0);
    setAvgSavings(parseNumericAmount(data?.avgSavings) ?? 0);

    setAccountBalances(
      (data?.account_balances || []).map((item: RawAccountBalance) => ({
        id: item.id,
        name: item.name,
        currency: item.currency,
        account_type: item.account_type,
        balance: parseNumericAmount(item.balance) ?? 0,
        data: (item.data || []).map(
          (value: string | number | null | undefined) =>
            parseNumericAmount(value) ?? 0,
        ),
        labels: item.labels || [],
        color: item.color,
      })),
    );

    setCurrencyOverview(
      (data?.currency_overview || []).map((item: RawCurrencyOverview) => ({
        currency: item.currency,
        income: parseNumericAmount(item.income) ?? 0,
        expenses: parseNumericAmount(item.expenses) ?? 0,
        net: parseNumericAmount(item.net) ?? 0,
        flag: getCurrencyMeta(item.currency).flag,
        color: colors.primary,
      })),
    );
  }, []);

  const refreshData = useCallback(async () => {
    await fetchChartData({
      currency: baseCurrency,
      accountId: selectedAccount,
      timeRange,
      refresh: true,
    });
  }, [fetchChartData, baseCurrency, selectedAccount, timeRange]);

  useEffect(() => {
    let active = true;

    const restoreAndFetch = async () => {
      const hadData = hasDataRef.current;
      const snapshot = await loadSnapshot<ChartsApiResponse>(cacheKey);

      if (active && snapshot) {
        hydrateChartState(snapshot.value);
        setLastUpdated(snapshot.updatedAt);
        // Only mark as stale on initial load (no data yet).
        // When changing filters with data already on screen, skip the
        // stale banner — the fetch below will either succeed (clearing
        // any staleness) or fail (which sets isStale in the catch block).
        if (!hadData) {
          setIsStale(true);
        }
        setLoading(false);
      }

      if (active) {
        await fetchChartData({
          currency: baseCurrency,
          accountId: selectedAccount,
          timeRange,
        });
      }
    };

    restoreAndFetch();

    return () => {
      active = false;
    };
  }, [
    baseCurrency,
    cacheKey,
    fetchChartData,
    hydrateChartState,
    selectedAccount,
    timeRange,
  ]);

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
      isStale,
      lastUpdated,
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
      isStale,
      lastUpdated,
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
