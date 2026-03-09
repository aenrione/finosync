# Single-Currency View Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Filter all 5 main tabs to display data in one currency (`baseCurrency` from Settings), eliminating multi-currency UI complexity.

**Architecture:** Backend endpoints accept a `?currency=` param and filter accounts/transactions to that currency. Frontend reads `baseCurrency` from Zustand config store and passes it to all API calls. Changing `baseCurrency` in Settings invalidates all caches so every tab refetches.

**Tech Stack:** Rails 8 API (Ruby), React Native + Expo (TypeScript), Zustand, React Context

---

### Task 1: Backend — Filter dashboard by currency

**Files:**
- Modify: `apps/backend/app/controllers/dashboard_controller.rb`
- Modify: `apps/backend/app/commands/get_user_balances.rb`

**Step 1: Update `DashboardController#show` to accept `currency` param and filter all queries**

In `dashboard_controller.rb`, add currency filtering:

```ruby
class DashboardController < ApplicationController
  def show
    user = current_user
    currency = params[:currency] || "CLP"

    # Balances for single currency
    balances = GetUserBalances.for(user: user, currency: currency)

    # Accounts filtered by currency
    accounts = user.accounts.where(currency: currency).map { |acc| AccountSerializer.new(acc).serializable_hash[:data][:attributes] }

    # Recent transactions from currency-matching accounts
    recent_transactions = user.transactions
      .joins(:account)
      .where(accounts: { currency: currency })
      .order(transaction_date: :desc)
      .limit(10)
      .map { |tx| TransactionSerializer.new(tx).serializable_hash[:data][:attributes] }

    # Spending insights for single currency
    spending_insights = {}
    %w[this_month last_month].each do |period|
      time_range = period == 'this_month' ? Date.current.beginning_of_month..Date.current.end_of_month :
                                            1.month.ago.beginning_of_month..1.month.ago.end_of_month
      scope = user.transactions.joins(:account).where(accounts: { currency: currency }, transaction_date: time_range)
      total_spent = scope.where('amount < 0').sum(:amount).abs
      total_earned = scope.where('amount > 0').sum(:amount)
      top_categories = scope.joins(:transaction_category)
                           .group('transaction_categories.name')
                           .sum(:amount)
                           .map { |cat, amt| { category: cat, amount: amt.abs } }
                           .sort_by { |c| -c[:amount] }
                           .first(5)
      spending_insights[period] = {
        total_spent: total_spent,
        total_earned: total_earned,
        top_categories: top_categories
      }
    end

    render json: {
      balances: balances,
      currency: currency,
      accounts: accounts,
      recent_transactions: recent_transactions,
      spending_insights: spending_insights
    }, status: :ok
  end
end
```

**Step 2: Update `GetUserBalances` to accept and filter by currency**

```ruby
class GetUserBalances < PowerTypes::Command.new(:user, :currency)
  def perform
    accounts = @user.accounts
    accounts = accounts.where(currency: @currency) if @currency.present?

    accounts
      .group(:currency)
      .select(
        :currency,
        "SUM(balance) as balance",
        "SUM(income) as income",
        "SUM(expense) as expense",
        "SUM(investments_return) as investments_return"
      )
      .map do |record|
        @cur = record.currency
        {
          currency: record.currency,
          balance: parse_amount(record.balance),
          income: parse_amount(record.income),
          expense: parse_amount(record.expense),
          investments_return: parse_amount(record.investments_return)
        }
      end
  end

  private

  def parse_amount(amount)
    if amount.is_a?(Money)
      amount.format(currency: @cur)
    elsif amount.is_a?(Numeric)
      Money.new(amount * 100).format(currency: @cur)
    elsif amount.is_a?(String)
      Money.from_amount(amount.to_f, @cur).format
    else
      raise ArgumentError, "Invalid amount type: #{amount.class}"
    end
  end
end
```

Note: `spending_insights` is now a flat hash `{ "this_month": {...}, "last_month": {...} }` instead of nested by currency `{ "CLP": { "this_month": {...} } }`.

**Step 3: Verify**

```bash
cd apps/backend && bundle exec rspec spec/
```

**Step 4: Commit**

