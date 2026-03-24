import React from 'react';
import { waitFor } from '@testing-library/react-native';
import { renderWithTheme } from '../test-utils';
import DashboardScreen from '../../screens/DashboardScreen';

// Mock all service functions
jest.mock('../../services/dashboard', () => ({
  getSummary: jest.fn().mockResolvedValue({ totalIncome: 5000, totalExpenses: 3200, net: 1800, transactionCount: 42 }),
  getBreakdown: jest.fn().mockResolvedValue({ breakdown: [] }),
  getTrend: jest.fn().mockResolvedValue({ trend: [] }),
  getInsights: jest.fn().mockResolvedValue({ insights: [] }),
  getRecentPeaks: jest.fn().mockResolvedValue({ transactions: [] }),
}));
jest.mock('../../services/budgets', () => ({
  getBudgets: jest.fn().mockResolvedValue({ budgets: [] }),
}));
jest.mock('../../hooks/usePlan', () => ({
  usePlan: () => ({ isPro: false, isFree: true, isTrialing: false }),
}));
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { name: 'Test User' }, isAuthenticated: true }),
}));

describe('DashboardScreen', () => {
  it('renders without crashing and shows greeting', async () => {
    const { getByText } = renderWithTheme(<DashboardScreen />);
    await waitFor(() => {
      expect(getByText(/Hey,/)).toBeTruthy();
    });
  });

  it('shows summary cards after data loads', async () => {
    const { getByText } = renderWithTheme(<DashboardScreen />);
    await waitFor(() => {
      expect(getByText('$1,800.00')).toBeTruthy();
    });
  });
});
