---
title: Mobile Dashboard Editorial Redesign — Implementation Plan
tags: [mobile, dashboard, redesign, plan, react-native, expo, tasks]
type: plan
date: 2026-03-23
related:
  - "[Design Spec](../specs/2026-03-23-mobile-dashboard-editorial-redesign.md)"
---

# Mobile Dashboard Editorial Redesign — Implementation Plan

> [!IMPORTANT] **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> [!TIP] Design spec: [Mobile Dashboard Editorial Redesign — Design Spec](../specs/2026-03-23-mobile-dashboard-editorial-redesign.md)

**Goal:** Adapt the web editorial finance dashboard to the React Native / Expo mobile app with full visual parity, extracting inline components from the 578-line `DashboardScreen.tsx` monolith.

**Architecture:** Extract 6 dashboard components from inline code to focused files under `mobile/src/components/dashboard/`. Add editorial design tokens (Manrope/Inter fonts, surface hierarchy, no-line cards), a glassmorphic header, and 3 new sections (EditorialInsightCard, RecentPeaks, BudgetComplianceTable). DashboardScreen becomes a thin layout shell (~130 lines) that imports components and wires data.

**Tech Stack:** React Native 0.83.2 · Expo SDK 55 · React 19 · TanStack Query v5 · expo-blur · expo-linear-gradient · @expo-google-fonts/manrope · @expo-google-fonts/inter

---

## File Map

### New Files

| File | Responsibility |
|------|---------------|
| `mobile/src/types/dashboard.ts` | `DashboardSummary`, `BreakdownItem`, `TrendItem` types |
| `mobile/src/components/dashboard/SummaryCards.tsx` | Gradient net balance + 3 standard summary cards |
| `mobile/src/components/dashboard/TrendChart.tsx` | Opacity-ramp bar chart |
| `mobile/src/components/dashboard/EditorialInsightCard.tsx` | Dark indigo insight card with pro gate |
| `mobile/src/components/dashboard/SpendingAllocation.tsx` | Horizontal progress bar breakdown |
| `mobile/src/components/dashboard/RecentPeaks.tsx` | Top expenses transaction list |
| `mobile/src/components/dashboard/BudgetComplianceTable.tsx` | Budget vs. actual with status badges |
| `mobile/src/__tests__/components/dashboard/SummaryCards.test.tsx` | Tests for SummaryCards |
| `mobile/src/__tests__/components/dashboard/TrendChart.test.tsx` | Tests for TrendChart |
| `mobile/src/__tests__/components/dashboard/EditorialInsightCard.test.tsx` | Tests for EditorialInsightCard |
| `mobile/src/__tests__/components/dashboard/SpendingAllocation.test.tsx` | Tests for SpendingAllocation |
| `mobile/src/__tests__/components/dashboard/RecentPeaks.test.tsx` | Tests for RecentPeaks |
| `mobile/src/__tests__/components/dashboard/BudgetComplianceTable.test.tsx` | Tests for BudgetComplianceTable |
| `mobile/src/__tests__/services/dashboard.test.ts` | Tests for `getRecentPeaks()` |
| `mobile/src/__tests__/screens/DashboardScreen.test.tsx` | Smoke test for restructured DashboardScreen |

### Modified Files

| File | Changes |
|------|---------|
| `mobile/src/constants/theme.ts` | Add 4 color tokens + `FontFamily` constant |
| `mobile/src/components/Card.tsx` | Remove borders, add shadow/elevation (no-line rule) |
| `mobile/App.tsx` | Add `useFonts()` for Manrope + Inter, gate on font readiness |
| `mobile/src/services/dashboard.ts` | Add `getRecentPeaks()` function |
| `mobile/src/locales/en.json` | Add ~20 i18n keys |
| `mobile/src/screens/DashboardScreen.tsx` | Full restructure: import components, glassmorphic header, 3 new queries, MoM% |

---

## Reference: Testing Patterns

