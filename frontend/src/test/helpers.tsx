import { type ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/lib/auth';
import { ThemeProvider } from '@/lib/theme';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

interface WrapperOptions {
  routerProps?: MemoryRouterProps;
  withAuth?: boolean;
}

export function createWrapper(options: WrapperOptions = {}) {
  const { routerProps, withAuth = false } = options;
  const queryClient = createTestQueryClient();

  return function Wrapper({ children }: { children: ReactNode }) {
    const core = <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;

    if (withAuth) {
      return (
        <MemoryRouter {...routerProps}>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <AuthProvider>{children}</AuthProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </MemoryRouter>
      );
    }

    if (routerProps || options.routerProps !== undefined) {
      return <MemoryRouter {...routerProps}>{core}</MemoryRouter>;
    }

    return core;
  };
}

export function renderWithProviders(
  ui: ReactNode,
  options: WrapperOptions & Omit<RenderOptions, 'wrapper'> = {},
) {
  const { routerProps, withAuth, ...renderOptions } = options;
  const wrapper = createWrapper({ routerProps, withAuth });
  return render(ui as React.ReactElement, { wrapper, ...renderOptions });
}

export function renderWithRouter(ui: ReactNode, routerProps?: MemoryRouterProps) {
  return renderWithProviders(ui, { routerProps: routerProps ?? {} });
}
