import { TRPCError } from '@trpc/server';
import { router, proProcedure } from '../trpc';
import { scanReceiptInputSchema } from '@fin-health/shared';
import { getReceiptProvider } from '../services/receiptScanner';
import { env } from '../lib/env';

export const receiptsRouter = router({
  scan: proProcedure.input(scanReceiptInputSchema).mutation(async ({ input }) => {
    if (!env.FEATURE_RECEIPT_SCANNING) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'RECEIPT_SCANNING_DISABLED' });
    }

    const hasKey =
      (env.RECEIPT_PROVIDER === 'anthropic' && env.ANTHROPIC_API_KEY) ||
      (env.RECEIPT_PROVIDER === 'openai' && env.OPENAI_API_KEY) ||
      (env.RECEIPT_PROVIDER === 'qwen' && env.DASHSCOPE_API_KEY);

    if (!hasKey) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Receipt scanning is not configured',
      });
    }

    try {
      const provider = await getReceiptProvider();
      const result = await provider.scan(input.imageBase64, input.mimeType);
      return { result };
    } catch (err) {
      if (err instanceof TRPCError) throw err;
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to parse receipt. Please try a clearer image.',
        cause: err,
      });
    }
  }),
});