```bash
git add apps/backend/app/controllers/dashboard_controller.rb apps/backend/app/commands/get_user_balances.rb
git commit -m "feat(backend): filter dashboard endpoint by currency param"
```

---

### Task 2: Backend — Filter transactions by currency

**Files:**
- Modify: `apps/backend/app/controllers/transactions_controller.rb`

**Step 1: Add currency filtering to `TransactionsController#index`**

After the `account_id` filter block (line 14), add:

```ruby
# Filter by currency if provided
if params[:currency].present?
  transactions_scope = transactions_scope.joins(:account).where(accounts: { currency: params[:currency] })
end
```

**Step 2: Add currency filtering to `AccountsController#index`**

In `apps/backend/app/controllers/accounts_controller.rb`, update the `index` action:

```ruby
def index
  @accounts = current_user.accounts
  @accounts = @accounts.where(currency: params[:currency]) if params[:currency].present?
  render_jsonapi @accounts
end
```

**Step 3: Verify**

```bash
cd apps/backend && bundle exec rspec spec/
```

**Step 4: Commit**

```bash
git add apps/backend/app/controllers/transactions_controller.rb apps/backend/app/controllers/accounts_controller.rb
git commit -m "feat(backend): filter transactions and accounts by currency param"
```

---

### Task 3: Frontend — Wire `baseCurrency` into Dashboard context

**Files:**
- Modify: `apps/mobile/src/context/dashboard.context.tsx`

**Step 1: Import store and pass `baseCurrency` to `/dashboard` API call**

```typescript
import { useStore } from "@/utils/store";
```

In `DashboardProvider`, read baseCurrency from store and pass it:

```typescript
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
  // ...rest unchanged
```

Key change: `fetchDashboard` depends on `baseCurrency`, so it refetches when currency changes.

**Step 2: Commit**

```bash
git add apps/mobile/src/context/dashboard.context.tsx
git commit -m "feat(mobile): pass baseCurrency to dashboard API"
```

---

### Task 4: Frontend — Wire `baseCurrency` into Accounts context

**Files:**
- Modify: `apps/mobile/src/context/accounts.context.tsx`

**Step 1: Pass `baseCurrency` to `/accounts` API call**

```typescript
import { useStore } from "@/utils/store";
```

In `AccountsProvider`:

```typescript
const baseCurrency = useStore((s) => s.baseCurrency);

const fetchAccountss = useCallback(async () => {
  try {
    setLoading(true)
    const res = await fetchWithAuth(`/accounts?currency=${baseCurrency}`)
    // ...rest unchanged
  }
}, [baseCurrency])
```

The `useEffect` already depends on `fetchAccountss`, so it will refetch when `baseCurrency` changes.

**Step 2: Commit**

```bash
git add apps/mobile/src/context/accounts.context.tsx
git commit -m "feat(mobile): filter accounts by baseCurrency"
```

---

### Task 5: Frontend — Wire `baseCurrency` into Transactions context

**Files:**
- Modify: `apps/mobile/src/context/transactions.context.tsx`

**Step 1: Pass `baseCurrency` to `/transactions` API call**

```typescript
import { useStore } from "@/utils/store";
```

In `TransactionsProvider`:

```typescript
const baseCurrency = useStore((s) => s.baseCurrency);
```

In `fetchTransactions` (around line 99), change the URL:

```typescript
const res = await fetchWithAuth(
  `/transactions?currency=${baseCurrency}&page=${page}&limit=${ITEMS_PER_PAGE}`,
);
```

In `fetchTransactionsByAccount` (around line 192), change the URL:

```typescript
const res = await fetchWithAuth(
  `/transactions?currency=${baseCurrency}&account_id=${accountId}&page=${page}&limit=${ITEMS_PER_PAGE}`,
);
```

Add `baseCurrency` to the dependency array of both `useCallback`s.

**Step 2: Commit**

```bash
git add apps/mobile/src/context/transactions.context.tsx
git commit -m "feat(mobile): filter transactions by baseCurrency"
```

---

### Task 6: Frontend — Wire `baseCurrency` into Charts context (replace `selectedCurrency`)

**Files:**
- Modify: `apps/mobile/src/context/charts.context.tsx`

