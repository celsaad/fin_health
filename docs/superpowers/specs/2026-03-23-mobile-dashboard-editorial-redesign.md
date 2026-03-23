# Mobile Dashboard Editorial Redesign — Design Spec

> Adapts the web editorial finance dashboard (completed 2026-03-23) to the React Native / Expo mobile app with full visual parity, single-column scrollable layout, and extracted component architecture.

**Platform:** React Native 0.83.2 · Expo SDK 55 · React 19 · TanStack Query v5

**Approach:** Section-by-section port — extract inline components from the 578-line `DashboardScreen.tsx` monolith into focused files under `mobile/src/components/dashboard/`, apply editorial design system tokens, add 3 new sections (EditorialInsightCard, RecentPeaks, BudgetComplianceTable).

---

## 1. Foundation: Theme Tokens

**File:** `mobile/src/constants/theme.ts`

### 1.1 New ThemeColors Properties

Add to the `ThemeColors` interface and both light/dark objects:

| Token                  | Light                     | Dark                      | Purpose                              |
| ---------------------- | ------------------------- | ------------------------- | ------------------------------------ |
| `primaryContainer`     | `hsl(239, 82%, 66%)`     | `hsl(239, 82%, 60%)`     | Gradient endpoint for net balance    |
| `surfaceContainerLow`  | `hsl(228, 20%, 95%)`     | `hsl(217, 33%, 12%)`     | Tonal layering (progress bar tracks) |
| `surfaceContainer`     | `hsl(228, 14%, 93%)`     | `hsl(217, 33%, 17%)`     | Tonal layering                       |
| `surfaceBright`        | `hsl(0, 0%, 100%)`       | `hsl(222, 47%, 14%)`     | Card background alternative          |

### 1.2 FontFamily Constant

```ts
export const FontFamily = {
  headline: 'Manrope_700Bold',
  headlineSemiBold: 'Manrope_600SemiBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
} as const;
```

Names match `@expo-google-fonts` loaded font identifiers.

---

## 2. Foundation: Font Loading

**File:** App root (`App.tsx` or root layout)

- Install `@expo-google-fonts/manrope` and `@expo-google-fonts/inter`
- Use `useFonts()` hook to load: `Manrope_600SemiBold`, `Manrope_700Bold`, `Inter_400Regular`, `Inter_500Medium`, `Inter_600SemiBold`, `Inter_700Bold`
- Show splash/loading screen until fonts resolve (standard Expo pattern with `expo-splash-screen`)
- Fonts propagate to components via `fontFamily` in `StyleSheet`

---

## 3. Foundation: Card No-Line Rule

**File:** `mobile/src/components/Card.tsx`

Remove all `borderWidth` / `borderColor` logic. Replace with elevation-based depth:

