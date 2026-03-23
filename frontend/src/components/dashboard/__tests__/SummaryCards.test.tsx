import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SummaryCards } from '@/components/dashboard/SummaryCards';

const baseSummary = {
  totalIncome: 5000,
  totalExpenses: 3000,
  net: 2000,
  transactionCount: 42,
};

describe('SummaryCards', () => {
  it('renders net balance card with gradient background', () => {
    render(<SummaryCards summary={baseSummary} netChangePercent={null} />);
    // Net balance card should have the gradient class
    const netCard = screen.getByText('Net Balance').closest('[data-slot="card"]');
    expect(netCard?.className).toContain('from-primary');
    expect(netCard?.className).toContain('to-primary-container');
  });

  it('shows month-over-month badge when netChangePercent is provided', () => {
    render(<SummaryCards summary={baseSummary} netChangePercent={12.5} />);
    expect(screen.getByText(/12\.5%/)).toBeInTheDocument();
    expect(screen.getByText(/vs last month/i)).toBeInTheDocument();
  });

  it('hides month-over-month badge when netChangePercent is null', () => {
    render(<SummaryCards summary={baseSummary} netChangePercent={null} />);
    expect(screen.queryByText(/vs last month/i)).not.toBeInTheDocument();
  });

  it('renders all four cards', () => {
    render(<SummaryCards summary={baseSummary} netChangePercent={null} />);
    expect(screen.getByText('Net Balance')).toBeInTheDocument();
    expect(screen.getByText('Income')).toBeInTheDocument();
    expect(screen.getByText('Expenses')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
  });

  it('renders income/expenses/count cards with hover lift', () => {
    render(<SummaryCards summary={baseSummary} netChangePercent={null} />);
    const incomeCard = screen.getByText('Income').closest('[data-slot="card"]');
    expect(incomeCard?.className).toContain('hover:translate-y');
  });
});
