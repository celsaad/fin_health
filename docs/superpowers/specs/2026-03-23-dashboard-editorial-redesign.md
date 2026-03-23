# Dashboard Editorial Redesign

## Overview

Restyle the FinHealth web dashboard to match the "Editorial Finance" design system mockup. This is a full visual overhaul of the dashboard page plus global design token updates, using Approach A (restyle existing components in-place, add new components for Budget Compliance and Editorial Insight).

## Scope

- **Global:** Design tokens (fonts, colors, surface hierarchy), Card component border removal, Header glassmorphism
- **Dashboard page:** All 7 dashboard sections restyled or replaced
- **New components:** BudgetCompliance table, EditorialInsight card, RecentPeaks list
- **Replaced components:** MonthlyTable replaced by BudgetCompliance, TopCategories replaced by RecentPeaks
- **Icons:** Keep Lucide React (map mockup's Material Symbols to Lucide equivalents)

## Non-goals

- Other pages beyond the dashboard (they inherit theme changes automatically but get no dedicated restyling)
- Mobile-specific layout changes (responsive breakpoints stay as-is)
- Backend API changes (all data is available from existing endpoints; month-over-month percentage is derived client-side)

---

## 1. Global Design System Updates

### 1.1 Typography

Add Google Fonts import for Manrope (headlines) and Inter (body) in `index.html`.

Define Tailwind font-family tokens in `index.css`:

```css
--font-headline: 'Manrope', system-ui, sans-serif;
--font-body: 'Inter', system-ui, sans-serif;
```

Update `@layer base` body rule to use `font-family: var(--font-body)`.

Add utility classes for headline usage (Manrope) via Tailwind `fontFamily` extend.

**Editorial typography pattern:**
- Headlines: Manrope, bold/extrabold
- Body text: Inter, regular/medium
- Labels/metadata: Inter, `text-[10px] font-bold uppercase tracking-widest` (the "tabloid-chic" look)
- Subtitles below headlines: `text-xs uppercase tracking-widest text-muted-foreground`

### 1.2 Surface Hierarchy

Replace current card/background model with tonal layering:

Add these tokens to the `@theme` block in `index.css`. Light values go in `@theme`, dark overrides go in `.dark` within `@layer base`.

| Token (CSS var) | Tailwind class | Light | Dark | Purpose |
|---|---|---|---|---|
| `--color-background` | `bg-background` | `hsl(228 33% 97%)` | `hsl(222 47% 8%)` | Page base (Level 1) |
| `--color-surface-container-low` | `bg-surface-container-low` | `hsl(228 20% 95%)` | `hsl(217 33% 12%)` | Secondary zones (Level 2) |
| `--color-surface-container` | `bg-surface-container` | `hsl(228 14% 93%)` | `hsl(217 33% 17%)` | Track backgrounds, divider replacement (Level 2.5) |
| `--color-card` | `bg-card` | `hsl(0 0% 100%)` | `hsl(222 47% 11%)` | Primary data cards (Level 3) |
| `--color-surface-bright` | `bg-surface-bright` | `hsl(0 0% 100%)` | `hsl(222 47% 14%)` | Floating modals/popovers (Level 4) |
| `--color-primary-container` | `bg-primary-container` | `hsl(239 82% 66%)` | `hsl(239 82% 60%)` | Gradient endpoints (Level n/a) |

**Token-to-class reference for common uses in this spec:**
- `bg-surface-container` → chart track backgrounds, progress bar tracks
- `bg-surface-container-low` → hover backgrounds on table rows
- `bg-background` → page base, row hover states (written as `hover:bg-background`)

### 1.3 No-Line Rule

Update `Card` component (`src/components/ui/card.tsx`):

**Before:** `border border-border/50 bg-card ... shadow-sm`
**After:** `bg-card ... shadow-sm` (remove `border border-border/50`)

The card relies purely on white-on-gray tonal lift for boundary definition.

If a border is absolutely required for accessibility, use `outline-variant` at 15% opacity: `border border-[#c7c4d7]/15`.

### 1.4 Header Glassmorphism

Update `Header` component (`src/components/layout/Header.tsx`):

**Before:** `bg-card shadow-sm`
**After:** `bg-white/70 backdrop-blur-xl`

Dark mode: `dark:bg-[hsl(222,47%,11%)]/70 dark:backdrop-blur-xl`

Add notification bell icon (Lucide `Bell`) and help icon (Lucide `HelpCircle`) to the header, left of the user menu.

- These are **decorative/placeholder** for now — they do not open popovers or link anywhere. They serve as visual anchors to match the mockup layout.
- `aria-label={t('common.notifications')}` on Bell, `aria-label={t('common.help')}` on HelpCircle
- Both wrapped in `<button>` elements (not `<span>`) for keyboard accessibility, with `cursor-pointer hover:text-primary transition-colors`
- Add i18n keys: `common.notifications`, `common.help`

### 1.5 Shadow Philosophy

Replace generic shadows with primary-tinted shadows:

- Cards: `shadow-[0_10px_30px_-5px_rgba(70,72,212,0.05)]`
- Floating elements: `shadow-xl shadow-indigo-900/10`

### 1.6 Primary Container Color

Included in the token table above (Section 1.2). `--color-primary-container: hsl(239 82% 66%)` for gradient endpoints. Used in the Net Balance card gradient and primary CTAs.

---

## 2. Summary Cards (SummaryCards.tsx)

### 2.1 Net Balance Card (Gradient Variant)

Render the first card with a distinct gradient treatment:

- Background: `bg-gradient-to-br from-primary to-primary-container`
- Text: white
- Label: `text-xs font-bold uppercase tracking-widest opacity-80`
- Value: `font-headline text-3xl font-extrabold` (Manrope)
- Icon: Lucide `Landmark`, positioned top-right, `text-white/50`
- Month-over-month badge: `bg-white/20 text-xs font-medium px-2 py-1 rounded-lg` showing percentage change with `TrendingUp`/`TrendingDown` icon
- Decorative blur circle in top-right corner (exact sizing at implementer's discretion): `absolute bg-white/10 rounded-full blur-2xl` positioned top-right, roughly 6rem square

### 2.2 Standard Cards (Income, Expenses, Count)

Each card follows a consistent pattern:

- Icon: top-left in a tinted circle (`w-10 h-10 rounded-lg`)
  - Income: emerald tint, Lucide `ArrowDown`
  - Expenses: red tint, Lucide `ArrowUp`
  - Count: blue tint, Lucide `ListChecks`
- Label: top-right, `text-[10px] font-bold uppercase tracking-widest text-muted-foreground`
- Value: `font-headline text-2xl font-bold`
- Subtitle: `text-xs text-muted-foreground mt-2 font-medium`
- Hover effect: `hover:translate-y-[-2px] transition-transform`

### 2.3 Data

The backend summary endpoint returns `{ totalIncome, totalExpenses, net, transactionCount }` — it does **not** include a month-over-month percentage. We compute this on the frontend.

**Approach:** In `Dashboard.tsx`, fetch both the current and previous month summaries:

```typescript
const summary$ = useSummary(month, year);

// Previous month (handles year wraparound: Jan → Dec of prior year)
const prevMonth = month === 1 ? 12 : month - 1;
const prevYear = month === 1 ? year - 1 : year;
const prevSummary$ = useSummary(prevMonth, prevYear);
```

Derive the percentage in the component (or a `useMemo`):

```typescript
const netChangePercent = useMemo(() => {
  if (!summary$.data || !prevSummary$.data || prevSummary$.data.net === 0) return null;
  return ((summary$.data.net - prevSummary$.data.net) / Math.abs(prevSummary$.data.net)) * 100;
}, [summary$.data, prevSummary$.data]);
```

Pass `netChangePercent` as an additional prop to `SummaryCards`.

If `netChangePercent` is `null` (no previous data or division by zero), hide the month-over-month badge entirely rather than showing "+0%".

### 2.4 Layout

Grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`

---

## 3. Cash Flow Trend (TrendChart.tsx restyle)

### 3.1 Visual Changes

- Remove `CartesianGrid`
- Remove `YAxis`
- Narrow bars: `barSize={12}`, rounded top only (`radius={[2, 2, 0, 0]}`)
- Opacity ramp: For each month, apply decreasing opacity. Most recent month = 100%, oldest = 20%. This is done by rendering individual `<Bar>` cells with opacity styling.
- Income bars: indigo (`#4648d4`), Expense bars: `#f87171` (red-400)
- Most recent month's X-axis label in bold dark text; others in muted gray
- Current month bars: full opacity with no additional shadow (CSS box-shadow doesn't apply to SVG `<rect>` elements; skip this decorative detail rather than adding SVG filter complexity)

### 3.2 Header Treatment

Replace Card header with editorial style:

```
Cash Flow Trend                    [● Income  ● Expenses]
INCOME VS EXPENSES ANALYSIS
```

- Title: `font-headline text-lg font-bold`
- Subtitle: `text-xs uppercase tracking-widest text-muted-foreground mt-1`
- Legend: `flex items-center gap-4` with color dots + `text-xs font-medium`

### 3.3 Layout

`col-span-12 lg:col-span-8` in a 12-column grid. Padding: `p-8`.

### 3.4 Data

Same `useTrend(6)` hook. No changes.

**Note:** `useTrend` always returns the most recent 6 calendar months regardless of the selected month/year in `DateRangeSelector`. This is intentional — the trend chart shows the "bigger picture" trajectory, not a window aligned to the selected period. The last element in the returned array is always the most recent month (full opacity), and the first is the oldest (lowest opacity).

---

## 4. Editorial Insight Card (new: EditorialInsightCard.tsx)

### 4.1 Purpose

Replaces the current `InsightsCard` + `ProGate` wrapper. Shows AI-generated spending insights for Pro users, or a teaser with upgrade CTA for free users.

### 4.2 Layout

`col-span-12 lg:col-span-4` — sits beside the Cash Flow Trend chart.

### 4.3 Non-Pro State (Locked)

- Background: `bg-indigo-900` with subtle radial dot pattern overlay at 10% opacity
- Badge: "EDITORIAL INSIGHT" in `bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest`
- Lock icon: Lucide `Lock`, `text-amber-400`, filled variant
- Headline: "Spending Forecast for [Next Month]" in `font-headline text-2xl font-bold text-white`
- Teaser text: `text-indigo-200 text-sm leading-relaxed`
- Animated loading bars: two placeholder bars with `animate-pulse`
- CTA button: `bg-white text-indigo-900 font-bold py-3 rounded-lg` — "Upgrade to Pro"

### 4.4 Pro State (Unlocked)

- Same dark background treatment
- Badge: "EDITORIAL INSIGHT" (no lock icon)
- Show the first insight's title and description from `useInsights`
- No CTA button; optionally show "View All Insights" link

### 4.5 Loading State

While `useInsights` is loading (Pro users only): show the dark background with the "EDITORIAL INSIGHT" badge, the animated placeholder bars (same as locked state), but no headline text — just two `h-4 w-3/4 bg-white/10 rounded animate-pulse` skeleton lines where the headline and description would be.

### 4.6 Data

- `usePlan().isPro` for gating
- `useInsights(month, year, isPro)` for content
- Next month name derived from current `month` state

---

## 5. Spending Allocation (ExpenseTreemap.tsx restyle)

### 5.1 Visual Change

Replace the Recharts vertical bar chart with pure CSS horizontal progress bars.

### 5.2 Structure

For each category (sorted by total, top 10):

```
HOUSING & RENT                    $1,800.00 (43%)
[============================...........]  (colored bar at 43% width)
```

- Category name: `text-xs font-bold uppercase tracking-tight text-muted-foreground`
- Amount + percentage: same style, right-aligned
- Progress bar: `h-3 w-full bg-surface-container rounded-full overflow-hidden` with inner `div` at `width: {percentage}%`
- Colors cycle: indigo-500, emerald-500, amber-500, purple-500, rose-500, sky-500, slate-500

### 5.3 Legend

Mini color-dot legend at the bottom:

```
● HOUSING  ● DINING  ● TRANSPORT  ● SHOPPING  ● HEALTH  ● EDUCATION  ● OTHER
```

Each: `text-[10px] font-bold uppercase text-muted-foreground` with `w-2 h-2 rounded-full` color dot.

### 5.4 Header

- Title: "Spending Allocation" — `font-headline font-bold`
- Subtitle: "Breakdown by Top 10 Categories" — `text-xs uppercase tracking-widest text-muted-foreground mt-1`

### 5.5 Layout

`col-span-12 xl:col-span-7` in a 12-column grid. Padding: `p-8`.

### 5.6 Empty State

If `categories` array is empty, show the card header with a centered `text-muted-foreground` message: `t('dashboard.noExpenseData')` (existing key).

### 5.7 Data

Same `useCategoryBreakdown` hook. No Recharts dependency needed for this component anymore (though TrendChart still uses Recharts).

---

## 6. Recent Spending Peaks (new: RecentPeaks.tsx, replaces TopCategories)

### 6.1 Purpose

Shows the highest individual expense transactions, replacing the category-level TopCategories view.

### 6.2 Structure

Each transaction row:

```
[icon circle]  Sweetgreen                    -$18.42
               DINING & DRINKS • OCT 24
```

- Icon: category icon (Lucide via `getCategoryIcon(transaction.category.name)`) in `w-10 h-10 rounded-full bg-primary/10 text-primary`
- Name: `text-sm font-bold` — from `transaction.description`
- Meta: `text-[10px] uppercase tracking-tighter text-muted-foreground` — `transaction.category.name` + formatted `transaction.date`
- Amount: `text-sm font-bold text-destructive` — formatted as negative currency
- Row hover: `rounded-xl hover:bg-background transition-colors`

### 6.3 Loading & Empty States

- **Loading:** Show 3 skeleton rows with `animate-pulse` (circle + two line skeletons + amount skeleton)
- **Empty:** Show card header + centered `text-muted-foreground` message: `t('dashboard.noExpensesForPeriod')` (existing key)
- **Loaded:** Show real transaction rows. If fewer than 3 results, optionally show skeleton rows for remaining slots at reduced opacity for visual balance (decorative only, not loading indicator)

### 6.4 Footer

"View All Transactions" link at bottom: `text-primary text-xs font-bold uppercase tracking-widest hover:underline`, uses `<Link to="/transactions">`.

### 6.5 Layout

`col-span-12 xl:col-span-5` beside Spending Allocation. Padding: `p-8`.

### 6.6 Data

New hook `useRecentPeaks` in `useDashboard.ts`:

```typescript
import { useTransactions } from '@/hooks/useTransactions';
import { endOfMonth, format } from 'date-fns';

export function useRecentPeaks(month: number, year: number) {
  const monthStart = format(new Date(year, month - 1, 1), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(new Date(year, month - 1, 1)), 'yyyy-MM-dd');

  const query = useTransactions({
    type: 'expense',
    sortBy: 'amount',
    sortOrder: 'desc',
    limit: 5,
    startDate: monthStart,
    endDate: monthEnd,
  });

  // Unwrap paginated response for convenience
  return {
    ...query,
    data: query.data?.transactions,
  };
}
```

**Important notes:**
- `useTransactions` returns `PaginatedResponse<Transaction>` (shape: `{ transactions: Transaction[], pagination: {...} }`). The hook unwraps `.transactions` for the component.
- The `Transaction` type has `category: { id: string, name: string }` — **not** a flat `categoryName`. The component accesses `transaction.category.name`.
- Date construction uses `date-fns` (already a project dependency) for `endOfMonth` + `format` to produce ISO date strings. The month start is constructed manually via `new Date(year, month - 1, 1)`.

### 6.7 Error Handling

Add `recentPeaks$` to the `hasError` check in `Dashboard.tsx`:

```typescript
const hasError = summary$.isError || categoryBreakdown$.isError || trend$.isError || recentPeaks$.isError;
```

---

## 7. Budget Compliance Table (new: BudgetComplianceTable.tsx, replaces MonthlyTable)

### 7.1 Purpose

Shows per-category budget tracking status: how much was budgeted, how much was spent, remaining balance, and whether the category is on track.

### 7.2 Columns

| Column | Content | Style |
|---|---|---|
| Category | Color dot + category name | `text-sm font-bold` |
| Status | Badge: "ON TRACK" or "OVER BUDGET" | see below |
| Budgeted | Budget amount | `text-sm text-muted-foreground` |
| Spent | Actual spending | `text-sm font-medium` |
| Remaining | Budget - Spent | `text-sm font-bold`, red if negative |

### 7.3 Status Badges

- **ON TRACK:** `bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded`
- **OVER BUDGET:** `bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded`

### 7.4 Table Header

- Title: "Budget Compliance" — `font-headline font-bold`
- Subtitle: "Monthly category tracking" — `text-xs uppercase tracking-widest text-muted-foreground mt-1`
- Column headers: `text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-surface/50`

### 7.5 Table Styling

- No row borders — use `divide-y divide-surface-container` (very subtle tonal divider)
- Row hover: `hover:bg-background transition-colors`
- Full-width card with overflow-x-auto for responsive
- Padding: header `p-8`, cells `px-8 py-5`
- Column headers: `text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-background/50`

### 7.6 Empty State

If no categories have budgets set (empty `budgetRows`), show the card header + centered message: `t('budgets.noBudgets')` (existing key) with a link to `/budgets` to create one.

### 7.7 Data

Combine `useCategoryBreakdown` (spent per category) with `useBudgets` (budget limits). The component joins these two datasets by `categoryId` to produce:

```typescript
interface BudgetComplianceRow {
  categoryId: string;
  categoryName: string;
  colorIndex: number;  // index into the COLORS array for the color dot
  budgeted: number;
  spent: number;
  remaining: number;
  isOverBudget: boolean;
}
```

Only show categories that have a budget set.

**Color dot derivation:** Use the same `COLORS` array as the Spending Allocation section (indigo-500, emerald-500, amber-500, etc.). The color dot for each budget row is determined by the category's index in the sorted spending breakdown. If the category doesn't appear in the spending breakdown (spent $0), use `slate-400` as a default.

---

## 8. Dashboard Page Layout (Dashboard.tsx)

### 8.1 New Layout Structure

```
<div className="space-y-8">
  {/* Row 1: Summary Cards */}
  <SummaryCards />

  {/* Row 2: Bento - Charts + Insight */}
  <section className="grid grid-cols-12 gap-8">
    <TrendChart className="col-span-12 lg:col-span-8" />
    <EditorialInsightCard className="col-span-12 lg:col-span-4" />
  </section>

  {/* Row 3: Bento - Spending + Peaks (xl breakpoint: wider content needs more room) */}
  <section className="grid grid-cols-12 gap-8">
    <SpendingAllocation className="col-span-12 xl:col-span-7" />
    <RecentPeaks className="col-span-12 xl:col-span-5" />
  </section>

  {/* Row 4: Budget Compliance */}
  <BudgetComplianceTable />
</div>
```

### 8.2 Header Integration

**Keep the `DateRangeSelector` in `Dashboard.tsx`**, not in the Header. The Header already shows the page title dynamically. The mockup shows the date picker inline with the "Dashboard" title, but architecturally it's cleaner to render it as part of the dashboard page content rather than lifting date state to the Header (which would need a shared context or route-aware logic).

The dashboard page header area renders as:
```tsx
<div className="flex items-center gap-4">
  <h1 className="font-headline text-lg font-bold">{t('dashboard.title')}</h1>
  <DateRangeSelector ... />
</div>
```

This is placed inside the dashboard page content area, not the global Header component. The global Header continues to show the page title and user menu as before.

### 8.3 Responsive Grid Breakpoint Note

Row 2 (Trend + Insight) splits at `lg` (1024px) because both components are compact enough. Row 3 (Spending Allocation + Recent Peaks) splits at `xl` (1280px) because the horizontal progress bars in Spending Allocation need more horizontal room to be readable. This is intentional.

### 8.4 Data Hooks

```typescript
const summary$ = useSummary(month, year);
const categoryBreakdown$ = useCategoryBreakdown(month, year);
const trend$ = useTrend(6);
const insights$ = useInsights(month, year, isPro);
const budgets$ = useBudgets(month, year);
const recentPeaks$ = useRecentPeaks(month, year);  // NEW
```

---

## 9. i18n

Add new translation keys to `en.json`:

```json
{
  "common": {
    "notifications": "Notifications",
    "help": "Help"
  },
  "dashboard": {
    "cashFlowTrend": "Cash Flow Trend",
    "incomeVsExpenses": "Income vs Expenses Analysis",
    "spendingAllocation": "Spending Allocation",
    "breakdownByCategories": "Breakdown by Top 10 Categories",
    "editorialInsight": "Editorial Insight",
    "spendingForecast": "Spending Forecast for {{month}}",
    "upgradeToPro": "Upgrade to Pro",
    "recentSpendingPeaks": "Recent Spending Peaks",
    "viewAllTransactions": "View All Transactions",
    "budgetCompliance": "Budget Compliance",
    "monthlyCategoryTracking": "Monthly category tracking",
    "onTrack": "On Track",
    "overBudget": "Over Budget",
    "budgeted": "Budgeted",
    "spent": "Spent",
    "remaining": "Remaining",
    "status": "Status",
    "earnedThisMonth": "Earned this month",
    "spentThisMonth": "Spent this month",
    "totalTransactions": "Total transactions",
    "vsLastMonth": "vs last month"
  }
}
```

---

## 10. Accessibility

- All new components use semantic HTML (`table`, `thead`, `tbody`, `th`, `td` for Budget Compliance; `ul`/`li` for lists)
- Status badges use `aria-label` for screen readers (e.g., `aria-label="Status: On Track"`)
- Color-coded elements have text equivalents (badges have text, not just color)
- Focus styles maintained via existing Tailwind ring utilities
- The locked Editorial Insight card is accessible — the CTA button is keyboard-focusable
- Progress bars in Spending Allocation use `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`

---

## 11. Testing Strategy

- **SummaryCards:** Test gradient variant renders for net balance; test month-over-month badge shows/hides based on data
- **TrendChart:** Test renders correct number of bar groups; test opacity ramp applied
- **EditorialInsightCard:** Test locked vs unlocked state based on `isPro`; test CTA button present when locked
- **SpendingAllocation:** Test progress bar widths match percentages; test color cycling; test empty state
- **RecentPeaks:** Test transaction rows render with correct data; test "View All Transactions" link; test skeleton states
- **BudgetComplianceTable:** Test ON TRACK vs OVER BUDGET badges; test negative remaining shown in red; test only budgeted categories shown
- **Design tokens:** Visual regression testing via Storybook or screenshot tests (optional/stretch)

---

## 12. Files Changed

### Modified
- `frontend/index.html` — Add Google Fonts link for Manrope + Inter
- `frontend/src/index.css` — New color tokens, font tokens, surface hierarchy, dark mode
- `frontend/src/components/ui/card.tsx` — Remove border (no-line rule)
- `frontend/src/components/layout/Header.tsx` — Glassmorphic background, notification/help icons
- `frontend/src/components/dashboard/SummaryCards.tsx` — Gradient net balance, editorial card styling
- `frontend/src/components/dashboard/TrendChart.tsx` — Remove grid/axis, opacity ramp, editorial header
- `frontend/src/components/dashboard/ExpenseTreemap.tsx` — Replace Recharts bars with CSS progress bars
- `frontend/src/pages/Dashboard.tsx` — New bento layout, new data hooks, section ordering
- `frontend/src/hooks/useDashboard.ts` — Extend `DashboardSummary` type, add `useRecentPeaks`
- `frontend/src/locales/en.json` — New translation keys

### New
- `frontend/src/components/dashboard/EditorialInsightCard.tsx` — Pro insight card (locked/unlocked)
- `frontend/src/components/dashboard/BudgetComplianceTable.tsx` — Budget compliance table
- `frontend/src/components/dashboard/RecentPeaks.tsx` — Recent high-value transactions

### Removed (functionally replaced)
- `frontend/src/components/dashboard/TopCategories.tsx` — Replaced by `RecentPeaks.tsx`
- `frontend/src/components/dashboard/MonthlyTable.tsx` — Replaced by `BudgetComplianceTable.tsx`

### Unchanged (dead code, leave as-is)
- `frontend/src/components/dashboard/ExpensePieChart.tsx` — Not imported by `Dashboard.tsx`; appears to be dead code. Do not modify or delete as part of this work.

### Test Files (new or updated)
- Tests for each new/modified dashboard component
