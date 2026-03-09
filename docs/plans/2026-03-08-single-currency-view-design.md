# Single-Currency View Design

## Goal
All 5 main tabs (dashboard, accounts, transactions, charts, budget) display data filtered to a single currency — the user's `baseCurrency` setting (default: CLP). No exchange rate conversion; pure filtering. Buda crypto accounts are an exception (already provide CLP-equivalent values).

## Backend Changes

### `GET /dashboard?currency=CLP`
- Accept optional `currency` query param
- Filter `GetUserBalances` to single currency — return one balance object, not an array
- Filter `accounts` to only those matching the currency
- Filter `recent_transactions` to transactions from matching-currency accounts
- Filter `spending_insights` to the single currency (no longer nested by currency)
- Filter `user_currencies` accordingly (or remove — single currency means it's redundant)

### `GET /transactions?currency=CLP`
- Accept optional `currency` query param
- Filter transactions to those belonging to accounts with matching currency

### `GET /charts/data?currency=CLP`
- Already accepts `currency` param — no backend changes needed

## Frontend Changes

### Config Store (`config.store.ts`)
- `baseCurrency` already exists (default: "CLP")
- `setBaseCurrency` triggers invalidation of all React Query caches and context refreshes

### Dashboard Context (`dashboard.context.tsx`)
- Pass `baseCurrency` from Zustand store as `?currency=X` to `/dashboard`
- Re-fetch when `baseCurrency` changes

### Dashboard Components
- **TotalBalance**: Show single balance card (not horizontal scroll of multiple currencies)
- **SpendingInsights**: Remove `CurrencyFilter` component. Data comes pre-filtered for one currency.
- **AccountsList**: Only receives filtered accounts — no changes needed
- **RecentTransactions**: Only receives filtered transactions — no changes needed

### Charts Context (`charts.context.tsx`)
- Remove `selectedCurrency` local state
- Use `baseCurrency` from Zustand store instead
- Remove `userCurrencies` state (no longer needed for selector)
- Remove `CurrencyFilter` from charts UI components

### Transactions Context (`transactions.context.tsx`)
- Pass `baseCurrency` to `/transactions?currency=X`
- Re-fetch when `baseCurrency` changes

### Settings (`settings.tsx`)
- `CurrencyPicker` stays as-is (CLP/USD/EUR/BTC)
- On currency change: invalidate all caches so all tabs refetch

## What Stays the Same
- `showAmount()`, `getCurrencyMeta()`, `parseNumericAmount()` utilities
- Individual account detail screens (show native currency)
- Buda accounts (crypto → CLP conversion already handled by backend)
- Budget tab (already single-currency)

## Data Flow
```
Settings → setBaseCurrency("CLP") → invalidate all caches
  → Dashboard refetch /dashboard?currency=CLP
  → Charts refetch /charts/data?currency=CLP
  → Transactions refetch /transactions?currency=CLP
```

## Non-Goals (Future)
- Exchange rate conversion (show USD account balances converted to CLP)
- Multi-currency aggregated totals
- Per-tab currency overrides
