import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  exportTransactions,
  type TransactionFilters,
} from '@/hooks/useTransactions';

interface ExportButtonProps {
  filters: TransactionFilters;
}

export function ExportButton({ filters }: ExportButtonProps) {
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
    >
      <Download className="size-4" />
      {isExporting ? 'Exporting...' : 'Export CSV'}
    </Button>
  );
}
