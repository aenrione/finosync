# UI Standardization Design
**Date:** 2026-03-08
**Status:** Approved
**Scope:** `apps/mobile` frontend — full visual overhaul

---

## Problem

The app is mid-migration from a legacy custom style system to a modern Tailwind-based design system. Three styling approaches, two color systems, and two font families coexist with no enforcement. The result is a visually inconsistent app that looks unprofessional despite having functional screens.

**Root causes:**
- Gluestack UI's internal config (`gluestack-ui-provider/config.ts`) defines "primary" as gray — not the teal `#1abdbd` in `tailwind.config.js`. Brand colors render incorrectly.
- Legacy files (`src/styles/colors.js`, `src/styles/typography.js`, `src/constants/Colors.ts`) still imported and conflict with design tokens.
- Three styling patterns coexist: `StyleSheet.create`, inline styles, NativeWind `className`.
- Hardcoded hex values and arbitrary Tailwind colors (`slate-900`, `blue-600`) instead of design tokens.
- Gilroy font used alongside DM Sans.

---

## Solution

Replace Gluestack UI with **react-native-reusables** (shadcn/ui approach for React Native). Enforce a single styling language across the entire codebase: NativeWind classes sourced exclusively from `tailwind.config.js` tokens.

---

## Architecture

### Styling Stack (after)
| Package | Role | Keep? |
|---|---|---|
| `nativewind` | Tailwind for React Native | Yes |
| `tailwindcss` | Config & token definitions | Yes |
| `tailwind-merge` | Smart class merging | Yes |
| `clsx` | Conditional classes | Yes |
| `react-native-css-interop` | Required by NativeWind | Yes |
| `lucide-react-native` | Icons | Yes |
| All `@gluestack-ui/*` packages | Component library | **Removed** |

### Component Library
Bootstrapped via `pnpm dlx @react-native-reusables/cli@latest init`. Components are copied as source files into `src/components/ui/` — owned code, not package imports.

**Components to init:**
- button, card, input, text, label
- checkbox, switch, radio-group
- select, dialog, alert-dialog
- progress, badge, avatar, separator
- tabs, skeleton, alert

### Files Deleted
- `src/styles/` — entire folder
- `src/constants/Colors.ts`
- `src/components/CustomButton/`
- `src/components/CustomInput/`
- `src/components/CustomCard/`
- `src/components/ui/gluestack-ui-provider/`
- All existing `src/components/ui/*.tsx` (replaced by reusables)

---

## Visual Language

### Colors
Single source of truth: `tailwind.config.js` (unchanged — already correct).

**Semantic token usage:**
| Token | Use |
|---|---|
| `bg-background` / `text-foreground` | Page backgrounds, primary text |
| `bg-primary` / `text-primary-foreground` | Brand CTAs, active states |
| `bg-secondary` / `text-secondary-foreground` | Amber accents |
| `bg-muted` / `text-muted-foreground` | Subtle backgrounds, secondary text |
| `border-border` | All borders, dividers |
| `bg-card` / `text-card-foreground` | Card surfaces |
| `text-success` / `text-income` / `text-expense` | Financial amounts |
| `bg-destructive` | Destructive actions |

**Forbidden:** Hardcoded hex values, `slate-*`, `blue-*`, `gray-*`, `bg-[#...]` in any component.

### Typography
- **Primary font:** DM Sans — loaded via `expo-font`, applied globally in root layout
- **Mono font:** IBM Plex Mono — for currency amounts only

| Class | Use |
|---|---|
| `text-2xl font-bold` | Screen titles |
| `text-lg font-semibold` | Section headers, card titles |
| `text-base font-medium` | Body, labels |
| `text-sm text-muted-foreground` | Captions, metadata |
| `text-xs text-muted-foreground` | Timestamps, fine print |
| `font-mono` | Currency/numeric values |

**Forbidden:** Inline `fontFamily`, `fontSize`, `fontWeight` in style objects. No Gilroy.

### Spacing
- Screens: `px-4 py-6` outer padding
- Cards: `p-4` internal padding
- Section gaps: `gap-4` or `mb-4`
- All spacing via Tailwind scale — no raw pixel values

### Shape
- Cards, modals, sheets: `rounded-xl`
- Buttons, inputs: `rounded-lg`
- Avatars, icon containers, badges: `rounded-full`
- Dividers: `rounded-none`

### Shadows
- `shadow-sm` on cards only
- No shadow on buttons, inputs, or flat elements
- No `elevation` in inline styles

### Icons
- Lucide React Native exclusively
- Default size: `size={20}`
- Color: always a token class (`className="text-foreground"`) — never hardcoded

---

## Enforcement Rules

1. **No inline style objects** for visual properties (color, font, spacing, radius)
2. **No StyleSheet.create** — NativeWind className only
3. **No hardcoded colors** — only token-derived Tailwind classes
4. **No per-component font declarations** — global font via root layout
5. **No arbitrary Tailwind values** — no `text-[#333]`, `p-[10px]`, etc.

---

## Screens to Update

All screens in `src/app/` get their styling audited and updated:
- Dashboard and all sub-components
- Transactions (list, add, edit)
- Charts
- Categories
- Accounts
- Budget
- Auth (sign-in, sign-up)
- Settings / About / Notifications

All components in `src/components/` get migrated to Tailwind-only approach.

---

## Success Criteria

- Zero `@gluestack-ui/*` imports in codebase
- Zero hardcoded hex colors in components
- Zero `StyleSheet.create` usage
- Zero Gilroy font references
- All screens use DM Sans with correct scale
- All components source colors from `tailwind.config.js` tokens
- App visually consistent across all screens