- **Light mode:** `shadowColor: colors.primary`, `shadowOpacity: 0.06`, `shadowOffset: { width: 0, height: 4 }`, `shadowRadius: 12`, `elevation: 2`
- **Dark mode:** No shadow (RN shadows don't render well on dark backgrounds). Card background uses `surfaceBright` which contrasts against `background` for visual separation.

Matches web's no-line rule: cards separated by shadow and tonal contrast, never strokes.

---

## 4. Header Glassmorphism

**File:** `mobile/src/screens/DashboardScreen.tsx` (inline header restyle)

### Current

Avatar | "FinHealth" centered | Settings gear

### New

- Wrap header `View` in `BlurView` from `expo-blur` (`intensity={80}`, `tint` from theme)
- **Left:** Avatar + initials (unchanged)
- **Center:** Greeting `"Hey, {firstName}"` in `FontFamily.headline` (Manrope Bold)
- **Right:** `Bell` icon from `lucide-react-native` (replaces Settings gear; Settings remains in Profile tab)
- Position: `position: 'absolute'`, `zIndex: 10`, full width — floats over scroll content with blur visible as content scrolls beneath
- Add compensating `paddingTop` to ScrollView content

### Accessibility

- Bell icon: `accessibilityLabel={t('dashboard.notifications')}`

### i18n

- `dashboard.greeting`: `"Hey, {{name}}"`
- `dashboard.notifications`: `"Notifications"`

---

## 5. Summary Cards

**New file:** `mobile/src/components/dashboard/SummaryCards.tsx`

Extracted from inline `SummaryCard` function (DashboardScreen lines 294-320).

### Layout

2×2 grid with the net balance card spanning full width (first row).

### Net Balance Card (full-width)

- `expo-linear-gradient` background: `[colors.primary, colors.primaryContainer]`, `start={[0,0]} end={[1,1]}`
- White text throughout
- Amount: `FontFamily.headline`, ~28px
- Label: uppercase tracking-wide `"NET BALANCE"`, `FontFamily.bodySemiBold`, `opacity: 0.8`
- Decorative: absolute-positioned `View` with `borderRadius: 9999`, `backgroundColor: 'rgba(255,255,255,0.1)'` in top-right
- Faint `Landmark` icon (from lucide) in top-right, white, `opacity: 0.3`
- **MoM% badge:** Pill with `backgroundColor: 'rgba(255,255,255,0.2)'`, `TrendingUp`/`TrendingDown` icon + `"+X.X% vs last month"`. Only rendered when `netChangePercent !== null`

### Income / Expenses / Transactions (half-width each)

- Standard `Card` (borderless with shadow from §3)
- 40×40 rounded-lg icon container with tinted background (emerald / red / blue)
- Label: uppercase tracking-wide, `FontFamily.bodySemiBold`, `textSecondary`
- Amount: `FontFamily.headline`, ~22px
- Subtitle: "Earned this month" / "Spent this month" / "Total transactions", caption size, `textSecondary`

### Props

```ts
interface SummaryCardsProps {
  summary: DashboardSummary;
  netChangePercent: number | null;
}
```

### i18n Keys

`dashboard.netBalance`, `dashboard.vsLastMonth`, `dashboard.earnedThisMonth`, `dashboard.spentThisMonth`, `dashboard.totalTransactions`

---

## 6. Trend Chart (Cash Flow Trend)

**New file:** `mobile/src/components/dashboard/TrendChart.tsx`

Extracted from inline bar chart (DashboardScreen lines 222-261).

### Header

- Title: `t('dashboard.cashFlowTrend')` in `FontFamily.headlineSemiBold`
- Legend row on right: colored dots + "INCOME" / "EXPENSE" in `FontFamily.bodyMedium`

### Bar Chart — Opacity Ramp

- Keep existing `View`-based bar approach (no SVG)
- Opacity ramp: most recent month = `1.0`, each preceding month reduces by ~0.15. For 6 months: `[0.25, 0.4, 0.55, 0.7, 0.85, 1.0]`
- Income bars: `colors.primary` (indigo) with per-month opacity
- Expense bars: `colors.expense` (red) with per-month opacity
- Bar width: 14, top corners rounded (`borderTopLeftRadius: 4`, `borderTopRightRadius: 4`)

### Month Labels

- `FontFamily.bodyMedium`, `textSecondary` color
- Current month: `colors.text` + `FontFamily.bodySemiBold` for emphasis

### Props

```ts
interface TrendChartProps {
  trend: { month: number; year: number; income: number; expense: number }[];
}
```

### i18n Key

`dashboard.cashFlowTrend`

---

## 7. Editorial Insight Card

**New file:** `mobile/src/components/dashboard/EditorialInsightCard.tsx`

### Design

Dark indigo card — the "editorial voice" of the app.

- Background: `colors.primary` (indigo) solid fill
- `BorderRadius.lg` (16) corners
- All text white

### Content (vertical stack)

1. `Sparkles` icon (lucide, white, `opacity: 0.7`)
2. Title: `t('dashboard.editorialInsight')`, `FontFamily.headlineSemiBold`, white, ~16px
3. Body: Top insight's `description`, `FontFamily.body`, white `opacity: 0.85`, ~14px, up to 3 lines
4. If >1 insight: `"See all N insights"` link text, `opacity: 0.7`

### Pro Gate

When `!isPro` (from `usePlan()`):
- Show card with blurred/placeholder content
- "Upgrade to Pro" button overlay: white background, indigo text, `FontFamily.bodySemiBold`, `borderRadius: BorderRadius.full`
- `accessibilityRole="button"`, `accessibilityLabel={t('dashboard.upgradeToPro')}`

### Props

```ts
interface EditorialInsightCardProps {
  insights: Insight[];
  isPro: boolean;
}
```

### i18n Keys

`dashboard.editorialInsight`, `dashboard.seeAllInsights`, `dashboard.upgradeToPro`

---

## 8. Spending Allocation

**New file:** `mobile/src/components/dashboard/SpendingAllocation.tsx`

Replaces the SVG donut chart + legend (DashboardScreen lines 182-218, inline `DonutChart` function lines 324-405).

### Header

- Title: `t('dashboard.spendingAllocation')`, `FontFamily.headlineSemiBold`
- Total on right: `formatCurrency(totalSpent)`, `FontFamily.bodyMedium`, `textSecondary`

### Category Rows (top 6 by amount)

Each row is a vertical stack:
1. Category name (`FontFamily.bodySemiBold`, left) + amount + percentage (`FontFamily.bodyMedium`, `textSecondary`, right)
2. Progress bar: `View` `height: 8`, `borderRadius: 4`, background `surfaceContainerLow`. Inner `View` with `width: ${percentage}%`, `borderRadius: 4`, fill from `CategoryColors`

Gap: `Spacing.md` between rows.

### Empty State

`t('dashboard.noExpenses')` centered text when breakdown is empty.

### Deleted Code

- `DonutChart` function (lines 324-405) — all SVG arc math removed
- Donut-related styles (`donutContainer`, `donutCenter`, `donutAmount`, `donutLabel`, `legendGrid`, `legendItem`)

### Props

```ts
interface SpendingAllocationProps {
  breakdown: { categoryId: string; categoryName: string; total: number; percentage: number; icon: string | null; color: string | null }[];
}
```

### i18n Key

`dashboard.spendingAllocation`

---

## 9. Recent Peaks

**New file:** `mobile/src/components/dashboard/RecentPeaks.tsx`

Replaces the "Top Categories" section (DashboardScreen lines 264-288).

### Header

`t('dashboard.recentSpendingPeaks')`, `FontFamily.headlineSemiBold`

### Transaction List (top 5 expenses by amount)

Each row inside a `Card`:
- **Left:** `CategoryIcon` (existing component, 40px)
- **Middle (flex: 1):**
  - Description/note: `FontFamily.bodySemiBold`, `colors.text`, `numberOfLines={1}`
  - Category name: `FontFamily.body`, `colors.textSecondary`, caption size
- **Right:**
  - Amount: `FontFamily.bodySemiBold`, `colors.expense` (red)
  - Date: `FontFamily.body`, `colors.textSecondary`, caption size, formatted `'MMM d'` via date-fns

### States

- **Loading:** 5 skeleton rows using `LoadingSkeleton`
- **Empty:** `t('dashboard.noTransactions')` centered

### Data Layer

New function in `mobile/src/services/dashboard.ts`:

```ts
export async function getRecentPeaks(month: number, year: number, limit = 5) {
  const { data } = await api.get('/transactions', {
    params: { month, year, sort: 'amount', order: 'desc', limit, type: 'expense' },
  });
  return data;
}
```

### Props

```ts
interface RecentPeaksProps {
  transactions: Transaction[];
  isLoading: boolean;
}
```

### i18n Keys

`dashboard.recentSpendingPeaks`, `dashboard.noTransactions`

---

## 10. Budget Compliance Table

**New file:** `mobile/src/components/dashboard/BudgetComplianceTable.tsx`

### Header

`t('dashboard.budgetCompliance')`, `FontFamily.headlineSemiBold`

### Column Header Row

"Category" | "Progress" | "Status" — `FontFamily.bodyMedium`, `textSecondary`, caption size, uppercase tracking-wide.

### Data Rows

Each row is a horizontal `View`:
- **Left:** `CategoryIcon` (32px) + category name in `FontFamily.bodySemiBold`
- **Center:** Mini progress bar (`height: 6`, same style as SpendingAllocation). Color: `colors.income` (green) if `spent <= budget`, `colors.expense` (red) if over
- **Right:** Status badge pill:
  - **On track:** `incomeBg` background, green text, `t('dashboard.onTrack')`
  - **Over budget:** `expenseBg` background, red text, `t('dashboard.overBudget')`
  - `FontFamily.bodySemiBold`, caption size

### Visibility

Only rendered when budgets exist. If no budgets, section is not rendered (matches web conditional).

### Data

Receives `categories` (from `getBreakdown`) and `budgets` (from budget service). Joins client-side by category name, computes `spent / budget` ratio.

### Props

```ts
interface BudgetComplianceTableProps {
  categories: BreakdownItem[];
  budgets: Budget[];
}
```

### i18n Keys

`dashboard.budgetCompliance`, `dashboard.onTrack`, `dashboard.overBudget`, `dashboard.category`, `dashboard.progress`, `dashboard.status`

---

## 11. DashboardScreen Restructure

**File:** `mobile/src/screens/DashboardScreen.tsx`

Target: ~120-150 lines (from 578).

### Deleted Inline Code

| Code                              | Disposition                          |
| --------------------------------- | ------------------------------------ |
| `SummaryCard` function            | Extracted to `SummaryCards.tsx`       |
| `DonutChart` function             | Deleted (replaced by SpendingAllocation) |
| `InsightRow` + `SENTIMENT_CONFIG` | Data passed to `EditorialInsightCard` |
| `summaryStyles` StyleSheet        | Moved into `SummaryCards.tsx`         |
| `insightStyles` StyleSheet        | Moved into `EditorialInsightCard.tsx` |
| Donut/legend/bar chart styles     | Deleted or moved to respective files |

### New Queries

```ts
// Previous month for MoM%
const prevSummaryQuery = useQuery({
  queryKey: ['dashboard', 'summary', prevMonth, prevYear],
  queryFn: () => getSummary(prevMonth, prevYear),
});

// Recent peaks
const recentPeaksQuery = useQuery({
  queryKey: ['dashboard', 'recentPeaks', month, year],
  queryFn: () => getRecentPeaks(month, year),
});

// Budgets
const budgetsQuery = useQuery({
  queryKey: ['budgets', month, year],
  queryFn: () => getBudgets(month, year),
});
```

### MoM% Derivation

```ts
const netChangePercent = useMemo(() => {
  if (!summary || !prevSummaryQuery.data || prevSummaryQuery.data.net === 0) return null;
  return ((summary.net - prevSummaryQuery.data.net) / Math.abs(prevSummaryQuery.data.net)) * 100;
}, [summary, prevSummaryQuery.data]);
```

### Layout

```
SafeAreaView
  BlurView header (glassmorphic, absolute, z-10)
  MonthSelector
  ScrollView (paddingTop for header, RefreshControl)
    QueryError | Loading skeletons | Content:
      <SummaryCards summary={summary} netChangePercent={netChangePercent} />
      <TrendChart trend={trend} />
      <EditorialInsightCard insights={insights} isPro={isPro} />
      <SpendingAllocation breakdown={breakdown} />
      <RecentPeaks transactions={recentPeaks} isLoading={recentPeaksQuery.isLoading} />
      {budgets ? <BudgetComplianceTable categories={breakdown} budgets={budgets} /> : null}
```

Each section: `marginTop: Spacing.md`.

`onRefresh` refetches all 7 queries.

---

## 12. i18n Keys Summary

All added to `mobile/src/locales/en.json` under the `dashboard` namespace:

```json
{
  "dashboard": {
    "greeting": "Hey, {{name}}",
    "notifications": "Notifications",
    "netBalance": "Net Balance",
    "vsLastMonth": "vs last month",
    "earnedThisMonth": "Earned this month",
    "spentThisMonth": "Spent this month",
    "totalTransactions": "Total transactions",
    "cashFlowTrend": "Cash Flow Trend",
    "editorialInsight": "Editorial Insight",
    "seeAllInsights": "See all {{count}} insights",
    "upgradeToPro": "Upgrade to Pro",
    "spendingAllocation": "Spending Allocation",
    "noExpenses": "No expenses this month",
    "recentSpendingPeaks": "Recent Spending Peaks",
    "noTransactions": "No transactions this month",
    "budgetCompliance": "Budget Compliance",
    "onTrack": "On Track",
    "overBudget": "Over Budget",
    "category": "Category",
    "progress": "Progress",
    "status": "Status"
  }
}
```

---

## 13. New Dependencies

| Package                        | Purpose                      |
| ------------------------------ | ---------------------------- |
| `expo-blur`                    | Header glassmorphism         |
| `expo-linear-gradient`         | Net balance gradient card    |
| `@expo-google-fonts/manrope`   | Headline font                |
| `@expo-google-fonts/inter`     | Body font                    |

---

## 14. File Summary

### New Files (7)

| File                                                    | Purpose                |
| ------------------------------------------------------- | ---------------------- |
| `mobile/src/components/dashboard/SummaryCards.tsx`       | Gradient + standard summary cards |
| `mobile/src/components/dashboard/TrendChart.tsx`         | Opacity-ramp bar chart |
| `mobile/src/components/dashboard/EditorialInsightCard.tsx` | Dark indigo insight card with pro gate |
| `mobile/src/components/dashboard/SpendingAllocation.tsx` | Progress bar breakdown |
| `mobile/src/components/dashboard/RecentPeaks.tsx`        | Top expenses list      |
| `mobile/src/components/dashboard/BudgetComplianceTable.tsx` | Budget vs. actual table |
| `mobile/src/components/dashboard/__tests__/` (7 test files) | One test file per component |

### Modified Files (5)

| File                                    | Changes                                          |
| --------------------------------------- | ------------------------------------------------ |
| `mobile/src/constants/theme.ts`         | Add 4 color tokens + `FontFamily` constant       |
| `mobile/src/components/Card.tsx`        | Remove borders, add shadow/elevation              |
| `mobile/src/screens/DashboardScreen.tsx`| Restructure: import components, add queries, glassmorphic header |
| `mobile/src/services/dashboard.ts`      | Add `getRecentPeaks()` function                  |
| `mobile/src/locales/en.json`            | Add ~20 i18n keys                                |
| App root                                | Add `useFonts()` for Manrope + Inter              |

### Deleted Code

| Code                                | Location                    |
| ----------------------------------- | --------------------------- |
| `DonutChart` inline function        | DashboardScreen lines 324-405 |
| `SummaryCard` inline function       | DashboardScreen lines 294-320 |
| `InsightRow` + `SENTIMENT_CONFIG`   | DashboardScreen lines 407-440 |
| All associated `StyleSheet` blocks  | DashboardScreen lines 442-577 |
| "Top Categories" section JSX        | DashboardScreen lines 264-288 |