Tests in this project use:
- **Framework:** Jest with `jest-expo` preset, `@testing-library/react-native`
- **Test location:** `mobile/src/__tests__/` (mirrors `src/` structure)
- **Render helper:** `renderWithTheme()` from `../../__tests__/test-utils` (wraps in `ThemeProvider`)
- **React 19 note:** Use `waitFor(() => ...)` around assertions. Some tests need a `beforeAll` warmup render (render + unmount) for React 19 compatibility.
- **Icon mocking:** All lucide icons are auto-mocked to `<View testID="icon-{Name}" />` via `jest.setup.ts`
- **Run tests:** `cd mobile && npx jest src/__tests__/path/to/test.tsx`

## Reference: Existing Component Props

- **`Card`:** `{ children: ReactNode; style?: ViewStyle }` — wraps children in styled View
- **`CategoryIcon`:** `{ icon?: string | null; color?: string | null; size?: number }` — renders lucide icon in colored circle, has null-safe fallback to gray
- **`LoadingSkeleton`:** `{ width?: number | string; height?: number; borderRadius?: number; style?: ViewStyle }` — animated pulsing bar
- **`QueryError`:** `{ message?: string; onRetry?: () => void }` — alert icon + message + optional retry button
- **`MonthSelector`:** `{ selectedMonth: number; selectedYear: number; onSelect: (m, y) => void }` — month/year picker

---

## Task 1: Install Dependencies

**Files:**
- Modify: `mobile/package.json`

- [ ] **Step 1: Install new packages**

```bash
cd mobile && npx expo install expo-blur @expo-google-fonts/manrope @expo-google-fonts/inter
```

`expo-linear-gradient` is already installed. The `expo install` command ensures version compatibility with Expo SDK 55.

- [ ] **Step 2: Verify installation**

```bash
cd mobile && cat package.json | grep -E "expo-blur|expo-google-fonts"
```

Expected: All three packages listed in `dependencies`.

- [ ] **Step 3: Commit**

```bash
cd mobile && git add package.json package-lock.json && git commit -m "chore(mobile): install expo-blur and editorial fonts"
```

---

## Task 2: Theme Tokens & FontFamily

**Files:**
- Modify: `mobile/src/constants/theme.ts:1-103`
- Test: `mobile/src/__tests__/components/Card.test.tsx` (existing — verify no breakage)

- [ ] **Step 1: Add new properties to ThemeColors interface**

In `mobile/src/constants/theme.ts`, add after `amberBg: string;` (line 17):

```ts
  primaryContainer: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceBright: string;
```

- [ ] **Step 2: Add values to light theme object**

After `amberBg: '#fffbeb',` (line 37), add:

```ts
    primaryContainer: 'hsl(239, 82%, 66%)',
    surfaceContainerLow: 'hsl(228, 20%, 95%)',
    surfaceContainer: 'hsl(228, 14%, 93%)',
    surfaceBright: 'hsl(0, 0%, 100%)',
```

- [ ] **Step 3: Add values to dark theme object**

After `amberBg: '#451a03',` (line 55), add:

```ts
    primaryContainer: 'hsl(239, 82%, 60%)',
    surfaceContainerLow: 'hsl(217, 33%, 12%)',
    surfaceContainer: 'hsl(217, 33%, 17%)',
    surfaceBright: 'hsl(222, 47%, 14%)',
```

- [ ] **Step 4: Add FontFamily constant**

After the `FontWeight` object (after line 103), add:

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

- [ ] **Step 5: Run existing tests to verify no breakage**

```bash
cd mobile && npx jest src/__tests__/components/Card.test.tsx --verbose
```

Expected: PASS (2 tests).

- [ ] **Step 6: Run typecheck**

```bash
cd mobile && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 7: Commit**

```bash
cd mobile && git add src/constants/theme.ts && git commit -m "feat(mobile): add editorial design tokens and FontFamily constant"
```

---

## Task 3: Dashboard Types

**Files:**
- Create: `mobile/src/types/dashboard.ts`

- [ ] **Step 1: Create types file**

Create `mobile/src/types/dashboard.ts`:

```ts
export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  net: number;
  transactionCount: number;
}

