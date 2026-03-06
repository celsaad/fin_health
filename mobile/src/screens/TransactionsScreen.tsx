import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Bell } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useTheme } from '../contexts/ThemeContext';
import { getTransactions, deleteTransaction } from '../services/transactions';
import { getCategories } from '../services/categories';
import { formatAmount, formatDateGroupHeader } from '@fin-health/shared/format';
import CategoryIcon from '../components/CategoryIcon';
import Badge from '../components/Badge';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import AddTransactionSheet from '../components/AddTransactionSheet';
import { CardSkeleton } from '../components/LoadingSkeleton';
import QueryError from '../components/QueryError';
import { FontSize, Spacing, BorderRadius } from '../constants/theme';
import type { Transaction, CategoryType } from '@fin-health/shared/types';

export default function TransactionsScreen() {
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<CategoryType | ''>('');
  const [filterCategoryId, _setFilterCategoryId] = useState('');
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [showSheet, setShowSheet] = useState(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useInfiniteQuery({
    queryKey: ['transactions', search, filterType, filterCategoryId],
    queryFn: ({ pageParam = 1 }) =>
      getTransactions({
        page: pageParam,
        limit: 20,
        search: search || undefined,
        type: filterType || undefined,
        categoryId: filterCategoryId || undefined,
        sortBy: 'date',
        sortOrder: 'desc',
      }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const { data: _categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      Toast.show({ type: 'success', text1: 'Transaction deleted' });
    },
  });

  const allTransactions = data?.pages.flatMap((p) => p.transactions) ?? [];

  // Group by date
  const grouped = groupByDate(allTransactions);

  function confirmDelete(id: string) {
    Alert.alert('Delete Transaction', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteMutation.mutate(id),
      },
    ]);
  }

  const renderTransaction = useCallback(
    ({ item }: { item: Transaction }) => {
      return (
        <TouchableOpacity
          onPress={() => {
            setEditingTx(item);
            setShowSheet(true);
          }}
          onLongPress={() => confirmDelete(item.id)}
          activeOpacity={0.7}
        >
          <Card style={styles.txCard}>
            <CategoryIcon icon={item.category.icon} color={item.category.color} size={40} />
            <View style={styles.txInfo}>
              <Text style={[styles.txDesc, { color: colors.text }]} numberOfLines={1}>
                {item.description}
              </Text>
              <View style={styles.txMeta}>
                <Badge
                  label={item.type}
                  color={item.type === 'income' ? '#16a34a' : '#dc2626'}
                  bgColor={item.type === 'income' ? colors.incomeBg : colors.expenseBg}
                />
                <Text style={[styles.txCategory, { color: colors.textSecondary }]}>
                  {item.category.name}
                </Text>
              </View>
            </View>
            <Text
              style={[
                styles.txAmount,
                { color: item.type === 'income' ? colors.income : colors.expense },
              ]}
            >
              {formatAmount(item.amount, item.type)}
            </Text>
          </Card>
        </TouchableOpacity>
      );
    },
    [colors],
  );

  const typeOptions = ['All', 'Income', 'Expense'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Transactions</Text>
        <Bell size={22} color={colors.textSecondary} />
      </View>

      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: colors.inputBg }]}>
        <Search size={18} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search transactions..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filter chips */}
      <View style={styles.filterRow}>
        {typeOptions.map((opt) => {
          const val = opt === 'All' ? '' : opt.toLowerCase();
          const isActive = filterType === val;
          return (
            <TouchableOpacity
              key={opt}
              style={[
                styles.filterChip,
                {
                  backgroundColor: isActive ? colors.primary : colors.inputBg,
                  borderColor: isActive ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setFilterType(val as any)}
            >
              <Text
                style={{
                  color: isActive ? '#fff' : colors.textSecondary,
                  fontSize: FontSize.caption,
                  fontWeight: '500',
                }}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          {[1, 2, 3, 4, 5].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </View>
      ) : isError ? (
        <QueryError onRetry={() => refetch()} />
      ) : allTransactions.length === 0 ? (
        <EmptyState
          title="No transactions yet"
          message="Add your first transaction to start tracking"
        />
      ) : (
        <FlatList
          data={grouped}
          keyExtractor={(item) => (item.type === 'header' ? `header-${item.date}` : item.id)}
          renderItem={({ item }) => {
            if (item.type === 'header') {
              return (
                <Text style={[styles.dateHeader, { color: colors.textSecondary }]}>
                  {item.label}
                </Text>
              );
            }
            return renderTransaction({ item: item as Transaction });
          }}
          contentContainerStyle={styles.listContent}
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isFetchingNextPage}
              onRefresh={() => refetch()}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <AddTransactionSheet
        visible={showSheet}
        onClose={() => {
          setShowSheet(false);
          setEditingTx(null);
        }}
        transaction={editingTx}
      />
    </SafeAreaView>
  );
}

function groupByDate(transactions: Transaction[]): any[] {
  const result: any[] = [];
  let lastDate = '';

  for (const tx of transactions) {
    const dateKey = tx.date.split('T')[0];
    if (dateKey !== lastDate) {
      result.push({ type: 'header', date: dateKey, label: formatDateGroupHeader(tx.date) });
      lastDate = dateKey;
    }
    result.push(tx);
  }

  return result;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: { fontSize: FontSize.pageTitle, fontWeight: '700' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    height: 44,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.body,
    height: 44,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  loadingContainer: { paddingHorizontal: Spacing.lg },
  listContent: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },
  dateHeader: {
    fontSize: FontSize.caption,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  txInfo: { flex: 1, marginLeft: Spacing.md },
  txDesc: { fontSize: FontSize.body, fontWeight: '600' },
  txMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: Spacing.sm,
  },
  txCategory: { fontSize: FontSize.caption },
  txAmount: { fontSize: FontSize.body, fontWeight: '600' },
});
