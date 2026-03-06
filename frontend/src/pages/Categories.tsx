import { useState } from 'react';
import { FolderOpen } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { ListSkeleton } from '@/components/shared/LoadingSkeleton';
import { QueryError } from '@/components/shared/QueryError';
import { CategoryList } from '@/components/categories/CategoryList';
import { useCategories } from '@/hooks/useCategories';

export default function Categories() {
  const { data: categories = [], isLoading, isError, refetch } = useCategories();
  const [activeType, setActiveType] = useState<'expense' | 'income'>('expense');

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const incomeCategories = categories.filter((c) => c.type === 'income');

  const displayedCategories = activeType === 'expense' ? expenseCategories : incomeCategories;
  const count = displayedCategories.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage your transaction categories and subcategories
          </p>
        </div>

        {/* Segmented control */}
        <div className="inline-flex rounded-full border border-border p-1 gap-0.5">
          {(['expense', 'income'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeType === type
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {type === 'expense' ? 'Expense' : 'Income'}
            </button>
          ))}
        </div>
      </div>

      {isError ? (
        <QueryError onRetry={refetch} />
      ) : isLoading ? (
        <ListSkeleton rows={6} />
      ) : categories.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No categories yet"
          description="Categories are created automatically when you add transactions. Start by creating a transaction with a new category name."
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {activeType === 'expense' ? 'Expense' : 'Income'} Categories
            </h2>
            <span className="text-sm text-muted-foreground">{count} Total</span>
          </div>
          {count > 0 ? (
            <CategoryList categories={displayedCategories} />
          ) : (
            <p className="py-8 text-center text-muted-foreground">No {activeType} categories yet</p>
          )}
        </div>
      )}
    </div>
  );
}
