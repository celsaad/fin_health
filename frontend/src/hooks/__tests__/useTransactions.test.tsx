import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  useTransactions,
  useCreateTransaction,
  useDeleteTransaction,
} from '@/hooks/useTransactions';
import type { ReactNode } from 'react';

const mockTransactionsListUseQuery = vi.fn();
const mockTransactionsCreateUseMutation = vi.fn();
const mockTransactionsDeleteUseMutation = vi.fn();
const mockInvalidateTransactions = vi.fn();
const mockInvalidateCategories = vi.fn();

vi.mock('@/lib/trpc', () => ({
  trpc: {
    transactions: {
      list: { useQuery: (...args: unknown[]) => mockTransactionsListUseQuery(...args) },
      create: { useMutation: (...args: unknown[]) => mockTransactionsCreateUseMutation(...args) },
      delete: { useMutation: (...args: unknown[]) => mockTransactionsDeleteUseMutation(...args) },
    },
    useUtils: () => ({
      transactions: { list: { invalidate: mockInvalidateTransactions } },
      categories: { list: { invalidate: mockInvalidateCategories } },
    }),
  },
}));

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api');
  return { ...actual, default: { get: vi.fn() }, parseError: actual.parseError };
});

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

beforeEach(() => vi.clearAllMocks());

describe('useTransactions', () => {
  it('fetches transactions with filters', () => {
    const mockData = {
      transactions: [{ id: '1', amount: 50, type: 'expense', description: 'Coffee', date: '2024-01-15' }],
      pagination: { page: 1, totalPages: 1, limit: 20, total: 1 },
    };
    mockTransactionsListUseQuery.mockReturnValue({ data: mockData, isSuccess: true, isError: false });

    const { result } = renderHook(() => useTransactions({ page: 1, limit: 20 }), {
      wrapper: createWrapper(),
    });

    expect(result.current.data).toEqual(mockData);
    expect(mockTransactionsListUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 20 }),
    );
  });

  it('builds query input from filters', () => {
    mockTransactionsListUseQuery.mockReturnValue({ data: undefined, isSuccess: false });

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

    expect(mockTransactionsListUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, limit: 10, type: 'expense', search: 'coffee' }),
    );
  });

  it('reflects error state', () => {
    mockTransactionsListUseQuery.mockReturnValue({ data: undefined, isSuccess: false, isError: true });

    const { result } = renderHook(() => useTransactions(), { wrapper: createWrapper() });

    expect(result.current.isError).toBe(true);
  });
});

describe('useCreateTransaction', () => {
  it('triggers invalidation and success toast on success', () => {
    mockTransactionsCreateUseMutation.mockImplementation((options: { onSuccess?: () => void }) => ({
      mutate: () => options?.onSuccess?.(),
      isSuccess: false,
    }));

    const { result } = renderHook(() => useCreateTransaction(), { wrapper: createWrapper() });
    result.current.mutate({
      amount: 25,
      type: 'expense',
      description: 'Lunch',
      date: '2024-01-15',
      categoryName: 'Food',
    });

    expect(mockInvalidateTransactions).toHaveBeenCalled();
    expect(mockInvalidateCategories).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Transaction created successfully');
  });

  it('shows error toast on failure', () => {
    mockTransactionsCreateUseMutation.mockImplementation((options: { onError?: (err: Error) => void }) => ({
      mutate: () => options?.onError?.(new Error('Server error')),
      isSuccess: false,
    }));

    const { result } = renderHook(() => useCreateTransaction(), { wrapper: createWrapper() });
    result.current.mutate({
      amount: 25,
      type: 'expense',
      description: 'Test',
      date: '2024-01-15',
      categoryName: 'Food',
    });

    expect(toast.error).toHaveBeenCalled();
  });
});

describe('useDeleteTransaction', () => {
  it('triggers invalidation and success toast on success', () => {
    mockTransactionsDeleteUseMutation.mockImplementation((options: { onSuccess?: () => void }) => ({
      mutate: () => options?.onSuccess?.(),
      isSuccess: false,
    }));

    const { result } = renderHook(() => useDeleteTransaction(), { wrapper: createWrapper() });
    result.current.mutate('tx-123');

    expect(mockInvalidateTransactions).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Transaction deleted successfully');
  });
});
