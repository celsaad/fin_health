# Mobile Dashboard Editorial Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adapt the web editorial finance dashboard to the React Native / Expo mobile app with full visual parity, extracting inline components from the 578-line `DashboardScreen.tsx` monolith.

**Architecture:** Extract 6 dashboard components from inline code to focused files under `mobile/src/components/dashboard/`. Add editorial design tokens (Manrope/Inter fonts, surface hierarchy, no-line cards), a glassmorphic header, and 3 new sections (EditorialInsightCard, RecentPeaks, BudgetComplianceTable). DashboardScreen becomes a thin layout shell (~130 lines) that imports components and wires data.

**Tech Stack:** React Native 0.83.2 · Expo SDK 55 · React 19 · TanStack Query v5 · expo-blur · expo-linear-gradient · @expo-google-fonts/manrope · @expo-google-fonts/inter

**Spec:** `docs/superpowers/specs/2026-03-23-mobile-dashboard-editorial-redesign.md`

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

Create `mobile/src/components/dashboard/SummaryCards.tsx`:

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Landmark, ArrowDown, ArrowUp, ListChecks, TrendingUp, TrendingDown } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import Card from '../Card';
import { formatCurrency } from '@fin-health/shared/format';
import { FontFamily, FontSize, Spacing, BorderRadius } from '../../constants/theme';
import type { DashboardSummary } from '../../types/dashboard';

interface SummaryCardsProps {
  summary: DashboardSummary;
  netChangePercent: number | null;
}

export default function SummaryCards({ summary, netChangePercent }: SummaryCardsProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.grid}>
      {/* Net Balance — Full-width gradient */}
      <LinearGradient
        colors={[colors.primary, colors.primaryContainer]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.netCard}
      >
        <View style={styles.decorativeCircle} />
        <Landmark
          size={32}
          color="rgba(255,255,255,0.3)"
          style={styles.bgIcon}
        />
        <Text style={styles.netLabel}>
          {t('dashboard.netBalance').toUpperCase()}
        </Text>
        <Text style={styles.netAmount}>
          {formatCurrency(summary.net)}
        </Text>
        {netChangePercent !== null && (
          <View style={styles.momBadge}>
            {netChangePercent >= 0 ? (
              <TrendingUp size={12} color="#fff" />
            ) : (
              <TrendingDown size={12} color="#fff" />
            )}
            <Text style={styles.momText}>
              {netChangePercent >= 0 ? '+' : ''}
              {netChangePercent.toFixed(1)}% {t('dashboard.vsLastMonth')}
            </Text>
          </View>
        )}
      </LinearGradient>

      {/* Income */}
      <Card style={styles.halfCard}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, { backgroundColor: '#ecfdf5' }]}>
            <ArrowDown size={20} color="#16a34a" />
          </View>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
            {t('dashboard.income').toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.cardAmount, { color: colors.text }]}>
          {formatCurrency(summary.totalIncome)}
        </Text>
        <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
          {t('dashboard.earnedThisMonth')}
        </Text>
      </Card>

      {/* Expenses */}
      <Card style={styles.halfCard}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, { backgroundColor: '#fef2f2' }]}>
            <ArrowUp size={20} color="#dc2626" />
          </View>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
            {t('dashboard.expenses').toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.cardAmount, { color: colors.text }]}>
          {formatCurrency(summary.totalExpenses)}
        </Text>
        <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
          {t('dashboard.spentThisMonth')}
        </Text>
      </Card>

      {/* Transactions */}
      <Card style={styles.halfCard}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, { backgroundColor: '#eff6ff' }]}>
            <ListChecks size={20} color="#2563eb" />
          </View>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
            {t('dashboard.transactions').toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.cardAmount, { color: colors.text }]}>
          {String(summary.transactionCount)}
        </Text>
        <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
          {t('dashboard.totalTransactions')}
        </Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  netCard: {
    width: '100%',
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  decorativeCircle: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  bgIcon: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
  },
  netLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    color: '#fff',
    opacity: 0.8,
    letterSpacing: 1.5,
  },
  netAmount: {
    fontFamily: FontFamily.headline,
    fontSize: 28,
    color: '#fff',
    marginTop: Spacing.xs,
  },
  momBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    alignSelf: 'flex-start',
    marginTop: Spacing.md,
    gap: 4,
  },
  momText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.caption,
    color: '#fff',
  },
  halfCard: {
    width: '48%',
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    letterSpacing: 1.2,
  },
  cardAmount: {
    fontFamily: FontFamily.headline,
    fontSize: 22,
    marginTop: Spacing.md,
  },
  cardSubtitle: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.caption,
    marginTop: Spacing.xs,
  },
});
```

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

Create `mobile/src/components/dashboard/TrendChart.tsx`:

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import Card from '../Card';
import { getShortMonthName } from '@fin-health/shared/format';
import { FontFamily, FontSize, Spacing } from '../../constants/theme';
import type { TrendItem } from '../../types/dashboard';

interface TrendChartProps {
  trend: TrendItem[];
}

const OPACITY_RAMP = [0.25, 0.4, 0.55, 0.7, 0.85, 1.0];

export default function TrendChart({ trend }: TrendChartProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const maxBar = Math.max(
    ...trend.map((item) => Math.max(item.income || 0, item.expense || 0)),
    1,
  );

  const lastIndex = trend.length - 1;

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('dashboard.cashFlowTrend')}
        </Text>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>
            {t('dashboard.incomeLabel')}
          </Text>
          <View style={[styles.legendDot, { backgroundColor: colors.expense, marginLeft: 12 }]} />
          <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>
            {t('dashboard.expenseLabel')}
          </Text>
        </View>
      </View>

      <View style={styles.barChart}>
        {trend.map((item, i) => {
          const opacityIndex = trend.length <= 6
            ? OPACITY_RAMP.length - trend.length + i
            : Math.min(i, OPACITY_RAMP.length - 1);
          const opacity = OPACITY_RAMP[opacityIndex] ?? 1;
          const isCurrent = i === lastIndex;

          return (
            <View key={`${item.month}-${item.year}`} style={styles.barGroup}>
              <View style={styles.bars}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(((item.income || 0) / maxBar) * 100, 4),
                      backgroundColor: colors.primary,
                      opacity,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(((item.expense || 0) / maxBar) * 100, 4),
                      backgroundColor: colors.expense,
                      opacity,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.barLabel,
                  {
                    color: isCurrent ? colors.text : colors.textSecondary,
                    fontFamily: isCurrent ? FontFamily.bodySemiBold : FontFamily.bodyMedium,
                  },
                ]}
              >
                {getShortMonthName(item.month)}
              </Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: Spacing.md },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: { fontFamily: FontFamily.headlineSemiBold, fontSize: FontSize.sectionHeader },
  legendRow: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 4 },
  legendLabel: { fontFamily: FontFamily.bodyMedium, fontSize: 10 },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  barGroup: { alignItems: 'center', flex: 1 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 100 },
  bar: { width: 14, borderTopLeftRadius: 4, borderTopRightRadius: 4, minHeight: 4 },
  barLabel: { fontSize: 10, marginTop: 4 },
});
```

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

