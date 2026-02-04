/**
 * Category card component
 */

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../ui/Card';
import { ProgressBar } from './ProgressBar';
import { format } from '@fin-health/domain';
import type { CategoryBudgetSummary } from '@fin-health/domain';

interface CategoryCardProps {
  category: CategoryBudgetSummary;
  currency?: string;
  onPress?: () => void;
}

export function CategoryCard({ category, currency = 'USD', onPress }: CategoryCardProps) {
  const isOverBudget = category.spentCents > category.allocatedCents;

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.categoryName}>{category.categoryName}</Text>
          <Text style={[styles.remaining, isOverBudget && styles.overBudget]}>
            {format(category.remainingCents, currency)}
          </Text>
        </View>

        <View style={styles.amounts}>
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Spent</Text>
            <Text style={styles.amountValue}>
              {format(category.spentCents, currency)}
            </Text>
          </View>
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Budget</Text>
            <Text style={styles.amountValue}>
              {format(category.allocatedCents, currency)}
            </Text>
          </View>
        </View>

        <ProgressBar
          current={category.spentCents}
          total={category.allocatedCents}
        />

        {category.subcategories.length > 0 && (
          <View style={styles.subcategories}>
            <Text style={styles.subcategoriesTitle}>
              {category.subcategories.length} subcategories
            </Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  remaining: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34C759',
  },
  overBudget: {
    color: '#FF3B30',
  },
  amounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  amountItem: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  amountValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  subcategories: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  subcategoriesTitle: {
    fontSize: 12,
    color: '#999',
  },
});
