import { z } from 'zod';

export const receiptScanResultSchema = z.object({
  merchant: z.string(),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
  currency: z.string().length(3).toUpperCase(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: z.enum(['expense', 'income']),
  description: z.string(),
  categoryName: z.string(),
  subcategoryName: z.string().nullish(),
  notes: z.string().nullish(),
  confidence: z.enum(['high', 'medium', 'low']),
});

export const scanReceiptInputSchema = z.object({
  imageBase64: z.string().min(1).max(10_000_000),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
});

export type ReceiptScanResult = z.infer<typeof receiptScanResultSchema>;
export type ScanReceiptInput = z.infer<typeof scanReceiptInputSchema>;

export type TransactionPrefillData = Partial<
  Pick<
    ReceiptScanResult,
    | 'amount'
    | 'currency'
    | 'type'
    | 'description'
    | 'date'
    | 'categoryName'
    | 'subcategoryName'
    | 'notes'
  >
>;