export interface BreakdownItem {
  categoryId: string;
  categoryName: string;
  total: number;
  percentage: number;
  transactionCount?: number;
  icon: string | null;
  color: string | null;
}

export interface TrendItem {
  month: number;
  year: number;
  income: number;
  expense: number;
}
```

- [ ] **Step 2: Run typecheck**

```bash
cd mobile && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
cd mobile && git add src/types/dashboard.ts && git commit -m "feat(mobile): add dashboard type definitions"
```

---

## Task 4: Card No-Line Rule

**Files:**
- Modify: `mobile/src/components/Card.tsx:1-36`
- Test: `mobile/src/__tests__/components/Card.test.tsx`

- [ ] **Step 1: Update Card.test.tsx with new test for shadow styling**

Add a new test to `mobile/src/__tests__/components/Card.test.tsx`:

```tsx
  it('applies shadow instead of border in light mode', async () => {
    const { getByText } = renderWithTheme(
      <Card>
        <Text>Shadow card</Text>
      </Card>,
    );
    await waitFor(() => {
      const card = getByText('Shadow card').parent;
      expect(card).toBeTruthy();
      const flatStyle = Array.isArray(card!.props.style)
        ? Object.assign({}, ...card!.props.style.filter(Boolean))
        : card!.props.style;
      expect(flatStyle).not.toHaveProperty('borderWidth');
      expect(flatStyle).toHaveProperty('shadowColor');
      expect(flatStyle).toHaveProperty('shadowOpacity');
    });
  });
```

- [ ] **Step 2: Run test to verify it passes (existing behavior still works)**

```bash
cd mobile && npx jest src/__tests__/components/Card.test.tsx --verbose
```

Expected: PASS (3 tests).

- [ ] **Step 3: Update Card component**

Replace the entire contents of `mobile/src/components/Card.tsx`:

```tsx
import React from 'react';
import { View, StyleSheet, Platform, type ViewStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { BorderRadius, Spacing } from '../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function Card({ children, style }: CardProps) {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? colors.surfaceBright : colors.card,
          ...(isDark
            ? {}
            : {
                shadowColor: colors.primary,
                shadowOpacity: 0.06,
                shadowOffset: { width: 0, height: 4 },
                shadowRadius: 12,
                ...Platform.select({ android: { elevation: 2 } }),
              }),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
});
```

- [ ] **Step 4: Run tests**

```bash
cd mobile && npx jest src/__tests__/components/Card.test.tsx --verbose
```

Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
cd mobile && git add src/components/Card.tsx src/__tests__/components/Card.test.tsx && git commit -m "feat(mobile): apply no-line rule to Card component"
```

---

## Task 5: Font Loading in App Root

**Files:**
- Modify: `mobile/App.tsx:1-97`

- [ ] **Step 1: Add font imports and loading**

In `mobile/App.tsx`, add imports after line 1:

```ts
import {
  useFonts,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
```

- [ ] **Step 2: Add useFonts to App component**

In the `App` function (line 81), add font loading before the return. **Important:** Keep the existing `export default Sentry.wrap(App)` export at the bottom of the file — only modify the function body. The `App` component becomes:

```ts
function App() {
  const [fontsLoaded] = useFonts({
    Manrope_600SemiBold,
    Manrope_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <AppContent />
            </ThemeProvider>
          </QueryClientProvider>
        </SafeAreaProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
```

The splash screen is already managed by `AppContent` via `SplashScreen.preventAutoHideAsync()` / `hideAsync()`, so fonts load while splash is visible.

- [ ] **Step 3: Add mock for @expo-google-fonts packages**

In `mobile/jest.setup.ts`, add at the bottom:

```ts
// Mock @expo-google-fonts
jest.mock('@expo-google-fonts/manrope', () => ({
  useFonts: jest.fn(() => [true]),
  Manrope_600SemiBold: 'Manrope_600SemiBold',
  Manrope_700Bold: 'Manrope_700Bold',
}));

jest.mock('@expo-google-fonts/inter', () => ({
  Inter_400Regular: 'Inter_400Regular',
  Inter_500Medium: 'Inter_500Medium',
  Inter_600SemiBold: 'Inter_600SemiBold',
  Inter_700Bold: 'Inter_700Bold',
}));

// Mock expo-blur
jest.mock('expo-blur', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    BlurView: ({ children, ...props }: any) =>
      React.createElement(View, { testID: 'blur-view', ...props }, children),
  };
});
```

