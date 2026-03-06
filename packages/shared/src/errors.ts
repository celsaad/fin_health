export type ErrorCode = 'NETWORK' | 'TIMEOUT' | 'AUTH' | 'VALIDATION' | 'SERVER' | 'UNKNOWN';

export class AppError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public status?: number,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Duck-typed check for Axios-like errors (has `response` or Axios error codes).
 * Avoids importing axios so this module stays platform-agnostic.
 */
function isHttpError(error: unknown): error is {
  code?: string;
  message: string;
  response?: { status?: number; data?: { error?: string } };
} {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    ('response' in error || 'code' in error)
  );
}

export function parseError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (isHttpError(error)) {
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      return new AppError('Unable to connect. Please check your internet connection.', 'NETWORK');
    }

    if (error.code === 'ECONNABORTED') {
      return new AppError('Request timed out. Please try again.', 'TIMEOUT');
    }

    const status = error.response?.status;
    const serverMessage = error.response?.data?.error;

    if (status === 401) {
      return new AppError(serverMessage ?? 'Session expired. Please log in again.', 'AUTH', 401);
    }

    if (status === 422 || status === 400) {
      return new AppError(
        serverMessage ?? 'Invalid input. Please check your data.',
        'VALIDATION',
        status,
      );
    }

    if (status && status >= 500) {
      return new AppError(
        'Something went wrong on our end. Please try again later.',
        'SERVER',
        status,
      );
    }

    return new AppError(serverMessage ?? 'Something went wrong.', 'UNKNOWN', status);
  }

  if (error instanceof Error) {
    return new AppError(error.message, 'UNKNOWN');
  }

  return new AppError('An unexpected error occurred.', 'UNKNOWN');
}
