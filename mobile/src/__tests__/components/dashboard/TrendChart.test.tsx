import React from 'react';
import { waitFor } from '@testing-library/react-native';
import { renderWithTheme } from '../../test-utils';
import TrendChart from '../../../components/dashboard/TrendChart';
import type { TrendItem } from '../../../types/dashboard';

const mockTrend: TrendItem[] = [
  { month: 10, year: 2025, income: 4000, expense: 3000 },
  { month: 11, year: 2025, income: 4500, expense: 3500 },
  { month: 12, year: 2025, income: 5000, expense: 2800 },
];

describe('TrendChart', () => {
  it('renders month labels', async () => {
    const { getByText } = renderWithTheme(<TrendChart trend={mockTrend} />);
    await waitFor(() => {
      expect(getByText('Oct')).toBeTruthy();
      expect(getByText('Nov')).toBeTruthy();
      expect(getByText('Dec')).toBeTruthy();
    });
  });

  it('renders section title', async () => {
    const { getByText } = renderWithTheme(<TrendChart trend={mockTrend} />);
    await waitFor(() => {
      expect(getByText('Cash Flow Trend')).toBeTruthy();
    });
  });

  it('renders legend labels', async () => {
    const { getByText } = renderWithTheme(<TrendChart trend={mockTrend} />);
    await waitFor(() => {
      expect(getByText('INCOME')).toBeTruthy();
      expect(getByText('EXPENSE')).toBeTruthy();
    });
  });
});
