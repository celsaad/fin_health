// Exchange rate service using frankfurter.app (ECB reference rates).
// Rates are cached in two slots per day — 00:00 UTC and 16:00 UTC — because
// the ECB publishes updated rates around 15:00-16:00 UTC on business days.

interface CachedRate {
  ratePerUsd: number; // 1 USD = ratePerUsd units of this currency
}

const rateCache = new Map<string, CachedRate>();

// In-flight deduplication: if a fetch for a key is already running, all callers
// share the same promise instead of firing redundant concurrent HTTP requests.
const inFlight = new Map<string, Promise<number>>();

function cacheSlot(now = new Date()): string {
  const date = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const slot = now.getUTCHours() >= 16 ? '16' : '00';
  return `${date}-${slot}`;
}

/**
 * Returns how many units of `currency` equal 1 USD.
 * e.g. getRatePerUsd('BRL') → 5.67 means 1 USD = 5.67 BRL
 *
 * Concurrent calls for the same currency+slot share a single HTTP request.
 */
export function getRatePerUsd(currency: string): Promise<number> {
  if (currency === 'USD') return Promise.resolve(1);

  const slot = cacheSlot();
  const key = `${currency}-${slot}`;

  const cached = rateCache.get(key);
  if (cached) return Promise.resolve(cached.ratePerUsd);

  // Return the already-running promise if one exists for this key
  const existing = inFlight.get(key);
  if (existing) return existing;

  const request = (async () => {
    try {
      const response = await fetch(`https://api.frankfurter.app/latest?from=USD&to=${currency}`, {
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = (await response.json()) as { rates: Record<string, number> };
      const rate = data.rates[currency];
      if (!rate) throw new Error(`No rate in response for ${currency}`);

      rateCache.set(key, { ratePerUsd: rate });
      return rate;
    } catch (err) {
      // For any failure (network, timeout, bad status) try stale cache before giving up
      for (const [k, v] of rateCache) {
        if (k.startsWith(`${currency}-`)) return v.ratePerUsd;
      }
      throw new Error(
        `Exchange rate unavailable for ${currency}: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, request);
  return request;
}

/** Convert an amount in `currency` to its USD equivalent. */
export async function toUsd(
  amount: number,
  currency: string,
): Promise<{ amountUsd: number; exchangeRate: number }> {
  const rate = await getRatePerUsd(currency);
  return { amountUsd: amount / rate, exchangeRate: rate };
}

/** Convert a USD amount to the target display currency. */
export async function fromUsd(amountUsd: number, currency: string): Promise<number> {
  const rate = await getRatePerUsd(currency);
  return amountUsd * rate;
}
