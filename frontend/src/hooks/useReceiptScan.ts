import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

export function useReceiptScan() {
  return trpc.receipts.scan.useMutation({
    onError: (error) => {
      if (error.data?.code === 'FORBIDDEN') {
        toast.error('Receipt scanning requires a Pro plan');
      } else {
        toast.error(error.message || 'Failed to scan receipt');
      }
    },
  });
}
