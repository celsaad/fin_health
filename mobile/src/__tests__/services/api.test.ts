import { AxiosError } from 'axios';
import { AppError, parseError } from '../../services/api';

function makeAxiosError(
  overrides: {
    code?: string;
    message?: string;
    status?: number;
    data?: any;
  } = {},
): AxiosError {
  const error = new AxiosError(overrides.message ?? 'Request failed', overrides.code);
  if (overrides.status !== undefined) {
    error.response = {
      status: overrides.status,
      data: overrides.data ?? {},
      statusText: '',
      headers: {},
      config: {} as any,
    };
  }
  return error;
}

describe('AppError', () => {
  it('creates an error with code and status', () => {
    const err = new AppError('test', 'NETWORK', 500);
    expect(err.message).toBe('test');
    expect(err.code).toBe('NETWORK');
    expect(err.status).toBe(500);
    expect(err.name).toBe('AppError');
  });
});

describe('parseError', () => {
  it('returns the same AppError if already an AppError', () => {
    const original = new AppError('already parsed', 'AUTH', 401);
    expect(parseError(original)).toBe(original);
  });

  it('handles network errors', () => {
    const err = makeAxiosError({ code: 'ERR_NETWORK' });
    const result = parseError(err);
    expect(result.code).toBe('NETWORK');
    expect(result.message).toContain('internet connection');
  });

  it('handles Network Error message', () => {
    // Real axios network errors always set code: 'ERR_NETWORK'
    const err = makeAxiosError({ message: 'Network Error', code: 'ERR_NETWORK' });
    const result = parseError(err);
    expect(result.code).toBe('NETWORK');
  });

  it('handles timeout errors', () => {
    const err = makeAxiosError({ code: 'ECONNABORTED' });
    const result = parseError(err);
    expect(result.code).toBe('TIMEOUT');
    expect(result.message).toContain('timed out');
  });

  it('handles 401 with default message', () => {
    const err = makeAxiosError({ status: 401 });
    const result = parseError(err);
    expect(result.code).toBe('AUTH');
    expect(result.status).toBe(401);
    expect(result.message).toContain('Session expired');
  });

  it('handles 401 with server message', () => {
    const err = makeAxiosError({ status: 401, data: { error: 'Token expired' } });
    const result = parseError(err);
    expect(result.code).toBe('AUTH');
    expect(result.message).toBe('Token expired');
  });

  it('handles 400 validation errors', () => {
    const err = makeAxiosError({ status: 400, data: { error: 'Email required' } });
    const result = parseError(err);
    expect(result.code).toBe('VALIDATION');
    expect(result.status).toBe(400);
    expect(result.message).toBe('Email required');
  });

  it('handles 422 validation errors', () => {
    const err = makeAxiosError({ status: 422 });
    const result = parseError(err);
    expect(result.code).toBe('VALIDATION');
    expect(result.status).toBe(422);
  });

  it('handles 500 server errors', () => {
    const err = makeAxiosError({ status: 500 });
    const result = parseError(err);
    expect(result.code).toBe('SERVER');
    expect(result.status).toBe(500);
    expect(result.message).toContain('our end');
  });

  it('handles 502 server errors', () => {
    const err = makeAxiosError({ status: 502 });
    const result = parseError(err);
    expect(result.code).toBe('SERVER');
  });

  it('handles unknown status codes with server message', () => {
    const err = makeAxiosError({ status: 403, data: { error: 'Forbidden' } });
    const result = parseError(err);
    expect(result.code).toBe('UNKNOWN');
    expect(result.message).toBe('Forbidden');
  });

  it('handles unknown status codes without message', () => {
    const err = makeAxiosError({ status: 403 });
    const result = parseError(err);
    expect(result.code).toBe('UNKNOWN');
    expect(result.message).toBe('Something went wrong.');
  });

  it('handles non-Axios errors', () => {
    const result = parseError(new Error('random'));
    expect(result.code).toBe('UNKNOWN');
    expect(result.message).toBe('random');
  });

  it('handles strings', () => {
    const result = parseError('some string');
    expect(result.code).toBe('UNKNOWN');
  });

  it('handles null', () => {
    const result = parseError(null);
    expect(result.code).toBe('UNKNOWN');
  });
});
