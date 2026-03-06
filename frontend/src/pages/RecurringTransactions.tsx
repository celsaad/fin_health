import { useState, useMemo } from 'react';
import { PlusCircle, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { RecurringForm } from '@/components/recurring/RecurringForm';
import { RecurringList } from '@/components/recurring/RecurringList';
import { useRecurringTransactions, type RecurringTransaction } from '@/hooks/useRecurring';

export default function RecurringTransactions() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RecurringTransaction | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'paused'>('active');

  const { data: transactions, isLoading } = useRecurringTransactions();

  const filtered = useMemo(() => {
    if (!transactions) return [];
    return transactions.filter((t) =>
      activeTab === 'active' ? t.isActive : !t.isActive
    );
  }, [transactions, activeTab]);

  const activeCount = transactions?.filter((t) => t.isActive).length ?? 0;
  const pausedCount = transactions?.filter((t) => !t.isActive).length ?? 0;

  const handleEdit = (txn: RecurringTransaction) => {
    setEditing(txn);
    setFormOpen(true);
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditing(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recurring Transactions</h1>
          <p className="text-sm text-muted-foreground">
            Manage your recurring income and expense templates
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <PlusCircle className="size-4" />
          Add Recurring
        </Button>
      </div>

      {/* Tab toggle */}
      {transactions && transactions.length > 0 && (
        <div className="inline-flex rounded-full border border-border p-1 gap-0.5">
          <button
            onClick={() => setActiveTab('active')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'active'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setActiveTab('paused')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'paused'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Paused ({pausedCount})
          </button>
        </div>
      )}

      {isLoading ? (
        <TableSkeleton rows={5} columns={8} />
      ) : !transactions || transactions.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title="No recurring transactions"
          description="Add recurring transactions to automatically track regular income or expenses."
          actionLabel="Add Recurring"
          onAction={() => setFormOpen(true)}
        />
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          No {activeTab} recurring transactions
        </div>
      ) : (
        <RecurringList transactions={filtered} onEdit={handleEdit} />
      )}

      <RecurringForm
        open={formOpen}
        onOpenChange={handleFormClose}
        editingTransaction={editing}
      />
    </div>
  );
}
