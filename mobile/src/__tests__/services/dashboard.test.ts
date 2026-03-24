import api from '../../services/api';
import { getRecentPeaks } from '../../services/dashboard';

jest.mock('../../services/api');
const mockApi = api as jest.Mocked<typeof api>;

describe('getRecentPeaks', () => {
  it('calls /transactions with correct params for January 2026', async () => {
    const mockData = { transactions: [], pagination: { total: 0 } };
    mockApi.get.mockResolvedValue({ data: mockData });

    const result = await getRecentPeaks(1, 2026);

    expect(mockApi.get).toHaveBeenCalledWith('/transactions', {
      params: {
        startDate: '2026-01-01',
        endDate: '2026-01-31',
        sortBy: 'amount',
        sortOrder: 'desc',
        limit: 5,
        type: 'expense',
      },
    });
    expect(result).toEqual(mockData);
  });

  it('respects custom limit', async () => {
    mockApi.get.mockResolvedValue({ data: { transactions: [] } });

    await getRecentPeaks(3, 2026, 10);

    expect(mockApi.get).toHaveBeenCalledWith('/transactions', {
      params: expect.objectContaining({ limit: 10 }),
    });
  });
});
