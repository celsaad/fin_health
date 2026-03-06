import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const mockUseAuth = vi.fn();

vi.mock('@/lib/auth', () => ({
  useAuth: () => mockUseAuth(),
}));

function renderWithRoute(initialEntry = '/') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route index element={<div>Protected Content</div>} />
        </Route>
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  it('shows loading skeleton while auth is loading', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: true });
    renderWithRoute();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });

  it('redirects to /login when not authenticated', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: false });
    renderWithRoute();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders outlet when authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', email: 'test@test.com', name: 'Test' },
      isLoading: false,
    });
    renderWithRoute();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
