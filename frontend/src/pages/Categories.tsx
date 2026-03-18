import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FolderOpen } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { ListSkeleton } from '@/components/shared/LoadingSkeleton';
import { QueryError } from '@/components/shared/QueryError';
import { CategoryList } from '@/components/categories/CategoryList';
import { useCategories } from '@/hooks/useCategories';

export default function Categories() {
  const { t } = useTranslation();
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
          <h1 className="text-2xl font-bold tracking-tight">{t('categories.title')}</h1>
          <p className="text-muted-foreground">{t('categories.subtitle')}</p>
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
              {type === 'expense' ? t('categories.expense') : t('categories.income')}
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
          title={t('categories.noCategories')}
          description={t('categories.noCategoriesDesc')}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {activeType === 'expense'
                ? t('categories.expenseCategories')
                : t('categories.incomeCategories')}
            </h2>
            <span className="text-sm text-muted-foreground">
              {t('categories.total', { count })}
            </span>
          </div>
          {count > 0 ? (
            <CategoryList categories={displayedCategories} />
          ) : (
            <p className="py-8 text-center text-muted-foreground">
              {t('categories.noTypeCategories', { type: activeType })}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
