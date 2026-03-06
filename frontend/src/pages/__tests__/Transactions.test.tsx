import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Transactions from '@/pages/Transactions';

const mockUseTransactions = vi.fn();

vi.mock('@/hooks/useTransactions', () => ({
  useTransactions: (...args: unknown[]) => mockUseTransactions(...args),
}));

// Mock child components to isolate page logic
vi.mock('@/components/transactions/TransactionForm', () => ({
  TransactionForm: ({ open }: { open: boolean }) =>
    open ? <div data-testid="transaction-form">Form</div> : null,
}));

vi.mock('@/components/transactions/TransactionFilters', () => ({
  TransactionFilters: () => <div data-testid="transaction-filters">Filters</div>,
}));

vi.mock('@/components/transactions/TransactionList', () => ({
  TransactionList: ({ transactions }: { transactions: unknown[] }) => (
    <div data-testid="transaction-list">{transactions.length} items</div>
  ),
}));

vi.mock('@/components/transactions/ExportButton', () => ({
  ExportButton: () => <button>Export</button>,
}));

function renderTransactions() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <Transactions />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('Transactions page', () => {
  it('renders page heading', () => {
    mockUseTransactions.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    });

    renderTransactions();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('Manage your income and expenses')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockUseTransactions.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    });

    renderTransactions();
    expect(screen.getByText('Failed to load data. Please try again.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('renders empty state when no transactions', () => {
    mockUseTransactions.mockReturnValue({
      data: { transactions: [], pagination: { page: 1, limit: 20, totalPages: 1 } },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderTransactions();
    expect(screen.getByText('No transactions yet')).toBeInTheDocument();
  });

  it('renders transaction list when data is available', () => {
    mockUseTransactions.mockReturnValue({
      data: {
        transactions: [{ id: '1' }, { id: '2' }],
        pagination: { page: 1, limit: 20, totalPages: 1 },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderTransactions();
    expect(screen.getByTestId('transaction-list')).toBeInTheDocument();
    expect(screen.getByText('2 items')).toBeInTheDocument();
  });

  it('opens form when Add Transaction is clicked', async () => {
    const user = userEvent.setup();
    mockUseTransactions.mockReturnValue({
      data: {
        transactions: [{ id: '1' }],
        pagination: { page: 1, limit: 20, totalPages: 1 },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderTransactions();
    expect(screen.queryByTestId('transaction-form')).not.toBeInTheDocument();

    // Use the header "Add Transaction" button (only one when list is non-empty)
    await user.click(screen.getByRole('button', { name: /add transaction/i }));
    expect(screen.getByTestId('transaction-form')).toBeInTheDocument();
  });
});
