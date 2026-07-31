import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-100">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 mb-4 border border-red-500/20">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Application Error</h1>
          <p className="text-slate-400 max-w-md mb-6 text-sm">
            An unhandled runtime error occurred. The system isolated the fault to preserve telemetry data stability.
          </p>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 mb-6 max-w-md w-full text-left font-mono text-xs text-red-400 overflow-x-auto">
            {this.state.error?.message || 'Unknown Application Fault'}
          </div>
          <button
            onClick={this.handleReload}
            className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-500 transition-colors shadow-lg shadow-primary-600/20"
          >
            <RefreshCw className="h-4 w-4" /> Reload System
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
