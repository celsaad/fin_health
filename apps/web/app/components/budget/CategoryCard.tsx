/**
 * Category card component
 */

import { Card } from '../ui/Card';
import { ProgressBar } from './ProgressBar';
import { format } from '@fin-health/domain';
import type { CategoryBudgetSummary } from '@fin-health/domain';

interface CategoryCardProps {
  category: CategoryBudgetSummary;
  currency?: string;
}

export function CategoryCard({ category, currency = 'USD' }: CategoryCardProps) {
  const isOverBudget = category.spentCents > category.allocatedCents;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{category.categoryName}</h3>
        <span
          className={`text-xl font-bold ${
            isOverBudget ? 'text-red-600' : 'text-green-600'
          }`}
        >
          {format(category.remainingCents, currency)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Spent</p>
          <p className="text-lg font-semibold text-gray-900">
            {format(category.spentCents, currency)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Budget</p>
          <p className="text-lg font-semibold text-gray-900">
            {format(category.allocatedCents, currency)}
          </p>
        </div>
      </div>

      <ProgressBar current={category.spentCents} total={category.allocatedCents} />

      {category.subcategories.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            {category.subcategories.length} subcategories
          </p>
        </div>
      )}
    </Card>
  );
}
