import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useTransactions,
  useCreateTransaction,
  useDeleteTransaction,
} from '@/hooks/useTransactions';
import api from '@/lib/api';
import type { ReactNode } from 'react';

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api');
  return {
    ...actual,
    default: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  };
});

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
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

describe('useTransactions', () => {
  it('fetches transactions with filters', async () => {
    const mockData = {
      transactions: [
        { id: '1', amount: 50, type: 'expense', description: 'Coffee', date: '2024-01-15' },
      ],
      pagination: { page: 1, totalPages: 1, limit: 20 },
    };
    mockApi.get.mockResolvedValueOnce({ data: mockData });

    const { result } = renderHook(() => useTransactions({ page: 1, limit: 20 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
    expect(mockApi.get).toHaveBeenCalledWith(expect.stringContaining('/transactions?'));
  });

  it('builds query params from filters', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { transactions: [], pagination: {} } });

    renderHook(
      () =>
        useTransactions({
          page: 2,
          limit: 10,
          type: 'expense',
          search: 'coffee',
          sortBy: 'date',
          sortOrder: 'desc',
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(mockApi.get).toHaveBeenCalled();
    });

    const url = mockApi.get.mock.calls[0][0];
    expect(url).toContain('page=2');
    expect(url).toContain('limit=10');
    expect(url).toContain('type=expense');
    expect(url).toContain('search=coffee');
    expect(url).toContain('sortBy=date');
    expect(url).toContain('sortOrder=desc');
  });

  it('handles fetch error', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('Network Error'));

    const { result } = renderHook(() => useTransactions({ page: 1, limit: 20 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useCreateTransaction', () => {
  it('posts transaction and shows success toast', async () => {
    const { toast } = await import('sonner');
    const newTransaction = {
      amount: 25,
      type: 'expense' as const,
      description: 'Lunch',
      date: '2024-01-15',
      categoryName: 'Food',
    };
    mockApi.post.mockResolvedValueOnce({
      data: { transaction: { id: '2', ...newTransaction } },
    });

    const { result } = renderHook(() => useCreateTransaction(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(newTransaction);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApi.post).toHaveBeenCalledWith('/transactions', newTransaction);
    expect(toast.success).toHaveBeenCalledWith('Transaction created successfully');
  });

  it('shows error toast on failure', async () => {
    const { toast } = await import('sonner');
    mockApi.post.mockRejectedValueOnce(new Error('Server error'));

    const { result } = renderHook(() => useCreateTransaction(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      amount: 25,
      type: 'expense',
      description: 'Test',
      date: '2024-01-15',
      categoryName: 'Food',
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(toast.error).toHaveBeenCalled();
  });
});

describe('useDeleteTransaction', () => {
  it('deletes transaction by id', async () => {
    const { toast } = await import('sonner');
    mockApi.delete.mockResolvedValueOnce({});

    const { result } = renderHook(() => useDeleteTransaction(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('tx-123');

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApi.delete).toHaveBeenCalledWith('/transactions/tx-123');
    expect(toast.success).toHaveBeenCalledWith('Transaction deleted successfully');
  });
});
