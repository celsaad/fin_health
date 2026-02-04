/**
 * Dashboard index - redirect to current month
 */

import { redirect, type LoaderFunctionArgs } from '@remix-run/node';
import { requireAuth } from '~/lib/auth.server';
import { createTRPCClient } from '~/lib/trpc.server';
import { getCurrentMonthKey } from '@fin-health/domain';

export async function loader({ request }: LoaderFunctionArgs) {
  const { token } = await requireAuth(request);
  const trpc = createTRPCClient(token);

  // Get user settings to determine timezone and month start day
  const settings = await trpc.settings.get.query();

  const monthKey = getCurrentMonthKey(settings.timezone, settings.monthStartDay);

  return redirect(`/dashboard/month/${monthKey}`);
}
