import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

const mockUseTransactions = vi.fn();

vi.mock('@/hooks/useTransactions', () => ({
  useTransactions: (...args: unknown[]) => mockUseTransactions(...args),
}));

// Import after mock setup
const { useRecentPeaks } = await import('@/hooks/useDashboard');

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useRecentPeaks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('passes correct filters to useTransactions', () => {
    mockUseTransactions.mockReturnValue({ data: undefined, isLoading: true });

    renderHook(() => useRecentPeaks(3, 2026), { wrapper: createWrapper() });

    expect(mockUseTransactions).toHaveBeenCalledWith({
      type: 'expense',
      sortBy: 'amount',
      sortOrder: 'desc',
      limit: 5,
      startDate: '2026-03-01',
      endDate: '2026-03-31',
    });
  });

  it('unwraps paginated response to flat transactions array', () => {
    const transactions = [
      { id: '1', amount: 100, description: 'Test', category: { id: 'c1', name: 'Food' } },
    ];
    mockUseTransactions.mockReturnValue({
      data: { transactions, pagination: { page: 1, totalPages: 1 } },
      isLoading: false,
    });

    const { result } = renderHook(() => useRecentPeaks(3, 2026), { wrapper: createWrapper() });

    expect(result.current.data).toEqual(transactions);
  });

  it('returns undefined data when query is loading', () => {
    mockUseTransactions.mockReturnValue({ data: undefined, isLoading: true });

    const { result } = renderHook(() => useRecentPeaks(3, 2026), { wrapper: createWrapper() });

    expect(result.current.data).toBeUndefined();
  });

  it('handles year wraparound for January', () => {
    mockUseTransactions.mockReturnValue({ data: undefined, isLoading: true });

    renderHook(() => useRecentPeaks(1, 2026), { wrapper: createWrapper() });

    expect(mockUseTransactions).toHaveBeenCalledWith(
      expect.objectContaining({
        startDate: '2026-01-01',
        endDate: '2026-01-31',
      }),
    );
  });
});
