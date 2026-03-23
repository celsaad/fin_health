import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock getCategoryIcon
vi.mock('@/lib/categoryIcons', () => ({
  getCategoryIcon: () => ({
    icon: ({ className }: { className?: string }) => <span data-testid="icon" className={className} />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    darkBgColor: 'dark:bg-orange-950',
  }),
}));

import { RecentPeaks } from '@/components/dashboard/RecentPeaks';

const transactions = [
  {
    id: '1',
    amount: 1842,
    type: 'expense' as const,
    description: 'Sweetgreen',
    date: '2026-03-24',
    category: { id: 'c1', name: 'Dining', type: 'expense' },
    createdAt: '2026-03-24T00:00:00Z',
    updatedAt: '2026-03-24T00:00:00Z',
  },
  {
    id: '2',
    amount: 500,
    type: 'expense' as const,
    description: 'Uber',
    date: '2026-03-22',
    category: { id: 'c2', name: 'Transport', type: 'expense' },
    createdAt: '2026-03-22T00:00:00Z',
    updatedAt: '2026-03-22T00:00:00Z',
  },
];

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('RecentPeaks', () => {
  it('renders transaction descriptions', () => {
    renderWithRouter(<RecentPeaks transactions={transactions} isLoading={false} />);
    expect(screen.getByText('Sweetgreen')).toBeInTheDocument();
    expect(screen.getByText('Uber')).toBeInTheDocument();
  });

  it('renders "View All Transactions" link', () => {
    renderWithRouter(<RecentPeaks transactions={transactions} isLoading={false} />);
    const link = screen.getByRole('link', { name: /view all transactions/i });
    expect(link).toHaveAttribute('href', '/transactions');
  });

  it('renders loading skeletons when isLoading', () => {
    const { container } = renderWithRouter(
      <RecentPeaks transactions={undefined} isLoading={true} />,
    );
    const pulses = container.querySelectorAll('.animate-pulse');
    expect(pulses.length).toBeGreaterThan(0);
  });

  it('renders empty state message when no transactions', () => {
    renderWithRouter(<RecentPeaks transactions={[]} isLoading={false} />);
    expect(screen.getByText('No expenses for this period')).toBeInTheDocument();
  });
});
