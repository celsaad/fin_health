import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useBudgets, useUpsertBudget, useDeleteBudget } from '@/hooks/useBudgets';
import type { ReactNode } from 'react';

const mockBudgetsListUseQuery = vi.fn();
const mockBudgetsUpsertUseMutation = vi.fn();
const mockBudgetsDeleteUseMutation = vi.fn();
const mockInvalidateBudgets = vi.fn();

vi.mock('@/lib/trpc', () => ({
  trpc: {
    budgets: {
      list: { useQuery: (...args: unknown[]) => mockBudgetsListUseQuery(...args) },
      upsert: { useMutation: (...args: unknown[]) => mockBudgetsUpsertUseMutation(...args) },
      delete: { useMutation: (...args: unknown[]) => mockBudgetsDeleteUseMutation(...args) },
    },
    useUtils: () => ({
      budgets: { list: { invalidate: mockInvalidateBudgets } },
    }),
  },
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

vi.mock('@/contexts/UserPreferencesContext', () => ({
  useUserPreferences: () => ({ currency: 'USD' }),
}));

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

beforeEach(() => vi.clearAllMocks());

describe('useBudgets', () => {
  it('fetches budgets for a given month and year', () => {
    const mockBudgets = [{ id: '1', amount: 500, month: 3, year: 2024, categoryId: 'cat-1' }];
    mockBudgetsListUseQuery.mockReturnValue({
      data: { budgets: mockBudgets },
      isSuccess: true,
      isError: false,
    });

    const { result } = renderHook(() => useBudgets(3, 2024), { wrapper: createWrapper() });

    expect(result.current.data).toEqual(mockBudgets);
    expect(mockBudgetsListUseQuery).toHaveBeenCalledWith({ month: 3, year: 2024, currency: 'USD' });
  });

  it('handles error', () => {
    mockBudgetsListUseQuery.mockReturnValue({ data: undefined, isSuccess: false, isError: true });

    const { result } = renderHook(() => useBudgets(3, 2024), { wrapper: createWrapper() });

    expect(result.current.isError).toBe(true);
  });
});

describe('useUpsertBudget', () => {
  it('triggers invalidation and success toast on success', () => {
    mockBudgetsUpsertUseMutation.mockImplementation((options: { onSuccess?: () => void }) => ({
      mutate: () => options?.onSuccess?.(),
      isSuccess: false,
    }));

    const { result } = renderHook(() => useUpsertBudget(), { wrapper: createWrapper() });
    result.current.mutate({ amount: 300, month: 3, year: 2024, categoryId: 'cat-1' });

    expect(mockInvalidateBudgets).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Budget saved successfully');
  });
});

describe('useDeleteBudget', () => {
  it('triggers invalidation and success toast on success', () => {
    mockBudgetsDeleteUseMutation.mockImplementation((options: { onSuccess?: () => void }) => ({
      mutate: () => options?.onSuccess?.(),
      isSuccess: false,
    }));

    const { result } = renderHook(() => useDeleteBudget(), { wrapper: createWrapper() });
    result.current.mutate('budget-1');

    expect(mockInvalidateBudgets).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Budget deleted successfully');
  });
});
