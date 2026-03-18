import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
  description: z.string().min(1, 'Description is required'),
  date: z.string().min(1, 'Date is required'),
  categoryName: z.string().min(1, 'Category is required'),
  subcategoryName: z.string().optional(),
  notes: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction;
  onSuccess?: () => void;
}

export function TransactionForm({
  open,
  onOpenChange,
  transaction,
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
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: 0,
      type: 'expense',
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
        description: transaction.description,
        date: format(new Date(transaction.date), 'yyyy-MM-dd'),
        categoryName: transaction.category.name,
        subcategoryName: transaction.subcategory?.name ?? '',
        notes: transaction.notes ?? '',
      });
    } else if (open && !transaction) {
      reset({
        amount: 0,
        type: 'expense',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        categoryName: '',
        subcategoryName: '',
        notes: '',
      });
    }
  }, [open, transaction, reset]);

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
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">{t('transactions.amount')}</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                aria-invalid={!!errors.amount}
                aria-describedby={errors.amount ? 'amount-error' : undefined}
                required
                {...register('amount')}
              />
              {errors.amount && (
                <p id="amount-error" className="text-xs text-destructive">
                  {errors.amount.message}
                </p>
              )}
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
