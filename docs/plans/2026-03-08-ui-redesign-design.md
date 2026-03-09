# FinoSync UI Redesign — Design Document

## Direction
Clean & Minimal. "Slate & Indigo" palette. Premium fintech aesthetic (Mercury/Wise inspired).

## Principles
- All colors referenced via semantic tokens only (never raw Tailwind like `blue-200`)
- Tailwind config defines the design system; components consume tokens
- IBM Plex Mono for financial amounts; DM Sans for everything else
- Cards use `bg-surface shadow-sm rounded-2xl` — no visible borders except accent
- Consistency > novelty

## Color Palette

### Core
| Token | Hex | Usage |
|---|---|---|
| primary | #4F46E5 (Indigo 600) | Buttons, active tabs, links |
| primary-light | #EEF2FF (Indigo 50) | Tinted backgrounds, selected states |
| primary-dark | #3730A3 (Indigo 800) | Hover/pressed states |
| background | #FFFFFF | Main background |
| surface | #F8FAFC (Slate 50) | Card backgrounds, sections |
| border | #E2E8F0 (Slate 200) | Subtle dividers |
| foreground | #0F172A (Slate 900) | Primary text |
| muted-foreground | #64748B (Slate 500) | Secondary text, labels |
| muted | #F1F5F9 (Slate 100) | Muted backgrounds |

### Financial
| Token | Hex | Usage |
|---|---|---|
| income / success | #10B981 | Positive amounts |
| expense / destructive | #EF4444 | Negative amounts, delete |
| investment | #8B5CF6 | Investment accounts |
| crypto | #F59E0B | Crypto accounts |
| savings | #06B6D4 | Savings |
| warning | #F59E0B | Warnings |
| info | #3B82F6 | Informational |

### Account Type Accents
| Type | Color | Tint bg |
|---|---|---|
| Local | primary #4F46E5 | primary-light #EEF2FF |
| Fintoc | savings #06B6D4 | #ECFEFF |
| Fintual | investment #8B5CF6 | #F5F3FF |
| Buda | crypto #F59E0B | #FFFBEB |

### Secondary/Cancel Button
- Replace yellow (#ffc71a) with neutral: `bg-muted text-foreground`

## Typography
- Page title: text-2xl font-bold
- Section title: text-lg font-semibold
- Card title: text-base font-semibold
- Body: text-sm font-normal
- Caption: text-xs font-normal
- Amount large: text-3xl font-bold font-mono
- Amount medium: text-lg font-bold font-mono
- Amount small: text-sm font-semibold font-mono
- Minimum weight: font-normal (no font-light)

## Component Patterns

### Cards
- `bg-surface shadow-sm rounded-2xl p-5` — no visible border
- Account hero: left accent border `border-l-4 border-l-{type-color}`
- Stack with gap-3

### Buttons
- Primary: `bg-primary text-white rounded-xl py-3 font-semibold`
- Secondary: `bg-surface text-foreground border border-border rounded-xl py-3`
- Destructive: `bg-destructive/10 text-destructive rounded-xl`
- Ghost: `text-primary font-medium`
- Icon: `w-10 h-10 rounded-full bg-primary/10`

### Inputs
- Default: `bg-surface rounded-xl px-4 py-3 text-foreground`
- Focus: `ring-2 ring-primary/20 bg-background`
- Labels: `text-sm font-medium text-muted-foreground mb-1.5` above input

### Transaction Items
- Flat list with `border-b border-border` dividers (not individual bordered cards)
- Truncate descriptions to 2 lines
- Amount: `font-mono font-semibold` colored `text-income` or `text-expense`
- Category badge: `bg-{color}/10 text-{color} rounded-full px-2 py-0.5 text-xs`

### Filter Pills
- Unselected: `bg-surface text-muted-foreground rounded-full px-4 py-2`
- Selected: `bg-primary text-white rounded-full px-4 py-2`

## Screen-Specific Changes

### Sign-In
- Replace wallet clipart with "FinoSync" wordmark (text-3xl font-bold text-primary)
- Center form vertically
- Inputs: bg-surface rounded-xl
- Button: bg-primary rounded-xl py-4
- Links: text-primary text-sm font-medium
- Server URL: text-xs text-muted-foreground, bottom

### Dashboard
- Header: "Good afternoon, **Name**" in text-xl font-semibold
- Balance cards: bg-surface rounded-2xl p-5 shadow-sm, amount in font-mono
- Quick actions: smaller icon buttons in horizontal row
- Account cards: differentiated by type color accent
- Transactions: flat list with dividers
- Spending insights: bg-surface stat cards

### Account Detail
- Hero: bg-surface shadow-sm + left accent border
- 2x2 insight grid: bg-surface rounded-xl p-4
- Flat transaction list with dividers

### Categories
- Rows: bg-surface rounded-xl shadow-sm
- Edit/delete: icon-only, text-muted / text-destructive

### Forms
- Consistent bg-surface rounded-xl inputs
- Labels above inputs
- Fix "(Optional) (Optional)" bug
- Single primary CTA full-width, cancel as ghost/back nav
- Remove yellow cancel button

### Drawer
- Wordmark instead of clipart
- User name + email under logo
- Active item: rounded-xl bg-primary/10 text-primary
- Logout: text-destructive at bottom
