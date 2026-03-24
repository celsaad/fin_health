import React from 'react';
import { waitFor } from '@testing-library/react-native';
import { renderWithTheme } from '../../test-utils';
import SummaryCards from '../../../components/dashboard/SummaryCards';
import type { DashboardSummary } from '../../../types/dashboard';

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, ...props }: any) =>
      React.createElement(View, { testID: 'linear-gradient', ...props }, children),
  };
});

const mockSummary: DashboardSummary = {
  totalIncome: 5000,
  totalExpenses: 3200,
  net: 1800,
  transactionCount: 42,
};

describe('SummaryCards', () => {
  it('renders net balance with formatted currency', async () => {
    const { getByText } = renderWithTheme(
      <SummaryCards summary={mockSummary} netChangePercent={null} />,
    );
    await waitFor(() => {
      expect(getByText('$1,800.00')).toBeTruthy();
    });
  });

  it('renders income, expenses, and transaction count', async () => {
    const { getByText } = renderWithTheme(
      <SummaryCards summary={mockSummary} netChangePercent={null} />,
    );
    await waitFor(() => {
      expect(getByText('$5,000.00')).toBeTruthy();
      expect(getByText('$3,200.00')).toBeTruthy();
      expect(getByText('42')).toBeTruthy();
    });
  });

  it('shows MoM badge when netChangePercent is provided', async () => {
    const { getByText } = renderWithTheme(
      <SummaryCards summary={mockSummary} netChangePercent={12.5} />,
    );
    await waitFor(() => {
      expect(getByText(/12\.5%/)).toBeTruthy();
    });
  });

  it('hides MoM badge when netChangePercent is null', async () => {
    const { queryByText } = renderWithTheme(
      <SummaryCards summary={mockSummary} netChangePercent={null} />,
    );
    await waitFor(() => {
      expect(queryByText(/vs last month/)).toBeNull();
    });
  });
});
