# FinoSync UI Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform FinoSync mobile app from amateur-looking to clean, premium fintech aesthetic with "Slate & Indigo" palette.

**Architecture:** Update design tokens (Tailwind config + CSS variables) first, then update UI primitives (button, input, card), then update each screen. All colors must be semantic tokens — no raw Tailwind colors (e.g., `blue-200`) in components.

**Tech Stack:** NativeWind 4, Tailwind CSS, React Native, Expo Router, Lucide icons, DM Sans + IBM Plex Mono fonts

---

## Task 1: Update Tailwind Color Tokens

**Files:**
- Modify: `apps/mobile/tailwind.config.js`

**Step 1: Replace the color palette**

Replace the entire `colors` object in `theme.extend.colors` (lines 12-109) with the new Slate & Indigo palette:

```js
colors: {
  // FinoSync Brand Colors — Indigo
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',
    600: '#4F46E5',  // Main brand color
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
    950: '#1E1B4B',
    DEFAULT: '#4F46E5',
    foreground: '#FFFFFF',
    light: '#EEF2FF',
  },
  secondary: {
    DEFAULT: '#F1F5F9',
    foreground: '#334155',
  },

  // Semantic colors
  success: {
    DEFAULT: '#10B981',
    light: '#D1FAE5',
    dark: '#047857',
  },
  warning: {
    DEFAULT: '#F59E0B',
    light: '#FEF3C7',
    dark: '#D97706',
  },
  error: {
    DEFAULT: '#EF4444',
    light: '#FEE2E2',
    dark: '#DC2626',
  },
  info: {
    DEFAULT: '#3B82F6',
    light: '#DBEAFE',
    dark: '#1D4ED8',
  },

  // Financial-specific
  income: '#10B981',
  expense: '#EF4444',
  investment: '#8B5CF6',
  crypto: '#F59E0B',
  savings: '#06B6D4',

  // Account type accents
  'account-local': '#4F46E5',
  'account-fintoc': '#06B6D4',
  'account-fintual': '#8B5CF6',
  'account-buda': '#F59E0B',
  'account-local-light': '#EEF2FF',
  'account-fintoc-light': '#ECFEFF',
  'account-fintual-light': '#F5F3FF',
  'account-buda-light': '#FFFBEB',

  // UI surface colors
  background: '#FFFFFF',
  foreground: '#0F172A',
  surface: '#F8FAFC',
  border: '#E2E8F0',
  input: '#F8FAFC',
  ring: '#4F46E5',
  destructive: {
    DEFAULT: '#EF4444',
    foreground: '#FFFFFF',
  },
  muted: {
    DEFAULT: '#F1F5F9',
    foreground: '#64748B',
  },
  accent: {
    DEFAULT: '#EEF2FF',
    foreground: '#4F46E5',
  },
  card: {
    DEFAULT: '#F8FAFC',
    foreground: '#0F172A',
  },
},
```

**Step 2: Clean up shadows — remove legacy ones**

Replace the `boxShadow` object (lines 179-195) — remove `hard-*` and `soft-*`:

```js
boxShadow: {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
  md: '0 4px 8px 0 rgba(0, 0, 0, 0.12)',
  lg: '0 8px 16px 0 rgba(0, 0, 0, 0.15)',
  xl: '0 12px 24px 0 rgba(0, 0, 0, 0.18)',
},
```

**Step 3: Verify the app still compiles**

Run: `cd apps/mobile && pnpm start --web --port 8083 &` — check for Tailwind compilation errors.

**Step 4: Commit**

```bash
git add apps/mobile/tailwind.config.js
git commit -m "style: update Tailwind tokens to Slate & Indigo palette"
```

---

## Task 2: Update CSS Variables (global.css)

**Files:**
- Modify: `apps/mobile/src/global.css`

**Step 1: Replace CSS variables for light mode**

Replace the `:root` block (lines 6-66) with new Indigo-based HSL values:

