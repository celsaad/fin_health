import { z } from 'zod';

export const receiptScanResultSchema = z.object({
  merchant: z.string(),
  amount: z.string(),
  currency: z.string().length(3).toUpperCase(),
  date: z.string(),
  type: z.enum(['expense', 'income']),
  description: z.string(),
  categoryName: z.string(),
  subcategoryName: z.string().optional(),
  notes: z.string().optional(),
  confidence: z.enum(['high', 'medium', 'low']),
});

export const scanReceiptInputSchema = z.object({
  imageBase64: z.string().min(1),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
});

export type ReceiptScanResult = z.infer<typeof receiptScanResultSchema>;
export type ScanReceiptInput = z.infer<typeof scanReceiptInputSchema>;
