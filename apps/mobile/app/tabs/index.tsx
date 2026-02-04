/**
 * Budget overview screen (main tab)
 */

import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { trpc } from '../../lib/trpc';
import { useCurrentMonth } from '../../hooks/useCurrentMonth';
import { CategoryCard } from '../../components/budget/CategoryCard';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/budget/ProgressBar';
import { format, formatMonthKey } from '@fin-health/domain';
import { useState } from 'react';

export default function BudgetScreen() {
  const { monthKey, goToPreviousMonth, goToNextMonth } = useCurrentMonth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: settings } = trpc.settings.get.useQuery();
  const { data: overview, refetch } = trpc.budgets.get.useQuery({ monthKey });

  const currency = settings?.currency || 'USD';

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleAddExpense = () => {
    Alert.alert('Add Expense', 'Expense entry modal coming soon!');
  };

  if (!overview) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const isOverBudget = overview.totalSpentCents > overview.totalAllocatedCents;

  return (
    <View style={styles.container}>
      {/* Month Navigation */}
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <Text style={styles.navButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{formatMonthKey(monthKey)}</Text>
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <Text style={styles.navButtonText}>→</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Total Summary */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryLabel}>Total</Text>
            <Text style={[styles.summaryAmount, isOverBudget && styles.overBudgetText]}>
              {format(overview.totalRemainingCents, currency)}
            </Text>
          </View>
          <View style={styles.summaryDetails}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemLabel}>Spent</Text>
              <Text style={styles.summaryItemValue}>
                {format(overview.totalSpentCents, currency)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemLabel}>Budget</Text>
              <Text style={styles.summaryItemValue}>
                {format(overview.totalAllocatedCents, currency)}
              </Text>
            </View>
          </View>
          <ProgressBar
            current={overview.totalSpentCents}
            total={overview.totalAllocatedCents}
          />
        </Card>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Categories</Text>
          {overview.categories.length === 0 ? (
            <Card>
              <Text style={styles.emptyText}>
                No budget allocations for this month.
              </Text>
              <Text style={styles.emptySubtext}>
                Set up your budget in the Categories tab.
              </Text>
            </Card>
          ) : (
            overview.categories.map((category) => (
              <CategoryCard
                key={category.categoryId}
                category={category}
                currency={currency}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Expense Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddExpense}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  navButton: {
    padding: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 24,
    color: '#007AFF',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  summaryCard: {
    margin: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#34C759',
  },
  overBudgetText: {
    color: '#FF3B30',
  },
  summaryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
  },
  summaryItemLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  summaryItemValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  categoriesSection: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: '#FFF',
    fontWeight: '300',
  },
});