```css
:root {
  /* FinoSync Design System - Light Mode (Slate & Indigo) */
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;

  /* Primary: Indigo */
  --primary: 239 84% 67%;
  --primary-foreground: 0 0% 100%;

  /* Secondary: Slate light */
  --secondary: 210 40% 96%;
  --secondary-foreground: 215 25% 27%;

  /* Muted */
  --muted: 210 40% 96%;
  --muted-foreground: 215 16% 47%;

  --accent: 226 100% 97%;
  --accent-foreground: 239 84% 67%;

  /* Semantic */
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;

  --warning: 38 92% 50%;
  --warning-foreground: 0 0% 10%;

  /* UI elements */
  --card: 210 40% 98%;
  --card-foreground: 222 47% 11%;

  --popover: 0 0% 100%;
  --popover-foreground: 222 47% 11%;

  --border: 214 32% 91%;
  --input: 210 40% 98%;
  --ring: 239 84% 67%;

  --radius: 0.75rem;

  /* Chart colors */
  --chart-1: 239 84% 67%;
  --chart-2: 160 84% 39%;
  --chart-3: 271 81% 56%;
  --chart-4: 38 92% 50%;
  --chart-5: 0 84% 60%;

  /* Sidebar */
  --sidebar-background: 210 40% 98%;
  --sidebar-foreground: 215 16% 47%;
  --sidebar-primary: 239 84% 67%;
  --sidebar-primary-foreground: 0 0% 100%;
  --sidebar-accent: 226 100% 97%;
  --sidebar-accent-foreground: 222 47% 11%;
  --sidebar-border: 214 32% 91%;
  --sidebar-ring: 239 84% 67%;

  /* Status */
  --online: 142 71% 45%;
  --online-foreground: 142 71% 25%;
}
```

**Step 2: Replace dark mode variables**

Replace the `.dark` block (lines 68-118):

```css
.dark {
  /* FinoSync Design System - Dark Mode (Slate & Indigo) */
  --background: 222 47% 11%;
  --foreground: 210 40% 98%;

  --primary: 239 84% 67%;
  --primary-foreground: 0 0% 100%;

  --secondary: 217 33% 17%;
  --secondary-foreground: 210 40% 98%;

  --muted: 217 33% 17%;
  --muted-foreground: 215 20% 65%;

  --accent: 217 33% 17%;
  --accent-foreground: 210 40% 98%;

  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 98%;

  --warning: 38 92% 50%;
  --warning-foreground: 0 0% 98%;

  --card: 222 47% 13%;
  --card-foreground: 210 40% 98%;

  --popover: 222 47% 13%;
  --popover-foreground: 210 40% 98%;

  --border: 217 33% 20%;
  --input: 217 33% 17%;
  --ring: 239 84% 67%;

  --chart-1: 239 84% 75%;
  --chart-2: 160 84% 45%;
  --chart-3: 271 81% 65%;
  --chart-4: 38 92% 55%;
  --chart-5: 0 84% 65%;

  --sidebar-background: 222 47% 8%;
  --sidebar-foreground: 210 40% 96%;
  --sidebar-primary: 239 84% 67%;
  --sidebar-primary-foreground: 0 0% 100%;
  --sidebar-accent: 217 33% 17%;
  --sidebar-accent-foreground: 210 40% 98%;
  --sidebar-border: 217 33% 17%;
  --sidebar-ring: 239 84% 67%;

  --online: 142 71% 45%;
  --online-foreground: 142 71% 70%;
}
```

**Step 3: Commit**

```bash
git add apps/mobile/src/global.css
git commit -m "style: update CSS variables to Indigo/Slate palette"
```

---

## Task 3: Update UI Primitives (button, input, card, spinner)

**Files:**
- Modify: `apps/mobile/src/components/ui/button.tsx`
- Modify: `apps/mobile/src/components/ui/input.tsx`
- Modify: `apps/mobile/src/components/ui/card.tsx`
- Modify: `apps/mobile/src/components/ui/spinner.tsx`

**Step 1: Update button.tsx**

In the CVA variants, update the default variant styling. Change `rounded-lg` to `rounded-xl` and ensure consistent padding. The key change is the default button should use `bg-primary text-primary-foreground rounded-xl`.

Also update ButtonText variants to match.

**Step 2: Update input.tsx**

Change input styling from `bg-input border border-border` to `bg-surface rounded-xl px-4 py-3`. Remove the hard border, use clean surface background:

```tsx
// Change the base classes from:
"h-11 px-3 border border-border rounded-lg bg-input text-foreground"
// To:
"h-12 px-4 bg-card rounded-xl text-foreground text-base"
```

**Step 3: Update card.tsx**

Change Card base from `bg-card rounded-xl border border-border shadow-sm` to `bg-card rounded-2xl shadow-sm` (remove visible border):

```tsx
// Card base: remove border, use rounded-2xl
"bg-card rounded-2xl shadow-sm"
```

