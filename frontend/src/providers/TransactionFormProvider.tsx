import { createContext, useContext, useState, ReactNode } from 'react';

interface TransactionFormContextType {
    isOpen: boolean;
    openForm: () => void;
    closeForm: () => void;
}

const TransactionFormContext = createContext<TransactionFormContextType | undefined>(undefined);

export function TransactionFormProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    const openForm = () => setIsOpen(true);
    const closeForm = () => setIsOpen(false);

    return (
        <TransactionFormContext.Provider value={{ isOpen, openForm, closeForm }}>
            {children}
        </TransactionFormContext.Provider>
    );
}

export function useTransactionForm() {
    const context = useContext(TransactionFormContext);
    if (!context) {
        throw new Error('useTransactionForm must be used within TransactionFormProvider');
    }
    return context;
}
