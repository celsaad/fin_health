import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/lib/auth';
import { ThemeProvider } from '@/lib/theme';
import { ToastProvider } from '@/providers/ToastProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <ThemeProvider>
        <AuthProvider>
          <App />
          <ToastProvider />
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  </StrictMode>
);
