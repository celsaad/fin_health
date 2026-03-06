import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Content rendered</div>;
}

describe('ErrorBoundary', () => {
  // Suppress React's error boundary console.error output in tests
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  afterEach(() => {
    console.error = originalError;
  });

  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Content rendered')).toBeInTheDocument();
  });

  it('renders fallback UI when child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Refresh Page')).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom Error UI</div>}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('recovers when Try Again is clicked', async () => {
    const user = userEvent.setup();

    // Use a mutable flag that the component reads at render time
    const control = { shouldThrow: true };
    function MaybeThrow() {
      if (control.shouldThrow) throw new Error('Test error');
      return <div>Recovered</div>;
    }

    render(
      <ErrorBoundary>
        <MaybeThrow />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Fix the error before clicking retry
    control.shouldThrow = false;
    await user.click(screen.getByText('Try Again'));

    expect(screen.getByText('Recovered')).toBeInTheDocument();
  });

  it('shows error details in dev mode', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );
    // In test env, import.meta.env.DEV is true
    // The <pre> contains both message and stack, so use substring match
    const pre = screen.getByText(/Test error/, { selector: 'pre' });
    expect(pre).toBeInTheDocument();
  });
});
