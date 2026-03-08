# Frontend Test Suite Design

## Approach
Jest + React Native Testing Library (jest-expo preset). No MSW, no E2E. Focus on infrastructure: utils, Zustand stores, and services.

## Configuration
- `jest.config.ts` extending jest-expo with path aliases, setup file, coverage config
- `jest.setup.ts` with global mocks for native modules, i18n, expo-router, fetch

## Scope (No UI Components)

### Layer 1 — Pure Utils
- `currency.ts`: `curStyle`, `showAmount`, `amountStyle` — branch coverage for all input types
- `colors.ts`: `random_rgba` — returns valid rgba string
- `transactionFilters.ts`: `filterTransactions`, `getFilterStats` — all filter branches

### Layer 2 — Store Slices (Zustand)
- `session-store.ts`: getToken/setToken/deleteToken — platform-branched storage
- `api-key-store.ts`: getApiKey/setApiKey/deleteApiKey
- `user.store.ts`: setUser, toggleVisibility, logout (clears token + navigates)
- `config.store.ts`: setUrl
- `account.store.ts`, `transaction.store.ts`, `category.store.ts`: set + router push
- `store/index.ts`: combined store integration test

### Layer 3 — Services
- `api.ts`: fetchWithAuth (auth header injection, 401 logout), fetchApi (content-type)
- `auth.service.ts`: login (success/failure), checkSession (valid/invalid/no token)
- `accountService.ts`: createAccount, updateAccount, deleteAccount (success + error)

## Mocking Strategy
| Dependency | Mock |
|---|---|
| expo-secure-store | In-memory Map |
| async-storage | jest mock |
| expo-router | Jest mock with push/replace/navigate spies |
| react-i18next | t returns key |
| global.fetch | jest.fn() per test |
| react-native-reanimated | reanimated jest mock |
| nativewind | no-op |
| lucide-react-native | generic component |

## New Dev Dependencies
- @testing-library/react-native
- @testing-library/jest-native
