import React from 'react';
import { waitFor } from '@testing-library/react-native';
import { renderWithTheme } from '../../test-utils';
import BudgetComplianceTable from '../../../components/dashboard/BudgetComplianceTable';
import type { BreakdownItem } from '../../../types/dashboard';
import type { Budget } from '@fin-health/shared/types';

const mockCategories: BreakdownItem[] = [
  { categoryId: '1', categoryName: 'Food', total: 400, percentage: 40, icon: 'utensils', color: 'orange' },
  { categoryId: '2', categoryName: 'Transport', total: 250, percentage: 25, icon: 'car', color: 'blue' },
];

const mockBudgets: Budget[] = [
  { id: 'b1', amount: 500, month: 3, year: 2026, isRecurring: false, categoryId: '1', category: { id: '1', name: 'Food', icon: 'utensils', color: 'orange' }, spent: 400, remaining: 100 },
  { id: 'b2', amount: 200, month: 3, year: 2026, isRecurring: false, categoryId: '2', category: { id: '2', name: 'Transport', icon: 'car', color: 'blue' }, spent: 250, remaining: -50 },
] as Budget[];

describe('BudgetComplianceTable', () => {
  it('renders category names that have budgets', async () => {
    const { getByText } = renderWithTheme(
      <BudgetComplianceTable categories={mockCategories} budgets={mockBudgets} />,
    );
    await waitFor(() => {
      expect(getByText('Food')).toBeTruthy();
      expect(getByText('Transport')).toBeTruthy();
    });
  });

  it('shows On Track for under-budget categories', async () => {
    const { getByText } = renderWithTheme(
      <BudgetComplianceTable categories={mockCategories} budgets={mockBudgets} />,
    );
    await waitFor(() => {
      expect(getByText('On Track')).toBeTruthy();
    });
  });

  it('shows Over Budget for over-budget categories', async () => {
    const { getByText } = renderWithTheme(
      <BudgetComplianceTable categories={mockCategories} budgets={mockBudgets} />,
    );
    await waitFor(() => {
      expect(getByText('Over Budget')).toBeTruthy();
    });
  });

  it('renders section title', async () => {
    const { getByText } = renderWithTheme(
      <BudgetComplianceTable categories={mockCategories} budgets={mockBudgets} />,
    );
    await waitFor(() => {
      expect(getByText('Budget Compliance')).toBeTruthy();
    });
  });
});
