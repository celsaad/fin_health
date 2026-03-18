import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { X, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useCategories } from '@/hooks/useCategories';
import { useIsMobile } from '@/hooks/useIsMobile';
import type { TransactionFilters as Filters } from '@/hooks/useTransactions';

interface TransactionFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

function FilterChip({
  label,
  active,
  onClick,
  onClear,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  onClear?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? 'bg-primary text-primary-foreground border-primary'
          : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
    >
      {label}
      {active && onClear && (
        <X
          className="size-3.5"
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
        />
      )}
    </button>
  );
}

function FilterContent({ filters, onFilterChange }: TransactionFiltersProps) {
  const { t } = useTranslation();
  const { data: categories = [] } = useCategories();
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showSubcategoryPicker, setShowSubcategoryPicker] = useState(false);

  const handleTypeChange = (value: string) => {
    onFilterChange({
      ...filters,
      type: value === filters.type ? '' : (value as 'expense' | 'income'),
      page: 1,
    });
  };

  const handleCategoryChange = (value: string) => {
    onFilterChange({
      ...filters,
      categoryId: value === 'all' ? '' : value,
      subcategoryId: '',
      page: 1,
    });
    setShowCategoryPicker(false);
  };

  const handleSubcategoryChange = (value: string) => {
    onFilterChange({
      ...filters,
      subcategoryId: value === 'all' ? '' : value,
      page: 1,
    });
    setShowSubcategoryPicker(false);
  };

  const subcategories = useMemo(() => {
    if (!filters.categoryId) return [];
    const category = categories.find((c) => c.id === filters.categoryId);
    return category?.subcategories ?? [];
  }, [categories, filters.categoryId]);

  const selectedCategory = categories.find((c) => c.id === filters.categoryId);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      startDate: e.target.value,
      page: 1,
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      endDate: e.target.value,
      page: 1,
    });
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* Type filter chips */}
      <div className="flex items-center gap-2">
        <FilterChip
          label={t('transactions.all')}
          active={!filters.type}
          onClick={() => onFilterChange({ ...filters, type: '', page: 1 })}
        />
        <FilterChip
          label={t('transactions.expense')}
          active={filters.type === 'expense'}
          onClick={() => handleTypeChange('expense')}
          onClear={() => onFilterChange({ ...filters, type: '', page: 1 })}
        />
        <FilterChip
          label={t('transactions.income')}
          active={filters.type === 'income'}
          onClick={() => handleTypeChange('income')}
          onClear={() => onFilterChange({ ...filters, type: '', page: 1 })}
        />
      </div>

      {/* Category chip with dropdown */}
      <div className="relative">
        <FilterChip
          label={selectedCategory ? selectedCategory.name : t('transactions.categoryLabel')}
          active={!!filters.categoryId}
          onClick={() => setShowCategoryPicker(!showCategoryPicker)}
          onClear={filters.categoryId ? () => handleCategoryChange('all') : undefined}
        />
        {showCategoryPicker && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowCategoryPicker(false)} />
            <div className="absolute left-0 top-full z-20 mt-1 max-h-60 w-48 overflow-y-auto rounded-lg border bg-popover p-1 shadow-md">
              <button
                className="w-full rounded-md px-3 py-1.5 text-left text-sm hover:bg-muted"
                onClick={() => handleCategoryChange('all')}
              >
                {t('transactions.allCategories')}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className="w-full rounded-md px-3 py-1.5 text-left text-sm hover:bg-muted"
                  onClick={() => handleCategoryChange(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Subcategory chip with dropdown */}
      {subcategories.length > 0 && (
        <div className="relative">
          <FilterChip
            label={
              filters.subcategoryId
                ? (subcategories.find((s) => s.id === filters.subcategoryId)?.name ??
                  t('transactions.subcategory'))
                : t('transactions.subcategory')
            }
            active={!!filters.subcategoryId}
            onClick={() => setShowSubcategoryPicker(!showSubcategoryPicker)}
            onClear={filters.subcategoryId ? () => handleSubcategoryChange('all') : undefined}
          />
          {showSubcategoryPicker && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowSubcategoryPicker(false)} />
              <div className="absolute left-0 top-full z-20 mt-1 max-h-60 w-48 overflow-y-auto rounded-lg border bg-popover p-1 shadow-md">
                <button
                  className="w-full rounded-md px-3 py-1.5 text-left text-sm hover:bg-muted"
                  onClick={() => handleSubcategoryChange('all')}
                >
                  {t('transactions.allSubcategories')}
                </button>
                {subcategories.map((sub) => (
                  <button
                    key={sub.id}
                    className="w-full rounded-md px-3 py-1.5 text-left text-sm hover:bg-muted"
                    onClick={() => handleSubcategoryChange(sub.id)}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Date filters */}
      <div className="grid gap-1.5">
        <Label className="text-xs text-muted-foreground">{t('transactions.startDate')}</Label>
        <Input
          type="date"
          value={filters.startDate || ''}
          onChange={handleStartDateChange}
          className="w-[160px]"
        />
      </div>

      <div className="grid gap-1.5">
        <Label className="text-xs text-muted-foreground">{t('transactions.endDate')}</Label>
        <Input
          type="date"
          value={filters.endDate || ''}
          onChange={handleEndDateChange}
          className="w-[160px]"
        />
      </div>
    </div>
  );
}

export function TransactionFilters({ filters, onFilterChange }: TransactionFiltersProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);

  const activeCount =
    (filters.type ? 1 : 0) +
    (filters.categoryId ? 1 : 0) +
    (filters.subcategoryId ? 1 : 0) +
    (filters.startDate ? 1 : 0) +
    (filters.endDate ? 1 : 0);

  if (!isMobile) {
    return <FilterContent filters={filters} onFilterChange={onFilterChange} />;
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setSheetOpen(true)}
        aria-label={t('transactions.openFilters')}
        className="relative"
      >
        <SlidersHorizontal className="size-4" />
        <span>{t('transactions.filters')}</span>
        {activeCount > 0 && (
          <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {activeCount}
          </span>
        )}
      </Button>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle>{t('transactions.filters')}</SheetTitle>
              {activeCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onFilterChange({
                      ...filters,
                      type: '',
                      categoryId: '',
                      subcategoryId: '',
                      startDate: '',
                      endDate: '',
                      page: 1,
                    });
                  }}
                >
                  {t('transactions.clearFilters')}
                </Button>
              )}
            </div>
          </SheetHeader>
          <div className="px-4 pb-6">
            <FilterContent filters={filters} onFilterChange={onFilterChange} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
