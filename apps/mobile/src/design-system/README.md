# FinoSync Design System

A cohesive design system for the FinoSync budgeting application.

## Philosophy

**Trust & Clarity**: Financial applications need to feel secure, transparent, and trustworthy.
**Simplicity**: Clean, uncluttered interfaces that don't overwhelm users with financial complexity.
**Energy**: Vibrant but professional, inspiring action without being aggressive.

## Visual Identity

### Colors

**Primary (Teal)**: Represents financial security, growth, and forward movement. Used for primary actions, branding, and key UI elements.

**Secondary (Amber)**: Warmth and energy for CTAs, highlights, and important actions. Use sparingly for maximum impact.

**Neutrals**: Clean grays inspired by Fintoc's aesthetic but with our own scale. Use for text, borders, and backgrounds.

**Semantic Colors**:
- Success (Green): Positive outcomes, income, confirmations
- Error (Red): Errors, expenses, warnings that need attention
- Warning (Orange): Cautions, pending states
- Info (Blue): Informational messages, tips

**Financial Colors**:
- Income: Green (money coming in)
- Expense: Red (money going out)
- Investment: Purple (long-term growth)
- Crypto: Orange (volatile assets)
- Savings: Cyan (liquid reserves)

### Typography

**Primary Font**: DM Sans (Google Fonts)
- Clean, modern, geometric
- Excellent readability at all sizes
- Free and widely available

**Monospace**: IBM Plex Mono
- For numbers, amounts, dates
- Clear distinction of individual characters

### Spacing

Based on an 8px grid system (with 4px increments for fine-tuning).
Consistent spacing creates visual rhythm and hierarchy.

### Shadows

Light shadows for depth without heaviness. Use elevation to indicate interactivity and hierarchy.

## Usage

### In Components

```typescript
import { colors, typography, spacing } from '@/design-system/tokens';

// Direct usage
<Text style={{ color: colors.primary[400], fontSize: typography.fontSize.base }}>
  Hello
</Text>

// With NativeWind (preferred)
<Text className="text-primary-400 text-base">
  Hello
</Text>
```

### Color Naming Convention

- `primary-50` to `primary-950`: Lightest to darkest
- Use `400` as the default/main brand color
- Use `500-600` for hover/active states
- Use `50-100` for backgrounds
- Use `700-900` for text on light backgrounds

### Typography Scale

- `2xs`: 10px - Labels, captions
- `xs`: 12px - Small text, metadata
- `sm`: 14px - Secondary text
- `base`: 16px - Body text (default)
- `lg`: 18px - Emphasized text
- `xl`+: Headings

### Spacing Scale

Use consistent spacing for padding, margins, gaps:
- `1-2`: Tight spacing (4-8px)
- `3-4`: Normal spacing (12-16px)
- `5-6`: Comfortable spacing (20-24px)
- `8+`: Large spacing (32px+)

## Component Patterns

### Buttons

```tsx
// Primary action
<Button variant="primary" size="md">
  Save Changes
</Button>

// Secondary action
<Button variant="secondary" size="md">
  Cancel
</Button>

// Tertiary/ghost action
<Button variant="tertiary" size="sm">
  Learn More
</Button>
```

### Cards

```tsx
<Card>
  <CardHeader>
    <CardTitle>Account Balance</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### Forms

```tsx
<Input
  label="Amount"
  value={amount}
  onChangeText={setAmount}
  keyboardType="numeric"
  error={errors.amount}
/>
```

## Accessibility

- Minimum touch target: 44x44px
- Color contrast: WCAG AA (4.5:1 for normal text)
- Focus indicators: Clear and visible
- Semantic HTML/components

## Migration Strategy

Don't rebuild everything at once. Instead:

1. **Start with tokens**: Use new colors/typography in new components
2. **Update as you touch**: When editing a component, update its styling
3. **Prioritize high-impact**: Start with frequently used components (Button, Input, Card)
4. **Document patterns**: As you build, document reusable patterns

## Next Steps

- [ ] Create base UI components (Button, Input, Card)
- [ ] Update Tailwind config with these tokens
- [ ] Migrate existing components gradually
- [ ] Build component documentation/examples
