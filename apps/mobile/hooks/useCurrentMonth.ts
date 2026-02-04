/**
 * Hook for managing current month navigation
 */

import { useState, useCallback } from 'react';
import { getCurrentMonthKey, getPreviousMonthKey, getNextMonthKey } from '@fin-health/domain';
import { trpc } from '../lib/trpc';

export function useCurrentMonth() {
  // Get user settings to determine timezone and month start day
  const { data: settings } = trpc.settings.get.useQuery();

  const timezone = settings?.timezone || 'America/New_York';
  const monthStartDay = settings?.monthStartDay || 1;

  const [monthKey, setMonthKey] = useState(() =>
    getCurrentMonthKey(timezone, monthStartDay)
  );

  const goToPreviousMonth = useCallback(() => {
    setMonthKey((current) => getPreviousMonthKey(current));
  }, []);

  const goToNextMonth = useCallback(() => {
    setMonthKey((current) => getNextMonthKey(current));
  }, []);

  const goToCurrentMonth = useCallback(() => {
    setMonthKey(getCurrentMonthKey(timezone, monthStartDay));
  }, [timezone, monthStartDay]);

  return {
    monthKey,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
  };
}
