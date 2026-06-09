import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import i18n from '@/lib/i18n';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Autocomplete } from '@/components/shared/Autocomplete';
import { useCategories } from '@/hooks/useCategories';
import {
  useCreateTransaction,
  useUpdateTransaction,
  type Transaction,
} from '@/hooks/useTransactions';
import { format } from 'date-fns';

const transactionSchema = z.object({
  amount: z.coerce.number({ message: 'Amount is required' }).positive('Amount must be positive'),
  type: z.enum(['expense', 'income'], {
    required_error: 'Type is required',
  }),
  currency: z.string().length(3),
  description: z.string().min(1, 'Description is required'),
  date: z.string().min(1, 'Date is required'),
  categoryName: z.string().min(1, 'Category is required'),
  subcategoryName: z.string().optional(),
  notes: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface PrefillData {
  amount?: string;
  currency?: string;
  type?: 'expense' | 'income';
  description?: string;
  date?: string;
  categoryName?: string;
  subcategoryName?: string;
  notes?: string;
}

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction;
  prefillData?: PrefillData;
  onSuccess?: () => void;
}

export function TransactionForm({
  open,
  onOpenChange,
  transaction,
  prefillData,
  onSuccess,
}: TransactionFormProps) {
  const { t } = useTranslation();
  const { data: categories = [] } = useCategories();
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();

  const isEditing = !!transaction;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: 0,
      type: 'expense',
      currency: i18n.language.startsWith('pt') ? 'BRL' : 'USD',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      categoryName: '',
      subcategoryName: '',
      notes: '',
    },
  });

  const selectedType = watch('type');
  const selectedCategoryName = watch('categoryName');

  useEffect(() => {
    if (open && transaction) {
      reset({
        amount: transaction.amount,
        type: transaction.type,
        currency: transaction.currency || (i18n.language.startsWith('pt') ? 'BRL' : 'USD'),
        description: transaction.description,
        date: format(new Date(transaction.date), 'yyyy-MM-dd'),
        categoryName: transaction.category.name,
        subcategoryName: transaction.subcategory?.name ?? '',
        notes: transaction.notes ?? '',
      });
    } else if (open && !transaction && prefillData) {
      reset({
        amount: prefillData.amount ? parseFloat(prefillData.amount) : 0,
        type: prefillData.type ?? 'expense',
        currency: prefillData.currency ?? (i18n.language.startsWith('pt') ? 'BRL' : 'USD'),
        description: prefillData.description ?? '',
        date: prefillData.date ?? format(new Date(), 'yyyy-MM-dd'),
        categoryName: prefillData.categoryName ?? '',
        subcategoryName: prefillData.subcategoryName ?? '',
        notes: prefillData.notes ?? '',
      });
    } else if (open && !transaction) {
      reset({
        amount: 0,
        type: 'expense',
        currency: i18n.language.startsWith('pt') ? 'BRL' : 'USD',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        categoryName: '',
        subcategoryName: '',
        notes: '',
      });
    }
  }, [open, transaction, prefillData, reset]);

  const categoryNames = useMemo(() => {
    return categories.filter((c) => !selectedType || c.type === selectedType).map((c) => c.name);
  }, [categories, selectedType]);

  const subcategoryNames = useMemo(() => {
    const category = categories.find((c) => c.name === selectedCategoryName);
    return category ? category.subcategories.map((s) => s.name) : [];
  }, [categories, selectedCategoryName]);

  const onSubmit = async (values: TransactionFormValues) => {
    const payload = {
      ...values,
      subcategoryName: values.subcategoryName || undefined,
      notes: values.notes || undefined,
    };

    if (isEditing) {
      await updateMutation.mutateAsync({ id: transaction.id, ...payload });
    } else {
      await createMutation.mutateAsync(payload);
    }

    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('transactions.editTransaction') : t('transactions.addTransaction')}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? t('transactions.editDesc') : t('transactions.addDesc')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">{t('transactions.amount')}</Label>
              <Controller
                control={control}
                name="amount"
                render={({ field }) => (
                  <CurrencyInput
                    id="amount"
                    value={field.value || 0}
                    onChange={field.onChange}
                    aria-invalid={!!errors.amount}
                    aria-describedby={errors.amount ? 'amount-error' : undefined}
                    required
                  />
                )}
              />
              {errors.amount && (
                <p id="amount-error" className="text-xs text-destructive">
                  {errors.amount.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="currency">{t('transactions.currency')}</Label>
              <Select value={watch('currency')} onValueChange={(val) => setValue('currency', val)}>
                <SelectTrigger id="currency" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="BRL">BRL</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">{t('transactions.type')}</Label>
              <Select
                value={selectedType}
                onValueChange={(value) =>
                  setValue('type', value as 'expense' | 'income', {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger id="type" className="w-full">
                  <SelectValue placeholder={t('transactions.selectType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">{t('transactions.expense')}</SelectItem>
                  <SelectItem value="income">{t('transactions.income')}</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p id="type-error" className="text-xs text-destructive">
                  {errors.type.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">{t('transactions.description')}</Label>
            <Input
              id="description"
              placeholder={t('transactions.descPlaceholder')}
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? 'description-error' : undefined}
              required
              {...register('description')}
            />
            {errors.description && (
              <p id="description-error" className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="date">{t('transactions.date')}</Label>
            <Input
              id="date"
              type="date"
              aria-invalid={!!errors.date}
              aria-describedby={errors.date ? 'date-error' : undefined}
              required
              {...register('date')}
            />
            {errors.date && (
              <p id="date-error" className="text-xs text-destructive">
                {errors.date.message}
              </p>
            )}
          </div>

          <Autocomplete
            label={t('transactions.categoryLabel')}
            items={categoryNames}
            value={selectedCategoryName}
            onChange={(value) => {
              setValue('categoryName', value, { shouldValidate: true });
              setValue('subcategoryName', '');
            }}
            placeholder={t('transactions.categoryPlaceholder')}
          />
          {errors.categoryName && (
            <p id="categoryName-error" className="-mt-2 text-xs text-destructive">
              {errors.categoryName.message}
            </p>
          )}

          <Autocomplete
            label={t('transactions.subcategory')}
            items={subcategoryNames}
            value={watch('subcategoryName') ?? ''}
            onChange={(value) => setValue('subcategoryName', value)}
            placeholder={
              selectedCategoryName
                ? t('transactions.subcategoryPlaceholder')
                : t('transactions.subcategoryDisabled')
            }
            disabled={!selectedCategoryName}
          />

          <div className="grid gap-2">
            <Label htmlFor="notes">{t('transactions.notes')}</Label>
            <textarea
              id="notes"
              className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={t('transactions.notesPlaceholder')}
              {...register('notes')}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? t('common.saving')
                : isEditing
                  ? t('common.update')
                  : t('common.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
