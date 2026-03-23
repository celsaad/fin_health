import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from '@/pages/Dashboard';

const mockUseSummary = vi.fn();
const mockUseCategoryBreakdown = vi.fn();
const mockUseTrend = vi.fn();
const mockUseInsights = vi.fn();
const mockUseRecentPeaks = vi.fn();
const mockUseBudgets = vi.fn();

vi.mock('@/hooks/useDashboard', () => ({
  useSummary: (...args: unknown[]) => mockUseSummary(...args),
  useCategoryBreakdown: (...args: unknown[]) => mockUseCategoryBreakdown(...args),
  useTrend: (...args: unknown[]) => mockUseTrend(...args),
  useInsights: (...args: unknown[]) => mockUseInsights(...args),
  useRecentPeaks: (...args: unknown[]) => mockUseRecentPeaks(...args),
}));

vi.mock('@/hooks/useBudgets', () => ({
  useBudgets: (...args: unknown[]) => mockUseBudgets(...args),
}));

vi.mock('@/hooks/usePlan', () => ({
  usePlan: () => ({ isPro: false }),
}));

// Mock recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: () => <div data-testid="bar-chart" />,
  Bar: () => null,
  Cell: () => null,
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

function setupDefaultMocks() {
  mockUseInsights.mockReturnValue({ data: undefined, isLoading: false, isError: false, refetch: vi.fn() });
  mockUseRecentPeaks.mockReturnValue({ data: undefined, isLoading: false, isError: false, refetch: vi.fn() });
}

describe('Dashboard page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    setupDefaultMocks();
    mockUseSummary.mockReturnValue({ data: undefined, isLoading: true, isError: false, refetch: vi.fn() });
    mockUseCategoryBreakdown.mockReturnValue({ data: undefined, isLoading: true, isError: false, refetch: vi.fn() });
    mockUseTrend.mockReturnValue({ data: undefined, isLoading: true, isError: false, refetch: vi.fn() });
    mockUseBudgets.mockReturnValue({ data: undefined });

    renderDashboard();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders error state with retry', () => {
    setupDefaultMocks();
    const mockRefetch = vi.fn();
    mockUseSummary.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: mockRefetch });
    mockUseCategoryBreakdown.mockReturnValue({ data: undefined, isLoading: false, isError: false, refetch: vi.fn() });
    mockUseTrend.mockReturnValue({ data: undefined, isLoading: false, isError: false, refetch: vi.fn() });
    mockUseBudgets.mockReturnValue({ data: undefined });

    renderDashboard();
    expect(screen.getByText('Failed to load data. Please try again.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('renders summary data when loaded', () => {
    setupDefaultMocks();
    mockUseSummary.mockReturnValue({
      data: { totalIncome: 5000, totalExpenses: 3000, net: 2000, transactionCount: 15 },
      isLoading: false, isError: false, refetch: vi.fn(),
    });
    mockUseCategoryBreakdown.mockReturnValue({ data: [], isLoading: false, isError: false, refetch: vi.fn() });
    mockUseTrend.mockReturnValue({ data: [], isLoading: false, isError: false, refetch: vi.fn() });
    mockUseBudgets.mockReturnValue({ data: [] });

    renderDashboard();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('fetches previous month summary for MoM calculation', () => {
    setupDefaultMocks();
    mockUseSummary.mockReturnValue({ data: undefined, isLoading: true, isError: false, refetch: vi.fn() });
    mockUseCategoryBreakdown.mockReturnValue({ data: undefined, isLoading: true, isError: false, refetch: vi.fn() });
    mockUseTrend.mockReturnValue({ data: undefined, isLoading: true, isError: false, refetch: vi.fn() });
    mockUseBudgets.mockReturnValue({ data: undefined });

    renderDashboard();
    // useSummary should be called twice (current + previous month)
    expect(mockUseSummary).toHaveBeenCalledTimes(2);
  });
});
