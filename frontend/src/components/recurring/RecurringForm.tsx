import { useEffect } from 'react';
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
import { useCreateRecurring, useUpdateRecurring, type RecurringTransaction } from '@/hooks/useRecurring';
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

export function RecurringForm({
  open,
  onOpenChange,
  editingTransaction,
}: RecurringFormProps) {
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
        categoryName: editingTransaction.category,
        subcategoryName: editingTransaction.subcategory ?? '',
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
        }
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
            {isEditing ? 'Edit Recurring Transaction' : 'Add Recurring Transaction'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the recurring transaction details.'
              : 'Create a new recurring transaction template.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="e.g., Netflix subscription"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={selectedType}
                onValueChange={(val) => setValue('type', val as 'expense' | 'income')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select
              value={selectedFrequency}
              onValueChange={(val) =>
                setValue('frequency', val as 'weekly' | 'biweekly' | 'monthly' | 'yearly')
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Biweekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" {...register('startDate')} />
              {errors.startDate && (
                <p className="text-sm text-destructive">{errors.startDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date (optional)</Label>
              <Input id="endDate" type="date" {...register('endDate')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Category</Label>
              <Input
                id="categoryName"
                placeholder="e.g., Entertainment"
                {...register('categoryName')}
              />
              {errors.categoryName && (
                <p className="text-sm text-destructive">{errors.categoryName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subcategoryName">Subcategory (optional)</Label>
              <Input
                id="subcategoryName"
                placeholder="e.g., Streaming"
                {...register('subcategoryName')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input id="notes" placeholder="Additional notes..." {...register('notes')} />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