- [ ] **Step 4: Run all tests to verify mocks work**

```bash
cd mobile && npx jest --verbose
```

Expected: All existing tests PASS.

- [ ] **Step 5: Commit**

```bash
cd mobile && git add App.tsx jest.setup.ts && git commit -m "feat(mobile): load Manrope and Inter fonts via expo-google-fonts"
```

---

## Task 6: i18n Keys

**Files:**
- Modify: `mobile/src/locales/en.json`

- [ ] **Step 1: Add all new i18n keys**

Replace the `"dashboard"` section in `mobile/src/locales/en.json` with:

```json
  "dashboard": {
    "appName": "FinHealth",
    "greeting": "Hey, {{name}}",
    "notifications": "Notifications",
    "netBalance": "Net Balance",
    "income": "Income",
    "expenses": "Expenses",
    "transactions": "Transactions",
    "vsLastMonth": "vs last month",
    "earnedThisMonth": "Earned this month",
    "spentThisMonth": "Spent this month",
    "totalTransactions": "Total transactions",
    "cashFlowTrend": "Cash Flow Trend",
    "incomeLabel": "INCOME",
    "expenseLabel": "EXPENSE",
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
    "status": "Status",
    "expenseBreakdown": "Expense Breakdown",
    "spent": "SPENT",
    "activity": "Activity",
    "topCategories": "Top Categories",
    "viewAll": "View All",
    "transactionsSuffix": "transactions",
    "insights": "Insights",
    "noInsights": "No insights available for this period"
  }
```

This preserves all existing keys and adds the new ones.

- [ ] **Step 2: Commit**

```bash
cd mobile && git add src/locales/en.json && git commit -m "feat(mobile): add editorial redesign i18n keys"
```

---

## Task 7: getRecentPeaks Service Function

**Files:**
- Modify: `mobile/src/services/dashboard.ts:1-41`
- Create: `mobile/src/__tests__/services/dashboard.test.ts`

- [ ] **Step 1: Write test for getRecentPeaks**

Create `mobile/src/__tests__/services/dashboard.test.ts`:

```ts
import api from '../../services/api';
import { getRecentPeaks } from '../../services/dashboard';

jest.mock('../../services/api');
const mockApi = api as jest.Mocked<typeof api>;

describe('getRecentPeaks', () => {
  it('calls /transactions with correct params for January 2026', async () => {
    const mockData = { transactions: [], pagination: { total: 0 } };
    mockApi.get.mockResolvedValue({ data: mockData });

    const result = await getRecentPeaks(1, 2026);

    expect(mockApi.get).toHaveBeenCalledWith('/transactions', {
      params: {
        startDate: '2026-01-01',
        endDate: '2026-01-31',
        sortBy: 'amount',
        sortOrder: 'desc',
        limit: 5,
        type: 'expense',
      },
    });
    expect(result).toEqual(mockData);
  });

  it('respects custom limit', async () => {
    mockApi.get.mockResolvedValue({ data: { transactions: [] } });

    await getRecentPeaks(3, 2026, 10);

    expect(mockApi.get).toHaveBeenCalledWith('/transactions', {
      params: expect.objectContaining({ limit: 10 }),
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd mobile && npx jest src/__tests__/services/dashboard.test.ts --verbose
```

Expected: FAIL — `getRecentPeaks` is not exported from `../../services/dashboard`.

- [ ] **Step 3: Implement getRecentPeaks**

In `mobile/src/services/dashboard.ts`, add at the top alongside existing imports:

```ts
import { startOfMonth, endOfMonth, format } from 'date-fns';
```

Add after the `getInsights` function (after line 41):

