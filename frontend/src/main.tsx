import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import { initSentry } from '@/lib/sentry';
import App from './App';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/lib/auth';
import { ThemeProvider } from '@/lib/theme';
import { ToastProvider } from '@/providers/ToastProvider';

initSentry();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <QueryProvider>
          <ThemeProvider>
            <AuthProvider>
              <App />
              <ToastProvider />
            </AuthProvider>
          </ThemeProvider>
        </QueryProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