Create `mobile/src/components/dashboard/EditorialInsightCard.tsx`:

```tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { FontFamily, FontSize, Spacing, BorderRadius } from '../../constants/theme';
import type { Insight } from '../../services/dashboard';

interface EditorialInsightCardProps {
  insights: Insight[];
  isPro: boolean;
}

export default function EditorialInsightCard({ insights, isPro }: EditorialInsightCardProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  if (insights.length === 0) return null;

  const topInsight = insights[0];

  return (
    <View style={[styles.card, { backgroundColor: colors.primary }]}>
      <Sparkles size={20} color="rgba(255,255,255,0.7)" />
      <Text style={styles.title}>{t('dashboard.editorialInsight')}</Text>

      {isPro ? (
        <>
          <Text style={styles.body} numberOfLines={3}>
            {topInsight.description}
          </Text>
          {insights.length > 1 && (
            <Text style={styles.seeAll}>
              {t('dashboard.seeAllInsights', { count: insights.length })}
            </Text>
          )}
        </>
      ) : (
        <View style={styles.proGate}>
          <Text style={styles.body} numberOfLines={1}>
            ••••••••••••••••••••••••••
          </Text>
          <TouchableOpacity
            style={styles.upgradeButton}
            accessibilityRole="button"
            accessibilityLabel={t('dashboard.upgradeToPro')}
          >
            <Text style={[styles.upgradeText, { color: colors.primary }]}>
              {t('dashboard.upgradeToPro')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.md,
  },
  title: {
    fontFamily: FontFamily.headlineSemiBold,
    fontSize: FontSize.label,
    color: '#fff',
    marginTop: Spacing.sm,
  },
  body: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.body,
    color: 'rgba(255,255,255,0.85)',
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  seeAll: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.caption,
    color: 'rgba(255,255,255,0.7)',
    marginTop: Spacing.md,
  },
  proGate: {
    marginTop: Spacing.sm,
    alignItems: 'center',
  },
  upgradeButton: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.md,
  },
  upgradeText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.body,
  },
});
```

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

