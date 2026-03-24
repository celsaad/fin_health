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
