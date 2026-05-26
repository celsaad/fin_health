import { useAuth } from '@/lib/auth';
import { derivePlanState } from '@fin-health/shared';

export function usePlan() {
  const { user, featureFlags } = useAuth();
  return derivePlanState(user?.plan, featureFlags);
}
