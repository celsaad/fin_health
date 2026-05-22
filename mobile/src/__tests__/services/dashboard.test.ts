import { getRecentPeaks } from '../../services/dashboard';

const mockTransactionsList = jest.fn();

jest.mock('../../lib/trpc', () => ({
  trpcClient: {
    transactions: {
      list: { query: (...args: unknown[]) => mockTransactionsList(...args) },
    },
  },
  setCachedToken: jest.fn(),
  setTRPCAuthFailure: jest.fn(),
}));

describe('getRecentPeaks', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls transactions.list with correct params for January 2026', async () => {
    const mockData = { transactions: [], pagination: { total: 0 } };
    mockTransactionsList.mockResolvedValue(mockData);

    const result = await getRecentPeaks(1, 2026);

    expect(mockTransactionsList).toHaveBeenCalledWith(
      expect.objectContaining({
        startDate: '2026-01-01',
        endDate: '2026-01-31',
        sortBy: 'amount',
        sortOrder: 'desc',
        limit: 5,
        type: 'expense',
      }),
    );
    expect(result).toEqual(mockData);
  });

  it('respects custom limit', async () => {
    mockTransactionsList.mockResolvedValue({ transactions: [] });

    await getRecentPeaks(3, 2026, 10);

    expect(mockTransactionsList).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 10 }),
    );
  });
});