**Step 4: Update spinner.tsx**

Change the hardcoded color from `'#1abdbd'` to `'#4F46E5'` (new primary):

```tsx
color = '#4F46E5'
```

**Step 5: Commit**

```bash
git add apps/mobile/src/components/ui/
git commit -m "style: update UI primitives to new design system"
```

---

## Task 4: Fix Non-Semantic Colors in Shared Components

**Files:**
- Modify: `apps/mobile/src/components/transaction-list.tsx`
- Modify: `apps/mobile/src/components/transaction-filters.tsx`

**Step 1: Fix transaction-list.tsx — remove non-semantic colors**

In `getCategoryColor()` (lines 39-57), replace all raw Tailwind colors with semantic tokens:

```tsx
const getCategoryColor = (categoryName: string): { bg: string; text: string } => {
  const colorMap: Record<string, { bg: string; text: string }> = {
    "Food & Dining": { bg: "bg-destructive/10", text: "text-destructive" },
    "Transportation": { bg: "bg-primary/10", text: "text-primary" },
    "Shopping": { bg: "bg-investment/10", text: "text-investment" },
    "Entertainment": { bg: "bg-crypto/10", text: "text-crypto" },
    "Healthcare": { bg: "bg-income/10", text: "text-income" },
    "Education": { bg: "bg-info/10", text: "text-info" },
    "Travel": { bg: "bg-savings/10", text: "text-savings" },
    "Utilities": { bg: "bg-crypto/10", text: "text-crypto" },
    "Insurance": { bg: "bg-income/10", text: "text-income" },
    "Investment": { bg: "bg-investment/10", text: "text-investment" },
    "Salary": { bg: "bg-income/10", text: "text-income" },
    "Freelance": { bg: "bg-primary/10", text: "text-primary" },
    "Business": { bg: "bg-investment/10", text: "text-investment" },
    "Other": { bg: "bg-muted", text: "text-muted-foreground" },
  }
  return colorMap[categoryName] || { bg: "bg-muted", text: "text-muted-foreground" }
}
```

Also update the transaction item card styling (line 96) — change from bordered card to flat with divider:

```tsx
// From:
"bg-background border border-border rounded-2xl p-4 mb-3 shadow-sm"
// To:
"bg-background p-4 border-b border-border"
```

Add `numberOfLines={2}` to the transaction description Text (line 104-106):

```tsx
<Text className="text-base font-semibold text-foreground mb-1" numberOfLines={2}>
```

Update the amount text to use monospace font (line 113):

```tsx
<Text className={`text-base font-mono font-bold ${isExpense ? "text-expense" : "text-income"}`}>
```

Update the "Load More" button styling (line 162):

```tsx
// From:
"bg-background border border-border rounded-2xl p-4 mt-4 items-center"
// To:
"bg-card rounded-xl p-4 mt-4 items-center"
```

**Step 2: Fix transaction-filters.tsx — remove non-semantic colors**

Replace `getFilterColor()` (lines 71-82) to use semantic tokens:

```tsx
const getFilterColor = (filterKey: string) => {
  switch (filterKey) {
    case "income":
      return "text-income"
    case "expenses":
      return "text-expense"
    case "all":
      return "text-primary"
    default:
      return "text-muted-foreground"
  }
}
```

**Step 3: Commit**

```bash
git add apps/mobile/src/components/transaction-list.tsx apps/mobile/src/components/transaction-filters.tsx
git commit -m "style: replace non-semantic colors with design tokens"
```

---

## Task 5: Redesign Sign-In Screen

**Files:**
- Modify: `apps/mobile/src/app/(auth)/sign-in.tsx`

**Step 1: Replace wallet clipart with text wordmark**

Remove the `import Logo from "@/assets/images/wallet.png"` line.

Replace the Image in both the loading state (line 81) and the main form (lines 89-93) with a text wordmark:

Loading state replacement:
```tsx
<View className="flex-1 items-center justify-center bg-background">
  <Text className="text-3xl font-bold text-primary">FinoSync</Text>
  <Spinner className="mt-4" />
</View>
```

