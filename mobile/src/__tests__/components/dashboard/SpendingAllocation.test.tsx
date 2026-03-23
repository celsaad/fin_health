import React from 'react';
import { waitFor } from '@testing-library/react-native';
import { renderWithTheme } from '../../test-utils';
import SpendingAllocation from '../../../components/dashboard/SpendingAllocation';
import type { BreakdownItem } from '../../../types/dashboard';

const mockBreakdown: BreakdownItem[] = [
  { categoryId: '1', categoryName: 'Food', total: 500, percentage: 50, icon: 'utensils', color: 'orange' },
  { categoryId: '2', categoryName: 'Transport', total: 300, percentage: 30, icon: 'car', color: 'blue' },
  { categoryId: '3', categoryName: 'Entertainment', total: 200, percentage: 20, icon: null, color: null },
];

describe('SpendingAllocation', () => {
  it('renders category names', async () => {
    const { getByText } = renderWithTheme(
      <SpendingAllocation breakdown={mockBreakdown} />,
    );
    await waitFor(() => {
      expect(getByText('Food')).toBeTruthy();
      expect(getByText('Transport')).toBeTruthy();
      expect(getByText('Entertainment')).toBeTruthy();
    });
  });

  it('renders total spent in header', async () => {
    const { getByText } = renderWithTheme(
      <SpendingAllocation breakdown={mockBreakdown} />,
    );
    await waitFor(() => {
      expect(getByText('$1,000.00')).toBeTruthy();
    });
  });

  it('shows empty state when no breakdown', async () => {
    const { getByText } = renderWithTheme(
      <SpendingAllocation breakdown={[]} />,
    );
    await waitFor(() => {
      expect(getByText('No expenses this month')).toBeTruthy();
    });
  });
});
