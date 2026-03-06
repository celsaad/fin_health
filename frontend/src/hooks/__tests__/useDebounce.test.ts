import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/hooks/useDebounce';

describe('useDebounce', () => {
  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello'));
    expect(result.current).toBe('hello');
  });

  it('debounces value updates', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'hello' },
    });

    rerender({ value: 'world' });
    expect(result.current).toBe('hello');

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe('world');

    vi.useRealTimers();
  });

  it('resets timer when value changes rapidly', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'a' },
    });

    rerender({ value: 'ab' });
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current).toBe('a');

    rerender({ value: 'abc' });
    act(() => {
      vi.advanceTimersByTime(150);
    });
    // Still the old value because timer was reset
    expect(result.current).toBe('a');

    act(() => {
      vi.advanceTimersByTime(150);
    });
    // Now 300ms after last change
    expect(result.current).toBe('abc');

    vi.useRealTimers();
  });

  it('uses custom delay', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: 'start' },
    });

    rerender({ value: 'end' });

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe('start');

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('end');

    vi.useRealTimers();
  });
});