```ts
export async function getRecentPeaks(month: number, year: number, limit = 5) {
  const date = new Date(year, month - 1);
  const startDate = format(startOfMonth(date), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(date), 'yyyy-MM-dd');
  const { data } = await api.get('/transactions', {
    params: { startDate, endDate, sortBy: 'amount', sortOrder: 'desc', limit, type: 'expense' },
  });
  return data;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd mobile && npx jest src/__tests__/services/dashboard.test.ts --verbose
```

Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
cd mobile && git add src/services/dashboard.ts src/__tests__/services/dashboard.test.ts && git commit -m "feat(mobile): add getRecentPeaks service function"
```

---

## Task 8: SummaryCards Component

**Files:**
- Create: `mobile/src/components/dashboard/SummaryCards.tsx`
- Create: `mobile/src/__tests__/components/dashboard/SummaryCards.test.tsx`

- [ ] **Step 1: Write tests**

Create `mobile/src/__tests__/components/dashboard/SummaryCards.test.tsx`:

```tsx
import React from 'react';
import { waitFor } from '@testing-library/react-native';
import { renderWithTheme } from '../../test-utils';
import SummaryCards from '../../../components/dashboard/SummaryCards';
import type { DashboardSummary } from '../../../types/dashboard';

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, ...props }: any) =>
      React.createElement(View, { testID: 'linear-gradient', ...props }, children),
  };
});

const mockSummary: DashboardSummary = {
  totalIncome: 5000,
  totalExpenses: 3200,
  net: 1800,
  transactionCount: 42,
};

