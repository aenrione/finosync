# Dashboard & Cash Flow UI Redesign

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the Dashboard and Cash Flow screens with Monarch-inspired charts using `react-native-gifted-charts` — net worth stacked bar + line on dashboard, income/expense grouped bar + savings line on cash flow, and merged Monarch-style category progress bars replacing the pie chart + list.

**Architecture:** Replace `react-native-chart-kit` with `react-native-gifted-charts` (same `react-native-svg` dependency). Backend gets one small change: add `account_type` to the `account_balances` response. Frontend gets 3 new chart components and updates to 2 screens.

**Tech Stack:** React Native, Expo, TypeScript, NativeWind, react-native-gifted-charts, Rails API

---

### Task 1: Backend — Add account_type to account_balances response

**Files:**
- Modify: `apps/backend/app/controllers/charts_controller.rb:195-204`

**Step 1: Add account_type field**

In `get_account_balance_data`, add `account_type` to the returned hash:

```ruby
def get_account_balance_data(accounts, time_range)
  end_date = Date.current
  months_back = case time_range
  when "1M" then 1
  when "3M" then 3
  when "6M" then 6
  when "1Y" then 12
  else 6
  end

  accounts.map do |account|
    balance_data = []
    labels = []

    months_back.times do |i|
      month_start = end_date - i.months
      month_end = month_start.end_of_month

      balance = account.transactions
                      .where(transaction_date: month_start..month_end)
                      .sum(:amount)

      balance_data.unshift(balance)
      labels.unshift(month_start.strftime("%b"))
    end

    {
      id: account.id,
      name: account.account_name,
      currency: account.currency,
      account_type: account.account_type,
      balance: account.balance,
      data: balance_data,
      labels: labels,
      color: get_account_color(account.account_type)
    }
  end
end
```

**Step 2: Verify**

