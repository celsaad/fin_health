import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { env } from '../lib/env';

export { AppError, parseError } from '@fin-health/shared/errors';
export type { ErrorCode } from '@fin-health/shared/errors';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

const api = axios.create({
  baseURL: `${env.EXPO_PUBLIC_API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

// Callback set by AuthContext to clear user state on auth failure
let onAuthFailure: (() => void) | null = null;
export function setOnAuthFailure(cb: (() => void) | null) {
  onAuthFailure = cb;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry refresh requests or already-retried requests
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/signup')
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      // Queue this request until the refresh completes
      return new Promise((resolve) => {
        addRefreshSubscriber((newToken: string) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      if (!refreshToken) throw new Error('No refresh token');

      const { data } = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/refresh`, {
        refreshToken,
      });

      await SecureStore.setItemAsync(TOKEN_KEY, data.token);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.refreshToken);

      onTokenRefreshed(data.token);

      originalRequest.headers.Authorization = `Bearer ${data.token}`;
      return api(originalRequest);
    } catch {
      // Refresh failed — clear tokens and force re-login
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      onAuthFailure?.();
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  },
);

export async function setToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function removeToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function setRefreshToken(token: string) {
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
}

export async function removeRefreshToken() {
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

export default api;
