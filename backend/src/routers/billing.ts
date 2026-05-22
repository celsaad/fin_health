import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc';
import { checkoutSchema } from '../validators/billing';
import { env } from '../lib/env';
import { createCheckoutSession, createPortalSession } from '../services/stripeService';

export const billingRouter = router({
  checkout: protectedProcedure.input(checkoutSchema).mutation(async ({ ctx, input }) => {
    const priceId =
      input.interval === 'yearly'
        ? env.STRIPE_PRO_YEARLY_PRICE_ID
        : env.STRIPE_PRO_MONTHLY_PRICE_ID;

    if (!priceId) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Billing is not configured' });
    }

    const url = await createCheckoutSession(ctx.userId, priceId);
    return { url };
  }),

  portal: protectedProcedure.query(async ({ ctx }) => {
    const url = await createPortalSession(ctx.userId);
    return { url };
  }),
});
