import { useState } from 'react';
import { Plus, Camera } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useTransactionForm } from '@/providers/TransactionFormProvider';
import { ReceiptScanner } from '@/components/transactions/ReceiptScanner';

export function AddTransactionFAB() {
  const { t } = useTranslation();
  const { openForm } = useTransactionForm();
  const [scannerOpen, setScannerOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-24 right-6 flex flex-col items-end gap-2 lg:bottom-6">
        <Button
          onClick={() => setScannerOpen(true)}
          size="icon"
          variant="secondary"
          className="rounded-full shadow-md size-11"
          aria-label="Scan receipt"
        >
          <Camera className="size-4" />
        </Button>
        <Button
          onClick={openForm}
          size="lg"
          className="rounded-full shadow-lg"
          aria-label={t('transactions.addTransaction')}
        >
          <Plus className="size-5" />
        </Button>
      </div>

      <ReceiptScanner open={scannerOpen} onOpenChange={setScannerOpen} />
    </>
  );
}
