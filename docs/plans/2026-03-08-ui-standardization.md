# UI Standardization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace Gluestack UI with react-native-reusables and enforce a single styling language (NativeWind + tailwind.config.js tokens) across every screen and component in `apps/mobile`.

**Architecture:** Delete all `@gluestack-ui/*` packages, legacy style files, and existing `src/components/ui/`. Bootstrap react-native-reusables (shadcn approach — code owned in-repo). Migrate every component and screen to Tailwind-only classes sourced from `tailwind.config.js` tokens. No hardcoded colors, no StyleSheet.create, no Gilroy font.

**Tech Stack:** React Native, Expo, NativeWind 4, Tailwind CSS, react-native-reusables, Lucide React Native, DM Sans font

**Working directory for all commands:** `apps/mobile`

---

## Phase 1: Foundation

### Task 1: Remove Gluestack packages

**Files:**
- Modify: `apps/mobile/package.json`

**Step 1: Remove all Gluestack dependencies**

```bash
cd apps/mobile
pnpm remove @gluestack-ui/actionsheet @gluestack-ui/alert-dialog @gluestack-ui/button @gluestack-ui/checkbox @gluestack-ui/form-control @gluestack-ui/icon @gluestack-ui/input @gluestack-ui/nativewind-utils @gluestack-ui/overlay @gluestack-ui/progress @gluestack-ui/select @gluestack-ui/spinner @gluestack-ui/toast
```

**Step 2: Remove Gluestack plugin from tailwind.config.js**

In `apps/mobile/tailwind.config.js`, remove line 1 (`import gluestackPlugin from "@gluestack-ui/nativewind-utils/tailwind-plugin"`) and remove `plugins: [gluestackPlugin]` at the bottom. Replace plugins with empty array or remove the key entirely.

**Step 3: Verify package.json has no gluestack entries**

```bash
grep -r "gluestack" apps/mobile/package.json
```
Expected: no output.

---

### Task 2: Delete legacy files and old UI components

**Step 1: Delete legacy style files**

```bash
rm -rf apps/mobile/src/styles/
rm -f apps/mobile/src/constants/Colors.ts
```

**Step 2: Delete old Custom* components**

```bash
rm -rf apps/mobile/src/components/CustomButton/
rm -rf apps/mobile/src/components/CustomInput/
rm -rf apps/mobile/src/components/CustomCard/
rm -rf apps/mobile/src/components/CustomAlert/
```

**Step 3: Delete old ui/ folder (will be replaced by reusables)**

```bash
rm -rf apps/mobile/src/components/ui/gluestack-ui-provider/
rm -rf apps/mobile/src/components/ui/alert-dialog/
rm -rf apps/mobile/src/components/ui/button/
rm -rf apps/mobile/src/components/ui/card/
rm -rf apps/mobile/src/components/ui/checkbox/
rm -rf apps/mobile/src/components/ui/form-control/
rm -rf apps/mobile/src/components/ui/heading/
rm -rf apps/mobile/src/components/ui/hstack/
rm -rf apps/mobile/src/components/ui/icon/
rm -rf apps/mobile/src/components/ui/input/
rm -rf apps/mobile/src/components/ui/progress/
rm -rf apps/mobile/src/components/ui/select/
rm -rf apps/mobile/src/components/ui/spinner/
rm -rf apps/mobile/src/components/ui/vstack/
rm -rf apps/mobile/src/components/ui/box/
rm -rf apps/mobile/src/components/ui/collapsible/
```

Note: Keep `apps/mobile/src/components/ui/CurrencyFilter.tsx`, `icon-card.tsx`, `icon-text-card.tsx`, `month-selector/`, `PeriodDropdown.tsx` — these are custom app components, not Gluestack wrappers.

---

### Task 3: Init react-native-reusables

**Step 1: Run the CLI init**

```bash
cd apps/mobile
pnpm dlx @react-native-reusables/cli@latest init
```

When prompted, accept defaults. This creates:
- `src/components/ui/` base files
- Updates `tailwind.config.js` with required config (merge manually if it overwrites)
- Creates `src/lib/utils.ts` with `cn()` helper

**Step 2: Restore tailwind.config.js tokens if overwritten**

After init, verify `apps/mobile/tailwind.config.js` still contains the full FinoSync color/spacing/font config. If the CLI overwrote it, restore the original content from the design doc and merge any additions from the CLI.

**Step 3: Add individual components**

