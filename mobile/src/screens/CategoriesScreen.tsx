import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { getCategories } from '../services/categories';
import SegmentedControl from '../components/SegmentedControl';
import CategoryIcon from '../components/CategoryIcon';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import QueryError from '../components/QueryError';
import { FontSize, Spacing } from '../constants/theme';
import type { Category, CategoryType } from '@fin-health/shared/types';

export default function CategoriesScreen() {
  const { colors } = useTheme();
  const [typeIndex, setTypeIndex] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const type: CategoryType = typeIndex === 0 ? 'expense' : 'income';

  const query = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const categories = (query.data?.categories ?? []).filter((c: Category) => c.type === type);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.toggleContainer}>
        <SegmentedControl
          options={['Expense', 'Income']}
          selectedIndex={typeIndex}
          onSelect={setTypeIndex}
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {type === 'expense' ? 'Expense' : 'Income'} Categories
        </Text>
        <View style={[styles.countBadge, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.countText, { color: colors.primary }]}>
            {categories.length} Total
          </Text>
        </View>
      </View>

      <FlatList
        data={categories}
        keyExtractor={keyExtractor}
        renderItem={useCallback(
          ({ item }: { item: Category }) => {
            const isExpanded = expandedId === item.id;
            return (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setExpandedId(isExpanded ? null : item.id)}
              >
                <Card style={styles.categoryCard}>
                  <CategoryIcon icon={item.icon} color={item.color} size={44} />
                  <View style={styles.categoryInfo}>
                    <Text style={[styles.categoryName, { color: colors.text }]}>{item.name}</Text>
                    {item.subcategories.length > 0 && (
                      <Text
                        style={[styles.subcategories, { color: colors.textSecondary }]}
                        numberOfLines={1}
                      >
                        {item.subcategories.length} subcategories
                      </Text>
                    )}
                  </View>
                  <ChevronRight
                    size={20}
                    color={colors.textSecondary}
                    style={{ transform: [{ rotate: isExpanded ? '90deg' : '0deg' }] }}
                  />
                </Card>
                {isExpanded && item.subcategories.length > 0 && (
                  <View style={[styles.subcategoryList, { borderLeftColor: colors.border }]}>
                    {item.subcategories.map((sub) => (
                      <View key={sub.id} style={styles.subcategoryRow}>
                        <View
                          style={[styles.subcategoryDot, { backgroundColor: colors.textSecondary }]}
                        />
                        <Text style={[styles.subcategoryName, { color: colors.text }]}>
                          {sub.name}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          },
          [expandedId, colors],
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={query.isFetching} onRefresh={() => query.refetch()} />
        }
        ListEmptyComponent={
          query.isError ? (
            <QueryError onRetry={() => query.refetch()} />
          ) : (
            <EmptyState title="No categories" message="Categories will appear here once created" />
          )
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const keyExtractor = (item: Category) => item.id;

const styles = StyleSheet.create({
  container: { flex: 1 },
  toggleContainer: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  sectionTitle: { fontSize: FontSize.sectionHeader, fontWeight: '600' },
  countBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  countText: { fontSize: FontSize.caption, fontWeight: '600' },
  listContent: { paddingHorizontal: Spacing.lg, paddingBottom: 40 },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  categoryInfo: { flex: 1, marginLeft: Spacing.md },
  categoryName: { fontSize: FontSize.body, fontWeight: '600' },
  subcategories: { fontSize: FontSize.caption, marginTop: 2 },
  subcategoryList: {
    marginLeft: 38,
    paddingLeft: Spacing.md,
    borderLeftWidth: 2,
    marginBottom: Spacing.sm,
  },
  subcategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  subcategoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Spacing.sm,
  },
  subcategoryName: { fontSize: FontSize.body },
});