Main form — replace the entire return block (lines 86-130):
```tsx
return (
  <ScrollView className="bg-background" contentContainerStyle={{ flexGrow: 1 }}>
    <View className="flex-1 items-center justify-center px-6 py-12 gap-4">
      <View className="items-center mb-8">
        <Text className="text-4xl font-bold text-primary">FinoSync</Text>
        <Text className="text-sm text-muted-foreground mt-2">Your personal finance hub</Text>
      </View>

      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        className="w-full"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Input
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        onSubmitEditing={onSignInPressed}
        className="w-full"
      />

      <Button disabled={!buttonStatus} onPress={onSignInPressed} className="w-full mt-2">
        <ButtonText>{text.signIn}</ButtonText>
      </Button>

      {(currentUrl === "https://" || currentUrl === "") && (
        <Text className="text-sm text-destructive">Server URL can't be empty</Text>
      )}

      <Button variant="ghost" onPress={onNoAccountPressed} className="w-full">
        <ButtonText variant="ghost">{text.noAccount}</ButtonText>
      </Button>
      <Button variant="ghost" onPress={onForgotPasswordPressed} className="w-full">
        <ButtonText variant="ghost" className="text-muted-foreground">{text.forgotPassword}</ButtonText>
      </Button>
    </View>

    <View className="items-center pb-8 gap-1">
      <Text className="text-xs text-muted-foreground">Server URL</Text>
      <Button variant="ghost" onPress={updateUrl}>
        <ButtonText variant="ghost" className="text-xs text-primary">{currentUrl}</ButtonText>
      </Button>
    </View>
  </ScrollView>
)
```

Remove the `Image` import from `react-native` if no longer used. Add `Spinner` import if needed for loading state.

**Step 2: Commit**

```bash
git add apps/mobile/src/app/\(auth\)/sign-in.tsx
git commit -m "style: redesign sign-in screen with wordmark and clean inputs"
```

---

## Task 6: Redesign Dashboard Components

**Files:**
- Modify: `apps/mobile/src/components/features/dashboard/header.tsx`
- Modify: `apps/mobile/src/components/features/dashboard/total-balance.tsx`
- Modify: `apps/mobile/src/components/features/dashboard/quick-actions.tsx`
- Modify: `apps/mobile/src/components/features/dashboard/accounts-list.tsx`
- Modify: `apps/mobile/src/components/features/dashboard/recent-transactions.tsx`
- Modify: `apps/mobile/src/components/features/dashboard/spending-insights.tsx`

**Step 1: Update header.tsx**

Remove the `border-b border-border` from the container (line 22). Add bottom padding. Add `pb-3`:

```tsx
<View className="flex-row items-center justify-between px-5 pt-4 pb-3">
```

**Step 2: Update total-balance.tsx**

Update balance cards to use `bg-card rounded-2xl p-5 shadow-sm` styling. The amount should use `font-mono font-bold text-2xl`. Currency label should be `text-xs text-muted-foreground font-medium uppercase`. Remove any visible border styling.

Update the refresh button to use `bg-card rounded-full shadow-sm` instead of any bordered style.

**Step 3: Update quick-actions.tsx**

Replace the big circular icons with smaller, more subtle buttons. Change `w-14 h-14` to `w-11 h-11`. Remove `bg-secondary/10` (yellow tint). Use `bg-primary/10` and `text-primary` for both actions:

```tsx
const quickActions: QuickAction[] = [
  {
    id: "add-account",
    title: "Add Account",
    icon: "Plus",
    color: "text-primary",
    bgColor: "bg-primary/10",
    route: "/add-account"
  },
  {
    id: "add-transaction",
    title: "Add Transaction",
    icon: "Plus",
    color: "text-primary",
    bgColor: "bg-accent",
    route: "/add-transaction"
  }
]
```

Update the icon container size:

```tsx
<View className={`w-11 h-11 rounded-full justify-center items-center mb-2 ${action.bgColor}`}>
  <Icon name={action.icon as any} size={20} className={action.color} />
</View>
```

**Step 4: Update accounts-list.tsx**

Add account type color differentiation. Each account card should have a left border accent based on account type:

```tsx
const getAccountTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    local: 'border-l-account-local',
    fintoc: 'border-l-account-fintoc',
    fintual: 'border-l-account-fintual',
    buda: 'border-l-account-buda',
  }
  return colors[type] || 'border-l-primary'
}
```

Apply to each card: `bg-card rounded-2xl p-4 shadow-sm border-l-4 ${getAccountTypeColor(account.account_type)}`.

Remove any `border border-border` from cards. Truncate account names with `numberOfLines={1}`.

Update balance amount to use `font-mono font-bold`.