```bash
cd apps/mobile
pnpm dlx @react-native-reusables/cli@latest add button
pnpm dlx @react-native-reusables/cli@latest add card
pnpm dlx @react-native-reusables/cli@latest add input
pnpm dlx @react-native-reusables/cli@latest add text
pnpm dlx @react-native-reusables/cli@latest add label
pnpm dlx @react-native-reusables/cli@latest add badge
pnpm dlx @react-native-reusables/cli@latest add separator
pnpm dlx @react-native-reusables/cli@latest add progress
pnpm dlx @react-native-reusables/cli@latest add checkbox
pnpm dlx @react-native-reusables/cli@latest add dialog
pnpm dlx @react-native-reusables/cli@latest add alert-dialog
pnpm dlx @react-native-reusables/cli@latest add avatar
pnpm dlx @react-native-reusables/cli@latest add skeleton
pnpm dlx @react-native-reusables/cli@latest add tabs
pnpm dlx @react-native-reusables/cli@latest add select
```

**Step 4: Verify components exist**

```bash
ls apps/mobile/src/components/ui/
```
Expected: button.tsx, card.tsx, input.tsx, text.tsx, label.tsx, badge.tsx, separator.tsx, progress.tsx, checkbox.tsx, dialog.tsx, alert-dialog.tsx, avatar.tsx, skeleton.tsx, tabs.tsx, select.tsx (plus existing custom ones).

---

### Task 4: Set up DM Sans as global font

**Files:**
- Modify: `apps/mobile/src/app/_layout.tsx`

**Step 1: Install expo-font if not already present**

```bash
cd apps/mobile
pnpm add expo-font @expo-google-fonts/dm-sans @expo-google-fonts/ibm-plex-mono
```

**Step 2: Update root layout to load fonts globally**

In `apps/mobile/src/app/_layout.tsx`, add font loading:

```tsx
import { useFonts } from 'expo-font';
import {
  DM_Sans_400Regular,
  DM_Sans_500Medium,
  DM_Sans_600SemiBold,
  DM_Sans_700Bold,
} from '@expo-google-fonts/dm-sans';
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
} from '@expo-google-fonts/ibm-plex-mono';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'DM Sans': DM_Sans_400Regular,
    'DM Sans Medium': DM_Sans_500Medium,
    'DM Sans SemiBold': DM_Sans_600SemiBold,
    'DM Sans Bold': DM_Sans_700Bold,
    'IBM Plex Mono': IBMPlexMono_400Regular,
    'IBM Plex Mono Medium': IBMPlexMono_500Medium,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  // ... rest of existing layout
}
```

**Step 3: Verify TypeScript compiles**

```bash
cd apps/mobile
pnpm tsc --noEmit 2>&1 | head -30
```

---

## Phase 2: Core UI Components

### Task 5: Migrate button.tsx to match FinoSync brand

**Files:**
- Modify: `apps/mobile/src/components/ui/button.tsx`

The reusables button uses `bg-primary` by default. Verify these token classes align with `tailwind.config.js`:
- Default variant: `bg-primary text-primary-foreground` → renders teal `#1abdbd`
- Secondary variant: `bg-secondary text-secondary-foreground` → amber
- Destructive variant: `bg-destructive text-destructive-foreground`
- Outline variant: `border border-border bg-transparent`
- Ghost variant: `bg-transparent`

Sizes should use:
- `sm`: `h-9 px-3 text-sm rounded-lg`
- `default`: `h-11 px-4 text-base rounded-lg`
- `lg`: `h-14 px-6 text-lg rounded-lg`

Update the button.tsx variant definitions to match the above. Replace any hardcoded color values or non-token classes.

---

### Task 6: Migrate card.tsx to match FinoSync brand

**Files:**
- Modify: `apps/mobile/src/components/ui/card.tsx`

Ensure card uses:
```tsx
// Card root
className="bg-card rounded-xl border border-border shadow-sm"

// CardHeader
className="p-4 pb-2"

// CardContent
className="p-4 pt-0"

// CardFooter
className="p-4 pt-0 flex-row items-center"

// CardTitle
className="text-lg font-semibold text-card-foreground"

// CardDescription
className="text-sm text-muted-foreground"
```

---

### Task 7: Migrate input.tsx to match FinoSync brand

**Files:**
- Modify: `apps/mobile/src/components/ui/input.tsx`

Ensure input uses:
```tsx
className="h-11 px-3 border border-border rounded-lg bg-input text-foreground text-base"
// placeholder color: text-muted-foreground
// focus state: border-primary
```

---

### Task 8: Create lib/utils.ts cn() helper

**Files:**
- Create: `apps/mobile/src/lib/utils.ts` (if not created by CLI)

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## Phase 3: Dashboard Components

### Task 9: Fix quick-actions.tsx

