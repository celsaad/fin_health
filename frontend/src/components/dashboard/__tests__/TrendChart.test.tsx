import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TrendChart } from '@/components/dashboard/TrendChart';

// Mock recharts — return children so we can inspect structure
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: ({ dataKey }: { dataKey: string }) => <div data-testid={`bar-${dataKey}`} />,
  Cell: () => null,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => null,
  Legend: () => null,
}));

const trendData = [
  { month: 10, year: 2025, income: 4000, expenses: 3000 },
  { month: 11, year: 2025, income: 4200, expenses: 3200 },
  { month: 12, year: 2025, income: 4500, expenses: 2800 },
];

describe('TrendChart', () => {
  it('renders editorial header with title and subtitle', () => {
    render(<TrendChart trend={trendData} />);
    expect(screen.getByText('Cash Flow Trend')).toBeInTheDocument();
    expect(screen.getByText('Income vs Expenses Analysis')).toBeInTheDocument();
  });

  it('does not render CartesianGrid or YAxis', () => {
    render(<TrendChart trend={trendData} />);
    expect(screen.queryByTestId('cartesian-grid')).not.toBeInTheDocument();
    expect(screen.queryByTestId('y-axis')).not.toBeInTheDocument();
  });

  it('renders income and expense bars', () => {
    render(<TrendChart trend={trendData} />);
    expect(screen.getByTestId('bar-income')).toBeInTheDocument();
    expect(screen.getByTestId('bar-expenses')).toBeInTheDocument();
  });

  it('renders empty state when no data', () => {
    render(<TrendChart trend={[]} />);
    expect(screen.getByText('No trend data available')).toBeInTheDocument();
  });
});