**Step 5: Update recent-transactions.tsx**

Only styling adjustments needed — the section header "Recent Transactions" should use `text-lg font-semibold`. "See All" link should be `text-primary text-sm font-medium`.

**Step 6: Update spending-insights.tsx**

Update insight stat cards to use `bg-card rounded-xl p-4 shadow-sm` (no border). Amount values should use `font-mono font-bold`. Remove any visible borders from cards.

**Step 7: Commit**

```bash
git add apps/mobile/src/components/features/dashboard/
git commit -m "style: redesign dashboard components with Indigo palette"
```

---

## Task 7: Redesign Drawer and Tab Navigation

**Files:**
- Modify: `apps/mobile/src/components/features/layout/custom-drawer.tsx`
- Modify: `apps/mobile/src/app/(app)/(drawer)/(tabs)/_layout.tsx`
- Modify: `apps/mobile/src/app/(app)/(drawer)/_layout.tsx`

**Step 1: Update custom-drawer.tsx**

Replace wallet clipart with text wordmark. Replace the entire logo/title block (lines 22-31):

```tsx
<View className="items-center mt-5 mb-10">
  <Text className="text-2xl font-bold text-primary">{appName}</Text>
</View>
```

Remove the `import Logo from "@/assets/images/wallet.png"` and the `Image` import.

Update the logout button styling — use `text-destructive`:

```tsx
<Button
  variant="ghost"
  className="mt-auto"
  onPress={logout}
>
  <Icon name="LogOut" className="text-destructive" />
  <ButtonText className="text-base text-destructive"> {text.logout}</ButtonText>
</Button>
```

**Step 2: Update tabs _layout.tsx**

Ensure `tabBarActiveTintColor` uses the new primary color. Add to `screenOptions`:

```tsx
screenOptions={({ route }) => ({
  tabBarIcon: ({ focused, color, size }) => {
    const iconName = tabScreens.find(screen => screen.name === route.name)?.icon || "House"
    return <Icon name={iconName} size={22} className={focused ? "text-primary" : "text-muted-foreground"} />
  },
  tabBarActiveTintColor: '#4F46E5',
  tabBarInactiveTintColor: '#64748B',
  tabBarStyle: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
})}
```

**Step 3: Update drawer _layout.tsx**

Ensure drawer screen active tint uses new primary. If there's `drawerActiveTintColor` or similar, update to `'#4F46E5'`.

**Step 4: Commit**

```bash
git add apps/mobile/src/components/features/layout/custom-drawer.tsx apps/mobile/src/app/\(app\)/\(drawer\)/
git commit -m "style: redesign drawer and tab navigation"
```

---

## Task 8: Redesign Categories Screen and Category Card

**Files:**
- Modify: `apps/mobile/src/app/(app)/(drawer)/categories.tsx`
- Modify: `apps/mobile/src/components/features/categories/category-card.tsx`

**Step 1: Update category-card.tsx**

Remove bordered card styling. Use `bg-card rounded-xl p-4 shadow-sm` (no visible border).

For edit/delete buttons — simplify to icon-only, no colored backgrounds:
- Edit: just `text-muted-foreground` icon
- Delete: just `text-destructive` icon

Remove any raw color classes like `bg-blue-50`, `border-blue-200`, `bg-red-50`, `border-red-200`.

**Step 2: Update categories.tsx**

FAB button: change from `bg-primary` (which was teal) — it will automatically use the new indigo primary. Verify it uses `bg-primary`.

**Step 3: Commit**

```bash
git add apps/mobile/src/components/features/categories/category-card.tsx apps/mobile/src/app/\(app\)/\(drawer\)/categories.tsx
git commit -m "style: redesign categories screen with clean cards"
```

---

## Task 9: Redesign Account Detail Screen

**Files:**
- Modify: `apps/mobile/src/app/(app)/account/[id].tsx`

**Step 1: Update the balance hero card**

Use `bg-card rounded-2xl shadow-sm border-l-4` with the account type color accent. Remove any `border border-border`. The balance amount should use `font-mono text-3xl font-bold`.

**Step 2: Update insight metric cards**

Use `bg-card rounded-xl p-4 shadow-sm` (no border). Values should use `font-mono font-bold`. Icon backgrounds should use semantic colors with `/10` opacity.

**Step 3: Update "Top Spending Category" card**

Use `bg-card rounded-xl p-4 shadow-sm` styling.

