import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportTransactions, type TransactionFilters } from '@/hooks/useTransactions';

interface ExportButtonProps {
  filters: TransactionFilters;
}

export function ExportButton({ filters }: ExportButtonProps) {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportTransactions(filters);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isExporting}
      aria-label={t('transactions.exportCsv')}
    >
      <Download className="size-4" />
      <span className="hidden sm:inline">
        {isExporting ? t('transactions.exporting') : t('transactions.exportCsv')}
      </span>
    </Button>
  );
}