describe('SummaryCards', () => {
  it('renders net balance with formatted currency', async () => {
    const { getByText } = renderWithTheme(
      <SummaryCards summary={mockSummary} netChangePercent={null} />,
    );
    await waitFor(() => {
      expect(getByText('$1,800.00')).toBeTruthy();
    });
  });

  it('renders income, expenses, and transaction count', async () => {
    const { getByText } = renderWithTheme(
      <SummaryCards summary={mockSummary} netChangePercent={null} />,
    );
    await waitFor(() => {
      expect(getByText('$5,000.00')).toBeTruthy();
      expect(getByText('$3,200.00')).toBeTruthy();
      expect(getByText('42')).toBeTruthy();
    });
  });

  it('shows MoM badge when netChangePercent is provided', async () => {
    const { getByText } = renderWithTheme(
      <SummaryCards summary={mockSummary} netChangePercent={12.5} />,
    );
    await waitFor(() => {
      expect(getByText(/12\.5%/)).toBeTruthy();
    });
  });

  it('hides MoM badge when netChangePercent is null', async () => {
    const { queryByText } = renderWithTheme(
      <SummaryCards summary={mockSummary} netChangePercent={null} />,
    );
    await waitFor(() => {
      expect(queryByText(/vs last month/)).toBeNull();
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd mobile && npx jest src/__tests__/components/dashboard/SummaryCards.test.tsx --verbose
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement SummaryCards**

See [Design Spec — Summary Cards](../specs/2026-03-23-mobile-dashboard-editorial-redesign.md#5-summary-cards) for the full component spec.

- [ ] **Step 4: Run tests**

```bash
cd mobile && npx jest src/__tests__/components/dashboard/SummaryCards.test.tsx --verbose
```

Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
cd mobile && git add src/components/dashboard/SummaryCards.tsx src/__tests__/components/dashboard/SummaryCards.test.tsx && git commit -m "feat(mobile): add SummaryCards with gradient net balance and MoM badge"
```

---

## Task 9: TrendChart Component

**Files:**
- Create: `mobile/src/components/dashboard/TrendChart.tsx`
- Create: `mobile/src/__tests__/components/dashboard/TrendChart.test.tsx`

- [ ] **Step 1: Write tests**

Create `mobile/src/__tests__/components/dashboard/TrendChart.test.tsx`:

```tsx
import React from 'react';
import { waitFor } from '@testing-library/react-native';
import { renderWithTheme } from '../../test-utils';
import TrendChart from '../../../components/dashboard/TrendChart';
import type { TrendItem } from '../../../types/dashboard';

const mockTrend: TrendItem[] = [
  { month: 10, year: 2025, income: 4000, expense: 3000 },
  { month: 11, year: 2025, income: 4500, expense: 3500 },
  { month: 12, year: 2025, income: 5000, expense: 2800 },
];

describe('TrendChart', () => {
  it('renders month labels', async () => {
    const { getByText } = renderWithTheme(<TrendChart trend={mockTrend} />);
    await waitFor(() => {
      expect(getByText('Oct')).toBeTruthy();
      expect(getByText('Nov')).toBeTruthy();
      expect(getByText('Dec')).toBeTruthy();
    });
  });

  it('renders section title', async () => {
    const { getByText } = renderWithTheme(<TrendChart trend={mockTrend} />);
    await waitFor(() => {
      expect(getByText('Cash Flow Trend')).toBeTruthy();
    });
  });

  it('renders legend labels', async () => {
    const { getByText } = renderWithTheme(<TrendChart trend={mockTrend} />);
    await waitFor(() => {
      expect(getByText('INCOME')).toBeTruthy();
      expect(getByText('EXPENSE')).toBeTruthy();
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd mobile && npx jest src/__tests__/components/dashboard/TrendChart.test.tsx --verbose
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement TrendChart**

See [Design Spec — Trend Chart](../specs/2026-03-23-mobile-dashboard-editorial-redesign.md#6-trend-chart-cash-flow-trend) for the full component spec.

- [ ] **Step 4: Run tests**

```bash
cd mobile && npx jest src/__tests__/components/dashboard/TrendChart.test.tsx --verbose
```

Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
cd mobile && git add src/components/dashboard/TrendChart.tsx src/__tests__/components/dashboard/TrendChart.test.tsx && git commit -m "feat(mobile): add TrendChart with opacity ramp bars"
```

---

## Task 10: EditorialInsightCard Component

**Files:**
- Create: `mobile/src/components/dashboard/EditorialInsightCard.tsx`
- Create: `mobile/src/__tests__/components/dashboard/EditorialInsightCard.test.tsx`

- [ ] **Step 1: Write tests**

Create `mobile/src/__tests__/components/dashboard/EditorialInsightCard.test.tsx`:

```tsx
import React from 'react';
import { waitFor } from '@testing-library/react-native';
import { renderWithTheme } from '../../test-utils';
import EditorialInsightCard from '../../../components/dashboard/EditorialInsightCard';
import type { Insight } from '../../../services/dashboard';

const mockInsights: Insight[] = [
  {
    type: 'pace',
    title: 'Spending Pace',
    description: 'You are spending 20% more than last month at this point.',
    sentiment: 'negative',
  },
  {
    type: 'increase',
    title: 'Income Up',
    description: 'Your income increased by 10%.',
    sentiment: 'positive',
  },
];

describe('EditorialInsightCard', () => {
  it('renders top insight description when pro', async () => {
    const { getByText } = renderWithTheme(
      <EditorialInsightCard insights={mockInsights} isPro={true} />,
    );
    await waitFor(() => {
      expect(getByText(/spending 20% more/)).toBeTruthy();
    });
  });

  it('shows see-all link when multiple insights', async () => {
    const { getByText } = renderWithTheme(
      <EditorialInsightCard insights={mockInsights} isPro={true} />,
    );
    await waitFor(() => {
      expect(getByText(/See all 2 insights/)).toBeTruthy();
    });
  });

  it('shows upgrade button when not pro', async () => {
    const { getByText } = renderWithTheme(
      <EditorialInsightCard insights={mockInsights} isPro={false} />,
    );
    await waitFor(() => {
      expect(getByText('Upgrade to Pro')).toBeTruthy();
    });
  });

  it('renders nothing when no insights', async () => {
    const { toJSON } = renderWithTheme(
      <EditorialInsightCard insights={[]} isPro={true} />,
    );
    await waitFor(() => {
      expect(toJSON()).toBeNull();
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd mobile && npx jest src/__tests__/components/dashboard/EditorialInsightCard.test.tsx --verbose
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement EditorialInsightCard**

See [Design Spec — Editorial Insight Card](../specs/2026-03-23-mobile-dashboard-editorial-redesign.md#7-editorial-insight-card) for the full component spec.

- [ ] **Step 4: Run tests**

```bash
cd mobile && npx jest src/__tests__/components/dashboard/EditorialInsightCard.test.tsx --verbose
```

Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
cd mobile && git add src/components/dashboard/EditorialInsightCard.tsx src/__tests__/components/dashboard/EditorialInsightCard.test.tsx && git commit -m "feat(mobile): add EditorialInsightCard with pro gate"
```

---

## Task 11: SpendingAllocation Component

**Files:**
- Create: `mobile/src/components/dashboard/SpendingAllocation.tsx`
- Create: `mobile/src/__tests__/components/dashboard/SpendingAllocation.test.tsx`

- [ ] **Step 1: Write tests**

Create `mobile/src/__tests__/components/dashboard/SpendingAllocation.test.tsx`:

```tsx
import React from 'react';
import { waitFor } from '@testing-library/react-native';
import { renderWithTheme } from '../../test-utils';
import SpendingAllocation from '../../../components/dashboard/SpendingAllocation';
import type { BreakdownItem } from '../../../types/dashboard';

const mockBreakdown: BreakdownItem[] = [
  { categoryId: '1', categoryName: 'Food', total: 500, percentage: 50, icon: 'utensils', color: 'orange' },
  { categoryId: '2', categoryName: 'Transport', total: 300, percentage: 30, icon: 'car', color: 'blue' },
  { categoryId: '3', categoryName: 'Entertainment', total: 200, percentage: 20, icon: null, color: null },
];

describe('SpendingAllocation', () => {
  it('renders category names', async () => {
    const { getByText } = renderWithTheme(
      <SpendingAllocation breakdown={mockBreakdown} />,
    );
    await waitFor(() => {
      expect(getByText('Food')).toBeTruthy();
      expect(getByText('Transport')).toBeTruthy();
      expect(getByText('Entertainment')).toBeTruthy();
    });
  });

  it('renders total spent in header', async () => {
    const { getByText } = renderWithTheme(
      <SpendingAllocation breakdown={mockBreakdown} />,
    );
    await waitFor(() => {
      expect(getByText('$1,000.00')).toBeTruthy();
    });
  });

  it('shows empty state when no breakdown', async () => {
    const { getByText } = renderWithTheme(
      <SpendingAllocation breakdown={[]} />,
    );
    await waitFor(() => {
      expect(getByText('No expenses this month')).toBeTruthy();
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd mobile && npx jest src/__tests__/components/dashboard/SpendingAllocation.test.tsx --verbose
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement SpendingAllocation**

See [Design Spec — Spending Allocation](../specs/2026-03-23-mobile-dashboard-editorial-redesign.md#8-spending-allocation) for the full component spec.

- [ ] **Step 4: Run tests**

```bash
cd mobile && npx jest src/__tests__/components/dashboard/SpendingAllocation.test.tsx --verbose
```

Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
cd mobile && git add src/components/dashboard/SpendingAllocation.tsx src/__tests__/components/dashboard/SpendingAllocation.test.tsx && git commit -m "feat(mobile): add SpendingAllocation with progress bars replacing donut chart"
```

---

## Task 12: RecentPeaks Component

**Files:**
- Create: `mobile/src/components/dashboard/RecentPeaks.tsx`
- Create: `mobile/src/__tests__/components/dashboard/RecentPeaks.test.tsx`

- [ ] **Step 1: Write tests** (see design spec [Design Spec — Recent Peaks](../specs/2026-03-23-mobile-dashboard-editorial-redesign.md#9-recent-peaks))

- [ ] **Step 2: Run test to verify it fails**

```bash
cd mobile && npx jest src/__tests__/components/dashboard/RecentPeaks.test.tsx --verbose
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement RecentPeaks**

- [ ] **Step 4: Run tests**

```bash
cd mobile && npx jest src/__tests__/components/dashboard/RecentPeaks.test.tsx --verbose
```

Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
cd mobile && git add src/components/dashboard/RecentPeaks.tsx src/__tests__/components/dashboard/RecentPeaks.test.tsx && git commit -m "feat(mobile): add RecentPeaks transaction list component"
```

---

## Task 13: BudgetComplianceTable Component

**Files:**
- Create: `mobile/src/components/dashboard/BudgetComplianceTable.tsx`
- Create: `mobile/src/__tests__/components/dashboard/BudgetComplianceTable.test.tsx`

- [ ] **Step 1: Write tests** (see design spec [Design Spec — Budget Compliance Table](../specs/2026-03-23-mobile-dashboard-editorial-redesign.md#10-budget-compliance-table))

- [ ] **Step 2: Run test to verify it fails**

```bash
cd mobile && npx jest src/__tests__/components/dashboard/BudgetComplianceTable.test.tsx --verbose
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement BudgetComplianceTable**

- [ ] **Step 4: Run tests**

```bash
cd mobile && npx jest src/__tests__/components/dashboard/BudgetComplianceTable.test.tsx --verbose
```

Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
cd mobile && git add src/components/dashboard/BudgetComplianceTable.tsx src/__tests__/components/dashboard/BudgetComplianceTable.test.tsx && git commit -m "feat(mobile): add BudgetComplianceTable with status badges"
```

---

## Task 14: DashboardScreen Restructure

**Files:**
- Modify: `mobile/src/screens/DashboardScreen.tsx` (full rewrite, from 578 lines to ~140 lines)
- Create: `mobile/src/__tests__/screens/DashboardScreen.test.tsx`

This is the big task. Replace the entire file contents. The new DashboardScreen:
- Imports all extracted components
- Adds glassmorphic header with `BlurView`
- Adds 3 new queries (`prevSummaryQuery`, `recentPeaksQuery`, `budgetsQuery`)
- Adds `usePlan()` for pro gate
- Adds MoM% derivation via `useMemo`
- Removes all inline components (`SummaryCard`, `DonutChart`, `InsightRow`, `SENTIMENT_CONFIG`)
- Removes all associated StyleSheet blocks

See [Design Spec — DashboardScreen Restructure](../specs/2026-03-23-mobile-dashboard-editorial-redesign.md#11-dashboardscreen-restructure) for the full restructure spec.

- [ ] **Step 0: Create DashboardScreen smoke test**

- [ ] **Step 1: Replace DashboardScreen.tsx**

- [ ] **Step 2: Run typecheck**

```bash
cd mobile && npx tsc --noEmit
```

Expected: No errors. If there are import errors, fix them.

- [ ] **Step 3: Run all tests**

```bash
cd mobile && npx jest --verbose
```

Expected: All tests PASS. Some existing DashboardScreen tests may need updating if they reference removed inline components.

- [ ] **Step 4: Run lint**

```bash
cd mobile && npx eslint src/screens/DashboardScreen.tsx
```

Expected: Clean or minor warnings only.

- [ ] **Step 5: Commit**

```bash
cd mobile && git add src/screens/DashboardScreen.tsx src/__tests__/screens/DashboardScreen.test.tsx && git commit -m "feat(mobile): restructure DashboardScreen with extracted components and glassmorphic header"
```

---

## Task 15: Final Verification

**Files:** None (verification only)

- [ ] **Step 1: Run full test suite**

```bash
cd mobile && npx jest --verbose
```

Expected: All tests PASS.

- [ ] **Step 2: Run typecheck**

```bash
cd mobile && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Run lint**

```bash
cd mobile && npx eslint src/
```

Expected: No errors.

- [ ] **Step 4: Verify file count**

```bash
ls mobile/src/components/dashboard/
ls mobile/src/__tests__/components/dashboard/
```

Expected: 6 component files, 6 test files.

- [ ] **Step 5: Commit any remaining fixes**

```bash
cd mobile && git add -A && git status
```

If clean, done. If there are fixes, commit them:

```bash
git commit -m "fix(mobile): address lint and type errors from editorial redesign"
```
