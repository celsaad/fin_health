import { createContext, useContext, useState, ReactNode } from 'react';
import type { TransactionPrefillData } from '@fin-health/shared';

interface TransactionFormContextType {
  isOpen: boolean;
  prefillData: TransactionPrefillData | null;
  openForm: () => void;
  openFormWithData: (data: TransactionPrefillData) => void;
  closeForm: () => void;
}

const TransactionFormContext = createContext<TransactionFormContextType | undefined>(undefined);

export function TransactionFormProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [prefillData, setPrefillData] = useState<TransactionPrefillData | null>(null);

  const openForm = () => {
    setPrefillData(null);
    setIsOpen(true);
  };

  const openFormWithData = (data: TransactionPrefillData) => {
    setPrefillData(data);
    setIsOpen(true);
  };

  const closeForm = () => {
    setIsOpen(false);
    setPrefillData(null);
  };

  return (
    <TransactionFormContext.Provider
      value={{ isOpen, prefillData, openForm, openFormWithData, closeForm }}
    >
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
