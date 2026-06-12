import type { FeatureFlags, UserPlan, PlanType, SubscriptionStatus } from '../types/index';

const DISABLED_STATE = {
  plan: 'free' as PlanType,
  status: 'active' as SubscriptionStatus,
  isPro: false,
  isFree: true,
  isTrialing: false,
  isCanceling: false,
  trialEndsAt: null as string | null,
  currentPeriodEnd: null as string | null,
  isDisabled: true,
};

export function derivePlanState(plan: UserPlan | null | undefined, flags: FeatureFlags) {
  if (!flags.billing) return DISABLED_STATE;

  const p: UserPlan = plan ?? {
    plan: 'free',
    status: 'active',
    trialEndsAt: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
  };

  return {
    plan: p.plan,
    status: p.status,
    isPro: p.plan === 'pro' && (p.status === 'active' || p.status === 'trialing'),
    isFree: p.plan === 'free' || p.status === 'canceled' || p.status === 'expired',
    isTrialing: p.status === 'trialing',
    isCanceling: p.cancelAtPeriodEnd,
    trialEndsAt: p.trialEndsAt,
    currentPeriodEnd: p.currentPeriodEnd,
    isDisabled: false,
  };
}