**Step 1: Replace `selectedCurrency` state with `baseCurrency` from store**

```typescript
import { useStore } from "@/utils/store";
```

In `ChartsProvider`:
- Remove `const [selectedCurrency, setSelectedCurrency] = useState<string>("USD");`
- Remove `const [userCurrencies, setUserCurrencies] = useState<string[]>([]);`
- Add `const baseCurrency = useStore((s) => s.baseCurrency);`

In `fetchChartData`:
- Remove the block that sets `userCurrencies` and auto-switches `selectedCurrency` (lines 200-206)

In the `useEffect` (line 227-233), replace `selectedCurrency` with `baseCurrency`:
```typescript
useEffect(() => {
  fetchChartData({
    currency: baseCurrency,
    accountId: selectedAccount,
    timeRange,
  });
}, [fetchChartData, baseCurrency, selectedAccount, timeRange]);
```

In `refreshData`, replace `selectedCurrency` with `baseCurrency`:
```typescript
const refreshData = useCallback(async () => {
  setRefreshing(true);
  await fetchChartData({
    currency: baseCurrency,
    accountId: selectedAccount,
    timeRange,
  });
  setRefreshing(false);
}, [fetchChartData, baseCurrency, selectedAccount, timeRange]);
```

Update `ChartsContextType` — remove `selectedCurrency`, `setSelectedCurrency`, `userCurrencies`. Add `baseCurrency: string`.

Update `contextValue` accordingly.

**Step 2: Commit**

```bash
git add apps/mobile/src/context/charts.context.tsx
git commit -m "feat(mobile): use baseCurrency in charts, remove per-chart currency selector"
```

---

### Task 7: Frontend — Simplify Dashboard components

**Files:**
- Modify: `apps/mobile/src/components/features/dashboard/total-balance.tsx`
- Modify: `apps/mobile/src/components/features/dashboard/spending-insights.tsx`
- Modify: `apps/mobile/src/app/(app)/(drawer)/(tabs)/dashboard.tsx`

**Step 1: Simplify `TotalBalance` — single card instead of horizontal scroll**

Since backend now returns a single-currency balance array (usually 1 item), simplify the component:

```tsx
export default function TotalBalance({
  balances,
}: {
  balances: BalanceItem[];
}) {
  if (!balances || balances.length === 0) {
    return null;
  }

  const { refresh } = useDashboard();
  const isVisible = useStore((state) => state.isVisible);
  const bal = balances[0]; // Single currency

  return (
    <View className="px-5 mt-6">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold text-foreground">Net Position</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={refresh}
          className="p-2 rounded-full bg-card border border-border"
        >
          <View className="w-9 h-9 rounded-full bg-card justify-center items-center">
            <Icon name="RefreshCw" className="text-muted-foreground" size={20} />
          </View>
        </TouchableOpacity>
      </View>
      <View className="bg-card rounded-2xl p-5 border border-border">
        <View className="flex-row items-center mb-3">
          <Text className="text-xs text-muted-foreground font-medium uppercase">
            {bal.label || bal.currency}
          </Text>
        </View>
        <Text className="text-2xl font-bold font-mono text-foreground mb-2">
          {showAmount(bal.balance, isVisible)}
        </Text>
        {bal.changePct ? (
          <View className="flex-row items-center">
            <Icon name="TrendingUp" className="text-success mr-1" size={16} />
            <Text className="text-sm text-success font-medium">
              +{bal.changePct}% this month
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
```

**Step 2: Simplify `SpendingInsights` — remove `CurrencyFilter`, use flat data**

The backend now returns `spending_insights` as `{ this_month: {...}, last_month: {...} }` (not nested by currency).

```tsx
export default function SpendingInsights({ insights }: { insights: any }) {
  const [selectedPeriod, setSelectedPeriod] = useState(periodOptions[0].value)

  if (!insights) return null

  const isVisible = useStore((state) => state.isVisible)
  const data = insights[selectedPeriod]

  return (
    <View className="px-5 mb-6 mt-2">
      <View className="flex-row justify-between items-center">
        <Text className="text-2xl font-bold text-foreground">Spending Insights</Text>
        <PeriodDropdown
          options={periodOptions}
          selectedValue={selectedPeriod}
          onValueChange={setSelectedPeriod}
        />
      </View>
      {/* Remove CurrencyFilter entirely */}

      <View className="bg-card rounded-xl p-5 shadow-sm mb-6 mt-4">
        {/* ...rest of the insights card unchanged, but remove selectedCurrency from data access */}
        {/* data is now insights[selectedPeriod] instead of insights[selectedCurrency]?.[selectedPeriod] */}
```

