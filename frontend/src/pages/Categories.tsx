import { FolderOpen } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { ListSkeleton } from '@/components/shared/LoadingSkeleton';
import { CategoryList } from '@/components/categories/CategoryList';
import { useCategories } from '@/hooks/useCategories';

export default function Categories() {
  const { data: categories = [], isLoading } = useCategories();

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const incomeCategories = categories.filter((c) => c.type === 'income');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
        <p className="text-muted-foreground">
          Manage your transaction categories and subcategories
        </p>
      </div>

      {isLoading ? (
        <ListSkeleton rows={6} />
      ) : categories.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No categories yet"
          description="Categories are created automatically when you add transactions. Start by creating a transaction with a new category name."
        />
      ) : (
        <div className="space-y-8">
          {expenseCategories.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Expense Categories</h2>
              <CategoryList categories={expenseCategories} />
            </section>
          )}

          {incomeCategories.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Income Categories</h2>
              <CategoryList categories={incomeCategories} />
            </section>
          )}
        </div>
      )}
    </div>
  );
}
