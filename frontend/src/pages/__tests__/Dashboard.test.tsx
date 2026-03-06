import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from '@/pages/Dashboard';

// Mock the hooks to control data in tests
const mockUseSummary = vi.fn();
const mockUseBreakdown = vi.fn();
const mockUseTrend = vi.fn();
const mockUseBudgets = vi.fn();

vi.mock('@/hooks/useDashboard', () => ({
  useSummary: (...args: unknown[]) => mockUseSummary(...args),
  useBreakdown: (...args: unknown[]) => mockUseBreakdown(...args),
  useTrend: (...args: unknown[]) => mockUseTrend(...args),
}));

vi.mock('@/hooks/useBudgets', () => ({
  useBudgets: (...args: unknown[]) => mockUseBudgets(...args),
}));

// Mock recharts to avoid rendering issues in jsdom
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PieChart: () => <div data-testid="pie-chart" />,
  Pie: () => null,
  Cell: () => null,
  LineChart: () => <div data-testid="line-chart" />,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
}));

function renderDashboard() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <Dashboard />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('Dashboard page', () => {
  it('renders loading state', () => {
    mockUseSummary.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    });
    mockUseBreakdown.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    });
    mockUseTrend.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    });
    mockUseBudgets.mockReturnValue({ data: undefined });

    renderDashboard();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Your financial overview at a glance')).toBeInTheDocument();
  });

  it('renders error state with retry', () => {
    const mockRefetch = vi.fn();
    mockUseSummary.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    });
    mockUseBreakdown.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mockUseTrend.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mockUseBudgets.mockReturnValue({ data: undefined });

    renderDashboard();
    expect(screen.getByText('Failed to load data. Please try again.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('renders summary data when loaded', () => {
    mockUseSummary.mockReturnValue({
      data: { totalIncome: 5000, totalExpenses: 3000, net: 2000, transactionCount: 15 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mockUseBreakdown.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mockUseTrend.mockReturnValue({ data: [], isLoading: false, isError: false, refetch: vi.fn() });
    mockUseBudgets.mockReturnValue({ data: [] });

    renderDashboard();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    // SummaryCards should be rendered (the component receives the data)
  });
});
