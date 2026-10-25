import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Button from './Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/home';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="min-h-screen bg-[#F7F0DF] dark:bg-[#542612] flex items-center justify-center p-6 text-[#542612] dark:text-[#F7F0DF]">
          <div className="max-w-md w-full bg-white dark:bg-[#3D1B0D] rounded-3xl p-8 border border-[#542612]/15 dark:border-[#F7F0DF]/20 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-red-600 dark:text-red-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold font-serif text-[#542612] dark:text-white">
                Something went wrong
              </h2>
              <p className="text-xs text-[#542612]/70 dark:text-[#F7F0DF]/70">
                An unexpected error occurred while displaying this page.
              </p>
              {this.state.error?.message && (
                <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-[11px] font-mono text-red-700 dark:text-red-300 text-left overflow-auto max-h-32">
                  {this.state.error.message}
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-center pt-2">
              <Button
                variant="secondary"
                icon={RefreshCw}
                onClick={this.handleReload}
              >
                Reload Page
              </Button>
              <Button
                variant="primary"
                icon={Home}
                onClick={this.handleGoHome}
              >
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
