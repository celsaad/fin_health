import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryError } from '@/components/shared/QueryError';

describe('QueryError', () => {
  it('renders default error message', () => {
    render(<QueryError />);
    expect(screen.getByText('Failed to load data. Please try again.')).toBeInTheDocument();
  });

  it('renders custom error message', () => {
    render(<QueryError message="Custom error occurred" />);
    expect(screen.getByText('Custom error occurred')).toBeInTheDocument();
  });

  it('renders retry button when onRetry is provided', () => {
    render(<QueryError onRetry={() => {}} />);
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('does not render retry button when onRetry is not provided', () => {
    render(<QueryError />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(<QueryError onRetry={onRetry} />);

    await user.click(screen.getByRole('button', { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
