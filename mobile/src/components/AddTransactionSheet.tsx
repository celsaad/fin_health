import React, { useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTransactionSchema, updateTransactionSchema } from '@fin-health/shared/validators';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useTheme } from '../contexts/ThemeContext';
import { createTransaction, updateTransaction } from '../services/transactions';
import { getCategories } from '../services/categories';
import { parseError } from '../services/api';
import Input from './Input';
import Button from './Button';
import SegmentedControl from './SegmentedControl';
import { BorderRadius, FontSize, Spacing } from '../constants/theme';
import Toast from 'react-native-toast-message';
import type { Transaction, Category } from '@fin-health/shared/types';

interface Props {
  visible: boolean;
  onClose: () => void;
  transaction?: Transaction | null;
}

export default function AddTransactionSheet({ visible, onClose, transaction }: Props) {
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const isEditing = !!transaction;

  const schema = isEditing ? updateTransactionSchema : createTransactionSchema;
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: '',
      type: 'expense' as const,
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      categoryName: '',
      subcategoryName: '',
      notes: '',
    },
  });

  const selectedType = watch('type');
  const selectedCategoryName = watch('categoryName');

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    enabled: visible,
  });

  const filteredCategories =
    categoriesData?.categories?.filter((c: Category) => c.type === selectedType) ?? [];
  const selectedCategory = filteredCategories.find(
    (c: Category) => c.name === selectedCategoryName,
  );

  useEffect(() => {
    if (transaction && visible) {
      reset({
        amount: String(transaction.amount),
        type: transaction.type,
        description: transaction.description,
        date: transaction.date.split('T')[0],
        categoryName: transaction.category.name,
        subcategoryName: transaction.subcategory?.name ?? '',
        notes: transaction.notes ?? '',
      });
    } else if (!transaction && visible) {
      reset({
        amount: '',
        type: 'expense',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        categoryName: '',
        subcategoryName: '',
        notes: '',
      });
    }
  }, [transaction, visible, reset]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const body = {
        ...data,
        subcategoryName: data.subcategoryName || undefined,
        notes: data.notes || undefined,
      };
      if (isEditing && transaction) {
        return updateTransaction(transaction.id, body);
      }
      return createTransaction(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      Toast.show({
        type: 'success',
        text1: isEditing ? 'Transaction updated' : 'Transaction created',
      });
      onClose();
    },
    onError: (err: unknown) => {
      Alert.alert('Error', parseError(err).message);
    },
  });

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={[styles.sheet, { backgroundColor: colors.card }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              {isEditing ? 'Edit Transaction' : 'Add Transaction'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Amount"
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  value={String(value ?? '')}
                  onChangeText={onChange}
                  error={errors.amount?.message as string}
                />
              )}
            />

            <View style={{ marginBottom: Spacing.lg }}>
              <Text style={[styles.label, { color: colors.text }]}>Type</Text>
              <SegmentedControl
                options={['Expense', 'Income']}
                selectedIndex={selectedType === 'expense' ? 0 : 1}
                onSelect={(i) => setValue('type', i === 0 ? 'expense' : 'income')}
              />
            </View>

            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Description"
                  placeholder="e.g., Dinner with friends"
                  value={value}
                  onChangeText={onChange}
                  error={errors.description?.message as string}
                />
              )}
            />

            <Controller
              control={control}
              name="categoryName"
              render={({ field: { onChange, value } }) => (
                <View style={{ marginBottom: Spacing.lg }}>
                  <Text style={[styles.label, { color: colors.text, marginBottom: Spacing.sm }]}>
                    Category
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginBottom: 4 }}
                  >
                    {filteredCategories.map((cat: Category) => (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.chipOption,
                          {
                            backgroundColor: value === cat.name ? colors.primary : colors.inputBg,
                            borderColor: value === cat.name ? colors.primary : colors.border,
                          },
                        ]}
                        onPress={() => onChange(cat.name)}
                      >
                        <Text
                          style={{
                            color: value === cat.name ? '#fff' : colors.text,
                            fontSize: FontSize.caption,
                            fontWeight: '500',
                          }}
                        >
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <Input
                    placeholder="Or type a new category"
                    value={value}
                    onChangeText={onChange}
                    error={errors.categoryName?.message as string}
                  />
                </View>
              )}
            />

            {selectedCategory && selectedCategory.subcategories.length > 0 && (
              <Controller
                control={control}
                name="subcategoryName"
                render={({ field: { onChange, value } }) => (
                  <View style={{ marginBottom: Spacing.lg }}>
                    <Text style={[styles.label, { color: colors.text, marginBottom: Spacing.sm }]}>
                      Subcategory
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {selectedCategory.subcategories.map((sub) => (
                        <TouchableOpacity
                          key={sub.id}
                          style={[
                            styles.chipOption,
                            {
                              backgroundColor: value === sub.name ? colors.primary : colors.inputBg,
                              borderColor: value === sub.name ? colors.primary : colors.border,
                            },
                          ]}
                          onPress={() => onChange(sub.name)}
                        >
                          <Text
                            style={{
                              color: value === sub.name ? '#fff' : colors.text,
                              fontSize: FontSize.caption,
                              fontWeight: '500',
                            }}
                          >
                            {sub.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              />
            )}

            <Controller
              control={control}
              name="date"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Date"
                  placeholder="YYYY-MM-DD"
                  value={value}
                  onChangeText={onChange}
                  error={errors.date?.message as string}
                />
              )}
            />

            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Notes (optional)"
                  placeholder="Any additional notes..."
                  value={value ?? ''}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={3}
                  style={{ height: 80, textAlignVertical: 'top' }}
                />
              )}
            />

            <Button
              title={isEditing ? 'Update Transaction' : 'Save Transaction'}
              onPress={handleSubmit((data) => mutation.mutate(data))}
              loading={mutation.isPending}
              style={{ marginBottom: 40 }}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingTop: Spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.sectionHeader,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  label: {
    fontSize: FontSize.label,
    fontWeight: '500',
  },
  chipOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm - 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
});