Run: `cd apps/backend && bundle exec rspec spec/ --format progress 2>&1 | tail -5`
Expected: All tests pass (no test needed for this — it's additive JSON field)

**Step 3: Commit**

```bash
git add apps/backend/app/controllers/charts_controller.rb
git commit -m "feat(backend): add account_type to account_balances chart response"
```

---

### Task 2: Install react-native-gifted-charts and remove react-native-chart-kit

**Files:**
- Modify: `apps/mobile/package.json`

**Step 1: Swap dependencies**

```bash
cd apps/mobile
pnpm add react-native-gifted-charts
pnpm remove react-native-chart-kit
```

**Step 2: Verify no other files import react-native-chart-kit**

```bash
grep -r "react-native-chart-kit" apps/mobile/src/
```

Expected: Only `category-pie-chart.tsx` imports it. This file will be replaced in Task 5.

**Step 3: Commit**

```bash
git add apps/mobile/package.json pnpm-lock.yaml
git commit -m "feat(mobile): swap react-native-chart-kit for react-native-gifted-charts"
```

---

### Task 3: Update charts context types for account_type

**Files:**
- Modify: `apps/mobile/src/context/charts.context.tsx:31-39`

**Step 1: Add account_type to AccountBalanceData type**

Change the `AccountBalanceData` type:

```typescript
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
```

**Step 2: Commit**

```bash
git add apps/mobile/src/context/charts.context.tsx
git commit -m "feat(mobile): add account_type to AccountBalanceData type"
```

---

### Task 4: Create Net Worth Chart component for Dashboard

**Files:**
- Create: `apps/mobile/src/components/features/dashboard/net-worth-chart.tsx`
- Modify: `apps/mobile/src/app/(app)/(drawer)/(tabs)/dashboard.tsx`

**Step 1: Create the net worth chart component**

This component uses `useCharts()` context (which is available because `ChartsProvider` wraps the app). It aggregates `accountBalances` by `account_type` into stacked bars with a net worth line overlay.

Create `apps/mobile/src/components/features/dashboard/net-worth-chart.tsx`:

```tsx
import { View, Text, useWindowDimensions } from "react-native";
import React, { useMemo, useState } from "react";
import { BarChart } from "react-native-gifted-charts";

import { useCharts } from "@/context/charts.context";
import { colors } from "@/lib/colors";
import { showAmount } from "@/utils/currency";
import { useStore } from "@/utils/store";
import Icon from "@/components/ui/icon";

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  local: { label: "Cash", color: colors.income },
  fintoc: { label: "Banking", color: colors.accountFintoc },
  fintual: { label: "Investments", color: colors.investment },
  buda: { label: "Crypto", color: colors.crypto },
};

export default function NetWorthChart() {
  const { accountBalances, loading } = useCharts();
  const isVisible = useStore((s) => s.isVisible);
  const { width: screenWidth } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(screenWidth - 40);

  const { stackData, lineData, labels, typeKeys } = useMemo(() => {
    if (!accountBalances || accountBalances.length === 0) {
      return { stackData: [], lineData: [], labels: [], typeKeys: [] };
    }

    const refLabels = accountBalances[0]?.labels || [];

    // Group accounts by type, sum their data arrays
    const grouped: Record<string, number[]> = {};
    for (const acct of accountBalances) {
      const type = acct.account_type || "local";
      if (!grouped[type]) {
        grouped[type] = new Array(refLabels.length).fill(0);
      }
      acct.data.forEach((val, i) => {
        grouped[type][i] += val;
      });
    }

    const keys = Object.keys(grouped).filter((k) => TYPE_CONFIG[k]);

    // Build stackData for each month
    const stacks = refLabels.map((label, i) => ({
      stacks: keys.map((type) => ({
        value: Math.abs(grouped[type][i]),
        color: TYPE_CONFIG[type].color,
      })),
      label,
    }));

    // Net worth line = sum of all types per month
    const line = refLabels.map((_, i) => {
      const total = keys.reduce((sum, type) => sum + grouped[type][i], 0);
      return { value: total };
    });

    return { stackData: stacks, lineData: line, labels: refLabels, typeKeys: keys };
  }, [accountBalances]);

  if (loading || stackData.length === 0) return null;

  const chartWidth = containerWidth - 50;
  const barWidth = Math.max(16, chartWidth / stackData.length - 20);

  return (
    <View className="px-5 mt-2 mb-2">
      <View className="flex-row items-center mb-3">
        <Icon name="TrendingUp" className="text-primary mr-2" size={20} />
        <Text className="text-lg font-semibold text-foreground">
          Net Worth Trend
        </Text>
      </View>
      <View
        className="bg-card rounded-2xl border border-border p-4 pb-2"
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        <BarChart
          stackData={stackData}
          width={chartWidth}
          barWidth={barWidth}
          spacing={Math.max(8, chartWidth / stackData.length - barWidth)}
          initialSpacing={10}
          endSpacing={10}
          noOfSections={4}
          barBorderTopLeftRadius={4}
          barBorderTopRightRadius={4}
          xAxisThickness={0}
          yAxisThickness={0}
          yAxisTextStyle={{ color: colors.mutedForeground, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: colors.mutedForeground, fontSize: 11 }}
          formatYLabel={(label) => {
            const val = Number(label);
            if (Math.abs(val) >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
            if (Math.abs(val) >= 1000) return `${(val / 1000).toFixed(0)}k`;
            return label;
          }}
          hideRules={false}
          rulesColor={colors.border}
          rulesType="dashed"
          showLine
          lineData={lineData}
          lineConfig={{
            color: colors.foreground,
            thickness: 2.5,
            curved: true,
            hideDataPoints: false,
            dataPointsColor: colors.foreground,
            dataPointsRadius: 3,
          }}
          disableScroll
        />

        {/* Legend */}
        <View className="flex-row flex-wrap gap-3 mt-3 mb-1 justify-center">
          {typeKeys.map((type) => (
            <View key={type} className="flex-row items-center">
              <View
                className="w-2.5 h-2.5 rounded-full mr-1.5"
                style={{ backgroundColor: TYPE_CONFIG[type].color }}
              />
              <Text className="text-xs text-muted-foreground">
                {TYPE_CONFIG[type].label}
              </Text>
            </View>
          ))}
          <View className="flex-row items-center">
            <View
              className="w-2.5 h-2.5 rounded-full mr-1.5"
              style={{ backgroundColor: colors.foreground }}
            />
            <Text className="text-xs text-muted-foreground">Net Worth</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
```

**Step 2: Add NetWorthChart to Dashboard screen**

In `apps/mobile/src/app/(app)/(drawer)/(tabs)/dashboard.tsx`, add the import and render it after TotalBalance:

```tsx
import { View, ScrollView, RefreshControl } from "react-native"
import React from "react"

import RecentTransactions from "@/components/features/dashboard/recent-transactions"
import SpendingInsights from "@/components/features/dashboard/spending-insights"
import NetWorthChart from "@/components/features/dashboard/net-worth-chart"
import TotalBalance from "@/components/features/dashboard/total-balance"
import QuickActions from "@/components/features/dashboard/quick-actions"
import AccountsList from "@/components/features/dashboard/accounts-list"
import DashboardHeader from "@/components/features/dashboard/header"
import { useDashboard } from "@/context/dashboard.context"
import { Spinner } from "@/components/ui/spinner"
import { Text } from "@/components/ui/text"

export default function DashboardScreen() {
  const { dashboard, loading, error, refresh } = useDashboard()

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Spinner size="large" />
        <Text className="text-lg text-muted-foreground mt-4">Loading dashboard...</Text>
      </View>
    )
  }
  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-lg text-destructive">{error}</Text>
      </View>
    )
  }
  if (!dashboard) {
    return null
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
          />
        }
      >
        <DashboardHeader />
        <TotalBalance balances={dashboard.balances} />
        <NetWorthChart />
        <QuickActions accounts={dashboard.accounts} />
        <AccountsList accounts={dashboard.accounts} />
        <RecentTransactions transactions={dashboard.recent_transactions} />
        <SpendingInsights insights={dashboard.spending_insights} />
      </ScrollView>
    </View>
  )
}
```

**Step 3: Verify**

Run: `cd apps/mobile && pnpm check-types 2>&1 | tail -10`
Expected: No type errors

**Step 4: Commit**

```bash
git add apps/mobile/src/components/features/dashboard/net-worth-chart.tsx apps/mobile/src/app/(app)/(drawer)/(tabs)/dashboard.tsx
git commit -m "feat(mobile): add net worth stacked bar chart to dashboard"
```

---

### Task 5: Create Cash Flow Bar Chart component

**Files:**
- Create: `apps/mobile/src/components/features/charts/cash-flow-chart.tsx`

**Step 1: Create cash flow grouped bar chart with savings line**

This replaces `BalanceTrends`. It shows income (green) and expenses (red) as grouped bars with a savings trend line overlay.

Create `apps/mobile/src/components/features/charts/cash-flow-chart.tsx`:

```tsx
import { View, Text, useWindowDimensions } from "react-native";
import React, { useMemo, useState } from "react";
import { BarChart } from "react-native-gifted-charts";

import { useCharts } from "@/context/charts.context";
import { colors } from "@/lib/colors";
import { showAmount } from "@/utils/currency";
import Icon from "@/components/ui/icon";

export default function CashFlowChart() {
  const { balanceData, avgIncome, avgExpenses, avgSavings } = useCharts();
  const { width: screenWidth } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(screenWidth - 40);

  const { barData, lineData, maxVal } = useMemo(() => {
    if (!balanceData || balanceData.length === 0) {
      return { barData: [], lineData: [], maxVal: 0 };
    }

    let max = 0;
    const bars: any[] = [];
    const line: { value: number }[] = [];

    balanceData.forEach((item) => {
      const label = (item as any).week ?? (item as any).month ?? "";
      max = Math.max(max, item.income, item.expenses);

      // Income bar (first in pair)
      bars.push({
        value: item.income,
        label,
        spacing: 4,
        labelWidth: 40,
        labelTextStyle: { color: colors.mutedForeground, fontSize: 10, textAlign: "center" },
        frontColor: colors.income,
        barBorderTopLeftRadius: 4,
        barBorderTopRightRadius: 4,
      });

      // Expense bar (second in pair)
      bars.push({
        value: item.expenses,
        frontColor: colors.expense,
        barBorderTopLeftRadius: 4,
        barBorderTopRightRadius: 4,
      });

      // Savings line point
      line.push({ value: item.net });
    });

    return { barData: bars, lineData: line, maxVal: max };
  }, [balanceData]);

  if (barData.length === 0) return null;

  const chartWidth = containerWidth - 50;
  const groupCount = balanceData.length;
  const barWidth = Math.max(12, Math.min(24, (chartWidth / groupCount - 20) / 2));

  return (
    <View className="mt-6">
      <View className="flex-row items-center mb-3">
        <Icon name="BarChart3" className="text-primary mr-2" size={20} />
        <Text className="text-xl font-semibold text-foreground">
          Cash Flow
        </Text>
      </View>

      <View
        className="bg-card rounded-2xl border border-border p-4 pb-2"
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        <BarChart
          data={barData}
          width={chartWidth}
          barWidth={barWidth}
          spacing={Math.max(8, chartWidth / groupCount - barWidth * 2 - 4)}
          initialSpacing={10}
          endSpacing={10}
          noOfSections={4}
          maxValue={maxVal * 1.1}
          xAxisThickness={0}
          yAxisThickness={0}
          yAxisTextStyle={{ color: colors.mutedForeground, fontSize: 10 }}
          formatYLabel={(label) => {
            const val = Number(label);
            if (Math.abs(val) >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
            if (Math.abs(val) >= 1000) return `${(val / 1000).toFixed(0)}k`;
            return label;
          }}
          hideRules={false}
          rulesColor={colors.border}
          rulesType="dashed"
          showLine
          lineData={lineData}
          lineConfig={{
            color: colors.foreground,
            thickness: 2.5,
            curved: true,
            hideDataPoints: false,
            dataPointsColor: colors.foreground,
            dataPointsRadius: 3,
          }}
          disableScroll
        />

        {/* Legend */}
        <View className="flex-row gap-4 mt-3 mb-1 justify-center">
          <View className="flex-row items-center">
            <View className="w-2.5 h-2.5 rounded-full mr-1.5" style={{ backgroundColor: colors.income }} />
            <Text className="text-xs text-muted-foreground">Income</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-2.5 h-2.5 rounded-full mr-1.5" style={{ backgroundColor: colors.expense }} />
            <Text className="text-xs text-muted-foreground">Expenses</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-2.5 h-2.5 rounded-full mr-1.5" style={{ backgroundColor: colors.foreground }} />
            <Text className="text-xs text-muted-foreground">Savings</Text>
          </View>
        </View>
      </View>

      {/* Avg Stats Row */}
      <View className="flex-row gap-3 mt-3">
        <View className="flex-1 bg-card rounded-xl p-4 border border-border items-center">
          <Icon name="DollarSign" className="text-success mb-2" size={20} />
          <Text className="text-xs text-muted-foreground mb-1">Avg Income</Text>
          <Text className="text-base font-mono font-bold text-foreground">
            {showAmount(avgIncome)}
          </Text>
        </View>
        <View className="flex-1 bg-card rounded-xl p-4 border border-border items-center">
          <Icon name="TrendingDown" className="text-destructive mb-2" size={20} />
          <Text className="text-xs text-muted-foreground mb-1">Avg Expenses</Text>
          <Text className="text-base font-mono font-bold text-foreground">
            {showAmount(avgExpenses)}
          </Text>
        </View>
        <View className="flex-1 bg-card rounded-xl p-4 border border-border items-center">
          <Icon name="TrendingUp" className="text-primary mb-2" size={20} />
          <Text className="text-xs text-muted-foreground mb-1">Avg Savings</Text>
          <Text className="text-base font-mono font-bold text-foreground">
            {showAmount(avgSavings)}
          </Text>
        </View>
      </View>
    </View>
  );
}
```

**Step 2: Verify**

Run: `cd apps/mobile && pnpm check-types 2>&1 | tail -10`
Expected: No type errors

**Step 3: Commit**

```bash
git add apps/mobile/src/components/features/charts/cash-flow-chart.tsx
git commit -m "feat(mobile): add cash flow grouped bar chart with savings line"
```

---

### Task 6: Create Monarch-style Category Breakdown component

**Files:**
- Create: `apps/mobile/src/components/features/charts/category-breakdown.tsx`

**Step 1: Create merged donut + progress bars component**

This replaces both `CategoryPieChart` and `CategoryBarBreakdown` with a single component: small donut at top with total in center, then Monarch-style horizontal progress bars below sorted by amount.

Create `apps/mobile/src/components/features/charts/category-breakdown.tsx`:

```tsx
import { View, Text, TouchableOpacity, useWindowDimensions } from "react-native";
import React from "react";
import { PieChart } from "react-native-gifted-charts";

import { useCharts } from "@/context/charts.context";
import { getCurrencyMeta, showAmount } from "@/utils/currency";
import Icon from "@/components/ui/icon";

export default function CategoryBreakdown() {
  const {
    expenseData,
    incomeData,
    baseCurrency,
    showIncome,
    setShowIncome,
  } = useCharts();
  const { width: screenWidth } = useWindowDimensions();

  const currentData = showIncome ? incomeData : expenseData;
  const currentTotal = currentData.reduce((sum, item) => sum + item.amount, 0);
  const currencyMeta = getCurrencyMeta(baseCurrency);
  const sorted = [...currentData].sort((a, b) => b.amount - a.amount);

  if (currentData.length === 0) return null;

  const pieData = sorted.map((item) => ({
    value: item.amount,
    color: item.color,
    text: `${Math.round((item.amount / currentTotal) * 100)}%`,
  }));

  const radius = Math.min(screenWidth * 0.2, 80);

  return (
    <View className="mt-6">
      {/* Header with toggle */}
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center">
          <Icon name="ChartPie" className="text-primary mr-2" size={20} />
          <Text className="text-xl font-semibold text-foreground">
            Categories
          </Text>
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity
            className={`px-4 py-2 rounded-full ${!showIncome ? "bg-primary" : "bg-card border border-border"}`}
            onPress={() => setShowIncome(false)}
          >
            <Text
              className={`text-sm font-medium ${!showIncome ? "text-white" : "text-muted-foreground"}`}
            >
              Expenses
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 py-2 rounded-full ${showIncome ? "bg-primary" : "bg-card border border-border"}`}
            onPress={() => setShowIncome(true)}
          >
            <Text
              className={`text-sm font-medium ${showIncome ? "text-white" : "text-muted-foreground"}`}
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="bg-card rounded-2xl border border-border p-4">
        {/* Donut + Total */}
        <View className="items-center mb-4">
          <PieChart
            data={pieData}
            donut
            radius={radius}
            innerRadius={radius * 0.6}
            innerCircleColor="#FFFFFF"
            centerLabelComponent={() => (
              <View className="items-center justify-center">
                <Text className="text-xs text-muted-foreground">
                  {showIncome ? "Income" : "Spent"}
                </Text>
                <Text className="text-base font-bold font-mono text-foreground" numberOfLines={1}>
                  {currencyMeta.symbol}{showAmount(currentTotal)}
                </Text>
              </View>
            )}
          />
        </View>

        {/* Monarch-style progress bars */}
        <View className="gap-3">
          {sorted.map((item) => {
            const pct = currentTotal > 0 ? (item.amount / currentTotal) * 100 : 0;
            return (
              <View key={item.name}>
                <View className="flex-row justify-between items-center mb-1.5">
                  <View className="flex-row items-center flex-1 mr-3">
                    <View
                      className="w-3 h-3 rounded-full mr-2.5"
                      style={{ backgroundColor: item.color }}
                    />
                    <Text className="text-sm text-foreground" numberOfLines={1}>
                      {item.name}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-sm font-mono font-semibold text-foreground mr-2">
                      {currencyMeta.symbol}{showAmount(item.amount)}
                    </Text>
                    <Text className="text-xs font-mono text-muted-foreground w-10 text-right">
                      {Math.round(pct)}%
                    </Text>
                  </View>
                </View>
                <View className="h-2 bg-muted rounded-full">
                  <View
                    className="h-2 rounded-full"
                    style={{
                      width: `${Math.min(pct, 100)}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
```

**Step 2: Verify**

Run: `cd apps/mobile && pnpm check-types 2>&1 | tail -10`
Expected: No type errors

**Step 3: Commit**

```bash
git add apps/mobile/src/components/features/charts/category-breakdown.tsx
git commit -m "feat(mobile): add Monarch-style category breakdown with donut + progress bars"
```

---

### Task 7: Update Cash Flow screen to use new components

**Files:**
- Modify: `apps/mobile/src/components/features/charts/index.tsx`

**Step 1: Replace old chart imports with new ones**

Replace the full file content of `apps/mobile/src/components/features/charts/index.tsx`:

```tsx
import { ScrollView, RefreshControl, View, Text } from "react-native";
import React from "react";

import ScreenHeader from "@/components/screen-header";
import { Spinner } from "@/components/ui/spinner";
import { useCharts } from "@/context/charts.context";
import { colors } from "@/lib/colors";
import { showAmount } from "@/utils/currency";
import Icon from "@/components/ui/icon";

import TimeRangeSelector from "./time-range-selector";
import CategoryBreakdown from "./category-breakdown";
import CashFlowChart from "./cash-flow-chart";

export default function ChartsScreen() {
  const {
    loading,
    error,
    refreshing,
    refreshData,
    avgIncome,
    avgExpenses,
    avgSavings,
  } = useCharts();

  const handleRefresh = async () => {
    await refreshData();
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Spinner size="small" />
        <Text className="text-muted-foreground mt-4">Loading charts...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-destructive text-lg text-center mb-4">
          Error loading charts
        </Text>
        <Text className="text-muted-foreground text-center mb-4">{error}</Text>
        <Text className="text-muted-foreground text-center">
          Pull down to refresh
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.mutedForeground}
          colors={[colors.mutedForeground]}
        />
      }
    >
      <ScreenHeader variant="drawer" title="Cash Flow" />
      <View className="px-5 pt-4 pb-8">

        <TimeRangeSelector />

        {/* Net Savings Hero */}
        <View className="bg-card rounded-2xl border border-border p-5 mt-2 mb-2 items-center">
          <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
            Net Savings
          </Text>
          <Text
            className={`text-3xl font-mono font-bold ${avgSavings >= 0 ? "text-income" : "text-expense"}`}
          >
            {showAmount(avgSavings)}
          </Text>
          <Text className="text-sm text-muted-foreground mt-1">
            Income {showAmount(avgIncome)} − Expenses {showAmount(avgExpenses)}
          </Text>
        </View>

        <View className="flex-row gap-3 mt-2">
          <View className="flex-1 bg-card rounded-2xl p-4 border border-border">
            <Icon name="TrendingUp" className="text-income mb-3" size={18} />
            <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              Income
            </Text>
            <Text className="text-xl font-bold text-foreground">
              {showAmount(avgIncome)}
            </Text>
          </View>
          <View className="flex-1 bg-card rounded-2xl p-4 border border-border">
            <Icon name="TrendingDown" className="text-expense mb-3" size={18} />
            <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              Expenses
            </Text>
            <Text className="text-xl font-bold text-foreground">
              {showAmount(avgExpenses)}
            </Text>
          </View>
          <View className="flex-1 bg-card rounded-2xl p-4 border border-border">
            <Icon name="PiggyBank" className="text-primary mb-3" size={18} />
            <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              Savings
            </Text>
            <Text className="text-xl font-bold text-foreground">
              {showAmount(avgSavings)}
            </Text>
          </View>
        </View>

        <CashFlowChart />
        <CategoryBreakdown />
      </View>
    </ScrollView>
  );
}
```

**Step 2: Delete old chart components that are no longer imported**

```bash
rm apps/mobile/src/components/features/charts/category-pie-chart.tsx
rm apps/mobile/src/components/features/charts/category-bar-breakdown.tsx
rm apps/mobile/src/components/features/charts/balance-trends.tsx
```

**Step 3: Verify no broken imports**

Run: `cd apps/mobile && pnpm check-types 2>&1 | tail -10`
Expected: No type errors. The deleted files should only have been imported from `charts/index.tsx` which we just replaced.

**Step 4: Verify react-native-chart-kit is fully gone**

```bash
grep -r "react-native-chart-kit" apps/mobile/src/
```

Expected: No results — all usages have been removed.

**Step 5: Commit**

```bash
git add -A apps/mobile/src/components/features/charts/
git commit -m "feat(mobile): replace old chart components with cash-flow-chart and category-breakdown"
```

---

### Task 8: Visual QA and type check

**Step 1: Full type check**

```bash
cd apps/mobile && pnpm check-types
```

Expected: 0 errors

**Step 2: Lint check**

```bash
cd apps/mobile && pnpm lint
```

Expected: No new errors

**Step 3: Run existing tests**

```bash
cd apps/mobile && pnpm test 2>&1 | tail -20
```

Expected: All existing tests pass

**Step 4: Final commit if any lint fixes were needed**

```bash
git add -A
git commit -m "chore(mobile): lint fixes for chart redesign"
```
