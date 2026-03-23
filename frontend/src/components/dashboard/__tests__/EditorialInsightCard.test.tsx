import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const mockUsePlan = vi.fn();
const mockUseInsights = vi.fn();

vi.mock('@/hooks/usePlan', () => ({
  usePlan: () => mockUsePlan(),
}));

vi.mock('@/hooks/useDashboard', () => ({
  useInsights: (...args: unknown[]) => mockUseInsights(...args),
}));

import { EditorialInsightCard } from '@/components/dashboard/EditorialInsightCard';

describe('EditorialInsightCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows locked state with CTA when not pro', () => {
    mockUsePlan.mockReturnValue({ isPro: false });
    mockUseInsights.mockReturnValue({ data: undefined, isLoading: false });

    render(<EditorialInsightCard month={3} year={2026} />);

    expect(screen.getByText('Editorial Insight')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upgrade to pro/i })).toBeInTheDocument();
  });

  it('shows loading skeleton when pro and loading', () => {
    mockUsePlan.mockReturnValue({ isPro: true });
    mockUseInsights.mockReturnValue({ data: undefined, isLoading: true });

    const { container } = render(<EditorialInsightCard month={3} year={2026} />);

    // Should have pulse animation skeletons
    const pulseElements = container.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it('shows insight content when pro and data loaded', () => {
    mockUsePlan.mockReturnValue({ isPro: true });
    mockUseInsights.mockReturnValue({
      data: [{ type: 'pace', title: 'Great month!', description: 'You are saving more.', sentiment: 'positive' }],
      isLoading: false,
    });

    render(<EditorialInsightCard month={3} year={2026} />);

    expect(screen.getByText('Great month!')).toBeInTheDocument();
    expect(screen.getByText('You are saving more.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /upgrade to pro/i })).not.toBeInTheDocument();
  });
});
