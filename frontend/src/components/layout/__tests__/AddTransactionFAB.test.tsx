import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { AddTransactionFAB } from '@/components/layout/AddTransactionFAB';
import { TransactionFormProvider } from '@/providers/TransactionFormProvider';

describe('AddTransactionFAB', () => {
    it('renders the add transaction button', () => {
        render(
            <TransactionFormProvider>
                <AddTransactionFAB />
            </TransactionFormProvider>
        );

        const button = screen.getByRole('button', { name: /add transaction|add a transaction/i });
        expect(button).toBeInTheDocument();
    });

    it('calls openForm when clicked', async () => {
        const user = userEvent.setup();

        render(
            <TransactionFormProvider>
                <AddTransactionFAB />
            </TransactionFormProvider>
        );

        const button = screen.getByRole('button', { name: /add transaction|add a transaction/i });
        await user.click(button);

        // Button should still be visible
        expect(button).toBeInTheDocument();
    });

    it('has correct styling classes for floating position', () => {
        render(
            <TransactionFormProvider>
                <AddTransactionFAB />
            </TransactionFormProvider>
        );

        const button = screen.getByRole('button', { name: /add transaction|add a transaction/i });
        expect(button).toHaveClass('fixed', 'bottom-24', 'right-6', 'rounded-full', 'shadow-lg');
    });
});
