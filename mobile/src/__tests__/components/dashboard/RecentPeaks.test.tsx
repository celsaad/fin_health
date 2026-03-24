import React from 'react';
import { waitFor } from '@testing-library/react-native';
import { renderWithTheme } from '../../test-utils';
import RecentPeaks from '../../../components/dashboard/RecentPeaks';
import type { Transaction } from '@fin-health/shared/types';

const mockTransactions: Transaction[] = [
  {
    id: '1',
    amount: 250,
    type: 'expense',
    description: 'Grocery Store',
    date: '2026-03-15T00:00:00Z',
    category: { id: 'c1', name: 'Food', type: 'expense', icon: 'utensils', color: 'orange' },
    createdAt: '2026-03-15T00:00:00Z',
    updatedAt: '2026-03-15T00:00:00Z',
  },
  {
    id: '2',
    amount: 180,
    type: 'expense',
    description: 'Electric Bill',
    date: '2026-03-10T00:00:00Z',
    category: { id: 'c2', name: 'Utilities', type: 'expense', icon: 'zap', color: 'amber' },
    createdAt: '2026-03-10T00:00:00Z',
    updatedAt: '2026-03-10T00:00:00Z',
  },
];

describe('RecentPeaks', () => {
  it('renders transaction descriptions', async () => {
    const { getByText } = renderWithTheme(
      <RecentPeaks transactions={mockTransactions} isLoading={false} />,
    );
    await waitFor(() => {
      expect(getByText('Grocery Store')).toBeTruthy();
      expect(getByText('Electric Bill')).toBeTruthy();
    });
  });

  it('renders formatted amounts', async () => {
    const { getByText } = renderWithTheme(
      <RecentPeaks transactions={mockTransactions} isLoading={false} />,
    );
    await waitFor(() => {
      expect(getByText('$250.00')).toBeTruthy();
      expect(getByText('$180.00')).toBeTruthy();
    });
  });

  it('shows empty state when no transactions', async () => {
    const { getByText } = renderWithTheme(
      <RecentPeaks transactions={[]} isLoading={false} />,
    );
    await waitFor(() => {
      expect(getByText('No transactions this month')).toBeTruthy();
    });
  });

  it('shows loading skeletons', async () => {
    const { queryByText } = renderWithTheme(
      <RecentPeaks transactions={[]} isLoading={true} />,
    );
    await waitFor(() => {
      expect(queryByText('No transactions this month')).toBeNull();
    });
  });
});
