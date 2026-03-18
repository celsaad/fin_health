import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { checkoutSchema } from '../validators/billing';
import { env } from '../lib/env';
import { AppError } from '../middleware/errorHandler';
import {
  createCheckoutSession,
  createPortalSession,
  handleWebhookEvent,
  stripe,
} from '../services/stripeService';
import { logger } from '../lib/logger';

const router = Router();

// POST /api/billing/checkout — create Stripe Checkout session
router.post(
  '/checkout',
  authMiddleware,
  validate(checkoutSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { interval } = req.body;
      const priceId =
        interval === 'yearly' ? env.STRIPE_PRO_YEARLY_PRICE_ID : env.STRIPE_PRO_MONTHLY_PRICE_ID;

      if (!priceId) {
        throw new AppError('Billing is not configured', 500);
      }

      const url = await createCheckoutSession(req.userId!, priceId);
      res.json({ url });
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/billing/portal — create Stripe Customer Portal session
router.get('/portal', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const url = await createPortalSession(req.userId!);
    res.json({ url });
  } catch (err) {
    next(err);
  }
});

// Webhook router (mounted separately with express.raw())
const webhookRouter = Router();

webhookRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sig = req.headers['stripe-signature'];
    if (!sig || typeof sig !== 'string') {
      throw new AppError('Missing Stripe signature', 400);
    }

    const event = stripe().webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET);

    await handleWebhookEvent(event);
    res.json({ received: true });
  } catch (err) {
    if (err instanceof AppError) {
      next(err);
      return;
    }
    logger.error({ err }, 'Webhook signature verification failed');
    res.status(400).json({ error: 'Webhook signature verification failed' });
  }
});

export { webhookRouter };
export default router;
