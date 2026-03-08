import { useAuth } from '@/lib/auth';
import type { PlanType, SubscriptionStatus } from '@fin-health/shared/types';

const DEFAULT_PLAN = {
  plan: 'free' as PlanType,
  status: 'active' as SubscriptionStatus,
  trialEndsAt: null,
  currentPeriodEnd: null,
};

export function usePlan() {
  const { user } = useAuth();
  const plan = user?.plan ?? DEFAULT_PLAN;

  return {
    plan: plan.plan,
    status: plan.status,
    isPro: plan.plan === 'pro' && (plan.status === 'active' || plan.status === 'trialing'),
    isFree: plan.plan === 'free' || plan.status === 'canceled' || plan.status === 'expired',
    isTrialing: plan.status === 'trialing',
    trialEndsAt: plan.trialEndsAt,
    currentPeriodEnd: plan.currentPeriodEnd,
  };
}