**Files:**
- Modify: `apps/mobile/src/components/screens/dashboard/quick-actions.tsx`

Replace all arbitrary Tailwind colors with tokens:
- `text-blue-600` → `text-primary`
- `bg-blue-100` → `bg-primary/10`
- `text-amber-600` → `text-secondary`
- `bg-amber-100` → `bg-secondary/10`
- `text-red-600` → `text-destructive`
- `bg-red-100` → `bg-destructive/10`
- `text-green-600` → `text-success`
- `bg-green-100` → `bg-success/10`

Remove all hardcoded icon size props, use `size={20}` consistently.

---

### Task 10: Fix spending-insights.tsx

**Files:**
- Modify: `apps/mobile/src/components/screens/dashboard/spending-insights.tsx`

Replace all `slate-*` and `gray-*` classes with tokens:
- `text-slate-900` → `text-foreground`
- `text-slate-500`, `text-slate-600` → `text-muted-foreground`
- `text-slate-200`, `text-slate-50` → `text-muted`
- `text-slate-400` → `text-muted-foreground`
- `bg-slate-50`, `bg-slate-100` → `bg-muted`
- `bg-gray-400` → `bg-muted-foreground`

Wrap in `bg-card rounded-xl border border-border p-4 shadow-sm` card shell.

---

### Task 11: Fix total-balance.tsx and remaining dashboard components

**Files:**
- Modify: `apps/mobile/src/components/screens/dashboard/total-balance.tsx`
- Modify: Any other files in `apps/mobile/src/components/screens/dashboard/`

Audit each file:
1. Replace any `slate-*`, `blue-*`, `gray-*` with design tokens
2. Replace inline style objects with className equivalents
3. Ensure font classes are used (no inline `fontFamily`)
4. Card containers use `bg-card rounded-xl border border-border p-4`

---

### Task 12: Fix HomeHeader

**Files:**
- Modify: `apps/mobile/src/components/Headers/HomeHeader/index.tsx`

1. Remove import of `styles/typography.js`
2. Replace Gilroy font references with `font-sans` className
3. Replace hardcoded colors (`#84b9ff`, `#7A7A7A`, `#A1A1A1`) with tokens:
   - `#84b9ff` → `text-primary`
   - `#7A7A7A` → `text-muted-foreground`
   - `#A1A1A1` → `text-muted-foreground`
4. Use Lucide icons consistently (remove FontAwesome if present)

---

## Phase 4: Transaction & Financial Components

### Task 13: Fix TransactionList.tsx

**Files:**
- Modify: `apps/mobile/src/components/TransactionList.tsx`

1. Replace hardcoded category colors object with token-mapped colors:

```tsx
const CATEGORY_COLORS: Record<string, string> = {
  food: 'bg-primary/10 text-primary',
  transport: 'bg-secondary/10 text-secondary',
  health: 'bg-success/10 text-success',
  entertainment: 'bg-info/10 text-info',
  shopping: 'bg-destructive/10 text-destructive',
  // etc — use token-derived classes, not hex values
};
```

2. Replace `"text-red-500"` → `"text-expense"`, `"text-green-600"` → `"text-income"`
3. Replace dynamic `backgroundColor: color + "20"` with Tailwind opacity modifier classes
4. Remove all inline style objects, use className

---

### Task 14: Fix AccountCard and TransactionCard

**Files:**
- Modify: `apps/mobile/src/components/Cards/AccountCard/index.tsx`
- Modify: `apps/mobile/src/components/Cards/TransactionCard/index.tsx`

AccountCard:
- `bg-black` → `bg-neutral-950`
- `bg-light_black` → `bg-neutral-900` (define in tailwind.config.js if missing, or use `bg-neutral-900`)
- `text-primary-light` → `text-primary-400`

TransactionCard:
- `bg-light_black` → `bg-neutral-900`
- Ensure all classes use design tokens

---

## Phase 5: Screens

### Task 15: Fix auth screens (sign-in, sign-up, forgot-password)

**Files:**
- Modify: `apps/mobile/src/app/(auth)/sign-in.tsx`
- Modify: `apps/mobile/src/app/(auth)/sign-up.tsx`
- Modify: `apps/mobile/src/app/(auth)/forgot-password.tsx`

For each file:
1. Remove all `StyleSheet.create` blocks
2. Replace with NativeWind `className` equivalents:
   - `fontSize: 20` → `text-xl`
   - `fontWeight: "bold"` → `font-bold`
   - `marginBottom: 10` → `mb-2.5`
   - `padding: 20` → `p-5`
   - `marginTop: 30` → `mt-7`
