import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import {
  useCreateRecurring,
  useUpdateRecurring,
  type RecurringTransaction,
} from '@/hooks/useRecurring';
import { format } from 'date-fns';

const recurringSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive'),
  type: z.enum(['expense', 'income']),
  description: z.string().min(1, 'Description is required'),
  frequency: z.enum(['weekly', 'biweekly', 'monthly', 'yearly']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  categoryName: z.string().min(1, 'Category is required'),
  subcategoryName: z.string().optional(),
  notes: z.string().optional(),
});

type RecurringFormValues = z.infer<typeof recurringSchema>;

interface RecurringFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTransaction?: RecurringTransaction | null;
}

export function RecurringForm({ open, onOpenChange, editingTransaction }: RecurringFormProps) {
  const { t } = useTranslation();
  const createRecurring = useCreateRecurring();
  const updateRecurring = useUpdateRecurring();
  const isEditing = !!editingTransaction;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<RecurringFormValues>({
    resolver: zodResolver(recurringSchema),
    defaultValues: {
      amount: 0,
      type: 'expense',
      description: '',
      frequency: 'monthly',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: '',
      categoryName: '',
      subcategoryName: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (editingTransaction) {
      reset({
        amount: editingTransaction.amount,
        type: editingTransaction.type as 'expense' | 'income',
        description: editingTransaction.description,
        frequency: editingTransaction.frequency as 'weekly' | 'biweekly' | 'monthly' | 'yearly',
        startDate: format(new Date(editingTransaction.startDate), 'yyyy-MM-dd'),
        endDate: editingTransaction.endDate
          ? format(new Date(editingTransaction.endDate), 'yyyy-MM-dd')
          : '',
        categoryName: editingTransaction.category.name,
        subcategoryName: editingTransaction.subcategory?.name ?? '',
        notes: editingTransaction.notes ?? '',
      });
    } else {
      reset({
        amount: 0,
        type: 'expense',
        description: '',
        frequency: 'monthly',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: '',
        categoryName: '',
        subcategoryName: '',
        notes: '',
      });
    }
  }, [editingTransaction, reset]);

  const selectedType = watch('type');
  const selectedFrequency = watch('frequency');

  const onSubmit = (values: RecurringFormValues) => {
    const payload = {
      ...values,
      endDate: values.endDate || null,
      subcategoryName: values.subcategoryName || null,
      notes: values.notes || null,
    };

    if (isEditing) {
      updateRecurring.mutate(
        { id: editingTransaction.id, ...payload },
        {
          onSuccess: () => {
            reset();
            onOpenChange(false);
          },
        },
      );
    } else {
      createRecurring.mutate(payload, {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
      });
    }
  };

  const isPending = createRecurring.isPending || updateRecurring.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('recurring.editRecurring') : t('recurring.addRecurring')}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? t('recurring.editDesc') : t('recurring.addDesc')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">{t('recurring.description')}</Label>
            <Input
              id="description"
              placeholder={t('recurring.descPlaceholder')}
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? 'recurring-description-error' : undefined}
              required
              {...register('description')}
            />
            {errors.description && (
              <p id="recurring-description-error" className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">{t('recurring.amount')}</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                aria-invalid={!!errors.amount}
                aria-describedby={errors.amount ? 'recurring-amount-error' : undefined}
                required
                {...register('amount')}
              />
              {errors.amount && (
                <p id="recurring-amount-error" className="text-sm text-destructive">
                  {errors.amount.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t('recurring.type')}</Label>
              <Select
                value={selectedType}
                onValueChange={(val) => setValue('type', val as 'expense' | 'income')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('recurring.selectType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">{t('recurring.expense')}</SelectItem>
                  <SelectItem value="income">{t('recurring.income')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('recurring.frequency')}</Label>
            <Select
              value={selectedFrequency}
              onValueChange={(val) =>
                setValue('frequency', val as 'weekly' | 'biweekly' | 'monthly' | 'yearly')
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('recurring.frequency')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">{t('recurring.weekly')}</SelectItem>
                <SelectItem value="biweekly">{t('recurring.biweekly')}</SelectItem>
                <SelectItem value="monthly">{t('recurring.monthly')}</SelectItem>
                <SelectItem value="yearly">{t('recurring.yearly')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">{t('recurring.startDate')}</Label>
              <Input
                id="startDate"
                type="date"
                aria-invalid={!!errors.startDate}
                aria-describedby={errors.startDate ? 'startDate-error' : undefined}
                required
                {...register('startDate')}
              />
              {errors.startDate && (
                <p id="startDate-error" className="text-sm text-destructive">
                  {errors.startDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">{t('recurring.endDate')}</Label>
              <Input id="endDate" type="date" {...register('endDate')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">{t('recurring.category')}</Label>
              <Input
                id="categoryName"
                placeholder={t('recurring.categoryPlaceholder')}
                aria-invalid={!!errors.categoryName}
                aria-describedby={errors.categoryName ? 'recurring-category-error' : undefined}
                required
                {...register('categoryName')}
              />
              {errors.categoryName && (
                <p id="recurring-category-error" className="text-sm text-destructive">
                  {errors.categoryName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subcategoryName">{t('recurring.subcategoryOptional')}</Label>
              <Input
                id="subcategoryName"
                placeholder={t('recurring.subcategoryPlaceholder')}
                {...register('subcategoryName')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t('recurring.notesOptional')}</Label>
            <Input
              id="notes"
              placeholder={t('recurring.notesPlaceholder')}
              {...register('notes')}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? t('common.saving') : isEditing ? t('common.update') : t('common.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
