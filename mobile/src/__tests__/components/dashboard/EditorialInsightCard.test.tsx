import React from 'react';
import { waitFor } from '@testing-library/react-native';
import { renderWithTheme } from '../../test-utils';
import EditorialInsightCard from '../../../components/dashboard/EditorialInsightCard';
import type { Insight } from '../../../services/dashboard';

const mockInsights: Insight[] = [
  {
    type: 'pace',
    title: 'Spending Pace',
    description: 'You are spending 20% more than last month at this point.',
    sentiment: 'negative',
  },
  {
    type: 'increase',
    title: 'Income Up',
    description: 'Your income increased by 10%.',
    sentiment: 'positive',
  },
];

describe('EditorialInsightCard', () => {
  it('renders top insight description when pro', async () => {
    const { getByText } = renderWithTheme(
      <EditorialInsightCard insights={mockInsights} isPro={true} />,
    );
    await waitFor(() => {
      expect(getByText(/spending 20% more/)).toBeTruthy();
    });
  });

  it('shows see-all link when multiple insights', async () => {
    const { getByText } = renderWithTheme(
      <EditorialInsightCard insights={mockInsights} isPro={true} />,
    );
    await waitFor(() => {
      expect(getByText(/See all 2 insights/)).toBeTruthy();
    });
  });

  it('shows upgrade button when not pro', async () => {
    const { getByText } = renderWithTheme(
      <EditorialInsightCard insights={mockInsights} isPro={false} />,
    );
    await waitFor(() => {
      expect(getByText('Upgrade to Pro')).toBeTruthy();
    });
  });

  it('renders nothing when no insights', async () => {
    const { toJSON } = renderWithTheme(
      <EditorialInsightCard insights={[]} isPro={true} />,
    );
    await waitFor(() => {
      expect(toJSON()).toBeNull();
    });
  });
});
