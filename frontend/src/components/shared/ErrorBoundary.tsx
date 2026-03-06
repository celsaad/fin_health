import { Component, type ErrorInfo, type ReactNode } from 'react';
import * as Sentry from '@sentry/react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
    Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 rounded-full bg-destructive/10 p-4">
            <AlertTriangle className="size-8 text-destructive" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">Something went wrong</h2>
          <p className="mb-6 max-w-md text-sm text-muted-foreground">
            An unexpected error occurred. Try refreshing the page or click the button below to
            recover.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={this.handleReset}>
              <RefreshCw className="size-4" />
              Try Again
            </Button>
            <Button onClick={() => window.location.reload()}>Refresh Page</Button>
          </div>
          {import.meta.env.DEV && this.state.error && (
            <pre className="mt-6 max-w-lg overflow-auto rounded-lg bg-muted p-4 text-left text-xs text-muted-foreground">
              {this.state.error.message}
              {'\n'}
              {this.state.error.stack}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
