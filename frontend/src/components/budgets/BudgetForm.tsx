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
import { Checkbox } from '@/components/ui/checkbox';
import { useCategories } from '@/hooks/useCategories';
import { useUpsertBudget } from '@/hooks/useBudgets';

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

const MONTHS = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

export function BudgetForm({
  open,
  onOpenChange,
  defaultMonth,
  defaultYear,
  existingCategoryIds = [],
}: BudgetFormProps) {
  const { data: categories } = useCategories();
  const upsertBudget = useUpsertBudget();

  const {
    register,
    handleSubmit,
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
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Budget</DialogTitle>
          <DialogDescription>
            Set a budget for a specific category or an overall monthly budget.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('amount')}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="isRecurring"
              checked={isRecurring}
              onCheckedChange={(checked) =>
                setValue('isRecurring', checked === true)
              }
            />
            <Label htmlFor="isRecurring" className="cursor-pointer">
              Recurring monthly
            </Label>
          </div>

          {!isRecurring && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Month</Label>
                <Select
                  value={String(selectedMonth)}
                  onValueChange={(val) => setValue('month', Number(val))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Month" />
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
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  {...register('year')}
                />
                {errors.year && (
                  <p className="text-sm text-destructive">{errors.year.message}</p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={selectedCategoryId || undefined}
              onValueChange={(val) => setValue('categoryId', val, { shouldValidate: true })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
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
              <p className="text-sm text-destructive">{errors.categoryId.message}</p>
            )}
            {categories?.filter((c) => c.type === 'expense' && !existingCategoryIds.includes(c.id)).length === 0 && (
              <p className="text-xs text-muted-foreground">
                {categories?.filter((c) => c.type === 'expense').length === 0
                  ? 'Add transactions to create expense categories for per-category budgets.'
                  : 'All expense categories already have budgets for this period.'}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={upsertBudget.isPending}>
              {upsertBudget.isPending ? 'Saving...' : 'Save Budget'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