Create `mobile/src/components/dashboard/SpendingAllocation.tsx`:

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import Card from '../Card';
import { formatCurrency, formatPercent } from '@fin-health/shared/format';
import { CategoryColors, FontFamily, FontSize, Spacing } from '../../constants/theme';
import type { BreakdownItem } from '../../types/dashboard';

interface SpendingAllocationProps {
  breakdown: BreakdownItem[];
}

export default function SpendingAllocation({ breakdown }: SpendingAllocationProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const totalSpent = breakdown.reduce((sum, b) => sum + b.total, 0);

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('dashboard.spendingAllocation')}
        </Text>
        <Text style={[styles.totalText, { color: colors.textSecondary }]}>
          {formatCurrency(totalSpent)}
        </Text>
      </View>

      {breakdown.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          {t('dashboard.noExpenses')}
        </Text>
      ) : (
        <View style={styles.rows}>
          {breakdown.slice(0, 6).map((item) => {
            const barColor =
              item.color && CategoryColors[item.color]
                ? CategoryColors[item.color].icon
                : colors.primary;

            return (
              <View key={item.categoryId} style={styles.row}>
                <View style={styles.rowHeader}>
                  <Text style={[styles.categoryName, { color: colors.text }]}>
                    {item.categoryName}
                  </Text>
                  <Text style={[styles.categoryMeta, { color: colors.textSecondary }]}>
                    {formatCurrency(item.total)} · {formatPercent(item.percentage)}
                  </Text>
                </View>
                <View style={[styles.trackBar, { backgroundColor: colors.surfaceContainerLow }]}>
                  <View
                    style={[
                      styles.fillBar,
                      {
                        width: `${Math.min(item.percentage, 100)}%`,
                        backgroundColor: barColor,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: Spacing.md },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: { fontFamily: FontFamily.headlineSemiBold, fontSize: FontSize.sectionHeader },
  totalText: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.body },
  emptyText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.body,
    textAlign: 'center',
    paddingVertical: Spacing.xl,
  },
  rows: { gap: Spacing.md },
  row: {},
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  categoryName: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.body },
  categoryMeta: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.caption },
  trackBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fillBar: { height: 8, borderRadius: 4 },
});
```

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

- [ ] **Step 1: Write tests**

Create `mobile/src/__tests__/components/dashboard/RecentPeaks.test.tsx`:

```tsx
import React from 'react';
import { waitFor } from '@testing-library/react-native';
import { renderWithTheme } from '../../test-utils';
import RecentPeaks from '../../../components/dashboard/RecentPeaks';
import type { Transaction } from '@fin-health/shared/types';

const mockTransactions: Transaction[] = [
  {
    id: '1',
    amount: 250,
    type: 'expense',
    description: 'Grocery Store',
    date: '2026-03-15T00:00:00Z',
    category: { id: 'c1', name: 'Food', type: 'expense', icon: 'utensils', color: 'orange' },
    createdAt: '2026-03-15T00:00:00Z',
    updatedAt: '2026-03-15T00:00:00Z',
  },
  {
    id: '2',
    amount: 180,
    type: 'expense',
    description: 'Electric Bill',
    date: '2026-03-10T00:00:00Z',
    category: { id: 'c2', name: 'Utilities', type: 'expense', icon: 'zap', color: 'amber' },
    createdAt: '2026-03-10T00:00:00Z',
    updatedAt: '2026-03-10T00:00:00Z',
  },
];

describe('RecentPeaks', () => {
  it('renders transaction descriptions', async () => {
    const { getByText } = renderWithTheme(
      <RecentPeaks transactions={mockTransactions} isLoading={false} />,
    );
    await waitFor(() => {
      expect(getByText('Grocery Store')).toBeTruthy();
      expect(getByText('Electric Bill')).toBeTruthy();
    });
  });

  it('renders formatted amounts', async () => {
    const { getByText } = renderWithTheme(
      <RecentPeaks transactions={mockTransactions} isLoading={false} />,
    );
    await waitFor(() => {
      expect(getByText('$250.00')).toBeTruthy();
      expect(getByText('$180.00')).toBeTruthy();
    });
  });

  it('shows empty state when no transactions', async () => {
    const { getByText } = renderWithTheme(
      <RecentPeaks transactions={[]} isLoading={false} />,
    );
    await waitFor(() => {
      expect(getByText('No transactions this month')).toBeTruthy();
    });
  });

  it('shows loading skeletons', async () => {
    const { queryByText } = renderWithTheme(
      <RecentPeaks transactions={[]} isLoading={true} />,
    );
    await waitFor(() => {
      expect(queryByText('No transactions this month')).toBeNull();
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd mobile && npx jest src/__tests__/components/dashboard/RecentPeaks.test.tsx --verbose
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement RecentPeaks**

Create `mobile/src/components/dashboard/RecentPeaks.tsx`:

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { useTheme } from '../../contexts/ThemeContext';
import Card from '../Card';
import CategoryIcon from '../CategoryIcon';
import LoadingSkeleton from '../LoadingSkeleton';
import { formatCurrency } from '@fin-health/shared/format';
import { FontFamily, FontSize, Spacing } from '../../constants/theme';
import type { Transaction } from '@fin-health/shared/types';

interface RecentPeaksProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export default function RecentPeaks({ transactions, isLoading }: RecentPeaksProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Card style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>
        {t('dashboard.recentSpendingPeaks')}
      </Text>

      {isLoading ? (
        <View style={styles.skeletonList}>
          {[1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={styles.skeletonRow}>
              <LoadingSkeleton width={40} height={40} borderRadius={20} />
              <View style={styles.skeletonText}>
                <LoadingSkeleton width="60%" height={14} />
                <LoadingSkeleton width="40%" height={12} style={{ marginTop: 4 }} />
              </View>
              <LoadingSkeleton width={60} height={14} />
            </View>
          ))}
        </View>
      ) : transactions.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          {t('dashboard.noTransactions')}
        </Text>
      ) : (
        <View style={styles.list}>
          {transactions.map((tx) => (
            <View key={tx.id} style={styles.row}>
              <CategoryIcon
                icon={tx.category?.icon}
                color={tx.category?.color}
                size={40}
              />
              <View style={styles.middle}>
                <Text
                  style={[styles.description, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {tx.description}
                </Text>
                <Text style={[styles.categoryName, { color: colors.textSecondary }]}>
                  {tx.category?.name}
                </Text>
              </View>
              <View style={styles.right}>
                <Text style={[styles.amount, { color: colors.expense }]}>
                  {formatCurrency(tx.amount)}
                </Text>
                <Text style={[styles.date, { color: colors.textSecondary }]}>
                  {format(new Date(tx.date), 'MMM d')}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: Spacing.md },
  title: {
    fontFamily: FontFamily.headlineSemiBold,
    fontSize: FontSize.sectionHeader,
    marginBottom: Spacing.lg,
  },
  list: { gap: Spacing.md },
  row: { flexDirection: 'row', alignItems: 'center' },
  middle: { flex: 1, marginLeft: Spacing.md },
  description: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.body },
  categoryName: { fontFamily: FontFamily.body, fontSize: FontSize.caption, marginTop: 2 },
  right: { alignItems: 'flex-end' },
  amount: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.body },
  date: { fontFamily: FontFamily.body, fontSize: FontSize.caption, marginTop: 2 },
  emptyText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.body,
    textAlign: 'center',
    paddingVertical: Spacing.xl,
  },
  skeletonList: { gap: Spacing.md },
  skeletonRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  skeletonText: { flex: 1 },
});
```

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

- [ ] **Step 1: Write tests**

Create `mobile/src/__tests__/components/dashboard/BudgetComplianceTable.test.tsx`:

```tsx
import React from 'react';
import { waitFor } from '@testing-library/react-native';
import { renderWithTheme } from '../../test-utils';
import BudgetComplianceTable from '../../../components/dashboard/BudgetComplianceTable';
import type { BreakdownItem } from '../../../types/dashboard';
import type { Budget } from '@fin-health/shared/types';

const mockCategories: BreakdownItem[] = [
  { categoryId: '1', categoryName: 'Food', total: 400, percentage: 40, icon: 'utensils', color: 'orange' },
  { categoryId: '2', categoryName: 'Transport', total: 250, percentage: 25, icon: 'car', color: 'blue' },
];

const mockBudgets: Budget[] = [
  { id: 'b1', amount: 500, month: 3, year: 2026, isRecurring: false, categoryId: '1', category: { id: '1', name: 'Food', icon: 'utensils', color: 'orange' }, spent: 400, remaining: 100 },
  { id: 'b2', amount: 200, month: 3, year: 2026, isRecurring: false, categoryId: '2', category: { id: '2', name: 'Transport', icon: 'car', color: 'blue' }, spent: 250, remaining: -50 },
] as Budget[];

describe('BudgetComplianceTable', () => {
  it('renders category names that have budgets', async () => {
    const { getByText } = renderWithTheme(
      <BudgetComplianceTable categories={mockCategories} budgets={mockBudgets} />,
    );
    await waitFor(() => {
      expect(getByText('Food')).toBeTruthy();
      expect(getByText('Transport')).toBeTruthy();
    });
  });

  it('shows On Track for under-budget categories', async () => {
    const { getByText } = renderWithTheme(
      <BudgetComplianceTable categories={mockCategories} budgets={mockBudgets} />,
    );
    await waitFor(() => {
      expect(getByText('On Track')).toBeTruthy();
    });
  });

  it('shows Over Budget for over-budget categories', async () => {
    const { getByText } = renderWithTheme(
      <BudgetComplianceTable categories={mockCategories} budgets={mockBudgets} />,
    );
    await waitFor(() => {
      expect(getByText('Over Budget')).toBeTruthy();
    });
  });

  it('renders section title', async () => {
    const { getByText } = renderWithTheme(
      <BudgetComplianceTable categories={mockCategories} budgets={mockBudgets} />,
    );
    await waitFor(() => {
      expect(getByText('Budget Compliance')).toBeTruthy();
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd mobile && npx jest src/__tests__/components/dashboard/BudgetComplianceTable.test.tsx --verbose
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement BudgetComplianceTable**

Create `mobile/src/components/dashboard/BudgetComplianceTable.tsx`:

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import Card from '../Card';
import CategoryIcon from '../CategoryIcon';
import { FontFamily, FontSize, Spacing, BorderRadius } from '../../constants/theme';
import type { BreakdownItem } from '../../types/dashboard';
import type { Budget } from '@fin-health/shared/types';

interface BudgetComplianceTableProps {
  categories: BreakdownItem[];
  budgets: Budget[];
}

export default function BudgetComplianceTable({ categories, budgets }: BudgetComplianceTableProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  // Join categories with their budgets
  const rows = budgets
    .map((budget) => {
      const category = categories.find((c) => c.categoryId === budget.categoryId);
      if (!category) return null;
      const ratio = budget.amount > 0 ? category.total / budget.amount : 0;
      const isOver = category.total > budget.amount;
      return { budget, category, ratio, isOver };
    })
    .filter(Boolean) as { budget: Budget; category: BreakdownItem; ratio: number; isOver: boolean }[];

  if (rows.length === 0) return null;

  return (
    <Card style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>
        {t('dashboard.budgetCompliance')}
      </Text>

      {/* Column headers */}
      <View style={styles.headerRow}>
        <Text style={[styles.colHeader, { color: colors.textSecondary, flex: 1 }]}>
          {t('dashboard.category').toUpperCase()}
        </Text>
        <Text style={[styles.colHeader, { color: colors.textSecondary, flex: 1, textAlign: 'center' }]}>
          {t('dashboard.progress').toUpperCase()}
        </Text>
        <Text style={[styles.colHeader, { color: colors.textSecondary, width: 80, textAlign: 'right' }]}>
          {t('dashboard.status').toUpperCase()}
        </Text>
      </View>

      {/* Data rows */}
      <View style={styles.rows}>
        {rows.map(({ budget, category, ratio, isOver }) => (
          <View key={budget.id} style={styles.row}>
            {/* Category */}
            <View style={styles.categoryCell}>
              <CategoryIcon icon={category.icon} color={category.color} size={32} />
              <Text
                style={[styles.categoryName, { color: colors.text }]}
                numberOfLines={1}
              >
                {category.categoryName}
              </Text>
            </View>

            {/* Progress bar */}
            <View style={styles.progressCell}>
              <View style={[styles.trackBar, { backgroundColor: colors.surfaceContainerLow }]}>
                <View
                  style={[
                    styles.fillBar,
                    {
                      width: `${Math.min(ratio * 100, 100)}%`,
                      backgroundColor: isOver ? colors.expense : colors.income,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Status badge */}
            <View style={[
              styles.badge,
              { backgroundColor: isOver ? colors.expenseBg : colors.incomeBg },
            ]}>
              <Text style={[
                styles.badgeText,
                { color: isOver ? colors.expense : colors.income },
              ]}>
                {isOver ? t('dashboard.overBudget') : t('dashboard.onTrack')}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: Spacing.md },
  title: {
    fontFamily: FontFamily.headlineSemiBold,
    fontSize: FontSize.sectionHeader,
    marginBottom: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  colHeader: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.caption,
    letterSpacing: 1,
  },
  rows: { gap: Spacing.md },
  row: { flexDirection: 'row', alignItems: 'center' },
  categoryCell: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  categoryName: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.body, flex: 1 },
  progressCell: { flex: 1, paddingHorizontal: Spacing.sm },
  trackBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fillBar: { height: 6, borderRadius: 3 },
  badge: {
    width: 80,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
  },
  badgeText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.caption,
  },
});
```

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

- [ ] **Step 0: Create DashboardScreen smoke test**

Create `mobile/src/__tests__/screens/DashboardScreen.test.tsx`:

```tsx
import React from 'react';
import { waitFor } from '@testing-library/react-native';
import { renderWithTheme } from '../test-utils';
import DashboardScreen from '../../screens/DashboardScreen';

// Mock all service functions
jest.mock('../../services/dashboard', () => ({
  getSummary: jest.fn().mockResolvedValue({ totalIncome: 5000, totalExpenses: 3200, net: 1800, transactionCount: 42 }),
  getBreakdown: jest.fn().mockResolvedValue({ breakdown: [] }),
  getTrend: jest.fn().mockResolvedValue({ trend: [] }),
  getInsights: jest.fn().mockResolvedValue({ insights: [] }),
  getRecentPeaks: jest.fn().mockResolvedValue({ transactions: [] }),
}));
jest.mock('../../services/budgets', () => ({
  getBudgets: jest.fn().mockResolvedValue({ budgets: [] }),
}));
jest.mock('../../hooks/usePlan', () => ({
  usePlan: () => ({ isPro: false, isFree: true, isTrialing: false }),
}));
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { name: 'Test User' }, isAuthenticated: true }),
}));

describe('DashboardScreen', () => {
  it('renders without crashing and shows greeting', async () => {
    const { getByText } = renderWithTheme(<DashboardScreen />);
    await waitFor(() => {
      expect(getByText(/Hey,/)).toBeTruthy();
    });
  });

  it('shows summary cards after data loads', async () => {
    const { getByText } = renderWithTheme(<DashboardScreen />);
    await waitFor(() => {
      expect(getByText('$1,800.00')).toBeTruthy();
    });
  });
});
```

- [ ] **Step 1: Replace DashboardScreen.tsx**

Replace the entire contents of `mobile/src/screens/DashboardScreen.tsx` with:

```tsx
import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { usePlan } from '../hooks/usePlan';
import { getSummary, getBreakdown, getTrend, getInsights, getRecentPeaks } from '../services/dashboard';
import { getBudgets } from '../services/budgets';
import MonthSelector from '../components/MonthSelector';
import LoadingSkeleton from '../components/LoadingSkeleton';
import QueryError from '../components/QueryError';
import SummaryCards from '../components/dashboard/SummaryCards';
import TrendChart from '../components/dashboard/TrendChart';
import EditorialInsightCard from '../components/dashboard/EditorialInsightCard';
import SpendingAllocation from '../components/dashboard/SpendingAllocation';
import RecentPeaks from '../components/dashboard/RecentPeaks';
import BudgetComplianceTable from '../components/dashboard/BudgetComplianceTable';
import { FontFamily, FontSize, Spacing } from '../constants/theme';
import Card from '../components/Card';

const HEADER_HEIGHT = 60;

export default function DashboardScreen() {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { isPro } = usePlan();
  const { t } = useTranslation();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;

  // Queries
  const summaryQuery = useQuery({
    queryKey: ['dashboard', 'summary', month, year],
    queryFn: () => getSummary(month, year),
  });
  const prevSummaryQuery = useQuery({
    queryKey: ['dashboard', 'summary', prevMonth, prevYear],
    queryFn: () => getSummary(prevMonth, prevYear),
  });
  const breakdownQuery = useQuery({
    queryKey: ['dashboard', 'breakdown', month, year],
    queryFn: () => getBreakdown(month, year),
  });
  const trendQuery = useQuery({
    queryKey: ['dashboard', 'trend'],
    queryFn: () => getTrend(6),
  });
  const insightsQuery = useQuery({
    queryKey: ['dashboard', 'insights', month, year],
    queryFn: () => getInsights(month, year),
  });
  const recentPeaksQuery = useQuery({
    queryKey: ['dashboard', 'recentPeaks', month, year],
    queryFn: () => getRecentPeaks(month, year),
  });
  const budgetsQuery = useQuery({
    queryKey: ['budgets', month, year],
    queryFn: () => getBudgets(month, year),
  });

  const summary = summaryQuery.data;
  const breakdown = breakdownQuery.data?.breakdown ?? [];
  const trend = trendQuery.data?.trend ?? [];
  const insights = insightsQuery.data?.insights ?? [];
  const recentPeaks = recentPeaksQuery.data?.transactions ?? [];
  const budgets = budgetsQuery.data?.budgets;

  const isLoading = summaryQuery.isLoading;
  const isError = summaryQuery.isError || breakdownQuery.isError || trendQuery.isError;

  const netChangePercent = useMemo(() => {
    if (!summary || !prevSummaryQuery.data || prevSummaryQuery.data.net === 0) return null;
    return ((summary.net - prevSummaryQuery.data.net) / Math.abs(prevSummaryQuery.data.net)) * 100;
  }, [summary, prevSummaryQuery.data]);

  const firstName = user?.name?.split(' ')[0] ?? '';
  const initials =
    user?.name
      ?.split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) ?? '?';

  function onRefresh() {
    summaryQuery.refetch();
    prevSummaryQuery.refetch();
    breakdownQuery.refetch();
    trendQuery.refetch();
    insightsQuery.refetch();
    recentPeaksQuery.refetch();
    budgetsQuery.refetch();
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Glassmorphic header — absolute positioned, floats over scroll content */}
      <BlurView
        intensity={80}
        tint={isDark ? 'dark' : 'light'}
        style={[styles.header, { backgroundColor: isDark ? 'rgba(15,23,41,0.7)' : 'rgba(255,255,255,0.7)' }]}
      >
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.headerCenter}>
          <Text style={[styles.greeting, { color: colors.text }]}>
            {t('dashboard.greeting', { name: firstName })}
          </Text>
        </View>
        <View accessible accessibilityLabel={t('dashboard.notifications')}>
          <Bell size={22} color={colors.textSecondary} />
        </View>
      </BlurView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={summaryQuery.isFetching} onRefresh={onRefresh} />}
        contentContainerStyle={[styles.scrollContent, { paddingTop: HEADER_HEIGHT + Spacing.md }]}
      >
        <MonthSelector
          selectedMonth={month}
          selectedYear={year}
          onSelect={(m, y) => { setMonth(m); setYear(y); }}
        />

        {isError ? (
          <QueryError onRetry={onRefresh} />
        ) : isLoading ? (
          <View style={styles.skeletonGrid}>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} style={styles.skeletonCard}>
                <LoadingSkeleton width={40} height={40} borderRadius={20} />
                <LoadingSkeleton width="60%" height={14} style={{ marginTop: 8 }} />
                <LoadingSkeleton width="80%" height={20} style={{ marginTop: 4 }} />
              </Card>
            ))}
          </View>
        ) : summary ? (
          <>
            <SummaryCards summary={summary} netChangePercent={netChangePercent} />
            {trend.length > 0 && <TrendChart trend={trend} />}
            <EditorialInsightCard insights={insights} isPro={isPro} />
            <SpendingAllocation breakdown={breakdown} />
            <RecentPeaks transactions={recentPeaks} isLoading={recentPeaksQuery.isLoading} />
            {budgets && budgets.length > 0 ? (
              <BudgetComplianceTable categories={breakdown} budgets={budgets} />
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    height: HEADER_HEIGHT,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: FontFamily.bodySemiBold,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  greeting: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.sectionHeader,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  skeletonCard: {
    width: '48%',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
});
```

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
