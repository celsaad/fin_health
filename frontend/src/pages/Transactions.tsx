import { useState, useCallback } from 'react';
import { Plus, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/shared/SearchInput';
import { EmptyState } from '@/components/shared/EmptyState';
import { QueryError } from '@/components/shared/QueryError';
import { Pagination } from '@/components/shared/Pagination';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { TransactionFilters } from '@/components/transactions/TransactionFilters';
import { TransactionList } from '@/components/transactions/TransactionList';
import { ExportButton } from '@/components/transactions/ExportButton';
import { useTransactions, type TransactionFilters as Filters } from '@/hooks/useTransactions';

export default function Transactions() {
  const [formOpen, setFormOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    page: 1,
    limit: 20,
    type: '',
    categoryId: '',
    startDate: '',
    endDate: '',
    search: '',
    sortBy: 'date',
    sortOrder: 'desc',
  });

  const { data, isLoading, isError, refetch } = useTransactions(filters);

  const transactions = data?.transactions ?? [];
  const pagination = data?.pagination;

  const handleSearchChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  }, []);

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (limit: number) => {
    setFilters((prev) => ({ ...prev, limit, page: 1 }));
  };

  const hasActiveFilters =
    filters.type || filters.categoryId || filters.startDate || filters.endDate;
  const isEmpty = !isLoading && transactions.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">Manage your income and expenses</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton filters={filters} />
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="size-4" />
            Add Transaction
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="sr-only">Transaction List</CardTitle>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <TransactionFilters filters={filters} onFilterChange={setFilters} />
            <SearchInput
              value={filters.search}
              onChange={handleSearchChange}
              placeholder="Search transactions..."
              className="sm:w-64"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isError ? (
            <QueryError onRetry={refetch} />
          ) : isLoading ? (
            <TableSkeleton rows={5} columns={5} />
          ) : isEmpty ? (
            <EmptyState
              icon={Receipt}
              title={
                filters.search || hasActiveFilters ? 'No transactions found' : 'No transactions yet'
              }
              description={
                filters.search || hasActiveFilters
                  ? 'Try adjusting your search or filters.'
                  : 'Get started by adding your first transaction.'
              }
              actionLabel={filters.search || hasActiveFilters ? undefined : 'Add Transaction'}
              onAction={filters.search || hasActiveFilters ? undefined : () => setFormOpen(true)}
            />
          ) : (
            <div className="space-y-4">
              <TransactionList transactions={transactions} />
              {pagination && pagination.totalPages > 1 && (
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  pageSize={pagination.limit}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <TransactionForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
