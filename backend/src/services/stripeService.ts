import Stripe from 'stripe';
import { env } from '../lib/env';
import prisma from '../lib/prisma';
import { logger } from '../lib/logger';

let stripeInstance: Stripe | null = null;

function stripe(): Stripe {
  if (!stripeInstance) {
    if (!env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    stripeInstance = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-02-25.clover',
    });
  }
  return stripeInstance;
}

export async function getOrCreateStripeCustomer(userId: string): Promise<string> {
  const sub = await prisma.subscription.findUnique({ where: { userId } });

  if (sub?.stripeCustomerId) {
    return sub.stripeCustomerId;
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { email: true, name: true },
  });

  const customer = await stripe().customers.create({
    email: user.email,
    name: user.name,
    metadata: { userId },
  });

  await prisma.subscription.upsert({
    where: { userId },
    create: { userId, plan: 'free', status: 'active', stripeCustomerId: customer.id },
    update: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

export async function createCheckoutSession(userId: string, priceId: string): Promise<string> {
  const customerId = await getOrCreateStripeCustomer(userId);

  const session = await stripe().checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${env.CLIENT_URL}/settings?checkout=success`,
    cancel_url: `${env.CLIENT_URL}/settings?checkout=cancel`,
    metadata: { userId },
    subscription_data: { metadata: { userId } },
  });

  if (!session.url) {
    throw new Error('Stripe did not return a checkout URL');
  }

  return session.url;
}

export async function createPortalSession(userId: string): Promise<string> {
  const customerId = await getOrCreateStripeCustomer(userId);

  const session = await stripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: `${env.CLIENT_URL}/settings`,
  });

  return session.url;
}

function mapStripeStatus(
  status: Stripe.Subscription.Status,
): 'active' | 'trialing' | 'canceled' | 'expired' {
  switch (status) {
    case 'active':
      return 'active';
    case 'trialing':
      return 'trialing';
    case 'canceled':
    case 'incomplete_expired':
    case 'unpaid':
      return 'expired';
    case 'past_due':
    case 'incomplete':
      return 'active'; // still grant access while Stripe retries
    default:
      return 'expired';
  }
}

export async function handleWebhookEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (!userId || session.mode !== 'subscription') break;

      const stripeSubscriptionId =
        typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;

      await prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          plan: 'pro',
          status: 'active',
          stripeCustomerId:
            typeof session.customer === 'string'
              ? session.customer
              : (session.customer?.id ?? null),
          stripeSubscriptionId: stripeSubscriptionId ?? null,
        },
        update: {
          plan: 'pro',
          status: 'active',
          stripeSubscriptionId: stripeSubscriptionId ?? null,
        },
      });
      logger.info({ userId }, 'Checkout completed — subscription activated');
      break;
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice;
      const subRef = invoice.parent?.subscription_details?.subscription;
      const stripeSubscriptionId = typeof subRef === 'string' ? subRef : subRef?.id;

      if (!stripeSubscriptionId) break;

      const sub = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId },
      });
      if (!sub) break;

      await prisma.subscription.update({
        where: { id: sub.id },
        data: {
          status: 'active',
          currentPeriodEnd: invoice.lines.data[0]?.period?.end
            ? new Date(invoice.lines.data[0].period.end * 1000)
            : undefined,
        },
      });
      logger.info({ subscriptionId: sub.id }, 'Invoice paid — subscription renewed');
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      logger.warn(
        { invoiceId: invoice.id, customerId: invoice.customer },
        'Invoice payment failed — Stripe will retry',
      );
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const sub = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: subscription.id },
      });
      if (!sub) break;

      await prisma.subscription.update({
        where: { id: sub.id },
        data: {
          status: mapStripeStatus(subscription.status),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          currentPeriodEnd: subscription.items.data[0]?.current_period_end
            ? new Date(subscription.items.data[0].current_period_end * 1000)
            : undefined,
        },
      });
      logger.info(
        { subscriptionId: sub.id, stripeStatus: subscription.status },
        'Subscription updated',
      );
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const sub = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: subscription.id },
      });
      if (!sub) break;

      await prisma.subscription.update({
        where: { id: sub.id },
        data: {
          plan: 'free',
          status: 'expired',
          cancelAtPeriodEnd: false,
        },
      });
      logger.info({ subscriptionId: sub.id }, 'Subscription deleted — reverted to free');
      break;
    }

    default:
      logger.debug({ type: event.type }, 'Unhandled Stripe event');
  }
}

export { stripe };
