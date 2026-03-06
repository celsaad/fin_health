import { useEffect, useMemo } from 'react';
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
          <DialogTitle>{isEditing ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the transaction details below.'
              : 'Fill in the details to create a new transaction.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register('amount')}
              />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={selectedType}
                onValueChange={(value) =>
                  setValue('type', value as 'expense' | 'income', {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger id="type" className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="e.g., Grocery shopping"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" {...register('date')} />
            {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
          </div>

          <Autocomplete
            label="Category"
            items={categoryNames}
            value={selectedCategoryName}
            onChange={(value) => {
              setValue('categoryName', value, { shouldValidate: true });
              setValue('subcategoryName', '');
            }}
            placeholder="Type or select a category"
          />
          {errors.categoryName && (
            <p className="-mt-2 text-xs text-destructive">{errors.categoryName.message}</p>
          )}

          <Autocomplete
            label="Subcategory"
            items={subcategoryNames}
            value={watch('subcategoryName') ?? ''}
            onChange={(value) => setValue('subcategoryName', value)}
            placeholder={
              selectedCategoryName ? 'Type or select a subcategory' : 'Select a category first'
            }
            disabled={!selectedCategoryName}
          />

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Optional notes..."
              {...register('notes')}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
