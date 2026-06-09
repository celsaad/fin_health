import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AddTransactionFAB } from '@/components/layout/AddTransactionFAB';
import { TransactionFormProvider } from '@/providers/TransactionFormProvider';

const mockFlags = { billing: true, receiptScanning: false };

vi.mock('@/lib/auth', () => ({
  useAuth: () => ({ featureFlags: mockFlags }),
}));

vi.mock('@/components/transactions/ReceiptScanner', () => ({
  ReceiptScanner: () => null,
}));

function renderFAB() {
  return render(
    <TransactionFormProvider>
      <AddTransactionFAB />
    </TransactionFormProvider>,
  );
}

describe('AddTransactionFAB', () => {
  beforeEach(() => {
    mockFlags.receiptScanning = false;
  });

  it('renders the add transaction button', () => {
    renderFAB();
    expect(screen.getByRole('button', { name: /add transaction/i })).toBeInTheDocument();
  });

  it('calls openForm when clicked', async () => {
    const user = userEvent.setup();
    renderFAB();
    await user.click(screen.getByRole('button', { name: /add transaction/i }));
    expect(screen.getByRole('button', { name: /add transaction/i })).toBeInTheDocument();
  });

  it('does not show scan receipt button when receiptScanning flag is off', () => {
    renderFAB();
    expect(screen.queryByRole('button', { name: /scan receipt/i })).not.toBeInTheDocument();
  });

  it('shows scan receipt button when receiptScanning flag is on', () => {
    mockFlags.receiptScanning = true;
    renderFAB();
    expect(screen.getByRole('button', { name: /scan receipt/i })).toBeInTheDocument();
  });
});
