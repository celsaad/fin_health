import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBudgets, useUpsertBudget, useDeleteBudget } from '@/hooks/useBudgets';
import api from '@/lib/api';
import type { ReactNode } from 'react';

vi.mock('@/lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const mockApi = vi.mocked(api);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useBudgets', () => {
  it('fetches budgets for a given month and year', async () => {
    const mockBudgets = [{ id: '1', amount: 500, month: 3, year: 2024, categoryId: 'cat-1' }];
    mockApi.get.mockResolvedValueOnce({ data: { budgets: mockBudgets } });

    const { result } = renderHook(() => useBudgets(3, 2024), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockBudgets);
    expect(mockApi.get).toHaveBeenCalledWith('/budgets', {
      params: { month: 3, year: 2024 },
    });
  });

  it('handles error', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('Failed'));

    const { result } = renderHook(() => useBudgets(3, 2024), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useUpsertBudget', () => {
  it('creates a budget and shows success toast', async () => {
    const { toast } = await import('sonner');
    mockApi.post.mockResolvedValueOnce({ data: { id: '2', amount: 300 } });

    const { result } = renderHook(() => useUpsertBudget(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ amount: 300, month: 3, year: 2024, categoryId: 'cat-1' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApi.post).toHaveBeenCalledWith('/budgets', {
      amount: 300,
      month: 3,
      year: 2024,
      categoryId: 'cat-1',
    });
    expect(toast.success).toHaveBeenCalledWith('Budget saved successfully');
  });
});

describe('useDeleteBudget', () => {
  it('deletes a budget by id', async () => {
    const { toast } = await import('sonner');
    mockApi.delete.mockResolvedValueOnce({});

    const { result } = renderHook(() => useDeleteBudget(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('budget-1');

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApi.delete).toHaveBeenCalledWith('/budgets/budget-1');
    expect(toast.success).toHaveBeenCalledWith('Budget deleted successfully');
  });
});
