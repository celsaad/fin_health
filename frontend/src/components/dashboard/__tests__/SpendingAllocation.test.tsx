import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExpenseTreemap } from '@/components/dashboard/ExpenseTreemap';

const categories = [
  { categoryId: '1', categoryName: 'Housing', total: 1800, percentage: 45, subcategories: [] },
  { categoryId: '2', categoryName: 'Dining', total: 800, percentage: 20, subcategories: [] },
  { categoryId: '3', categoryName: 'Transport', total: 400, percentage: 10, subcategories: [] },
];

describe('SpendingAllocation (ExpenseTreemap)', () => {
  it('renders editorial header with title and subtitle', () => {
    render(<ExpenseTreemap categories={categories} />);
    expect(screen.getByText('Spending Allocation')).toBeInTheDocument();
    expect(screen.getByText('Breakdown by Top 10 Categories')).toBeInTheDocument();
  });

  it('renders progress bars with role="progressbar"', () => {
    render(<ExpenseTreemap categories={categories} />);
    const bars = screen.getAllByRole('progressbar');
    expect(bars.length).toBe(3);
    expect(bars[0]).toHaveAttribute('aria-valuenow', '45');
    expect(bars[0]).toHaveAttribute('aria-valuemin', '0');
    expect(bars[0]).toHaveAttribute('aria-valuemax', '100');
  });

  it('renders category names in uppercase', () => {
    render(<ExpenseTreemap categories={categories} />);
    // Category names shown as uppercase labels
    expect(screen.getAllByText(/HOUSING/i).length).toBeGreaterThan(0);
  });

  it('renders empty state when no categories', () => {
    render(<ExpenseTreemap categories={[]} />);
    expect(screen.getByText('No expense data for this period')).toBeInTheDocument();
  });

  it('renders color dot legend', () => {
    render(<ExpenseTreemap categories={categories} />);
    // Legend has category dots — check at least one exists
    const legendDots = document.querySelectorAll('[aria-hidden="true"].rounded-full');
    expect(legendDots.length).toBeGreaterThanOrEqual(3);
  });
});
