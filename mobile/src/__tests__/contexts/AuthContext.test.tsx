import React from 'react';
import { Text, Button } from 'react-native';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

jest.mock('../../services/api', () => {
  const actual = jest.requireActual('../../services/api');
  return {
    ...actual,
    __esModule: true,
    default: {
      get: jest.fn(),
      post: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    },
  };
});

const mockApi = api as jest.Mocked<typeof api>;

function AuthConsumer() {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();
  return (
    <>
      <Text testID="loading">{String(isLoading)}</Text>
      <Text testID="authenticated">{String(isAuthenticated)}</Text>
      <Text testID="userName">{user?.name ?? 'none'}</Text>
      <Button title="Login" onPress={() => login('test@test.com', 'pass123')} />
      <Button title="Logout" onPress={() => logout()} />
    </>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
  });

  it('starts in loading state and resolves to unauthenticated when no token', async () => {
    const { getByTestId } = render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    // Flush the async getToken() call in useEffect
    await act(async () => {});

    await waitFor(() => {
      expect(getByTestId('loading').props.children).toBe('false');
    });

    expect(getByTestId('authenticated').props.children).toBe('false');
    expect(getByTestId('userName').props.children).toBe('none');
  });

  it('restores user from token on mount', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('valid-token');
    (mockApi.get as jest.Mock).mockResolvedValue({
      data: { user: { id: '1', name: 'John', email: 'john@test.com' } },
    });

    const { getByTestId } = render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(getByTestId('loading').props.children).toBe('false');
    });

    expect(getByTestId('authenticated').props.children).toBe('true');
    expect(getByTestId('userName').props.children).toBe('John');
  });

  it('clears token when restore fails', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('expired-token');
    (mockApi.get as jest.Mock).mockRejectedValue(new Error('Unauthorized'));

    const { getByTestId } = render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(getByTestId('loading').props.children).toBe('false');
    });

    expect(getByTestId('authenticated').props.children).toBe('false');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalled();
  });

  it('login sets user and stores token and refresh token', async () => {
    (mockApi.post as jest.Mock).mockResolvedValue({
      data: {
        token: 'new-token',
        refreshToken: 'new-refresh-token',
        user: { id: '2', name: 'Jane', email: 'jane@test.com' },
      },
    });

    const { getByTestId, getByText } = render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(getByTestId('loading').props.children).toBe('false');
    });

    await act(async () => {
      fireEvent.press(getByText('Login'));
    });

    await waitFor(() => {
      expect(getByTestId('authenticated').props.children).toBe('true');
    });

    expect(getByTestId('userName').props.children).toBe('Jane');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('auth_token', 'new-token');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('refresh_token', 'new-refresh-token');
  });

  it('logout clears user and token', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('valid-token');
    (mockApi.get as jest.Mock).mockResolvedValue({
      data: { user: { id: '1', name: 'John', email: 'john@test.com' } },
    });
    (mockApi.post as jest.Mock).mockResolvedValue({});

    const { getByTestId, getByText } = render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(getByTestId('authenticated').props.children).toBe('true');
    });

    await act(async () => {
      fireEvent.press(getByText('Logout'));
    });

    await waitFor(() => {
      expect(getByTestId('authenticated').props.children).toBe('false');
    });

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_token');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('refresh_token');
  });

  it('throws when useAuth is used outside AuthProvider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<AuthConsumer />)).toThrow('useAuth must be used within AuthProvider');

    spy.mockRestore();
  });
});
