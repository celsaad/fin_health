import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { FrequencyBadge } from '@/components/recurring/FrequencyBadge';
import { RecurringCard } from '@/components/recurring/RecurringCard';
import {
  useDeleteRecurring,
  useToggleRecurring,
  type RecurringTransaction,
} from '@/hooks/useRecurring';
import { formatCurrency } from '@fin-health/shared/format';

interface RecurringListProps {
  transactions: RecurringTransaction[];
  onEdit: (transaction: RecurringTransaction) => void;
}

export function RecurringList({ transactions, onEdit }: RecurringListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleteRecurring = useDeleteRecurring();
  const toggleRecurring = useToggleRecurring();

  const handleDelete = () => {
    if (deleteId) {
      deleteRecurring.mutate(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <>
      {/* Card layout for mobile */}
      <div className="lg:hidden space-y-2">
        {transactions.map((txn) => (
          <RecurringCard key={txn.id} transaction={txn} onEdit={onEdit} onDelete={setDeleteId} />
        ))}
      </div>

      {/* Table layout for desktop */}
      <div className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((txn) => (
              <TableRow key={txn.id}>
                <TableCell className="font-medium">{txn.description}</TableCell>
                <TableCell>{formatCurrency(txn.amount)}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={
                      txn.type === 'income'
                        ? 'border-0 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'border-0 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }
                  >
                    {txn.type === 'income' ? 'Income' : 'Expense'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <FrequencyBadge frequency={txn.frequency} />
                </TableCell>
                <TableCell>
                  {txn.category?.name ?? txn.category}
                  {txn.subcategory && (
                    <span className="text-muted-foreground">
                      {' '}
                      / {txn.subcategory?.name ?? txn.subcategory}
                    </span>
                  )}
                </TableCell>
                <TableCell>{format(new Date(txn.startDate), 'MMM dd, yyyy')}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={txn.isActive}
                      onCheckedChange={() => toggleRecurring.mutate(txn.id)}
                    />
                    <span className="text-sm text-muted-foreground">
                      {txn.isActive ? 'Active' : 'Paused'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onEdit(txn)}
                      aria-label="Edit"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setDeleteId(txn.id)}
                      aria-label="Delete"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title="Delete Recurring Transaction"
        description="Are you sure you want to delete this recurring transaction? This action cannot be undone."
        onConfirm={handleDelete}
        variant="destructive"
        confirmLabel="Delete"
      />
    </>
  );
}
