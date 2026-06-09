import { createContext, useContext, useState, ReactNode } from 'react';
import type { ReceiptScanResult } from '@fin-health/shared';

type PrefillData = Pick<
  ReceiptScanResult,
  | 'amount'
  | 'currency'
  | 'type'
  | 'description'
  | 'date'
  | 'categoryName'
  | 'subcategoryName'
  | 'notes'
>;

interface TransactionFormContextType {
  isOpen: boolean;
  prefillData: Partial<PrefillData> | null;
  openForm: () => void;
  openFormWithData: (data: Partial<PrefillData>) => void;
  closeForm: () => void;
}

const TransactionFormContext = createContext<TransactionFormContextType | undefined>(undefined);

export function TransactionFormProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [prefillData, setPrefillData] = useState<Partial<PrefillData> | null>(null);

  const openForm = () => {
    setPrefillData(null);
    setIsOpen(true);
  };

  const openFormWithData = (data: Partial<PrefillData>) => {
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
