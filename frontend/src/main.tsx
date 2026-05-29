import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { reactErrorHandler } from '@sentry/react';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import '@/lib/i18n';
import { initSentry } from '@/lib/sentry';
import App from './App';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/lib/auth';
import { ThemeProvider } from '@/lib/theme';
import { ToastProvider } from '@/providers/ToastProvider';
import { TransactionFormProvider } from '@/providers/TransactionFormProvider';
import { UserPreferencesProvider } from '@/contexts/UserPreferencesContext';

initSentry();

createRoot(document.getElementById('root')!, {
  onUncaughtError: reactErrorHandler(),
  onCaughtError: reactErrorHandler(),
  onRecoverableError: reactErrorHandler(),
}).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <QueryProvider>
          <ThemeProvider>
            <UserPreferencesProvider>
              <AuthProvider>
                <TransactionFormProvider>
                  <App />
                  <ToastProvider />
                </TransactionFormProvider>
              </AuthProvider>
            </UserPreferencesProvider>
          </ThemeProvider>
        </QueryProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
