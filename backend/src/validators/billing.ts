import { z } from 'zod';

export const checkoutSchema = z.object({
  interval: z.enum(['monthly', 'yearly']),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
