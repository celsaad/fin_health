import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { TransactionFormProvider, useTransactionForm } from '@/providers/TransactionFormProvider';

function TestComponent() {
    const { isOpen, openForm, closeForm } = useTransactionForm();

    return (
        <div>
            <div data-testid="form-status">{isOpen ? 'open' : 'closed'}</div>
            <button onClick={openForm}>Open Form</button>
            <button onClick={closeForm}>Close Form</button>
        </div>
    );
}

describe('TransactionFormProvider', () => {
    it('provides initial state as closed', () => {
        render(
            <TransactionFormProvider>
                <TestComponent />
            </TransactionFormProvider>
        );

        const status = screen.getByTestId('form-status');
        expect(status).toHaveTextContent('closed');
    });

    it('opens the form when openForm is called', async () => {
        const user = userEvent.setup();

        render(
            <TransactionFormProvider>
                <TestComponent />
            </TransactionFormProvider>
        );

        const openButton = screen.getByRole('button', { name: 'Open Form' });
        await user.click(openButton);

        const status = screen.getByTestId('form-status');
        expect(status).toHaveTextContent('open');
    });

    it('closes the form when closeForm is called', async () => {
        const user = userEvent.setup();

        render(
            <TransactionFormProvider>
                <TestComponent />
            </TransactionFormProvider>
        );

        const openButton = screen.getByRole('button', { name: 'Open Form' });
        await user.click(openButton);

        const closeButton = screen.getByRole('button', { name: 'Close Form' });
        await user.click(closeButton);

        const status = screen.getByTestId('form-status');
        expect(status).toHaveTextContent('closed');
    });

    it('throws error when useTransactionForm is used outside provider', () => {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => { });

        expect(() => {
            render(<TestComponent />);
        }).toThrow('useTransactionForm must be used within TransactionFormProvider');

        spy.mockRestore();
    });
});
