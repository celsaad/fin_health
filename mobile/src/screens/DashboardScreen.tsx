import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  List,
  Settings,
  AlertTriangle,
  Info,
} from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { getSummary, getBreakdown, getTrend, getInsights } from '../services/dashboard';
import type { Insight } from '../services/dashboard';
import { formatCurrency, getShortMonthName, formatPercent } from '@fin-health/shared/format';
import Card from '../components/Card';
import MonthSelector from '../components/MonthSelector';
import CategoryIcon from '../components/CategoryIcon';
import LoadingSkeleton from '../components/LoadingSkeleton';
import QueryError from '../components/QueryError';
import { FontSize, Spacing } from '../constants/theme';
import Svg, { G, Path } from 'react-native-svg';

export default function DashboardScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { t } = useTranslation();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const summaryQuery = useQuery({
    queryKey: ['dashboard', 'summary', month, year],
    queryFn: () => getSummary(month, year),
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

  const isLoading = summaryQuery.isLoading;
  const isError = summaryQuery.isError || breakdownQuery.isError || trendQuery.isError;
  const summary = summaryQuery.data;
  const breakdown = breakdownQuery.data?.breakdown ?? [];
  const trend = trendQuery.data?.trend ?? [];
  const insights = insightsQuery.data?.insights ?? [];

  function onRefresh() {
    summaryQuery.refetch();
    breakdownQuery.refetch();
    trendQuery.refetch();
    insightsQuery.refetch();
  }

  const initials =
    user?.name
      ?.split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) ?? '?';

  // Donut chart data
  const donutColors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
  const totalSpent = breakdown.reduce((sum: number, b: any) => sum + b.total, 0);

  // Bar chart data
  const maxBar = Math.max(...trend.map((t: any) => Math.max(t.income || 0, t.expense || 0)), 1);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.headerCenter}>
          <Text style={[styles.appTitle, { color: colors.primary }]}>FinHealth</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('ProfileTab')}>
          <Settings size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <MonthSelector
        selectedMonth={month}
        selectedYear={year}
        onSelect={(m, y) => {
          setMonth(m);
          setYear(y);
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={summaryQuery.isFetching} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Summary Cards */}
        {isError ? (
          <QueryError onRetry={onRefresh} />
        ) : isLoading ? (
          <View style={styles.grid}>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} style={summaryStyles.card}>
                <LoadingSkeleton width={40} height={40} borderRadius={20} />
                <LoadingSkeleton width="60%" height={14} style={{ marginTop: 8 }} />
                <LoadingSkeleton width="80%" height={20} style={{ marginTop: 4 }} />
              </Card>
            ))}
          </View>
        ) : (
          <View style={styles.grid}>
            <SummaryCard
              icon={<Wallet size={20} color="#fff" />}
              iconBg={colors.primary}
              label="Net Balance"
              value={formatCurrency(summary?.net ?? 0)}
              colors={colors}
            />
            <SummaryCard
              icon={<TrendingUp size={20} color="#fff" />}
              iconBg="#16a34a"
              label="Income"
              value={formatCurrency(summary?.totalIncome ?? 0)}
              colors={colors}
            />
            <SummaryCard
              icon={<TrendingDown size={20} color="#fff" />}
              iconBg="#dc2626"
              label="Expenses"
              value={formatCurrency(summary?.totalExpenses ?? 0)}
              colors={colors}
            />
            <SummaryCard
              icon={<List size={20} color="#fff" />}
              iconBg="#3b82f6"
              label="Transactions"
              value={String(summary?.transactionCount ?? 0)}
              colors={colors}
            />
          </View>
        )}

        {/* Insights */}
        {insightsQuery.isLoading ? (
          <Card style={styles.sectionCard}>
            <LoadingSkeleton width="40%" height={18} />
            <LoadingSkeleton width="100%" height={14} style={{ marginTop: Spacing.lg }} />
            <LoadingSkeleton width="90%" height={14} style={{ marginTop: Spacing.md }} />
          </Card>
        ) : insights.length > 0 ? (
          <Card style={styles.sectionCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('dashboard.insights')}
            </Text>
            <View style={insightStyles.list} accessibilityRole="list">
              {insights.map((insight) => (
                <InsightRow key={insight.type} insight={insight} colors={colors} />
              ))}
            </View>
          </Card>
        ) : null}

        {/* Expense Breakdown */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Expense Breakdown</Text>
          {breakdown.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No expenses this month
            </Text>
          ) : (
            <>
              <View style={styles.donutContainer}>
                <DonutChart data={breakdown} colors={donutColors} size={160} />
                <View style={styles.donutCenter}>
                  <Text style={[styles.donutAmount, { color: colors.text }]}>
                    {formatCurrency(totalSpent)}
                  </Text>
                  <Text style={[styles.donutLabel, { color: colors.textSecondary }]}>SPENT</Text>
                </View>
              </View>
              <View style={styles.legendGrid}>
                {breakdown.slice(0, 6).map((item: any, i: number) => (
                  <View key={item.categoryId} style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendDot,
                        { backgroundColor: donutColors[i % donutColors.length] },
                      ]}
                    />
                    <Text
                      style={[styles.legendText, { color: colors.textSecondary }]}
                      numberOfLines={1}
                    >
                      {item.categoryName} ({formatPercent(item.percentage)})
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </Card>

        {/* Activity Chart */}
        <Card style={styles.sectionCard}>
          <View style={styles.activityHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Activity</Text>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.legendSmall, { color: colors.textSecondary }]}>INCOME</Text>
              <View style={[styles.legendDot, { backgroundColor: '#ec4899', marginLeft: 12 }]} />
              <Text style={[styles.legendSmall, { color: colors.textSecondary }]}>EXPENSE</Text>
            </View>
          </View>
          <View style={styles.barChart}>
            {trend.map((t: any, i: number) => (
              <View key={i} style={styles.barGroup}>
                <View style={styles.bars}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: Math.max(((t.income || 0) / maxBar) * 100, 4),
                        backgroundColor: colors.primary,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.bar,
                      {
                        height: Math.max(((t.expense || 0) / maxBar) * 100, 4),
                        backgroundColor: '#ec4899',
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.barLabel, { color: colors.textSecondary }]}>
                  {getShortMonthName(t.month)}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Top Categories */}
        <View style={styles.topCategories}>
          <TouchableOpacity
            style={styles.sectionHeaderRow}
            onPress={() => navigation.navigate('SpendingBreakdown')}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Categories</Text>
            <Text style={[styles.viewAll, { color: colors.primary }]}>View All</Text>
          </TouchableOpacity>
          {breakdown.slice(0, 4).map((item: any) => (
            <Card key={item.categoryId} style={styles.categoryRow}>
              <CategoryIcon icon={item.icon} color={item.color} size={40} />
              <View style={styles.categoryInfo}>
                <Text style={[styles.categoryName, { color: colors.text }]}>
                  {item.categoryName}
                </Text>
                <Text style={[styles.categoryCount, { color: colors.textSecondary }]}>
                  {item.transactionCount ?? 0} transactions
                </Text>
              </View>
              <Text style={[styles.categoryAmount, { color: colors.expense }]}>
                -{formatCurrency(item.total)}
              </Text>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryCard({
  icon,
  iconBg,
  label,
  value,
  colors,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  colors: any;
}) {
  return (
    <Card style={summaryStyles.card}>
      <View style={[summaryStyles.iconCircle, { backgroundColor: iconBg }]}>{icon}</View>
      <Text style={[summaryStyles.label, { color: colors.textSecondary }]}>{label}</Text>
      <Text
        style={[summaryStyles.value, { color: colors.text }]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
    </Card>
  );
}

function DonutChart({
  data,
  colors: chartColors,
  size,
}: {
  data: any[];
  colors: string[];
  size: number;
}) {
  const total = data.reduce((sum, d) => sum + d.total, 0);
  if (total === 0) return null;

  const radius = size / 2;
  const strokeWidth = 24;
  const innerRadius = radius - strokeWidth;
  let currentAngle = -90;

  const segments = data.map((d, i) => {
    const percentage = d.total / total;
    const angle = percentage * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    const endAngle = currentAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = radius + radius * Math.cos(startRad);
    const y1 = radius + radius * Math.sin(startRad);
    const x2 = radius + radius * Math.cos(endRad);
    const y2 = radius + radius * Math.sin(endRad);

    const ix1 = radius + innerRadius * Math.cos(startRad);
    const iy1 = radius + innerRadius * Math.sin(startRad);
    const ix2 = radius + innerRadius * Math.cos(endRad);
    const iy2 = radius + innerRadius * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    const path = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${ix2} ${iy2}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1}`,
      'Z',
    ].join(' ');

    return <Path key={i} d={path} fill={chartColors[i % chartColors.length]} />;
  });

  return (
    <Svg width={size} height={size}>
      <G>{segments}</G>
    </Svg>
  );
}

const SENTIMENT_CONFIG = {
  positive: { Icon: TrendingDown, iconColor: '#059669', bgLight: '#ecfdf5', bgDark: '#022c22' },
  negative: { Icon: TrendingUp, iconColor: '#dc2626', bgLight: '#fef2f2', bgDark: '#450a0a' },
  warning: { Icon: AlertTriangle, iconColor: '#d97706', bgLight: '#fffbeb', bgDark: '#451a03' },
  neutral: { Icon: Info, iconColor: '#3b82f6', bgLight: '#eff6ff', bgDark: '#172554' },
} as const;

function InsightRow({ insight, colors }: { insight: Insight; colors: any }) {
  const config = SENTIMENT_CONFIG[insight.sentiment];
  const isDark = colors.background === '#0f1729';
  const bg = isDark ? config.bgDark : config.bgLight;

  return (
    <View
      style={insightStyles.row}
      accessible
      accessibilityRole="summary"
      accessibilityLabel={`${insight.title}. ${insight.description}`}
    >
      <View
        style={[insightStyles.iconCircle, { backgroundColor: bg }]}
        importantForAccessibility="no-hide-descendants"
      >
        <config.Icon size={18} color={config.iconColor} />
      </View>
      <View style={insightStyles.textContainer}>
        <Text style={[insightStyles.title, { color: colors.text }]}>{insight.title}</Text>
        <Text style={[insightStyles.description, { color: colors.textSecondary }]}>
          {insight.description}
        </Text>
      </View>
    </View>
  );
}


const summaryStyles = StyleSheet.create({
  card: {
    width: '48%',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  label: { fontSize: FontSize.caption, fontWeight: '500' },
  value: { fontSize: FontSize.sectionHeader, fontWeight: '700', marginTop: 2 },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  headerCenter: { flex: 1, alignItems: 'center' },
  appTitle: { fontSize: FontSize.sectionHeader, fontWeight: '700' },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  sectionCard: { marginTop: Spacing.md },
  sectionTitle: { fontSize: FontSize.sectionHeader, fontWeight: '600' },
  emptyText: { fontSize: FontSize.body, textAlign: 'center', paddingVertical: Spacing.xl },
  donutContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.xl,
    position: 'relative',
  },
  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  donutAmount: { fontSize: FontSize.sectionHeader, fontWeight: '700' },
  donutLabel: { fontSize: FontSize.caption, fontWeight: '500', marginTop: 2 },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: { fontSize: FontSize.caption, flex: 1 },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  legendRow: { flexDirection: 'row', alignItems: 'center' },
  legendSmall: { fontSize: 10, fontWeight: '600', marginLeft: 4 },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  barGroup: { alignItems: 'center', flex: 1 },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 100,
  },
  bar: {
    width: 14,
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: { fontSize: 10, marginTop: 4 },
  topCategories: { marginTop: Spacing.xl },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  viewAll: { fontSize: FontSize.body, fontWeight: '500' },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  categoryInfo: { flex: 1, marginLeft: Spacing.md },
  categoryName: { fontSize: FontSize.body, fontWeight: '600' },
  categoryCount: { fontSize: FontSize.caption, marginTop: 2 },
  categoryAmount: { fontSize: FontSize.body, fontWeight: '600' },
});

const insightStyles = StyleSheet.create({
  list: { marginTop: Spacing.lg, gap: Spacing.md },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: { flex: 1 },
  title: { fontSize: FontSize.body, fontWeight: '600' },
  description: { fontSize: FontSize.caption, marginTop: 2, lineHeight: 18 },
});
