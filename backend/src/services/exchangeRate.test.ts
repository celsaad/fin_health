import { describe, it, expect, afterEach, vi } from 'vitest';
import { getRatePerUsd, __testing } from './exchangeRate';

describe('exchangeRate', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    __testing.clearCache();
  });

  it('returns 1 for USD without making a request', async () => {
    const fetchSpy = vi.fn();
    global.fetch = fetchSpy as unknown as typeof fetch;

    const rate = await getRatePerUsd('USD');

    expect(rate).toBe(1);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('throws when the request fails and no cached entry exists', async () => {
    const failingCurrency = `F${Math.floor(Math.random() * 100000)}`;
    global.fetch = vi.fn(async () => {
      throw new Error('network down');
    }) as unknown as typeof fetch;

    await expect(getRatePerUsd(failingCurrency)).rejects.toThrow(
      `Exchange rate unavailable for ${failingCurrency}`,
    );
  });

  it('falls back to the newest cached entry (not the oldest) on failure', async () => {
    const currency = `T${Math.floor(Math.random() * 100000)}`;

    // Seed two stale cache entries for this currency, oldest first.
    __testing.setCacheEntry(`${currency}-2020-01-01-00`, 5);
    __testing.setCacheEntry(`${currency}-2025-06-01-16`, 7);
    __testing.setCacheEntry(`${currency}-2025-06-01-00`, 6);

    global.fetch = vi.fn(async () => {
      throw new Error('network down');
    }) as unknown as typeof fetch;

    const rate = await getRatePerUsd(currency);
    // Lexicographically greatest key -> 2025-06-01-16 -> rate 7 (newest), not
    // the oldest entry (5) or the middle one (6).
    expect(rate).toBe(7);
  });

  it('evicts cache entries older than 3 days when a new rate is stored', async () => {
    const currency = `E${Math.floor(Math.random() * 100000)}`;
    __testing.setCacheEntry(`${currency}-2000-01-01-00`, 1);

    global.fetch = vi.fn(
      async () => new Response(JSON.stringify({ rates: { [currency]: 9 } }), { status: 200 }),
    ) as unknown as typeof fetch;

    const rate = await getRatePerUsd(currency);
    expect(rate).toBe(9);
    expect(__testing.hasCacheEntry(`${currency}-2000-01-01-00`)).toBe(false);
  });
});
