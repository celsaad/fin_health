import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
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
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useCategories } from '@/hooks/useCategories';
import { useUpsertBudget } from '@/hooks/useBudgets';
import { useFormatters } from '@/hooks/useFormatters';

const budgetSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive'),
  month: z.coerce.number().min(1).max(12).optional(),
  year: z.coerce.number().min(2000).max(2100).optional(),
  categoryId: z.string().min(1, 'Please select a category'),
  isRecurring: z.boolean(),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

interface BudgetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMonth: number;
  defaultYear: number;
  existingCategoryIds?: string[];
}

export function BudgetForm({
  open,
  onOpenChange,
  defaultMonth,
  defaultYear,
  existingCategoryIds = [],
}: BudgetFormProps) {
  const { t } = useTranslation();
  const { getMonthName } = useFormatters();
  const MONTHS = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: getMonthName(i + 1) })),
    [getMonthName],
  );
  const { data: categories } = useCategories();
  const upsertBudget = useUpsertBudget();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      amount: 0,
      month: defaultMonth,
      year: defaultYear,
      categoryId: '',
      isRecurring: false,
    },
  });

  const selectedMonth = watch('month');
  const selectedCategoryId = watch('categoryId');
  const isRecurring = watch('isRecurring');

  const onSubmit = (values: BudgetFormValues) => {
    upsertBudget.mutate(
      {
        amount: values.amount,
        ...(values.isRecurring
          ? { isRecurring: true }
          : { month: values.month, year: values.year }),
        categoryId: values.categoryId,
      },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('budgets.addBudget')}</DialogTitle>
          <DialogDescription>{t('budgets.addBudgetDesc')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">{t('budgets.amount')}</Label>
            <Controller
              control={control}
              name="amount"
              render={({ field }) => (
                <CurrencyInput
                  id="amount"
                  value={field.value || 0}
                  onChange={field.onChange}
                  aria-invalid={!!errors.amount}
                  aria-describedby={errors.amount ? 'budget-amount-error' : undefined}
                  required
                />
              )}
            />
            {errors.amount && (
              <p id="budget-amount-error" className="text-sm text-destructive">
                {errors.amount.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="isRecurring"
              checked={isRecurring}
              onCheckedChange={(checked) => setValue('isRecurring', checked === true)}
            />
            <Label htmlFor="isRecurring" className="cursor-pointer">
              {t('budgets.recurringMonthly')}
            </Label>
          </div>

          {!isRecurring && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('budgets.month')}</Label>
                <Select
                  value={String(selectedMonth)}
                  onValueChange={(val) => setValue('month', Number(val))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('budgets.month')} />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">{t('budgets.year')}</Label>
                <Input id="year" type="number" {...register('year')} />
                {errors.year && <p className="text-sm text-destructive">{errors.year.message}</p>}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>{t('budgets.category')}</Label>
            <Select
              value={selectedCategoryId || undefined}
              onValueChange={(val) => setValue('categoryId', val, { shouldValidate: true })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('budgets.selectCategory')} />
              </SelectTrigger>
              <SelectContent>
                {categories
                  ?.filter((c) => c.type === 'expense' && !existingCategoryIds.includes(c.id))
                  .map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p id="categoryId-error" className="text-sm text-destructive">
                {errors.categoryId.message}
              </p>
            )}
            {categories?.filter((c) => c.type === 'expense' && !existingCategoryIds.includes(c.id))
              .length === 0 && (
              <p className="text-xs text-muted-foreground">
                {categories?.filter((c) => c.type === 'expense').length === 0
                  ? t('budgets.noExpenseCategories')
                  : t('budgets.allCategoriesBudgeted')}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={upsertBudget.isPending}>
              {upsertBudget.isPending ? t('common.saving') : t('budgets.saveBudget')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