**Step 4: Commit**

```bash
git add apps/mobile/src/app/\(app\)/account/\[id\].tsx
git commit -m "style: redesign account detail screen"
```

---

## Task 10: Redesign Form Screens

**Files:**
- Modify: `apps/mobile/src/app/(app)/add-transaction.tsx`
- Modify: `apps/mobile/src/app/(app)/add-account.tsx`

**Step 1: Update add-transaction.tsx**

- Fix the "(Optional) (Optional)" duplicate label bug — find where label text says "Category (Optional) (Optional)" and fix to just "Category (Optional)"
- Remove the yellow cancel button. Use only one primary "Save" button full-width
- Change Cancel to a ghost button or remove it (back nav handles cancel)
- Labels should use `text-sm font-medium text-muted-foreground mb-1.5`
- Income/Expense toggle: keep but ensure green uses `text-income` and red uses `text-expense` (not raw colors)

**Step 2: Update add-account.tsx**

- Remove any yellow/secondary button styling
- Save button: `bg-primary rounded-xl` (full width)
- Form fields should use the updated Input component (bg-card rounded-xl)
- Labels: `text-sm font-medium text-muted-foreground mb-1.5`

**Step 3: Commit**

```bash
git add apps/mobile/src/app/\(app\)/add-transaction.tsx apps/mobile/src/app/\(app\)/add-account.tsx
git commit -m "style: redesign form screens, fix duplicate label bug"
```

---

## Task 11: Redesign Transactions Screen

**Files:**
- Modify: `apps/mobile/src/app/(app)/transactions.tsx`

**Step 1: Update header and filter stats**

- Title: `text-2xl font-bold text-foreground`
- Transaction count: `text-sm text-muted-foreground`
- Filter stats card: `bg-card rounded-xl p-4 shadow-sm` (no border)
- Stat values: `font-mono font-semibold`
- Remove any raw color usage

**Step 2: Commit**

```bash
git add apps/mobile/src/app/\(app\)/transactions.tsx
git commit -m "style: redesign transactions screen"
```

---

## Task 12: Visual QA Pass

**Step 1: Run the app in web mode**

```bash
cd apps/mobile && pnpm web
```

**Step 2: Navigate through every screen and verify:**

- [ ] Sign-in: wordmark visible, clean inputs, indigo button
- [ ] Dashboard: all sections using bg-card, no teal visible, amounts in mono
- [ ] Account cards: colored left borders by type
- [ ] Transaction list: flat with dividers, truncated text, mono amounts
- [ ] Categories: clean cards, no colored edit/delete backgrounds
- [ ] Account detail: hero with accent border, metric cards
- [ ] Add transaction: no duplicate label, single CTA, no yellow
- [ ] Add account: clean form, indigo save button
- [ ] Drawer: wordmark, indigo active state, destructive logout
- [ ] Tab bar: indigo active tab
- [ ] Charts: indigo period selector, clean stat cards
- [ ] No raw Tailwind colors (search codebase for `text-blue-`, `text-red-`, `text-green-`, `text-pink-`, `text-orange-`, `text-lime-`)

**Step 3: Fix any remaining raw color usages**

Run: `grep -rn "text-blue-\|text-red-\|text-green-\|text-pink-\|text-orange-\|text-lime-\|text-yellow-\|bg-blue-\|bg-red-\|bg-green-\|bg-pink-\|bg-orange-\|bg-lime-\|bg-yellow-" apps/mobile/src/`

Replace any matches with semantic tokens.

**Step 4: Final commit**

```bash
git add -A
git commit -m "style: fix remaining non-semantic colors from QA pass"
```

---

## Task 13: Update Charts Screen

**Files:**
- Modify: `apps/mobile/src/components/features/charts/index.tsx`
- Modify: `apps/mobile/src/components/features/charts/currency-overview.tsx`

**Step 1: Update chart components**

- Time range selector pills: selected should use `bg-primary text-white`, unselected `bg-card text-muted-foreground`
- Stat cards (Avg Income, Avg Expenses, Avg Savings): `bg-card rounded-xl p-4 shadow-sm`
- Amounts: `font-mono font-bold`
- Balance trend section: `bg-card rounded-2xl shadow-sm` wrapper
- Replace any hardcoded teal references

**Step 2: Commit**

```bash
git add apps/mobile/src/components/features/charts/
git commit -m "style: redesign charts screen"
```
