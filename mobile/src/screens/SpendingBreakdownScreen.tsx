import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, TrendingDown } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { getCategoryBreakdown } from '../services/dashboard';
import { formatCurrency, formatDate } from '../utils/format';
import Card from '../components/Card';
import MonthSelector from '../components/MonthSelector';
import CategoryIcon from '../components/CategoryIcon';
import ProgressBar from '../components/ProgressBar';
import { FontSize, Spacing, BorderRadius, CategoryColors } from '../constants/theme';

export default function SpendingBreakdownScreen() {
  const { colors } = useTheme();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ['dashboard', 'category-breakdown', month, year],
    queryFn: () => getCategoryBreakdown(month, year),
  });

  const categories = query.data?.categories ?? [];
  const totalExpenses = categories.reduce((sum: number, c: any) => sum + (c.total || 0), 0);
  const maxAmount = Math.max(...categories.map((c: any) => c.total || 0), 1);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MonthSelector
        selectedMonth={month}
        selectedYear={year}
        onSelect={(m, y) => { setMonth(m); setYear(y); }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={query.isFetching} onRefresh={() => query.refetch()} />
        }
      >
        {/* Total Expenses Banner */}
        <LinearGradient
          colors={['#6366f1', '#8b5cf6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <Text style={styles.bannerLabel}>TOTAL EXPENSES</Text>
          <Text style={styles.bannerAmount}>{formatCurrency(totalExpenses)}</Text>
          <View style={styles.trendPill}>
            <TrendingDown size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.trendText}>This month</Text>
          </View>
        </LinearGradient>

        {/* Categories */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Categories</Text>
        </View>

        {categories.map((cat: any) => {
          const isExpanded = expandedId === cat.categoryId;
          const progress = maxAmount > 0 ? cat.total / maxAmount : 0;
          const colorConfig = cat.color && CategoryColors[cat.color]
            ? CategoryColors[cat.color]
            : null;
          const barColor = colorConfig?.icon ?? colors.primary;

          return (
            <Card key={cat.categoryId} style={styles.catCard}>
              <TouchableOpacity
                style={styles.catHeader}
                onPress={() => setExpandedId(isExpanded ? null : cat.categoryId)}
                activeOpacity={0.7}
              >
                <CategoryIcon icon={cat.icon} color={cat.color} size={40} />
                <View style={styles.catInfo}>
                  <View style={styles.catNameRow}>
                    <Text style={[styles.catName, { color: colors.text }]}>{cat.categoryName}</Text>
                    <Text style={[styles.catAmount, { color: colors.text }]}>
                      {formatCurrency(cat.total)}
                    </Text>
                  </View>
                  <ProgressBar progress={progress} color={barColor} />
                </View>
                {isExpanded ? (
                  <ChevronUp size={20} color={colors.textSecondary} />
                ) : (
                  <ChevronDown size={20} color={colors.textSecondary} />
                )}
              </TouchableOpacity>

              {isExpanded && cat.transactions && (
                <View style={styles.txList}>
                  {cat.transactions.map((tx: any) => (
                    <View key={tx.id} style={styles.txRow}>
                      <View>
                        <Text style={[styles.txDesc, { color: colors.text }]}>{tx.description}</Text>
                        <Text style={[styles.txDate, { color: colors.textSecondary }]}>
                          {formatDate(tx.date)}
                        </Text>
                      </View>
                      <Text style={[styles.txAmount, { color: colors.expense }]}>
                        -{formatCurrency(tx.amount)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </Card>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: 40 },
  banner: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  bannerLabel: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.caption, fontWeight: '600', letterSpacing: 1 },
  bannerAmount: { color: '#fff', fontSize: 32, fontWeight: '700', marginTop: 4 },
  trendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    marginTop: Spacing.md,
    gap: 4,
  },
  trendText: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.caption },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  sectionTitle: { fontSize: FontSize.sectionHeader, fontWeight: '600' },
  catCard: { marginBottom: Spacing.sm },
  catHeader: { flexDirection: 'row', alignItems: 'center' },
  catInfo: { flex: 1, marginLeft: Spacing.md, marginRight: Spacing.sm },
  catNameRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  catName: { fontSize: FontSize.body, fontWeight: '600' },
  catAmount: { fontSize: FontSize.body, fontWeight: '600' },
  txList: { marginTop: Spacing.md, paddingLeft: 52 },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  txDesc: { fontSize: FontSize.body },
  txDate: { fontSize: FontSize.caption, marginTop: 2 },
  txAmount: { fontSize: FontSize.body, fontWeight: '500' },
});
