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
