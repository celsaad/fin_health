import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createRecurringSchema } from '@fin-health/shared/validators';
import { X } from 'lucide-react-native';
import { format } from 'date-fns';
import Toast from 'react-native-toast-message';
import { useTheme } from '../contexts/ThemeContext';
import {
  getRecurringTransactions,
  createRecurring,
  toggleRecurring,
  deleteRecurring,
} from '../services/recurring';
import { parseError } from '../services/api';
import { formatCurrency } from '@fin-health/shared/format';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import CategoryIcon from '../components/CategoryIcon';
import SegmentedControl from '../components/SegmentedControl';
import EmptyState from '../components/EmptyState';
import QueryError from '../components/QueryError';
import { FontSize, Spacing } from '../constants/theme';

export default function RecurringScreen() {
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState(0); // 0 = Active, 1 = Paused
  const [showAdd, setShowAdd] = useState(false);

  const query = useQuery({
    queryKey: ['recurring'],
    queryFn: getRecurringTransactions,
  });

  const toggleMutation = useMutation({
    mutationFn: toggleRecurring,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRecurring,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
      Toast.show({ type: 'success', text1: 'Recurring transaction deleted' });
    },
  });

  const all = query.data?.recurringTransactions ?? [];
  const items = tab === 0 ? all.filter((r) => r.isActive) : all.filter((r) => !r.isActive);

  function confirmDelete(id: string) {
    Alert.alert('Delete Recurring', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
    ]);
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['bottom']}
    >
      <SegmentedControl options={['Active', 'Paused']} selectedIndex={tab} onSelect={setTab} />

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={query.isFetching} onRefresh={() => query.refetch()} />
        }
      >
        {query.isError ? (
          <QueryError onRetry={() => query.refetch()} />
        ) : items.length === 0 ? (
          <EmptyState
            title={tab === 0 ? 'No active recurring' : 'No paused recurring'}
            message="Add recurring transactions to automate your tracking"
            actionLabel="Add Recurring"
            onAction={() => setShowAdd(true)}
          />
        ) : (
          <>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              {tab === 0 ? 'Subscriptions' : 'Paused'}
              {'  '}
              <Text style={{ color: colors.primary }}>{items.length} items</Text>
            </Text>
            {items.map((item) => (
              <TouchableOpacity
                key={item.id}
                onLongPress={() => confirmDelete(item.id)}
                activeOpacity={0.7}
              >
                <Card style={styles.itemCard}>
                  <CategoryIcon icon={item.category.icon} color={item.category.color} size={40} />
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemDesc, { color: colors.text }]}>
                      {item.description}
                    </Text>
                    <Text style={[styles.itemMeta, { color: colors.textSecondary }]}>
                      {item.frequency.toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.itemRight}>
                    <Text style={[styles.itemAmount, { color: colors.text }]}>
                      {formatCurrency(item.amount)}
                    </Text>
                    <Switch
                      value={item.isActive}
                      onValueChange={() => toggleMutation.mutate(item.id)}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor="#ffffff"
                    />
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>

      <View style={[styles.stickyButton, { backgroundColor: colors.background }]}>
        <Button title="+ Add Recurring Template" onPress={() => setShowAdd(true)} />
      </View>

      <AddRecurringModal visible={showAdd} onClose={() => setShowAdd(false)} />
    </SafeAreaView>
  );
}

function AddRecurringModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { colors } = useTheme();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createRecurringSchema),
    defaultValues: {
      amount: '',
      type: 'expense' as const,
      description: '',
      frequency: 'monthly' as const,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      categoryName: '',
      subcategoryName: '',
      notes: '',
    },
  });

  const selectedType = watch('type');
  const frequencies = ['weekly', 'biweekly', 'monthly', 'yearly'];

  const mutation = useMutation({
    mutationFn: (data: any) =>
      createRecurring({
        ...data,
        subcategoryName: data.subcategoryName || undefined,
        notes: data.notes || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
      Toast.show({ type: 'success', text1: 'Recurring transaction created' });
      reset();
      onClose();
    },
    onError: (err: unknown) => {
      Alert.alert('Error', parseError(err).message);
    },
  });

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={addStyles.overlay}>
        <View style={[addStyles.sheet, { backgroundColor: colors.card }]}>
          <View style={[addStyles.handle, { backgroundColor: colors.border }]} />
          <View style={addStyles.header}>
            <Text style={[addStyles.title, { color: colors.text }]}>Add Recurring</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={addStyles.content} showsVerticalScrollIndicator={false}>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Description"
                  placeholder="e.g., Netflix Premium"
                  value={value}
                  onChangeText={onChange}
                  error={errors.description?.message as string}
                />
              )}
            />
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Amount"
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  value={value}
                  onChangeText={onChange}
                  error={errors.amount?.message as string}
                />
              )}
            />

            <View style={{ marginBottom: 16 }}>
              <Text style={[styles.label, { color: colors.text }]}>Type</Text>
              <SegmentedControl
                options={['Expense', 'Income']}
                selectedIndex={selectedType === 'expense' ? 0 : 1}
                onSelect={(i) => setValue('type', i === 0 ? 'expense' : 'income')}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={[styles.label, { color: colors.text, marginBottom: 8 }]}>Frequency</Text>
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                {frequencies.map((f) => (
                  <TouchableOpacity
                    key={f}
                    style={[
                      styles.chipOption,
                      {
                        backgroundColor: watch('frequency') === f ? colors.primary : colors.inputBg,
                        borderColor: watch('frequency') === f ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setValue('frequency', f as any)}
                  >
                    <Text
                      style={{
                        color: watch('frequency') === f ? '#fff' : colors.text,
                        fontSize: 13,
                        fontWeight: '500',
                      }}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Controller
              control={control}
              name="categoryName"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Category"
                  placeholder="e.g., Entertainment"
                  value={value}
                  onChangeText={onChange}
                  error={errors.categoryName?.message as string}
                />
              )}
            />

            <Controller
              control={control}
              name="startDate"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Start Date"
                  placeholder="YYYY-MM-DD"
                  value={value}
                  onChangeText={onChange}
                  error={errors.startDate?.message as string}
                />
              )}
            />

            <Button
              title="Save Recurring"
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

const addStyles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%', paddingTop: 8 },
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
  scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: 120, flex: 1 },
  sectionLabel: {
    fontSize: FontSize.body,
    fontWeight: '600',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  itemCard: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  itemInfo: { flex: 1, marginLeft: Spacing.md },
  itemDesc: { fontSize: FontSize.body, fontWeight: '600' },
  itemMeta: { fontSize: FontSize.caption, fontWeight: '500', marginTop: 2 },
  itemRight: { alignItems: 'flex-end', gap: 6 },
  itemAmount: { fontSize: FontSize.body, fontWeight: '600' },
  stickyButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 34,
  },
  label: { fontSize: FontSize.label, fontWeight: '500', marginBottom: 4 },
  chipOption: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
});
