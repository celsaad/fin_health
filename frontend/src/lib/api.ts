import axios from 'axios';
import { env } from '@/lib/env';

export { AppError, parseError } from '@fin-health/shared/errors';
export type { ErrorCode } from '@fin-health/shared/errors';

const api = axios.create({
  baseURL: env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Allow the auth layer to register a logout handler so we avoid
// a hard window.location redirect (which loses all client state).
let onAuthError: (() => void) | null = null;

export function setAuthErrorHandler(handler: (() => void) | null) {
  onAuthError = handler;
}

// Request interceptor to attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ---------------------------------------------------------------------------
// Response interceptor — silent refresh on 401
// ---------------------------------------------------------------------------

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry refresh/login/signup requests, or already-retried requests
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
      return new Promise((resolve) => {
        refreshSubscribers.push((newToken: string) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token');

      const { data } = await axios.post(`${env.VITE_API_URL}/auth/refresh`, { refreshToken });

      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);

      onTokenRefreshed(data.token);

      originalRequest.headers.Authorization = `Bearer ${data.token}`;
      return api(originalRequest);
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      onAuthError?.();
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
