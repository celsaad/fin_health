import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { TransactionFormProvider, useTransactionForm } from '@/providers/TransactionFormProvider';

function TestComponent() {
  const { isOpen, prefillData, openForm, openFormWithData, closeForm } = useTransactionForm();

  return (
    <div>
      <div data-testid="form-status">{isOpen ? 'open' : 'closed'}</div>
      <div data-testid="prefill-amount">{prefillData?.amount ?? 'none'}</div>
      <button onClick={openForm}>Open Form</button>
      <button onClick={() => openFormWithData({ amount: '99.50', description: 'Scanned receipt' })}>
        Open With Data
      </button>
      <button onClick={closeForm}>Close Form</button>
    </div>
  );
}

describe('TransactionFormProvider', () => {
  it('provides initial state as closed', () => {
    render(
      <TransactionFormProvider>
        <TestComponent />
      </TransactionFormProvider>,
    );

    expect(screen.getByTestId('form-status')).toHaveTextContent('closed');
    expect(screen.getByTestId('prefill-amount')).toHaveTextContent('none');
  });

  it('opens the form when openForm is called', async () => {
    const user = userEvent.setup();

    render(
      <TransactionFormProvider>
        <TestComponent />
      </TransactionFormProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Open Form' }));

    expect(screen.getByTestId('form-status')).toHaveTextContent('open');
    expect(screen.getByTestId('prefill-amount')).toHaveTextContent('none');
  });

  it('closes the form when closeForm is called', async () => {
    const user = userEvent.setup();

    render(
      <TransactionFormProvider>
        <TestComponent />
      </TransactionFormProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Open Form' }));
    await user.click(screen.getByRole('button', { name: 'Close Form' }));

    expect(screen.getByTestId('form-status')).toHaveTextContent('closed');
  });

  it('opens with prefill data when openFormWithData is called', async () => {
    const user = userEvent.setup();

    render(
      <TransactionFormProvider>
        <TestComponent />
      </TransactionFormProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Open With Data' }));

    expect(screen.getByTestId('form-status')).toHaveTextContent('open');
    expect(screen.getByTestId('prefill-amount')).toHaveTextContent('99.50');
  });

  it('clears prefill data when closeForm is called', async () => {
    const user = userEvent.setup();

    render(
      <TransactionFormProvider>
        <TestComponent />
      </TransactionFormProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Open With Data' }));
    await user.click(screen.getByRole('button', { name: 'Close Form' }));

    expect(screen.getByTestId('prefill-amount')).toHaveTextContent('none');
  });

  it('clears prefill data when openForm (manual) is called after openFormWithData', async () => {
    const user = userEvent.setup();

    render(
      <TransactionFormProvider>
        <TestComponent />
      </TransactionFormProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Open With Data' }));
    await user.click(screen.getByRole('button', { name: 'Close Form' }));
    await user.click(screen.getByRole('button', { name: 'Open Form' }));

    expect(screen.getByTestId('prefill-amount')).toHaveTextContent('none');
  });

  it('throws error when useTransactionForm is used outside provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useTransactionForm must be used within TransactionFormProvider');

    spy.mockRestore();
  });
});
