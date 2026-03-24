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
