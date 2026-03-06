import { describe, it, expect } from 'vitest';
import { AppError, parseError } from '../errors';

describe('AppError', () => {
  it('sets name, message, code, and status', () => {
    const err = new AppError('fail', 'AUTH', 401);
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('AppError');
    expect(err.message).toBe('fail');
    expect(err.code).toBe('AUTH');
    expect(err.status).toBe(401);
  });

  it('status is optional', () => {
    const err = new AppError('oops', 'UNKNOWN');
    expect(err.status).toBeUndefined();
  });
});

describe('parseError', () => {
  it('returns the same AppError if already an AppError', () => {
    const original = new AppError('already', 'AUTH', 401);
    expect(parseError(original)).toBe(original);
  });

  it('maps ERR_NETWORK to NETWORK', () => {
    const err = parseError({ code: 'ERR_NETWORK', message: 'Network Error' });
    expect(err.code).toBe('NETWORK');
    expect(err.status).toBeUndefined();
  });

  it('maps "Network Error" message to NETWORK', () => {
    const err = parseError({ message: 'Network Error', response: {} });
    expect(err.code).toBe('NETWORK');
  });

  it('maps ECONNABORTED to TIMEOUT', () => {
    const err = parseError({ code: 'ECONNABORTED', message: 'timeout' });
    expect(err.code).toBe('TIMEOUT');
  });

  it('maps 401 to AUTH with server message', () => {
    const err = parseError({
      message: 'Request failed',
      response: { status: 401, data: { error: 'Token expired' } },
    });
    expect(err.code).toBe('AUTH');
    expect(err.status).toBe(401);
    expect(err.message).toBe('Token expired');
  });

  it('maps 401 with default message when no server message', () => {
    const err = parseError({
      message: 'Request failed',
      response: { status: 401 },
    });
    expect(err.code).toBe('AUTH');
    expect(err.message).toContain('Session expired');
  });

  it('maps 400 to VALIDATION', () => {
    const err = parseError({
      message: 'Request failed',
      response: { status: 400, data: { error: 'Bad input' } },
    });
    expect(err.code).toBe('VALIDATION');
    expect(err.status).toBe(400);
    expect(err.message).toBe('Bad input');
  });

  it('maps 422 to VALIDATION', () => {
    const err = parseError({
      message: 'Request failed',
      response: { status: 422 },
    });
    expect(err.code).toBe('VALIDATION');
    expect(err.status).toBe(422);
  });

  it('maps 5xx to SERVER', () => {
    const err = parseError({
      message: 'Request failed',
      response: { status: 500 },
    });
    expect(err.code).toBe('SERVER');
    expect(err.status).toBe(500);
  });

  it('maps 502 to SERVER', () => {
    const err = parseError({
      message: 'Request failed',
      response: { status: 502 },
    });
    expect(err.code).toBe('SERVER');
    expect(err.status).toBe(502);
  });

  it('maps other HTTP statuses to UNKNOWN', () => {
    const err = parseError({
      message: 'Request failed',
      response: { status: 403, data: { error: 'Forbidden' } },
    });
    expect(err.code).toBe('UNKNOWN');
    expect(err.status).toBe(403);
    expect(err.message).toBe('Forbidden');
  });

  it('handles plain Error instances', () => {
    const err = parseError(new Error('something broke'));
    expect(err.code).toBe('UNKNOWN');
    expect(err.message).toBe('something broke');
  });

  it('handles non-Error values', () => {
    expect(parseError('string error').code).toBe('UNKNOWN');
    expect(parseError(null).code).toBe('UNKNOWN');
    expect(parseError(42).code).toBe('UNKNOWN');
    expect(parseError(undefined).code).toBe('UNKNOWN');
  });
});
