import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PlusCircle, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { QueryError } from '@/components/shared/QueryError';
import { RecurringForm } from '@/components/recurring/RecurringForm';
import { RecurringList } from '@/components/recurring/RecurringList';
import { useRecurringTransactions, type RecurringTransaction } from '@/hooks/useRecurring';

export default function RecurringTransactions() {
  const { t } = useTranslation();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RecurringTransaction | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'paused'>('active');

  const { data: transactions, isLoading, isError, refetch } = useRecurringTransactions();

  const filtered = useMemo(() => {
    if (!transactions) return [];
    return transactions.filter((t) => (activeTab === 'active' ? t.isActive : !t.isActive));
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
          <h1 className="text-2xl font-bold">{t('recurring.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('recurring.subtitle')}</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <PlusCircle className="size-4" />
          {t('recurring.addButton')}
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
            {t('recurring.active')} ({activeCount})
          </button>
          <button
            onClick={() => setActiveTab('paused')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'paused'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('recurring.paused')} ({pausedCount})
          </button>
        </div>
      )}

      {isError ? (
        <QueryError onRetry={refetch} />
      ) : isLoading ? (
        <TableSkeleton rows={5} columns={8} />
      ) : !transactions || transactions.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title={t('recurring.noRecurring')}
          description={t('recurring.noRecurringDesc')}
          actionLabel={t('recurring.addButton')}
          onAction={() => setFormOpen(true)}
        />
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          {t('recurring.noFilteredRecurring', { tab: activeTab })}
        </div>
      ) : (
        <RecurringList transactions={filtered} onEdit={handleEdit} />
      )}

      <RecurringForm open={formOpen} onOpenChange={handleFormClose} editingTransaction={editing} />
    </div>
  );
}
