import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { logger } from '@utils/logger';
import { DEFAULT_ERROR_MESSAGE } from '@constants/app.constants';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error('ErrorBoundary', error.message, { error, errorInfo });
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-background-light px-6 text-center dark:bg-background-dark">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-status-danger/10 text-status-danger">
          <AlertTriangle className="h-7 w-7" strokeWidth={2} />
        </div>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Something went wrong
        </h1>
        <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">
          {this.state.error?.message || DEFAULT_ERROR_MESSAGE}
        </p>
        <button
          type="button"
          onClick={this.handleReset}
          className="focus-ring inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
        >
          <RotateCcw className="h-4 w-4" />
          Reload dashboard
        </button>
      </div>
    );
  }
}
