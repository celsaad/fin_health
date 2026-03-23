import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Header } from '@/components/layout/Header';

vi.mock('@/components/layout/UserMenu', () => ({
  UserMenu: () => <div data-testid="user-menu" />,
}));

function renderHeader(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Header />
    </MemoryRouter>,
  );
}

describe('Header', () => {
  it('renders notification and help buttons with aria-labels', () => {
    renderHeader();
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /help/i })).toBeInTheDocument();
  });

  it('has glassmorphic background classes', () => {
    const { container } = renderHeader();
    const header = container.querySelector('header');
    expect(header?.className).toContain('backdrop-blur');
    expect(header?.className).not.toContain('bg-card');
  });
});
