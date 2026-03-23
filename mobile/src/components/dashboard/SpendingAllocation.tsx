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
