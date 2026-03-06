import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMemo } from 'react';
import { useCategories } from '@/hooks/useCategories';
import type { TransactionFilters as Filters } from '@/hooks/useTransactions';

interface TransactionFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

export function TransactionFilters({
  filters,
  onFilterChange,
}: TransactionFiltersProps) {
  const { data: categories = [] } = useCategories();

  const handleTypeChange = (value: string) => {
    onFilterChange({
      ...filters,
      type: value === 'all' ? '' : (value as 'expense' | 'income'),
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
  };

  const handleSubcategoryChange = (value: string) => {
    onFilterChange({
      ...filters,
      subcategoryId: value === 'all' ? '' : value,
      page: 1,
    });
  };

  const subcategories = useMemo(() => {
    if (!filters.categoryId) return [];
    const category = categories.find((c) => c.id === filters.categoryId);
    return category?.subcategories ?? [];
  }, [categories, filters.categoryId]);

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
    <div className="flex flex-wrap items-end gap-4">
      <div className="grid gap-1.5">
        <Label className="text-xs text-muted-foreground">Type</Label>
        <Select
          value={filters.type || 'all'}
          onValueChange={handleTypeChange}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
            <SelectItem value="income">Income</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5">
        <Label className="text-xs text-muted-foreground">Category</Label>
        <Select
          value={filters.categoryId || 'all'}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {subcategories.length > 0 && (
        <div className="grid gap-1.5">
          <Label className="text-xs text-muted-foreground">Subcategory</Label>
          <Select
            value={filters.subcategoryId || 'all'}
            onValueChange={handleSubcategoryChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All subcategories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All subcategories</SelectItem>
              {subcategories.map((sub) => (
                <SelectItem key={sub.id} value={sub.id}>
                  {sub.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid gap-1.5">
        <Label className="text-xs text-muted-foreground">Start date</Label>
        <Input
          type="date"
          value={filters.startDate || ''}
          onChange={handleStartDateChange}
          className="w-[160px]"
        />
      </div>

      <div className="grid gap-1.5">
        <Label className="text-xs text-muted-foreground">End date</Label>
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
