import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { upsertBudgetSchema } from '@fin-health/shared/validators';
import { Info, Copy, X } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useTheme } from '../contexts/ThemeContext';
import { getBudgets, upsertBudget, deleteBudget, copyPreviousBudgets } from '../services/budgets';
import { getCategories } from '../services/categories';
import { parseError } from '../services/api';
import { formatCurrency } from '@fin-health/shared/format';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import MonthSelector from '../components/MonthSelector';
import CategoryIcon from '../components/CategoryIcon';
import ProgressBar from '../components/ProgressBar';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import QueryError from '../components/QueryError';
import { FontSize, Spacing, BorderRadius } from '../constants/theme';
import type { Category } from '@fin-health/shared/types';

export default function BudgetsScreen({ navigation }: any) {
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [showAdd, setShowAdd] = useState(false);

  const budgetsQuery = useQuery({
    queryKey: ['budgets', month, year],
    queryFn: () => getBudgets(month, year),
  });

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const budgets = budgetsQuery.data?.budgets ?? [];
  const categories = categoriesQuery.data?.categories ?? [];

  // Filter out categories that already have a budget
  const budgetedCategoryIds = new Set(budgets.map((b) => b.categoryId).filter(Boolean));
  const availableCategories = categories.filter(
    (c: Category) => c.type === 'expense' && !budgetedCategoryIds.has(c.id),
  );

  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + Number(b.spent ?? 0), 0);
  const progress = totalBudget > 0 ? totalSpent / totalBudget : 0;

  const deleteMutation = useMutation({
    mutationFn: deleteBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      Toast.show({ type: 'success', text1: 'Budget deleted' });
    },
  });

  const copyMutation = useMutation({
    mutationFn: () => copyPreviousBudgets(month, year),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      Toast.show({ type: 'success', text1: `Copied ${data.copied} budgets` });
    },
    onError: (err: unknown) => {
      Alert.alert('Error', parseError(err).message);
    },
  });

  function confirmDelete(id: string) {
    Alert.alert('Delete Budget', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
    ]);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Monthly Budgets</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => copyMutation.mutate()}>
            <Copy size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
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
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={budgetsQuery.isFetching}
            onRefresh={() => budgetsQuery.refetch()}
          />
        }
      >
        {/* Overall Budget */}
        <Card style={styles.overallCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Overall Budget</Text>
          <View style={styles.overallRow}>
            <View>
              <Text style={[styles.overallLabel, { color: colors.textSecondary }]}>
                Total Spent
              </Text>
              <Text style={[styles.overallAmount, { color: colors.text }]}>
                {formatCurrency(totalSpent)}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.goalText, { color: colors.textSecondary }]}>
                GOAL: {formatCurrency(totalBudget)}
              </Text>
              <Text style={[styles.percentText, { color: colors.primary }]}>
                {Math.round(progress * 100)}% reached
              </Text>
            </View>
          </View>
          <ProgressBar progress={progress} />
          <View style={styles.infoRow}>
            <Info size={14} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {formatCurrency(Math.max(totalBudget - totalSpent, 0))} remaining
            </Text>
          </View>
        </Card>

        {/* Category Budgets */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Categories</Text>
        </View>

        {budgetsQuery.isLoading ? (
          <View style={styles.gridContainer}>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} style={styles.budgetCard}>
                <LoadingSkeleton width={36} height={36} borderRadius={18} />
                <LoadingSkeleton width="60%" height={14} style={{ marginTop: 8 }} />
                <LoadingSkeleton width="100%" height={8} style={{ marginTop: 8 }} />
              </Card>
            ))}
          </View>
        ) : budgetsQuery.isError ? (
          <QueryError onRetry={() => budgetsQuery.refetch()} />
        ) : budgets.length === 0 ? (
          <EmptyState
            title="No budgets set"
            message="Add a budget to start tracking your spending"
            actionLabel="Add Budget"
            onAction={() => setShowAdd(true)}
          />
        ) : (
          <View style={styles.gridContainer}>
            {budgets.map((budget) => {
              const spent = Number(budget.spent ?? 0);
              const limit = Number(budget.amount);
              const prog = limit > 0 ? spent / limit : 0;
              const remaining = limit - spent;
              const isOver = remaining < 0;

              return (
                <TouchableOpacity
                  key={budget.id}
                  onLongPress={() => confirmDelete(budget.id)}
                  activeOpacity={0.7}
                  style={styles.budgetCardWrapper}
                >
                  <Card style={styles.budgetCard}>
                    <CategoryIcon
                      icon={budget.category?.icon}
                      color={budget.category?.color}
                      size={36}
                    />
                    <Text style={[styles.budgetName, { color: colors.text }]} numberOfLines={1}>
                      {budget.category?.name ?? 'Overall'}
                    </Text>
                    <Text style={[styles.budgetMeta, { color: colors.textSecondary }]}>
                      Spent: {formatCurrency(spent)}
                    </Text>
                    <Text style={[styles.budgetMeta, { color: colors.textSecondary }]}>
                      Limit: {formatCurrency(limit)}
                    </Text>
                    <ProgressBar progress={prog} />
                    <Text
                      style={[
                        styles.budgetRemaining,
                        {
                          color: isOver
                            ? colors.destructive
                            : prog > 0.75
                              ? colors.amber
                              : '#16a34a',
                        },
                      ]}
                    >
                      {isOver
                        ? `${formatCurrency(Math.abs(remaining))} over`
                        : `${formatCurrency(remaining)} left`}
                    </Text>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <TouchableOpacity
          style={styles.recurringLink}
          onPress={() => navigation.navigate('Recurring')}
        >
          <Text style={[styles.recurringText, { color: colors.primary }]}>
            Manage Recurring Transactions
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Sticky Add Button */}
      <View style={[styles.stickyButton, { backgroundColor: colors.background }]}>
        <Button title="+ Add New Budget" onPress={() => setShowAdd(true)} />
      </View>

      {/* Add Budget Sheet */}
      <AddBudgetModal
        visible={showAdd}
        onClose={() => setShowAdd(false)}
        month={month}
        year={year}
        availableCategories={availableCategories}
      />
    </SafeAreaView>
  );
}

function AddBudgetModal({
  visible,
  onClose,
  month,
  year,
  availableCategories,
}: {
  visible: boolean;
  onClose: () => void;
  month: number;
  year: number;
  availableCategories: Category[];
}) {
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(upsertBudgetSchema),
    defaultValues: {
      amount: '',
      month,
      year,
      isRecurring: false,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: any) =>
      upsertBudget({
        ...data,
        categoryId: selectedCategoryId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      Toast.show({ type: 'success', text1: 'Budget created' });
      reset();
      setSelectedCategoryId(null);
      onClose();
    },
    onError: (err: unknown) => {
      Alert.alert('Error', parseError(err).message);
    },
  });

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={modalStyles.overlay}>
        <View style={[modalStyles.sheet, { backgroundColor: colors.card }]}>
          <View style={[modalStyles.handle, { backgroundColor: colors.border }]} />
          <View style={modalStyles.header}>
            <Text style={[modalStyles.title, { color: colors.text }]}>Add Budget</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={modalStyles.content}>
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Budget Amount"
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  value={value as string}
                  onChangeText={onChange}
                  error={errors.amount?.message as string}
                />
              )}
            />

            <Text style={[styles.label, { color: colors.text, marginBottom: 8 }]}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 16 }}
            >
              {availableCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.chipOption,
                    {
                      backgroundColor:
                        selectedCategoryId === cat.id ? colors.primary : colors.inputBg,
                      borderColor: selectedCategoryId === cat.id ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedCategoryId(cat.id)}
                >
                  <Text
                    style={{
                      color: selectedCategoryId === cat.id ? '#fff' : colors.text,
                      fontSize: 13,
                      fontWeight: '500',
                    }}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Button
              title="Save Budget"
              onPress={handleSubmit((data) => mutation.mutate(data))}
              loading={mutation.isPending}
              style={{ marginBottom: 40 }}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '70%', paddingTop: 8 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: { fontSize: 18, fontWeight: '600' },
  content: { paddingHorizontal: 16 },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: FontSize.pageTitle, fontWeight: '700' },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: 120 },
  overallCard: { marginTop: Spacing.md },
  sectionTitle: { fontSize: FontSize.sectionHeader, fontWeight: '600', marginBottom: Spacing.md },
  overallRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  overallLabel: { fontSize: FontSize.caption },
  overallAmount: { fontSize: FontSize.pageTitle, fontWeight: '700' },
  goalText: { fontSize: FontSize.caption, fontWeight: '500' },
  percentText: { fontSize: FontSize.caption, fontWeight: '600', marginTop: 2 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.md,
  },
  infoText: { fontSize: FontSize.caption },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  budgetCardWrapper: { width: '48%', marginBottom: Spacing.md },
  budgetCard: { paddingVertical: Spacing.md },
  budgetName: { fontSize: FontSize.body, fontWeight: '600', marginTop: Spacing.sm },
  budgetMeta: { fontSize: FontSize.caption, marginTop: 2 },
  budgetRemaining: { fontSize: FontSize.caption, fontWeight: '600', marginTop: 6 },
  stickyButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    paddingBottom: 34,
  },
  recurringLink: { alignItems: 'center', marginTop: Spacing.xl },
  recurringText: { fontSize: FontSize.body, fontWeight: '500' },
  label: { fontSize: FontSize.label, fontWeight: '500' },
  chipOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: 8,
  },
});
