import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from '@/pages/Login';

const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('@/lib/auth', () => ({
  useAuth: () => ({
    login: mockLogin,
    user: null,
    token: null,
    isLoading: false,
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Login page', () => {
  it('renders the login form', () => {
    renderLogin();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText('Email'), 'not-an-email');
    await user.type(screen.getByLabelText('Password'), 'password');

    // Submit the form directly to bypass native HTML5 email validation in jsdom
    const form = screen.getByRole('button', { name: 'Login' }).closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('calls login and navigates on success', async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText('Email'), 'test@test.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@test.com', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('shows error toast on login failure', async () => {
    const { toast } = await import('sonner');
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText('Email'), 'test@test.com');
    await user.type(screen.getByLabelText('Password'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid credentials');
    });
  });

  it('disables submit button while submitting', async () => {
    // Make login hang so we can check the disabled state
    mockLogin.mockReturnValueOnce(new Promise(() => {}));
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText('Email'), 'test@test.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Signing in...' })).toBeDisabled();
    });
  });

  it('has a link to signup', () => {
    renderLogin();
    const signupLink = screen.getByRole('link', { name: 'Sign Up' });
    expect(signupLink).toBeInTheDocument();
    expect(signupLink).toHaveAttribute('href', '/signup');
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    renderLogin();

    const passwordInput = screen.getByLabelText('Password');
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Click the eye toggle button (it has tabIndex=-1, find by role)
    const toggleButtons = screen.getAllByRole('button');
    const eyeButton = toggleButtons.find((b) => b.getAttribute('tabindex') === '-1');
    expect(eyeButton).toBeDefined();

    await user.click(eyeButton!);
    expect(passwordInput).toHaveAttribute('type', 'text');

    await user.click(eyeButton!);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