Update the month-over-month comparison block similarly:
```tsx
const thisMonthData = insights.this_month
const lastMonthData = insights.last_month
```

Remove imports: `CurrencyFilter`.

**Step 3: Update `DashboardScreen` — remove `currencies` prop from `SpendingInsights`**

In `dashboard.tsx` line 52, change:
```tsx
<SpendingInsights insights={dashboard.spending_insights} currencies={dashboard.user_currencies} />
```
to:
```tsx
<SpendingInsights insights={dashboard.spending_insights} />
```

**Step 4: Commit**

```bash
git add apps/mobile/src/components/features/dashboard/total-balance.tsx apps/mobile/src/components/features/dashboard/spending-insights.tsx apps/mobile/src/app/(app)/(drawer)/(tabs)/dashboard.tsx
git commit -m "feat(mobile): simplify dashboard to single-currency view"
```

---

### Task 8: Frontend — Remove `CurrencyOverview` from Charts and clean up

**Files:**
- Modify: `apps/mobile/src/components/features/charts/index.tsx`
- Modify: `apps/mobile/src/components/features/charts/currency-overview.tsx` (delete or keep unused)

**Step 1: Remove `CurrencyOverview` from the Charts screen**

In `apps/mobile/src/components/features/charts/index.tsx`, remove the import and usage:

```diff
-import CurrencyOverview from "./currency-overview";
```

Remove `<CurrencyOverview />` from the JSX (line 117).

**Step 2: Commit**

```bash
git add apps/mobile/src/components/features/charts/index.tsx
git commit -m "feat(mobile): remove multi-currency overview from charts"
```

---

### Task 9: Frontend — Invalidate all data on currency change in Settings

**Files:**
- Modify: `apps/mobile/src/app/(app)/(drawer)/settings.tsx`

**Step 1: Add cache invalidation when `baseCurrency` changes**

The contexts already depend on `baseCurrency` via their `useCallback` dependencies, so they will auto-refetch. But we also need to reset the dashboard context. Since `DashboardProvider.fetchDashboard` already depends on `baseCurrency`, it will refetch automatically.

However, to ensure a clean slate, add `queryClient.invalidateQueries()` on currency change:

```tsx
const handleCurrencyChange = (currency: string) => {
  setBaseCurrency(currency);
  queryClient.invalidateQueries();
};
```

In the JSX, change:
```tsx
<CurrencyPicker
  value={baseCurrency}
  onChange={handleCurrencyChange}  // was setBaseCurrency
  currencies={CURRENCIES}
  labels={text.currencies}
/>
```

**Step 2: Commit**

```bash
git add apps/mobile/src/app/(app)/(drawer)/settings.tsx
git commit -m "feat(mobile): invalidate all caches on currency change"
```

---

### Task 10: Verify end-to-end

**Step 1: Run backend tests**

```bash
cd apps/backend && bundle exec rspec
```

**Step 2: Run mobile tests**

```bash
cd apps/mobile && pnpm test
```

**Step 3: Run lint**

```bash
cd apps/backend && bundle exec rubocop
cd apps/mobile && pnpm lint
```

**Step 4: Manual verification checklist**

- [ ] Dashboard shows single balance card for CLP
- [ ] Dashboard accounts list only shows CLP accounts
- [ ] Dashboard recent transactions only from CLP accounts
- [ ] Spending insights has no currency filter, shows CLP data
- [ ] Charts tab uses CLP from store (no currency selector)
- [ ] Transactions tab only shows CLP transactions
- [ ] Accounts tab only shows CLP accounts
- [ ] Changing currency in Settings refreshes all tabs
- [ ] Buda crypto accounts still work (if they use CLP currency)

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat: single-currency view across all tabs"
```
