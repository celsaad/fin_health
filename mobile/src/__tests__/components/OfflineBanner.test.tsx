import React from 'react';
import { render } from '@testing-library/react-native';
import OfflineBanner from '../../components/OfflineBanner';

// Control the mock return value per test
let mockIsOffline = false;
jest.mock('../../hooks/useNetworkStatus', () => ({
  useNetworkStatus: () => ({
    isConnected: !mockIsOffline,
    isInternetReachable: !mockIsOffline,
    isOffline: mockIsOffline,
  }),
}));

describe('OfflineBanner', () => {
  afterEach(() => {
    mockIsOffline = false;
  });

  it('renders nothing when online', () => {
    mockIsOffline = false;
    const { queryByText } = render(<OfflineBanner />);
    expect(queryByText('No internet connection')).toBeNull();
  });

  it('renders banner when offline', () => {
    mockIsOffline = true;
    const { getByText } = render(<OfflineBanner />);
    expect(getByText('No internet connection')).toBeTruthy();
  });
});