3. Replace `<CustomInput>` with new `<Input>` from `components/ui/input`
4. Replace `<CustomButton>` with new `<Button>` from `components/ui/button`
5. Replace hardcoded placeholder colors with `placeholderTextColor` using token value

---

### Task 16: Fix add-transaction.tsx

**Files:**
- Modify: `apps/mobile/src/app/(app)/add-transaction.tsx`

1. Remove all inline styles
2. Replace `placeholderTextColor="#6b7280"` with token value (neutral-500 = `#9e9e9e` or use CSS variable)
3. Replace `<CustomInput>` → `<Input>` from reusables
4. Replace `<CustomButton>` → `<Button>` from reusables
5. All text uses `text-foreground`, labels use `text-muted-foreground`

---

### Task 17: Fix remaining screens

**Files:**
- Modify: `apps/mobile/src/app/(app)/transactions.tsx`
- Modify: `apps/mobile/src/app/(app)/add-account.tsx`
- Modify: `apps/mobile/src/app/(app)/add-budget.tsx`
- Modify: `apps/mobile/src/app/(app)/add-category.tsx`
- Modify: `apps/mobile/src/app/(app)/account/[id].tsx`
- Modify: `apps/mobile/src/app/(app)/budget/[id].tsx`
- Modify: `apps/mobile/src/app/(app)/notifications.tsx`
- Modify: `apps/mobile/src/app/(app)/(drawer)/categories.tsx`
- Modify: `apps/mobile/src/app/(app)/(drawer)/about.tsx`
- Modify: `apps/mobile/src/app/(auth)/settings.tsx`

For each:
1. Audit for any `StyleSheet.create`, inline styles, hardcoded colors — replace with className
2. Replace any `CustomButton`, `CustomInput`, `CustomCard` imports with reusables equivalents
3. Remove any gluestack imports

---

### Task 18: Fix remaining components

**Files:**
- Modify: `apps/mobile/src/components/Headers/BackHeader/index.js`
- Modify: `apps/mobile/src/components/BudgetCard/`
- Modify: `apps/mobile/src/components/forms/`
- Modify: `apps/mobile/src/components/ui/CurrencyFilter.tsx`
- Modify: `apps/mobile/src/components/ui/month-selector/`
- Modify: `apps/mobile/src/components/ui/PeriodDropdown.tsx`

Audit each for:
- Hardcoded colors → tokens
- Inline styles → className
- Legacy font references → remove (rely on global)
- Old Custom* component usage → reusables

---

## Phase 6: Verification

### Task 19: TypeScript check & final audit

**Step 1: TypeScript compilation check**

```bash
cd apps/mobile
pnpm tsc --noEmit 2>&1 | head -50
```

Fix any type errors from removed Gluestack types.

**Step 2: Grep for any remaining violations**

```bash
# No hardcoded hex colors in components (excluding tailwind.config.js and design-system/tokens.ts)
grep -r '#[0-9a-fA-F]\{3,6\}' apps/mobile/src/components/ apps/mobile/src/app/ \
  --include="*.tsx" --include="*.ts" --include="*.js" \
  -l

# No StyleSheet.create usage
grep -r 'StyleSheet.create' apps/mobile/src/ --include="*.tsx" --include="*.ts" -l

# No Gluestack imports
grep -r '@gluestack-ui' apps/mobile/src/ --include="*.tsx" --include="*.ts" -l

# No Gilroy font references
grep -r 'Gilroy' apps/mobile/src/ --include="*.tsx" --include="*.ts" --include="*.js" -l

# No legacy style imports
grep -r "from.*styles/colors\|from.*styles/typography\|from.*constants/Colors" apps/mobile/src/ -l
```

Expected: all commands return no output.

**Step 3: Visual check**

```bash
cd apps/mobile
pnpm start
```

Open in Expo Go or simulator. Walk through: auth screens → dashboard → transactions → categories → add transaction. Verify visual consistency.

---

## Success Criteria

- [ ] Zero `@gluestack-ui/*` imports in `src/`
- [ ] Zero `StyleSheet.create` calls in `src/`
- [ ] Zero hardcoded hex colors in `src/components/` and `src/app/`
- [ ] Zero Gilroy font references
- [ ] Zero imports from `styles/colors`, `styles/typography`, `constants/Colors`
- [ ] DM Sans renders on all text elements
- [ ] All buttons are teal (primary) or correct variant
- [ ] All cards have consistent `rounded-xl border border-border bg-card shadow-sm`
- [ ] All inputs have consistent `rounded-lg border border-border bg-input`
- [ ] `pnpm tsc --noEmit` passes with no errors
