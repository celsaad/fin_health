import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BudgetComplianceTable } from '@/components/dashboard/BudgetComplianceTable';
import type { CategorySpending } from '@/hooks/useDashboard';
import type { Budget } from '@/hooks/useBudgets';

const categories: CategorySpending[] = [
  { categoryId: 'c1', categoryName: 'Housing', total: 1800, percentage: 45, subcategories: [] },
  { categoryId: 'c2', categoryName: 'Dining', total: 600, percentage: 15, subcategories: [] },
];

const budgets: Budget[] = [
  { id: 'b1', amount: 2000, month: 3, year: 2026, isRecurring: false, categoryId: 'c1', category: { id: 'c1', name: 'Housing', icon: null, color: null }, spent: 1800, remaining: 200 },
  { id: 'b2', amount: 400, month: 3, year: 2026, isRecurring: false, categoryId: 'c2', category: { id: 'c2', name: 'Dining', icon: null, color: null }, spent: 600, remaining: -200 },
];

function renderTable(props: { categories: CategorySpending[]; budgets: Budget[] }) {
  return render(
    <MemoryRouter>
      <BudgetComplianceTable {...props} />
    </MemoryRouter>,
  );
}

describe('BudgetComplianceTable', () => {
  it('renders table header', () => {
    renderTable({ categories, budgets });
    expect(screen.getByText('Budget Compliance')).toBeInTheDocument();
    expect(screen.getByText('Monthly category tracking')).toBeInTheDocument();
  });

  it('shows ON TRACK badge for within-budget category', () => {
    renderTable({ categories, budgets });
    expect(screen.getByText('On Track')).toBeInTheDocument();
  });

  it('shows OVER BUDGET badge for over-budget category', () => {
    renderTable({ categories, budgets });
    expect(screen.getByText('Over Budget')).toBeInTheDocument();
  });

  it('shows negative remaining in destructive color', () => {
    renderTable({ categories, budgets });
    // The Dining remaining is -$200 — use regex for cross-env currency format
    const negativeRemaining = screen.getByText(/-\$200/);
    expect(negativeRemaining.closest('td')?.className).toContain('text-destructive');
  });

  it('only shows categories that have budgets', () => {
    const extraCategory: CategorySpending = {
      categoryId: 'c3', categoryName: 'Shopping', total: 300, percentage: 8, subcategories: [],
    };
    renderTable({ categories: [...categories, extraCategory], budgets });
    // Shopping should NOT appear (no budget set)
    expect(screen.queryByText('Shopping')).not.toBeInTheDocument();
  });

  it('renders empty state when no budgets exist', () => {
    renderTable({ categories, budgets: [] });
    expect(screen.getByText('No budgets yet')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /budgets/i })).toHaveAttribute('href', '/budgets');
  });
});
