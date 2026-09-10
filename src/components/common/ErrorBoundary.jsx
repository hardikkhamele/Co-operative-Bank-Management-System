import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

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

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="w-full p-6 my-4 bg-rose-50 border border-rose-200 rounded-2xl text-center shadow-xs">
          <div className="w-12 h-12 mx-auto mb-3 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">
            {this.props.title || 'Something went wrong displaying this section'}
          </h3>
          <p className="text-xs text-gray-600 max-w-md mx-auto mb-4">
            {this.state.error?.message || 'An unexpected error occurred while rendering the data.'}
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#225091] hover:bg-[#1a3e70] rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            <RefreshCw size={14} />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
